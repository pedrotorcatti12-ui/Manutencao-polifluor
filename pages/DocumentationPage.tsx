
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceTask, MaintenanceType, FlatTask, Equipment } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { PreviewWorkOrderModal } from '../components/PreviewWorkOrderModal';
import { PreviewCorrectiveWorkOrderModal } from '../components/PreviewCorrectiveWorkOrderModal';
import { BulkPrintModal } from '../components/BulkPrintModal';
import { MONTHS } from '../constants';
import { SearchIcon, ClipboardListIcon, TargetIcon } from '../components/icons';

type DocumentType = 'Preventive' | 'Predictive' | 'Corrective';

export const DocumentationPage: React.FC = () => {
    const { equipmentData, setEquipmentData, workOrders, equipmentTypes } = useDataContext();
    const [selectedType, setSelectedType] = useState<DocumentType>('Preventive');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
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
            if (!typeMap[selectedType].includes(taskType)) return false;
            
            if (selectedMonth && item.task.month !== selectedMonth) return false;
            if (selectedFamily !== 'all' && item.equipment.model !== selectedFamily) return false;
            
            const term = debouncedSearchTerm.toLowerCase();
            
            const osVal = item.task.osNumber;
            const osNumberStr = (typeof osVal === 'string' || typeof osVal === 'number' ? String(osVal) : '').toLowerCase();
            
            const eqId = String(item.equipment.id || '').toLowerCase();
            const eqName = String(item.equipment.name || '').toLowerCase();

            return term === '' || 
                   (osNumberStr as string).includes(term) ||
                   (eqId as string).includes(term) ||
                   (eqName as string).includes(term);
        }).sort((a, b) => {
            // ORDENAÇÃO POR CRITICALIDADE PRIMEIRO, DEPOIS POR NÚMERO DE O.S.
            if (a.equipment.isKeyEquipment && !b.equipment.isKeyEquipment) return -1;
            if (!a.equipment.isKeyEquipment && b.equipment.isKeyEquipment) return 1;
            
            const osA = String(a.task.osNumber || '');
            const osB = String(b.task.osNumber || '');
            return osA.localeCompare(osB, undefined, { numeric: true });
        });
    }, [allTasks, selectedType, selectedMonth, selectedYear, selectedFamily, debouncedSearchTerm]);

    const handleBulkPrint = () => {
        // Marca as tarefas como preparadas no banco de dados ao iniciar impressão
        const keysArray: string[] = Array.from(selectedTaskKeys);
        
        setEquipmentData(prev => prev.map(eq => ({
            ...eq,
            schedule: eq.schedule.map(t => {
                const isMatch = keysArray.some((k: string) => k.includes(String(t.id)) && k.includes(String(eq.id)));
                if (isMatch) return { ...t, isPrepared: true, startDate: t.startDate || new Date().toISOString() };
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

    const selectAllFiltered = () => {
        if (selectedTaskKeys.size === filteredTasks.length) {
            setSelectedTaskKeys(new Set());
        } else {
            setSelectedTaskKeys(new Set(filteredTasks.map(t => t.key)));
        }
    };

    return (
        <div className="space-y-4">
            <Header title="Impressão de Documentos" subtitle="Priorização de ativos críticos e registro automático de logs de campo." />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-[10px] uppercase text-gray-400 mb-4 tracking-widest">1. Tipo de Documento</h3>
                        <div className="space-y-2">
                            {(['Preventive', 'Predictive', 'Corrective'] as DocumentType[]).map(t => (
                                <button key={t} onClick={() => { setSelectedType(t); setSelectedTaskKeys(new Set()); }} className={`w-full text-left p-3 rounded-lg border font-black text-xs uppercase transition-all ${selectedType === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-100'}`}>
                                    {t === 'Preventive' ? 'Preventiva (FO-091)' : t === 'Predictive' ? 'Preditiva' : 'Corretiva (FO-005)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-[10px] uppercase text-gray-400 mb-4 tracking-widest">2. Filtro por Família</h3>
                        <select value={selectedFamily} onChange={e => setSelectedFamily(e.target.value)} className="form-input text-xs font-black uppercase text-blue-600">
                            <option value="all">Todas as Famílias</option>
                            {equipmentTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.description}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
                        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="form-input w-32 font-black text-blue-600 border-none bg-blue-50">
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="form-input flex-1 font-bold border-gray-100">
                            <option value="">Todos os Meses</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Busca rápida (OS ou ID)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 form-input border-gray-100" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" checked={selectedTaskKeys.size > 0 && selectedTaskKeys.size === filteredTasks.length} onChange={selectAllFiltered} className="w-4 h-4 rounded text-blue-600" />
                                <span className="text-[10px] font-black uppercase text-gray-500">Selecionar Visíveis ({filteredTasks.length})</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">{selectedTaskKeys.size} Selecionados</span>
                        </div>
                        
                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                            {filteredTasks.map(item => (
                                <div key={item.key} onClick={() => toggleTask(item.key)} className={`group px-6 py-3 border-b border-gray-100 last:border-0 cursor-pointer transition-all flex items-center gap-4 hover:bg-blue-50/30 ${selectedTaskKeys.has(item.key) ? 'bg-blue-50/60' : ''}`}>
                                    <input type="checkbox" checked={selectedTaskKeys.has(item.key)} onChange={() => {}} className="w-4 h-4 rounded text-blue-600 pointer-events-none" />
                                    <div className="flex-1 grid grid-cols-12 items-center gap-4">
                                        <div className="col-span-2 font-black text-sm text-blue-700">#{item.task.osNumber || '---'}</div>
                                        <div className="col-span-6">
                                            <p className="text-[11px] font-black text-gray-800 uppercase flex items-center gap-2">
                                                {item.equipment.isKeyEquipment && <TargetIcon className="w-3 h-3 text-orange-600" title="Equipamento Crítico"/>}
                                                {item.equipment.id} - {item.equipment.name}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{item.equipment.location}</p>
                                        </div>
                                        <div className="col-span-4 text-right">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.task.isPrepared ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                                {item.task.isPrepared ? 'IMPRESSA' : 'PENDENTE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                             <button 
                                onClick={handleBulkPrint} 
                                disabled={selectedTaskKeys.size === 0} 
                                className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all flex items-center gap-2"
                             >
                                <ClipboardListIcon className="w-4 h-4"/> Gerar Lote e Registrar Log ({selectedTaskKeys.size})
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
