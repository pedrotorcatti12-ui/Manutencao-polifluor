
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceTask, MaintenanceType, FlatTask, Equipment } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { BulkPrintModal } from '../components/BulkPrintModal';
import { MONTHS } from '../constants';
import { SearchIcon, ClipboardListIcon, TargetIcon } from '../components/icons';

type DocumentType = 'Preventive' | 'Predictive' | 'Corrective';

export const DocumentationPage: React.FC = () => {
    const { equipmentData, setEquipmentData, workOrders, equipmentTypes } = useDataContext();
    const [selectedType, setSelectedType] = useState<DocumentType>('Preventive');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
    const [selectedFamily, setSelectedFamily] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    
    const [selectedTaskKeys, setSelectedTaskKeys] = useState<Set<string>>(new Set());
    const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const allTasks = useMemo((): FlatTask[] => {
        const sch = equipmentData.flatMap(eq =>
            eq.schedule.map(t => ({ 
                equipment: eq, 
                task: t, 
                year: t.year, 
                monthIndex: MONTHS.indexOf(t.month), 
                key: `sch-${eq.id}-${t.id}` 
            }))
        );

        const std = workOrders.map(o => {
             const eq = equipmentData.find(e => e.id === o.equipmentId) || { id: o.equipmentId, name: 'Avulso', location: 'N/A', status: 'Ativo', schedule: [], model: 'OUTROS' } as Equipment;
             const t: MaintenanceTask = { id: o.id, year: new Date(o.scheduledDate).getFullYear(), month: MONTHS[new Date(o.scheduledDate).getMonth()], status: o.status, type: o.type, description: o.description, osNumber: o.id, requester: o.requester, startDate: o.scheduledDate };
             return { equipment: eq, task: t, year: t.year, monthIndex: MONTHS.indexOf(t.month), key: `std-${o.id}` };
        });

        return [...sch, ...std];
    }, [equipmentData, workOrders]);

    const filteredTasks = useMemo(() => {
        const typeMap: Record<DocumentType, MaintenanceType[]> = {
            'Preventive': [MaintenanceType.Preventive, MaintenanceType.RevisaoPeriodica],
            'Predictive': [MaintenanceType.Predictive],
            'Corrective': [MaintenanceType.Corrective],
        };

        return allTasks.filter((item: FlatTask) => {
            if (item.year !== selectedYear) return false;
            
            const taskType = item.task.type as MaintenanceType;
            // FIX: Explicitly cast typeMap[selectedType] or ensure selectedType is typed as DocumentType 
            // to avoid 'Property includes does not exist on type unknown' error.
            if (!taskType || !typeMap[selectedType].includes(taskType)) return false;
            
            if (selectedMonth && item.task.month !== selectedMonth) return false;
            if (selectedFamily !== 'all' && item.equipment.model !== selectedFamily) return false;
            
            const term = debouncedSearchTerm.toLowerCase();
            const osVal = item.task.osNumber || '';
            const eqId = item.equipment.id.toLowerCase();
            const eqName = item.equipment.name.toLowerCase();

            return term === '' || 
                   String(osVal).toLowerCase().includes(term) ||
                   eqId.includes(term) ||
                   eqName.includes(term);
        }).sort((a, b) => {
            if (a.equipment.isKeyEquipment && !b.equipment.isKeyEquipment) return -1;
            if (!a.equipment.isKeyEquipment && b.equipment.isKeyEquipment) return 1;
            return (a.task.osNumber || '').localeCompare(b.task.osNumber || '', undefined, { numeric: true });
        });
    }, [allTasks, selectedType, selectedMonth, selectedYear, selectedFamily, debouncedSearchTerm]);

    const handleBulkPrint = () => {
        const keysArray = Array.from(selectedTaskKeys);
        setEquipmentData(prev => prev.map(eq => ({
            ...eq,
            schedule: eq.schedule.map(t => {
                const isMatch = keysArray.some(k => k.includes(t.id) && k.includes(eq.id));
                if (isMatch) return { ...t, isPrepared: true };
                return t;
            })
        })));
        setIsBulkPrintOpen(true);
    };

    const toggleTask = (key: string) => {
        const newSet = new Set(selectedTaskKeys);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setSelectedTaskKeys(newSet);
    };

    return (
        <div className="space-y-4">
            <Header title="Central de Impressão" subtitle="Gere documentos de campo em lote e organize a rotina da equipe." />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-[10px] uppercase text-gray-400 mb-4 tracking-widest">Tipo de O.S.</h3>
                        <div className="space-y-2">
                            {(['Preventive', 'Predictive', 'Corrective'] as DocumentType[]).map(t => (
                                <button key={t} onClick={() => { setSelectedType(t); setSelectedTaskKeys(new Set()); }} className={`w-full text-left p-3 rounded-lg border font-black text-xs uppercase transition-all ${selectedType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                                    {t === 'Preventive' ? 'Preventiva (FO-091)' : t === 'Predictive' ? 'Preditiva' : 'Corretiva (FO-005)'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="form-input flex-1 font-bold">
                            <option value="">Todos os Meses</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Filtrar lote..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 form-input" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-gray-500">Resultados: {filteredTasks.length}</span>
                            <button onClick={() => setSelectedTaskKeys(new Set(filteredTasks.map(t => t.key)))} className="text-[10px] font-bold text-blue-600 uppercase">Seleccionar Todos</button>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filteredTasks.map(item => (
                                <div key={item.key} onClick={() => toggleTask(item.key)} className={`px-6 py-3 border-b border-gray-100 last:border-0 cursor-pointer flex items-center gap-4 hover:bg-blue-50 ${selectedTaskKeys.has(item.key) ? 'bg-blue-50/60' : ''}`}>
                                    <input type="checkbox" checked={selectedTaskKeys.has(item.key)} readOnly className="w-4 h-4 rounded text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-gray-800 uppercase">#{item.task.osNumber || '---'} | {item.equipment.id} - {item.equipment.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">{item.equipment.location} • {item.task.status}</p>
                                    </div>
                                    {item.task.isPrepared && <span className="text-[8px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">Impresso</span>}
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                             <button 
                                onClick={handleBulkPrint} 
                                disabled={selectedTaskKeys.size === 0} 
                                className="px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-300 transition-all flex items-center gap-2"
                             >
                                <ClipboardListIcon className="w-4 h-4"/> Gerar Lote PDF ({selectedTaskKeys.size})
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {isBulkPrintOpen && (
                <BulkPrintModal 
                    isOpen={true} 
                    onClose={() => setIsBulkPrintOpen(false)} 
                    tasks={allTasks.filter(t => selectedTaskKeys.has(t.key))}
                    documentType={selectedType}
                />
            )}
        </div>
    );
};
