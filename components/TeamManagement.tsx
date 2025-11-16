
import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import { UserAccount, Role, KpiMaster, DepartmentDetails } from '../types';
import { getKpisByDepartment, getAllKpis, addKpi, updateKpi, getDepartments } from '../services/mockApi';
import Spinner from './common/Spinner';

interface TeamManagementProps {
    user: UserAccount;
}

const KpiModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (kpi: KpiMaster) => void;
    kpi: KpiMaster | null;
    user: UserAccount;
}> = ({ isOpen, onClose, onSave, kpi, user }) => {
    const isNew = kpi === null;
    const [departments, setDepartments] = useState<DepartmentDetails[]>([]);
    const [formData, setFormData] = useState<Omit<KpiMaster, 'kpiId'>>({
        kpiName: '',
        description: '',
        weight: 0,
        department: user.department || '',
    });

    useEffect(() => {
        if (user.role === Role.Admin) {
            getDepartments().then(setDepartments);
        }
    }, [user.role]);

    useEffect(() => {
        const defaultDept = user.department || (departments.length > 0 ? departments[0].name : '');
        if (kpi) {
            setFormData({
                kpiName: kpi.kpiName,
                description: kpi.description,
                weight: kpi.weight,
                department: kpi.department,
            });
        } else {
             setFormData({
                kpiName: '',
                description: '',
                weight: 0,
                department: defaultDept,
            });
        }
    }, [kpi, user.department, departments]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'weight' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const kpiToSave = isNew ? formData : { ...formData, kpiId: kpi!.kpiId };
        onSave(kpiToSave as KpiMaster);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{isNew ? 'Add New KPI' : 'Edit KPI'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">KPI Name</label>
                        <input type="text" name="kpiName" value={formData.kpiName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (%)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="0" max="100" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                    </div>
                    {user.role === Role.Admin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                {departments.map(d => <option key={d.departmentId} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">Save KPI</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const KpiManagement: React.FC<TeamManagementProps> = ({ user }) => {
    const [kpis, setKpis] = useState<KpiMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKpi, setEditingKpi] = useState<KpiMaster | null>(null);

    const fetchData = async () => {
        setLoading(true);
        let kpiData: KpiMaster[] = [];
        if (user.role === Role.Admin) {
            kpiData = await getAllKpis();
        } else if (user.role === Role.DeptHead && user.department) {
            kpiData = await getKpisByDepartment(user.department);
        }
        setKpis(kpiData);
        setLoading(false);
    }
    
    useEffect(() => {
        fetchData();
    }, [user]);

    const handleOpenModal = (kpi: KpiMaster | null) => {
        setEditingKpi(kpi);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingKpi(null);
    };

    const handleSaveKpi = async (kpiToSave: KpiMaster) => {
        if (kpiToSave.kpiId) { // Existing KPI
            await updateKpi(kpiToSave);
        } else { // New KPI
            await addKpi(kpiToSave);
        }
        fetchData();
        handleCloseModal();
    };


    return (
        <>
            <KpiModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveKpi} kpi={editingKpi} user={user} />
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">KPI Management</h1>
                    <button onClick={() => handleOpenModal(null)} className="w-full sm:w-auto bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>Add New KPI</span>
                    </button>
                </div>
                <Card>
                    {loading ? <Spinner/> : (
                        <>
                         {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                           {kpis.map(kpi => (
                               <div key={kpi.kpiId} className="border rounded-lg p-4 space-y-3">
                                   <div>
                                     <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 pr-2">{kpi.kpiName}</h3>
                                        <span className="flex-shrink-0 font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full text-sm">{kpi.weight}%</span>
                                     </div>
                                     {user.role === Role.Admin && <p className="text-sm text-gray-500">{kpi.department}</p>}
                                   </div>
                                   <p className="text-sm text-gray-600">{kpi.description}</p>
                                   <div className="pt-2 border-t mt-3">
                                        <button onClick={() => handleOpenModal(kpi)} className="w-full text-center text-teal-600 hover:text-teal-800 font-semibold text-sm py-1">Edit KPI</button>
                                   </div>
                               </div>
                           ))}
                        </div>
                         {/* Desktop Table View */}
                         <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3 font-semibold text-gray-600">KPI Name</th>
                                        {user.role === Role.Admin && <th className="p-3 font-semibold text-gray-600">Department</th>}
                                        <th className="p-3 font-semibold text-gray-600">Description</th>
                                        <th className="p-3 font-semibold text-gray-600">Weight</th>
                                        <th className="p-3 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kpis.map(kpi => (
                                        <tr key={kpi.kpiId} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{kpi.kpiName}</td>
                                            {user.role === Role.Admin && <td className="p-3 text-gray-600">{kpi.department}</td>}
                                            <td className="p-3 text-gray-600 max-w-sm truncate">{kpi.description}</td>
                                            <td className="p-3 text-gray-600">{kpi.weight}%</td>
                                            <td className="p-3">
                                                <button onClick={() => handleOpenModal(kpi)} className="text-teal-600 hover:text-teal-800 font-semibold">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </Card>
            </div>
        </>
    );
};

export default KpiManagement;