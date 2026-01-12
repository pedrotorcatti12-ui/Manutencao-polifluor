
import React, { useState, useMemo } from 'react';
import { WorkOrder, Equipment, MaintenanceStatus, MaintenanceType } from '../types';
import { Header } from '../components/Header';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, DocumentTextIcon, ClipboardListIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { WorkOrderFieldModal } from '../components/WorkOrderFieldModal';
import { MONTHS } from '../constants';

interface UnifiedWorkOrderRow {
    id: string;
    uniqueKey: string;
    equipmentId: string;
    equipmentName: string;
    equipmentLocation: string;
    isKeyEquipment: boolean;
    type: MaintenanceType;
    description: string;
    scheduledDate: string;
    status: MaintenanceStatus;
    source: 'schedule' | 'standalone';
    originalData: any;
    year: number;
    isPrepared?: boolean;
}

export const WorkOrderPage: React.FC = () => {
    const { setIsOSModalOpen, setEditingOrder } = useAppContext();
    const { workOrders, setWorkOrders, equipmentData, setEquipmentData, removeWorkOrder } = useDataContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [deletingItem, setDeletingItem] = useState<{ type: 'schedule' | 'standalone', data: any } | null>(null);
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const unifiedList = useMemo(() => {
        const list: UnifiedWorkOrderRow[] = [];
        const equipmentMap = new Map(equipmentData.map(e => [e.id, e]));

        // 1. Ordens Criadas Manualmente
        workOrders.forEach(order => {
            const eq = equipmentMap.get(order.equipmentId);
            const dateObj = order.scheduledDate ? new Date(order.scheduledDate) : new Date();
            list.push({
                id: order.id,
                uniqueKey: `std-${order.id}`,
                equipmentId: order.equipmentId,
                equipmentName: eq ? eq.name : 'Equipamento Avulso',
                equipmentLocation: eq?.location || 'N/A',
                isKeyEquipment: eq?.isKeyEquipment || false,
                type: order.type,
                description: order.description,
                scheduledDate: order.scheduledDate || '',
                status: order.status,
                source: 'standalone',
                originalData: order,
                year: dateObj.getFullYear(),
                isPrepared: (order as any).isPrepared
            });
        });

        // 2. Ordens vindas do Cronograma
        equipmentData.forEach(eq => {
            eq.schedule.forEach(task => {
                if (task.status !== MaintenanceStatus.None && task.status !== MaintenanceStatus.Deactivated) {
                    list.push({
                        id: task.osNumber || task.id,
                        uniqueKey: `sch-${eq.id}-${task.id}`,
                        equipmentId: eq.id,
                        equipmentName: eq.name,
                        equipmentLocation: eq.location,
                        isKeyEquipment: eq.isKeyEquipment || false,
                        type: (task.type as MaintenanceType) || MaintenanceType.Preventive,
                        description: task.description || '',
                        scheduledDate: task.startDate || `${task.month}/${task.year}`,
                        status: task.status,
                        source: 'schedule',
                        originalData: { equipment: eq, task: task },
                        year: task.year,
                        isPrepared: task.isPrepared
                    });
                }
            });
        });

        return list;
    }, [workOrders, equipmentData]);

    const filteredList = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        return unifiedList.filter(item => {
            if (item.year !== selectedYear) return false;
            if (filterType !== 'all' && item.type !== filterType) return false;
            
            if (filterStatus === 'in_field') {
                if (!item.isPrepared) return false;
            } else if (filterStatus !== 'all' && item.status !== filterStatus) {
                return false;
            }

            return item.id.toLowerCase().includes(term) ||
                   item.equipmentName.toLowerCase().includes(term) ||
                   item.equipmentId.toLowerCase().includes(term) ||
                   item.description.toLowerCase().includes(term);
        }).sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, ''));
            const numB = parseInt(b.id.replace(/\D/g, ''));
            if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
            return b.id.localeCompare(a.id);
        });
    }, [unifiedList, debouncedSearchTerm, selectedYear, filterType, filterStatus]);

    const getTypeStyles = (type: MaintenanceType) => {
        switch (type) {
            case MaintenanceType.Corrective: return 'border-l-rose-500 bg-rose-50/30';
            case MaintenanceType.Predictive: return 'border-l-amber-500 bg-amber-50/30';
            case MaintenanceType.Preventive: return 'border-l-blue-500 bg-blue-50/30';
            default: return 'border-l-gray-300';
        }
    };

    const handleEdit = (item: UnifiedWorkOrderRow) => {
        if (item.source === 'standalone') {
            setEditingOrder(item.originalData);
        } else {
            const { task } = item.originalData;
            const tempOrder: WorkOrder = {
                id: task.osNumber || task.id,
                equipmentId: item.originalData.equipment.id,
                type: (task.type as MaintenanceType),
                status: task.status,
                description: task.description,
                scheduledDate: task.startDate || '',
                endDate: task.endDate,
                requester: task.requester || 'Planejamento',
                manHours: [],
                machineStopped: true,
                observations: '',
                materialsUsed: [],
                miscNotes: '',
                downtimeNotes: '',
                purchaseRequests: task.purchaseRequests,
                rootCause: task.rootCause
            };
            setEditingOrder(tempOrder);
        }
        setIsOSModalOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'standalone') {
            // Delete real do DB para Ordens Avulsas
            removeWorkOrder(deletingItem.data.id);
        } else {
            // Apenas remove do schedule (atualiza o array do equipamento, o sync cuida do update do JSONB)
            const { equipment, task } = deletingItem.data;
            setEquipmentData(prev => prev.map(eq => eq.id === equipment.id ? { ...eq, schedule: eq.schedule.filter(t => t.id !== task.id) } : eq));
        }
        setDeletingItem(null);
    };

    const handleProcessFieldUpdate = (osNumbers: string[]) => {
        let foundCount = 0;
        const notFoundIds: string[] = [];
        const processedIds = new Set<string>();
        const targets = osNumbers.map(s => s.toLowerCase());

        setEquipmentData(prev => prev.map(eq => {
            let eqUpdated = false;
            const newSchedule = eq.schedule.map(task => {
                const taskId = (task.osNumber || task.id).toLowerCase();
                if (targets.some(t => taskId === t || taskId.endsWith(t) || t.endsWith(taskId))) {
                    foundCount++;
                    eqUpdated = true;
                    const matchedTarget = targets.find(t => taskId === t || taskId.endsWith(t) || t.endsWith(taskId));
                    if (matchedTarget) processedIds.add(matchedTarget);
                    return { ...task, isPrepared: true };
                }
                return task;
            });
            return eqUpdated ? { ...eq, schedule: newSchedule } : eq;
        }));

        setWorkOrders(prev => prev.map(wo => {
            const woId = wo.id.toLowerCase();
            if (targets.some(t => woId === t || woId.endsWith(t) || t.endsWith(woId))) {
                foundCount++;
                const matchedTarget = targets.find(t => woId === t || woId.endsWith(t) || t.endsWith(woId));
                if (matchedTarget) processedIds.add(matchedTarget);
                return { ...wo, isPrepared: true } as WorkOrder; 
            }
            return wo;
        }));

        targets.forEach(t => {
            if (!processedIds.has(t)) notFoundIds.push(t);
        });

        return { found: foundCount, notFound: notFoundIds };
    };

    return (
        <div className="space-y-4">
            <Header title="Gestão Integrada de O.S." subtitle="Central de ordens preventivas, preditivas e corretivas sincronizadas." 
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => setIsFieldModalOpen(true)} className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 text-xs uppercase tracking-wider">
                            <ClipboardListIcon className="w-4 h-4"/> REGISTRAR SAÍDA (LOTE)
                        </button>
                        <button onClick={() => { setEditingOrder(null); setIsOSModalOpen(true); }} className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-wider">
                            <PlusIcon className="w-4 h-4"/> NOVA CORRETIVA
                        </button>
                    </div>
                }
            />

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-2 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Buscar por OS, ID ou Nome da Máquina..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm form-input border-gray-100 bg-gray-50 focus:bg-white" />
                </div>
                
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input py-2 text-xs font-bold text-gray-600 border-gray-100 uppercase">
                    <option value="all">Todos os Tipos</option>
                    <option value={MaintenanceType.Preventive}>Preventivas</option>
                    <option value={MaintenanceType.Predictive}>Preditivas</option>
                    <option value={MaintenanceType.Corrective}>Corretivas</option>
                </select>

                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input py-2 text-xs font-bold text-gray-600 border-gray-100 uppercase">
                    <option value="all">Todos os Status</option>
                    <option value="in_field">EM CAMPO (Impresso)</option>
                    <option value={MaintenanceStatus.Scheduled}>Programados</option>
                    <option value={MaintenanceStatus.Executed}>Executados</option>
                    <option value={MaintenanceStatus.Delayed}>Atrasados</option>
                    <option value={MaintenanceStatus.WaitingParts}>Aguard. Peças</option>
                </select>

                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="form-input py-2 text-xs font-black text-blue-600 border-gray-100 bg-blue-50/50">
                    <option value={2026}>Operação 2026</option>
                    <option value={2025}>Histórico 2025</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Nº O.S. / Tipo</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Ativo (ID)</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Reg. Campo</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredList.map(item => (
                            <tr key={item.uniqueKey} className={`hover:bg-white transition-all border-l-4 ${getTypeStyles(item.type)}`}>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-black text-blue-700 text-sm">#{item.id}</span>
                                        <span className="text-[9px] font-black uppercase opacity-60 tracking-tighter">{item.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase">{item.equipmentName}</span>
                                        <span className="text-[10px] font-mono text-gray-400">{item.equipmentId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.isPrepared ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit" title="Documento já emitido para campo">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase">EM CAMPO</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-300 uppercase px-2">Pendente</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${
                                        item.status === 'Executado' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 
                                        item.status === 'Atrasado' ? 'bg-rose-50 border-rose-500 text-rose-700 animate-pulse' :
                                        item.status === 'Aguardando Peças' ? 'bg-orange-50 border-orange-500 text-orange-700' :
                                        'bg-blue-50 border-blue-500 text-blue-700'
                                    }`}>{item.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Editar/Lançar"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={() => setDeletingItem({ type: item.source, data: item.originalData })} className="p-2 text-gray-300 hover:text-rose-600 rounded-lg transition-all" title="Excluir"><DeleteIcon className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredList.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">Nenhuma ordem encontrada para os filtros atuais.</div>
                )}
            </div>

            <WorkOrderFieldModal 
                isOpen={isFieldModalOpen}
                onClose={() => setIsFieldModalOpen(false)}
                onProcess={handleProcessFieldUpdate}
            />

            {deletingItem && <ConfirmationModal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} onConfirm={confirmDelete} title="Excluir O.S." message="Deseja remover este registro? Esta ação é irreversível e afetará o histórico do ativo." />}
        </div>
    );
};
