import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, UserProfile, Role } from '../types';
import { getEmployeeById, getAllEmployees, updateUserProfile, getPositionsForDepartment } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

interface UserProfilePageProps {
  user: UserAccount;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const ProfileField: React.FC<{ label: string; value: React.ReactNode; isEditing?: boolean; children?: React.ReactNode; }> = ({ label, value, isEditing, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? children : <div className="mt-1 text-sm text-gray-900">{value || '-'}</div>}
    </div>
);

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onProfileUpdate }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UserProfile>>({});
    const [positions, setPositions] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user.role === Role.Admin;

    const fetchData = async () => {
        setLoading(true);
        const [profileData, allUsersData] = await Promise.all([
            getEmployeeById(user.employeeId),
            getAllEmployees()
        ]);
        if (profileData) {
            setProfile(profileData);
            setEditData(profileData);
            const deptPositions = await getPositionsForDepartment(profileData.department);
            setPositions(deptPositions);
        }
        setAllUsers(allUsersData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [user.employeeId]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditData(profile || {});
        }
        setIsEditing(!isEditing);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({...prev, [name]: value}));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        const updatedProfile = await updateUserProfile(editData as UserProfile);
        onProfileUpdate(updatedProfile); // Notify parent component
        setProfile(updatedProfile);
        setEditData(updatedProfile);
        setIsEditing(false);
    };

    const handleResetPasscode = () => {
        const newPasscode = Math.random().toString(36).slice(-8);
        alert(`AUTOMATION: A new passcode "${newPasscode}" has been sent to ${profile?.email}.`);
    };

    const supervisorName = allUsers.find(u => u.employeeId === profile?.supervisorId)?.name || 'N/A';

    if (loading) return <Spinner />;
    if (!profile) return <div className="text-center text-gray-500">Could not load user profile.</div>;
    
    const renderStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case 'Active': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
            case 'Inactive': return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Inactive</span>;
            case 'Probation': return <span className={`${baseClasses} bg-amber-100 text-amber-800`}>Probation</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
                <div className="flex space-x-2">
                    {isEditing && <button onClick={handleSave} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">Save Changes</button>}
                    <button onClick={handleEditToggle} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">{isEditing ? 'Cancel' : 'Edit Profile'}</button>
                </div>
            </div>
            
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 bg-gray-50/50 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative group">
                        <img src={editData.avatar} alt={profile.name} className="w-24 h-24 rounded-full ring-4 ring-white shadow-md object-cover"/>
                        {isEditing && (
                            <>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChange}
                                />
                            </>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                        <p className="text-gray-600">{profile.position}</p>
                        <p className="text-sm text-gray-500">{profile.department}</p>
                    </div>
                </div>
                
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6">
                        <button onClick={() => setActiveTab('profile')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Profile Details</button>
                        <button onClick={() => setActiveTab('contact')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Contact & Emergency</button>
                        <button onClick={() => setActiveTab('access')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'access' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Access & Role</button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <ProfileField label="Employee ID" value={profile.employeeId} />
                            <ProfileField label="Full Name" value={profile.name} isEditing={isEditing}>
                                <input type="text" name="name" value={editData.name} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                            </ProfileField>
                             <ProfileField label="Department" value={profile.department} />
                            <ProfileField label="Position" value={profile.position} isEditing={isEditing && isAdmin}>
                                <select name="position" value={editData.position} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                    {positions.length > 0 ? (
                                        positions.map(p => <option key={p} value={p}>{p}</option>)
                                    ) : (
                                        <option value="">No positions available</option>
                                    )}
                                </select>
                            </ProfileField>
                            <ProfileField label="Join Date" value={profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : '-'} />
                            <ProfileField label="Supervisor" value={supervisorName} />
                            <ProfileField label="Status" value={renderStatusBadge(profile.status)} />
                            <ProfileField label="Skill Level" value={profile.skillLevel} isEditing={isEditing && isAdmin}>
                                 <select name="skillLevel" value={editData.skillLevel || 'Basic'} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                                    <option>Basic</option><option>Intermediate</option><option>Advanced</option>
                                 </select>
                            </ProfileField>
                             <div className="md:col-span-2">
                                <ProfileField label="Certifications" value={profile.certifications?.join(', ') || 'None'} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'contact' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                             <ProfileField label="Email Address" value={profile.email} />
                             <ProfileField label="Phone Number" value={profile.phone} isEditing={isEditing}>
                                <input type="text" name="phone" value={editData.phone || ''} onChange={handleInputChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                            </ProfileField>
                            <div className="md:col-span-2 mt-4 pt-4 border-t">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ProfileField label="Name" value={profile.emergencyContact?.name} />
                                    <ProfileField label="Phone" value={profile.emergencyContact?.phone} />
                                    <ProfileField label="Relation" value={profile.emergencyContact?.relation} />
                                </div>
                            </div>
                         </div>
                    )}
                     {activeTab === 'access' && (
                         <div className="space-y-4 max-w-md">
                             <ProfileField label="Login Role" value={<span className="font-semibold text-gray-800">{user.role}</span>} />
                             <div>
                                <label className="block text-sm font-medium text-gray-500">Passcode</label>
                                <button onClick={handleResetPasscode} className="mt-1 text-sm text-teal-600 hover:text-teal-800 font-semibold">Send Reset Link</button>
                             </div>
                         </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserProfilePage;