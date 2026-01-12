
import React, { useState, useMemo } from 'react';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceStatus, MaintenanceTask, Equipment } from '../types';
import { Header } from '../components/Header';
import { Legend } from '../components/Legend';
import { MaintenanceSchedule } from '../components/MaintenanceSchedule';
import { SearchIcon, TargetIcon, DownloadIcon } from '../components/icons';
import { useAppContext } from '../contexts/AppContext';

export const SchedulePage: React.FC = () => {
    const { equipmentData, statusConfig, setEquipmentData } = useDataContext();
    const { setIsOSModalOpen, setEditingOrder } = useAppContext();
    const [viewYear, setViewYear] = useState(2026);
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyKeyEquipment, setOnlyKeyEquipment] = useState(false);

    const statusMap = useMemo(() => new Map(statusConfig.map(s => [s.label, s])), [statusConfig]);

    const filteredEquipment = useMemo(() => {
        return equipmentData.filter(eq => {
            const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 eq.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesKey = !onlyKeyEquipment || eq.isKeyEquipment;
            return matchesSearch && matchesKey;
        });
    }, [equipmentData, searchTerm, onlyKeyEquipment]);

    const handleTaskClick = (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => {
        // Ao clicar numa célula do cronograma, abre o editor de O.S. sincronizado
        const order = {
            id: task.osNumber || task.id,
            equipmentId: equipment.id,
            type: task.type || 'Preventiva',
            status: task.status,
            description: task.description,
            scheduledDate: task.startDate || `${task.year}-${(monthIndex + 1).toString().padStart(2, '0')}-01T08:00`,
            observations: '',
            manHours: [],
            materialsUsed: [],
            machineStopped: true
        } as any;
        
        setEditingOrder(order);
        setIsOSModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <Header 
                title="Cronograma Mestre de Manutenção" 
                subtitle="Visão anual de todas as paradas programadas e preventivas."
                actions={
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
                            <DownloadIcon className="w-4 h-4"/> Exportar PDF
                        </button>
                        <select 
                            value={viewYear} 
                            onChange={e => setViewYear(Number(e.target.value))}
                            className="form-input font-black text-blue-600 bg-blue-50 border-blue-200"
                        >
                            <option value={2025}>Histórico 2025</option>
                            <option value={2026}>Planejamento 2026</option>
                        </select>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por Máquina ou ID..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 form-input"
                    />
                </div>
                <button 
                    onClick={() => setOnlyKeyEquipment(!onlyKeyEquipment)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${onlyKeyEquipment ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                    <TargetIcon className="w-4 h-4"/> Apenas Críticos (IATF)
                </button>
                <div className="flex items-center gap-2 px-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-black uppercase">Filtrados:</span>
                    <span className="text-sm font-black">{filteredEquipment.length}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <Legend statusMap={statusMap} />
                </div>
                <div className="p-2 overflow-x-auto">
                    <MaintenanceSchedule 
                        equipmentData={filteredEquipment}
                        viewYear={viewYear}
                        statusMap={statusMap}
                        onCellClick={handleTaskClick}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onViewDetails={() => {}}
                        onAddCorrective={() => {}}
                    />
                </div>
            </div>
        </div>
    );
};
