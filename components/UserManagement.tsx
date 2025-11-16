import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, UserProfile, Role, DepartmentDetails } from '../types';
import { 
    getUsers, 
    getAllEmployees, 
    createUser, 
    updateUser, 
    deleteUser,
    getDepartments,
    getPositionsForDepartment
} from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

// Modal for Adding/Editing User
const UserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    user: (UserProfile & { role: Role; email: string }) | null;
    departments: DepartmentDetails[];
}> = ({ isOpen, onClose, onSave, user, departments }) => {
    const isNew = user === null;
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || Role.Employee,
        department: user?.department || '',
        position: user?.position || '',
        passcode: '',
    });
    const [positions, setPositions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.department) {
            getPositionsForDepartment(formData.department).then(setPositions);
        } else {
            setPositions([]);
        }
    }, [formData.department]);

    useEffect(() => {
        // Reset form data when the user prop changes
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || Role.Employee,
            department: user?.department || (departments.length > 0 ? departments[0].name : ''),
            position: user?.position || '',
            passcode: '',
        });
    }, [user, departments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        const newFormData = { ...formData, [name]: value };

        if (name === 'department') {
            newFormData.position = ''; // Reset position when department changes
        }
        
        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = isNew ? formData : { ...formData, employeeId: user?.employeeId };
        await onSave(dataToSave);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800">{isNew ? 'Add New User Account' : 'Edit User Account'}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!isNew} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100" />
                        </div>
                         {isNew && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Passcode</label>
                                <input type="password" name="passcode" value={formData.passcode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {formData.role !== Role.Admin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.departmentId} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Position</label>
                                    <select name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" disabled={positions.length === 0}>
                                        <option value="">Select Position</option>
                                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="w-32 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UserManagement: React.FC = () => {
    const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
    const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
    const [departments, setDepartments] = useState<DepartmentDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [profiles, accounts, depts] = await Promise.all([
            getAllEmployees(),
            getUsers(),
            getDepartments(),
        ]);
        setUserProfiles(profiles);
        setUserAccounts(accounts);
        setDepartments(depts);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const combinedUsers = useMemo(() => {
        return userProfiles.map(profile => {
            const account = userAccounts.find(acc => acc.employeeId === profile.employeeId);
            return {
                ...profile,
                email: account?.email || 'N/A',
                role: account?.role || Role.Employee,
            };
        });
    }, [userProfiles, userAccounts]);

    const handleOpenModal = (user: any | null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (data: any) => {
        try {
            if (data.employeeId) { // Editing existing user
                await updateUser(data.employeeId, data);
            } else { // Creating new user
                await createUser(data);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    };
    
    const handleDeleteUser = async (employeeId: string) => {
         if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser(employeeId);
                fetchData();
            } catch (error) {
                alert(error instanceof Error ? error.message : "An unknown error occurred.");
            }
        }
    };

    const filteredUsers = useMemo(() =>
        combinedUsers.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.department.toLowerCase().includes(searchQuery.toLowerCase())
        ), [combinedUsers, searchQuery]);

    return (
        <>
            <UserModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveUser} 
                user={editingUser}
                departments={departments}
            />
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Accounts</h1>
                    <button onClick={() => handleOpenModal(null)} className="w-full sm:w-auto bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
                        <span>Add New User</span>
                    </button>
                </div>
                <Card>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-md rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    {loading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3 font-semibold text-gray-600">Name</th>
                                        <th className="p-3 font-semibold text-gray-600">Department</th>
                                        <th className="p-3 font-semibold text-gray-600">Position</th>
                                        <th className="p-3 font-semibold text-gray-600">Role</th>
                                        <th className="p-3 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.employeeId} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-600">{user.department}</td>
                                            <td className="p-3 text-gray-600">{user.position}</td>
                                            <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">{user.role}</span></td>
                                            <td className="p-3 space-x-2">
                                                <button onClick={() => handleOpenModal(user)} className="text-teal-600 hover:text-teal-800 font-semibold">Edit</button>
                                                <button onClick={() => handleDeleteUser(user.employeeId)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
};

export default UserManagement;
