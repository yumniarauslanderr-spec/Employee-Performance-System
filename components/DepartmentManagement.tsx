
import React, { useState, useEffect, useMemo } from 'react';
import { DepartmentDetails, UserProfile } from '../types';
import { 
    getDepartments, 
    getAllEmployees, 
    addDepartment, 
    updateDepartment, 
    getPositionsForDepartment, 
    deleteDepartment,
    addPositionToDepartment,
    updatePositionInDepartment,
    deletePositionFromDepartment
} from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

const DepartmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (dept: DepartmentDetails) => Promise<void>;
    department: (DepartmentDetails & { employeeCount: number }) | null;
    employees: UserProfile[];
}> = ({ isOpen, onClose, onSave, department, employees }) => {
    const isNew = department === null;
    const [formData, setFormData] = useState<Partial<DepartmentDetails>>({
        name: '',
        code: '',
        headId: '',
        description: '',
        status: 'Active',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (department) {
            setFormData({
                departmentId: department.departmentId,
                name: department.name,
                code: department.code,
                headId: department.headId,
                description: department.description,
                status: department.status,
            });
        } else {
             setFormData({
                name: '',
                code: '',
                headId: '',
                description: '',
                status: 'Active',
            });
        }
    }, [department]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData as DepartmentDetails);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800">{isNew ? 'Add New Department' : 'Edit Department'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="e.g., Front Office" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department Code</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" placeholder="e.g., FO, HK" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department Head</label>
                            <select name="headId" value={formData.headId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                <option value="">Select a Head</option>
                                {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="w-32 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const DepartmentManagement: React.FC = () => {
    const [departments, setDepartments] = useState<(DepartmentDetails & { employeeCount: number })[]>([]);
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<(DepartmentDetails & { employeeCount: number }) | null>(null);

    // --- New states for Position Management ---
    const [selectedDeptForPositions, setSelectedDeptForPositions] = useState('');
    const [positions, setPositions] = useState<string[]>([]);
    const [loadingPositions, setLoadingPositions] = useState(false);
    const [newPositionName, setNewPositionName] = useState('');
    const [editingPosition, setEditingPosition] = useState<{ oldName: string; newName: string } | null>(null);


    const fetchData = async () => {
        setLoading(true);
        const [deptData, empData] = await Promise.all([getDepartments(), getAllEmployees()]);
        setDepartments(deptData);
        setEmployees(empData);
        if (deptData.length > 0 && !selectedDeptForPositions) {
            setSelectedDeptForPositions(deptData[0].name);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

     // Fetch positions when a department is selected
    useEffect(() => {
        if (selectedDeptForPositions) {
            setLoadingPositions(true);
            setEditingPosition(null); // Reset editing state when department changes
            getPositionsForDepartment(selectedDeptForPositions)
                .then(setPositions)
                .finally(() => setLoadingPositions(false));
        }
    }, [selectedDeptForPositions]);


    const handleOpenModal = (dept: (DepartmentDetails & { employeeCount: number }) | null) => {
        setEditingDept(dept);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
    };

    const handleSaveDepartment = async (deptToSave: DepartmentDetails) => {
        if (deptToSave.departmentId) {
            await updateDepartment(deptToSave);
        } else {
            await addDepartment(deptToSave);
        }
        fetchData();
        handleCloseModal();
    };

    const handleAddPosition = async () => {
        if (!newPositionName.trim()) return;
        try {
            await addPositionToDepartment(selectedDeptForPositions, newPositionName.trim());
            setNewPositionName('');
            const updatedPositions = await getPositionsForDepartment(selectedDeptForPositions);
            setPositions(updatedPositions);
        } catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    };

    const handleUpdatePosition = async () => {
        if (!editingPosition || !editingPosition.newName.trim()) return;
        try {
            await updatePositionInDepartment(selectedDeptForPositions, editingPosition.oldName, editingPosition.newName.trim());
            setEditingPosition(null);
            const updatedPositions = await getPositionsForDepartment(selectedDeptForPositions);
            setPositions(updatedPositions);
        } catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred.");
        }
    };

    const handleDeletePosition = async (positionName: string) => {
        if (window.confirm(`Are you sure you want to delete the position "${positionName}"? This action cannot be undone.`)) {
            try {
                await deletePositionFromDepartment(selectedDeptForPositions, positionName);
                const updatedPositions = await getPositionsForDepartment(selectedDeptForPositions);
                setPositions(updatedPositions);
            } catch (error) {
                alert(error instanceof Error ? error.message : "An unknown error occurred.");
            }
        }
    };

    const filteredDepartments = useMemo(() =>
        departments.filter(dept =>
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchQuery.toLowerCase())
        ), [departments, searchQuery]);

    const getEmployeeName = (employeeId: string) => employees.find(e => e.employeeId === employeeId)?.name || 'N/A';

    return (
        <>
            <DepartmentModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveDepartment} department={editingDept} employees={employees} />
            <div className="space-y-4 md:space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Department Management</h1>
                    <button onClick={() => handleOpenModal(null)} className="w-full sm:w-auto bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>Add Department</span>
                    </button>
                </div>

                <Card>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search departments by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                    {loading ? <Spinner/> : (
                         <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                               {filteredDepartments.map(dept => (
                                   <div key={dept.departmentId} className="border rounded-lg p-4 space-y-3">
                                       <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{dept.name} ({dept.code})</h3>
                                                <p className="text-sm text-gray-500">Head: {getEmployeeName(dept.headId)}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${dept.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{dept.status}</span>
                                       </div>
                                       <p className="text-sm text-gray-600">Employees: <span className="font-medium">{dept.employeeCount}</span></p>
                                       <div className="pt-2 border-t mt-3">
                                            <button onClick={() => handleOpenModal(dept)} className="w-full text-center text-teal-600 hover:text-teal-800 font-semibold text-sm py-1">Edit</button>
                                       </div>
                                   </div>
                               ))}
                            </div>

                             {/* Desktop Table View */}
                             <div className="overflow-x-auto hidden md:block">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-3 font-semibold text-gray-600">Department Name</th>
                                            <th className="p-3 font-semibold text-gray-600">Code</th>
                                            <th className="p-3 font-semibold text-gray-600">Department Head</th>
                                            <th className="p-3 font-semibold text-gray-600">Employees</th>
                                            <th className="p-3 font-semibold text-gray-600">Status</th>
                                            <th className="p-3 font-semibold text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDepartments.map(dept => (
                                            <tr key={dept.departmentId} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-800">{dept.name}</td>
                                                <td className="p-3 text-gray-600">{dept.code}</td>
                                                <td className="p-3 text-gray-600">{getEmployeeName(dept.headId)}</td>
                                                <td className="p-3 text-gray-600">{dept.employeeCount}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${dept.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{dept.status}</span>
                                                </td>
                                                <td className="p-3">
                                                    <button onClick={() => handleOpenModal(dept)} className="text-teal-600 hover:text-teal-800 font-semibold">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </>
                    )}
                </Card>

                <Card title="Manage Positions">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="dept-select-positions" className="block text-sm font-medium text-gray-700">Select Department</label>
                            <select
                                id="dept-select-positions"
                                value={selectedDeptForPositions}
                                onChange={(e) => setSelectedDeptForPositions(e.target.value)}
                                className="mt-1 block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                disabled={loading}
                            >
                                {departments.map(d => <option key={d.departmentId} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>

                        {loadingPositions ? <Spinner /> : (
                            <div>
                                <h4 className="text-md font-semibold text-gray-800 mb-2">Positions in {selectedDeptForPositions || '...'}</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-md p-2 bg-gray-50/50">
                                    {positions.length > 0 ? positions.map(pos => (
                                        <div key={pos} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm border">
                                            {editingPosition?.oldName === pos ? (
                                                <input
                                                    type="text"
                                                    value={editingPosition.newName}
                                                    onChange={(e) => setEditingPosition({ ...editingPosition, newName: e.target.value })}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-teal-500 focus:ring-teal-500"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdatePosition()}
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-800">{pos}</span>
                                            )}
                                            
                                            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                                {editingPosition?.oldName === pos ? (
                                                    <>
                                                        <button onClick={handleUpdatePosition} className="text-green-600 hover:text-green-800 font-semibold">Save</button>
                                                        <button onClick={() => setEditingPosition(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setEditingPosition({ oldName: pos, newName: pos })} className="text-teal-600 hover:text-teal-800 font-semibold text-sm">Edit</button>
                                                        <button onClick={() => handleDeletePosition(pos)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 p-2">No positions found for this department.</p>}
                                </div>
                                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                                    <input
                                        type="text"
                                        value={newPositionName}
                                        onChange={(e) => setNewPositionName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddPosition()}
                                        placeholder="Add new position name"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                    />
                                    <button onClick={handleAddPosition} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 text-sm whitespace-nowrap">Add Position</button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
};

export default DepartmentManagement;
