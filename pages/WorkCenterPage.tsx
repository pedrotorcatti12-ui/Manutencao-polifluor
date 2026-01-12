
import React, { useState, useMemo, DragEvent } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { FlatTask, MaintenanceStatus, MaintenanceTask, MaintenanceType, Equipment, WorkOrder } from '../types';
import { TaskCard } from '../components/TaskCard';
import { WorkOrderControlModal } from '../components/WorkOrderControlModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MONTHS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '../components/icons';

const KANBAN_COLUMNS = [
    { id: MaintenanceStatus.Scheduled, title: 'Agenda / Programado', icon: <ClockIcon className="w-6 h-6" />, headerColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200', borderColor: 'border-blue-500' },
    { id: MaintenanceStatus.Delayed, title: 'ATRASADO / URGENTE', icon: <ExclamationTriangleIcon className="w-6 h-6" />, headerColor: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200', borderColor: 'border-red-500' },
    { id: MaintenanceStatus.Executed, title: 'HISTÓRICO / CONCLUÍDO', icon: <CheckCircleIcon className="w-6 h-6" />, headerColor: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200', borderColor: 'border-green-500' },
];

interface ExtendedFlatTask extends FlatTask {
    source: 'schedule' | 'standalone';
}

export const WorkCenterPage: React.FC = () => {
    const { equipmentData, setEquipmentData, workOrders, setWorkOrders, maintainers, requesters, inventoryData } = useDataContext();
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [draggedTaskKey, setDraggedTaskKey] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [deletingTask, setDeletingTask] = useState<ExtendedFlatTask | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaintainer, setSelectedMaintainer] = useState('');
    const [viewYear, setViewYear] = useState(2026);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const allUnifiedTasks = useMemo((): ExtendedFlatTask[] => {
        const sch = equipmentData.flatMap(eq => 
            eq.schedule.filter(t => t.year === viewYear && t.status !== MaintenanceStatus.None && t.status !== MaintenanceStatus.Deactivated)
            .map(t => ({ equipment: eq, task: t, year: t.year, monthIndex: MONTHS.indexOf(t.month), key: `sch-${eq.id}-${t.id}`, source: 'schedule' as const }))
        );

        const std = workOrders.filter(o => {
            const d = new Date(o.scheduledDate);
            return d.getFullYear() === viewYear && o.status !== MaintenanceStatus.Deactivated;
        }).map(o => {
            const eq = equipmentData.find(e => e.id === o.equipmentId) || { id: o.equipmentId, name: 'Máquina Avulsa', location: 'N/A', status: 'Ativo', schedule: [] } as Equipment;
            const task: MaintenanceTask = { id: o.id, year: viewYear, month: '', status: o.status, type: o.type, description: o.description, osNumber: o.id, priority: 'Média', requester: o.requester, startDate: o.scheduledDate, purchaseRequests: o.purchaseRequests };
            return { equipment: eq, task, year: viewYear, monthIndex: 0, key: `std-${o.id}`, source: 'standalone' as const };
        });

        return [...sch, ...std];
    }, [equipmentData, workOrders, viewYear]);

    const filteredTasks = useMemo(() => {
        return allUnifiedTasks.filter(t => {
            const term = debouncedSearchTerm.toLowerCase();
            const matchesSearch = term === '' || t.equipment.id.toLowerCase().includes(term) || t.equipment.name.toLowerCase().includes(term) || (t.task.osNumber && t.task.osNumber.includes(term));
            const matchesMaintainer = selectedMaintainer === '' || t.task.maintainer?.name === selectedMaintainer || (t.source === 'standalone' && workOrders.find(wo => wo.id === t.task.id)?.manHours.some(m => m.maintainer === selectedMaintainer));
            return matchesSearch && matchesMaintainer;
        });
    }, [allUnifiedTasks, debouncedSearchTerm, selectedMaintainer, workOrders]);

    const tasksByColumn = useMemo(() => {
        const cols: Record<string, ExtendedFlatTask[]> = {};
        KANBAN_COLUMNS.forEach(c => cols[c.id] = []);
        filteredTasks.forEach(t => { if (cols[t.task.status]) cols[t.task.status].push(t); });
        return cols;
    }, [filteredTasks]);

    const handleTaskClick = (item: ExtendedFlatTask) => {
        if (item.source === 'standalone') {
            const order = workOrders.find(o => o.id === item.task.id);
            if (order) setSelectedOrder(order);
        } else {
            const orderFromTask: WorkOrder = {
                id: item.task.osNumber || item.task.id,
                equipmentId: item.equipment.id,
                type: item.task.type || MaintenanceType.Corrective,
                status: item.task.status,
                description: item.task.description,
                scheduledDate: item.task.startDate || `${item.year}-${(MONTHS.indexOf(item.task.month)+1).toString().padStart(2,'0')}-01T08:00`,
                endDate: item.task.endDate,
                requester: item.task.requester || 'Cronograma',
                manHours: [],
                machineStopped: true,
                observations: '',
                materialsUsed: [],
                downtimeNotes: '',
                purchaseRequests: item.task.purchaseRequests,
                rootCause: item.task.rootCause
            };
            setSelectedOrder(orderFromTask);
        }
    };

    const handleSaveOrder = (updatedOrder: WorkOrder) => {
        const isFromSchedule = allUnifiedTasks.find(t => (t.task.osNumber === updatedOrder.id || t.task.id === updatedOrder.id) && t.source === 'schedule');

        if (isFromSchedule) {
            setEquipmentData(prev => prev.map(eq => {
                if (eq.id === updatedOrder.equipmentId) {
                    return { ...eq, schedule: eq.schedule.map(t => (t.osNumber === updatedOrder.id || t.id === updatedOrder.id) ? 
                        { ...t, status: updatedOrder.status, description: updatedOrder.description, startDate: updatedOrder.scheduledDate, endDate: updatedOrder.endDate, purchaseRequests: updatedOrder.purchaseRequests, rootCause: updatedOrder.rootCause } : t) };
                }
                return eq;
            }));
        } else {
            setWorkOrders(prev => {
                const exists = prev.some(o => o.id === updatedOrder.id);
                return exists ? prev.map(o => o.id === updatedOrder.id ? updatedOrder : o) : [...prev, updatedOrder];
            });
        }
        setSelectedOrder(null);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, targetStatus: MaintenanceStatus) => {
        e.preventDefault();
        const key = e.dataTransfer.getData('text/plain');
        const item = allUnifiedTasks.find(t => t.key === key);
        if (!item) return;

        if (item.source === 'standalone') {
            setWorkOrders(prev => prev.map(o => o.id === item.task.id ? { ...o, status: targetStatus } : o));
        } else {
            setEquipmentData(prev => prev.map(eq => eq.id === item.equipment.id ? { ...eq, schedule: eq.schedule.map(t => t.id === item.task.id ? { ...t, status: targetStatus } : t) } : eq));
        }
        setDragOverColumn(null);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header title="Centro de Trabalho (Cérebro do Sistema)" subtitle="Gerencie Ordens de Serviço em tempo real. Cada mudança aqui impacta toda a planta." actions={
                <select value={viewYear} onChange={e => setViewYear(Number(e.target.value))} className="form-input font-black text-blue-600">
                    <option value={2025}>2025 (Histórico)</option>
                    <option value={2026}>2026 (Real)</option>
                </select>
            }/>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4">
                <input type="text" placeholder="Filtrar por Máquina ou Nº O.S..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 form-input" />
                <select value={selectedMaintainer} onChange={e => setSelectedMaintainer(e.target.value)} className="form-input w-64">
                    <option value="">Filtrar Mantenedor...</option>
                    {maintainers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
                <div className="flex gap-6 h-full min-w-full">
                    {KANBAN_COLUMNS.map(col => (
                        <div 
                            key={col.id} 
                            onDragOver={e => { e.preventDefault(); setDragOverColumn(col.id); }} 
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={e => handleDrop(e, col.id as MaintenanceStatus)}
                            className={`flex flex-col rounded-xl h-full min-w-[350px] flex-1 transition-all border-t-4 ${col.borderColor} ${dragOverColumn === col.id ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-gray-100/50'}`}
                        >
                            <div className={`p-4 flex justify-between items-center rounded-t-lg ${col.headerColor}`}>
                                <div className="flex items-center gap-2 font-black uppercase tracking-tighter">{col.icon} {col.title}</div>
                                <span className="bg-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">{tasksByColumn[col.id].length}</span>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                {tasksByColumn[col.id].map(t => (
                                    <TaskCard key={t.key} task={t} onTaskClick={handleTaskClick} onDragStart={e => e.dataTransfer.setData('text/plain', t.key)} onDelete={() => setDeletingTask(t)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedOrder && (
                <WorkOrderControlModal 
                    isOpen={!!selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    onSave={handleSaveOrder} 
                    existingOrder={selectedOrder} 
                    equipmentData={equipmentData} 
                    inventoryData={inventoryData} 
                    nextOSNumber="" 
                    maintainers={maintainers} 
                    requesters={requesters} 
                />
            )}
        </div>
    );
};
