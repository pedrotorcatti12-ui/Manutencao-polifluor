
import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, Equipment, SparePart, MaintenanceStatus, MaintenanceType, ManHourEntry, CorrectiveCategory, PurchaseRequest, TaskDetail, MaintenancePlan, MaterialUsage } from '../types';
import { CloseIcon, PlusIcon, DeleteIcon, CheckCircleIcon, ShoppingCartIcon, ClockIcon, ExclamationTriangleIcon, WrenchIcon, ClipboardListIcon, InfoIcon, InventoryIcon, PackageIcon } from './icons';
import { useDataContext } from '../contexts/DataContext';
import { SearchableSelect } from './SearchableSelect'; 

interface WorkOrderControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: WorkOrder) => void;
    existingOrder: WorkOrder | null;
    equipmentData: Equipment[];
    inventoryData: SparePart[];
    nextOSNumber: string; 
    maintainers: string[];
    requesters: string[];
}

type Tab = 'description' | 'execution' | 'purchasing' | 'analysis' | 'checklist';

export const WorkOrderControlModal: React.FC<WorkOrderControlModalProps> = ({ 
    isOpen, onClose, onSave, existingOrder, equipmentData, inventoryData, nextOSNumber, maintainers, requesters 
}) => {
    const { maintenancePlans, setInventoryData } = useDataContext();
    const [activeTab, setActiveTab] = useState<Tab>('description');
    
    // Core Data
    const [id, setId] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [type, setType] = useState<MaintenanceType>(MaintenanceType.Corrective);
    const [status, setStatus] = useState<MaintenanceStatus>(MaintenanceStatus.Scheduled);
    const [scheduledDate, setScheduledDate] = useState(''); 
    const [requestDate, setRequestDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [observations, setObservations] = useState('');
    const [manHours, setManHours] = useState<ManHourEntry[]>([]);
    const [correctiveCategory, setCorrectiveCategory] = useState<CorrectiveCategory | undefined>(undefined);
    const [rootCause, setRootCause] = useState('');
    const [checklist, setChecklist] = useState<TaskDetail[]>([]);
    const [requester, setRequester] = useState('');
    
    // Material & Purchasing
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
    const [materialsUsed, setMaterialsUsed] = useState<MaterialUsage[]>([]);
    const [selectedPartId, setSelectedPartId] = useState('');
    const [useQuantity, setUseQuantity] = useState(1);
    
    // Validation State
    const [dateError, setDateError] = useState<string | null>(null);

    const selectedEquipment = useMemo(() => equipmentData.find(e => e.id === equipmentId), [equipmentId, equipmentData]);

    const equipmentOptions = useMemo(() => {
        return equipmentData.map(eq => ({
            value: eq.id,
            label: `${eq.id} - ${eq.name}`,
            category: eq.location
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [equipmentData]);

    useEffect(() => {
        if (isOpen) {
            if (existingOrder) {
                setId(existingOrder.id);
                setEquipmentId(existingOrder.equipmentId);
                setType(existingOrder.type);
                setStatus(existingOrder.status);
                setScheduledDate(existingOrder.scheduledDate);
                setRequestDate(existingOrder.requestDate || existingOrder.scheduledDate);
                setEndDate(existingOrder.endDate || '');
                setDescription(existingOrder.description);
                setObservations(existingOrder.observations);
                setManHours(existingOrder.manHours || []);
                setPurchaseRequests(existingOrder.purchaseRequests || []);
                setMaterialsUsed(existingOrder.materialsUsed || []);
                setCorrectiveCategory(existingOrder.correctiveCategory);
                setRootCause(existingOrder.rootCause || '');
                setRequester(existingOrder.requester || '');
                
                const eq = equipmentData.find(e => e.id === existingOrder.equipmentId);
                
                if (existingOrder.type === MaintenanceType.Predictive) {
                    setChecklist([
                        { action: "Análise de Vibração" },
                        { action: "Termografia de Painéis e Motores" },
                        { action: "Coleta e Análise de Óleo" }
                    ]);
                    setActiveTab('checklist');
                } else if (existingOrder.type === MaintenanceType.Preventive || existingOrder.type === MaintenanceType.RevisaoPeriodica) {
                    const taskInSch = eq?.schedule.find(s => s.osNumber === existingOrder.id || s.id === existingOrder.id);
                    if (taskInSch?.details && taskInSch.details.length > 0) {
                        setChecklist(taskInSch.details);
                    } else {
                        const plan = maintenancePlans.find(p => p.equipmentTypeId === eq?.model);
                        setChecklist(plan?.tasks || []);
                    }
                    setActiveTab('checklist');
                } else {
                    setChecklist([]);
                    setActiveTab('description');
                }
            } else {
                setId(nextOSNumber);
                const now = new Date().toISOString().slice(0, 16);
                setScheduledDate(now);
                setRequestDate(now);
                setType(MaintenanceType.Corrective);
                setStatus(MaintenanceStatus.Scheduled);
                setChecklist([]);
                setActiveTab('description');
                setMaterialsUsed([]);
                setRequester('');
            }
        }
    }, [existingOrder, nextOSNumber, isOpen, equipmentData, maintenancePlans]);

    // Validação de Datas em Tempo Real
    useEffect(() => {
        if (scheduledDate && endDate) {
            const start = new Date(scheduledDate);
            const end = new Date(endDate);
            if (end < start) {
                setDateError("A data de término não pode ser anterior ao início.");
            } else {
                setDateError(null);
            }
        } else {
            setDateError(null);
        }
    }, [scheduledDate, endDate]);

    const calculatedHH = useMemo(() => {
        if (!scheduledDate || !endDate) return 0;
        const start = new Date(scheduledDate);
        const end = new Date(endDate);
        if (end <= start) return 0;
        return parseFloat(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2));
    }, [scheduledDate, endDate]);

    const handleAddMaterial = () => {
        if (!selectedPartId) return;
        const part = inventoryData.find(p => p.id === selectedPartId);
        if (!part) return;

        if (useQuantity > part.currentStock) {
            alert(`Atenção: Estoque insuficiente! Disponível: ${part.currentStock} ${part.unit}`);
            return;
        }

        const newMaterial: MaterialUsage = {
            partId: part.id,
            partName: part.name,
            quantity: useQuantity,
            unitCost: part.cost,
            totalCost: part.cost * useQuantity
        };

        setMaterialsUsed([...materialsUsed, newMaterial]);
        setSelectedPartId('');
        setUseQuantity(1);
    };

    const handleRemoveMaterial = (index: number) => {
        setMaterialsUsed(materialsUsed.filter((_, i) => i !== index));
    };

    const handleSave = (finalStatus?: MaintenanceStatus) => {
        // Validações de Entrada (Input Safety)
        if (!equipmentId) return alert("Selecione um equipamento.");
        
        if (type === MaintenanceType.Corrective && !correctiveCategory) {
            alert("Para manutenção corretiva, é obrigatório selecionar a Categoria da Falha.");
            return;
        }

        if (dateError) {
            alert("Corrija os erros de data antes de salvar.");
            setActiveTab('execution');
            return;
        }

        if (finalStatus === MaintenanceStatus.Executed) {
            if (!endDate) {
                alert("Para concluir a O.S., a Data de Término é obrigatória.");
                setActiveTab('execution');
                return;
            }
            if (isCorrective && !rootCause) {
                const confirmNoRootCause = window.confirm("Atenção: Você está fechando uma corretiva sem Análise de Causa Raiz. Isso afetará a qualidade IATF. Deseja continuar?");
                if (!confirmNoRootCause) {
                    setActiveTab('analysis');
                    return;
                }
            }
        }

        // LÓGICA DE BAIXA DE ESTOQUE REAL
        if (finalStatus === MaintenanceStatus.Executed) {
            if (materialsUsed.length > 0) {
                setInventoryData(currentInventory => {
                    return currentInventory.map(item => {
                        const usage = materialsUsed.find(m => m.partId === item.id);
                        if (usage) {
                            return { ...item, currentStock: item.currentStock - usage.quantity };
                        }
                        return item;
                    });
                });
            }
        }

        const order: WorkOrder = {
            id, equipmentId, type, status: finalStatus || status, 
            scheduledDate, requestDate, endDate, description, observations, manHours, 
            purchaseRequests, materialsUsed, correctiveCategory, machineStopped: true,
            miscNotes: rootCause, rootCause: rootCause,
            downtimeNotes: `Downtime: ${calculatedHH}h`,
            requester: requester || 'Manutenção',
        };
        onSave(order);
    };

    const isCorrective = type === MaintenanceType.Corrective;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700">
                
                <div className={`px-6 py-4 text-white flex justify-between items-center ${
                    status === MaintenanceStatus.Executed ? 'bg-emerald-600' : 
                    isCorrective ? 'bg-rose-700' : 
                    type === MaintenanceType.Predictive ? 'bg-amber-600' : 'bg-blue-800'
                }`}>
                    <div className="flex items-center gap-3">
                        <WrenchIcon className="w-5 h-5 text-white/80" />
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight">O.S. #{id}</h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                                {selectedEquipment?.id ? `${selectedEquipment.id} - ${selectedEquipment.name}` : 'Nova Ordem de Serviço'} • {type}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><CloseIcon className="w-5 h-5"/></button>
                </div>

                <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {[
                        { id: 'description', label: 'Identificação', icon: <ExclamationTriangleIcon className="w-3.5 h-3.5" />, visible: true },
                        { id: 'checklist', label: 'Checklist Técnico', icon: <ClipboardListIcon className="w-3.5 h-3.5" />, visible: !isCorrective },
                        { id: 'purchasing', label: 'Peças & Estoque', icon: <ShoppingCartIcon className="w-3.5 h-3.5" />, visible: true },
                        { id: 'execution', label: 'Execução / HH', icon: <ClockIcon className="w-3.5 h-3.5" />, visible: true },
                        { id: 'analysis', label: 'Causa Raiz', icon: <InfoIcon className="w-3.5 h-3.5" />, visible: isCorrective }
                    ].filter(t => t.visible).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-6 py-3.5 text-[10.5px] font-black transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-400'}`}
                        >
                            {tab.icon} <span className="uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900 custom-scrollbar">
                    {/* ABA DESCRIÇÃO */}
                    {activeTab === 'description' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="space-y-4">
                                <div>
                                    <SearchableSelect 
                                        label="Selecione o Equipamento/Ativo (Busca Inteligente)"
                                        options={equipmentOptions}
                                        value={equipmentId}
                                        onChange={setEquipmentId}
                                        placeholder="Digite código ou nome (Ex: 'BAN', 'PRENSA')..."
                                        disabled={!!existingOrder}
                                    />
                                    <p className="text-[9px] text-gray-400 mt-1 italic">* Digite para filtrar: Ex: "Banheiro", "Prensa", "Telhado".</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Classificação da O.S.</label>
                                    
                                    {isCorrective ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-black uppercase">CORRETIVA</span>
                                                <span className="text-xs text-gray-400">(Fixo)</span>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Categoria da Falha (Obrigatório)</label>
                                                <select value={correctiveCategory || ''} onChange={e => setCorrectiveCategory(e.target.value as CorrectiveCategory)} className="w-full form-input border-rose-200 text-sm">
                                                    <option value="">Selecione o sistema afetado...</option>
                                                    {Object.values(CorrectiveCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full form-input font-bold">
                                            {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Data da Requisição</label>
                                        <input 
                                            type="datetime-local" 
                                            value={requestDate} 
                                            onChange={e => setRequestDate(e.target.value)} 
                                            className="w-full form-input text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Solicitante</label>
                                        <select value={requester} onChange={e => setRequester(e.target.value)} className="w-full form-input text-xs">
                                            <option value="">Selecione...</option>
                                            {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase">O que ocorreu? (Descreva a falha)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full form-input text-sm bg-yellow-50/30 border-yellow-200 focus:border-yellow-400" placeholder="Ex: Máquina parou com ruído no motor principal..." />
                            </div>
                        </div>
                    )}

                    {/* ABA CHECKLIST */}
                    {activeTab === 'checklist' && (
                        <div className="animate-fade-in">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Plano de Atividades Sugerido</h4>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                {checklist.length > 0 ? checklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-800 uppercase">{item.action}</p>
                                            {item.materials && <p className="text-xs text-gray-500 mt-1">Mat: {item.materials}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-16 text-center text-gray-400">
                                        <ClipboardListIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Sem checklist vinculado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA PEÇAS E ESTOQUE */}
                    {activeTab === 'purchasing' && (
                        <div className="space-y-8 animate-fade-in">
                            
                            {/* SEÇÃO 1: BAIXA DE ESTOQUE (MÍNIMO) */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <h4 className="text-[11px] font-black text-blue-800 dark:text-blue-300 uppercase mb-3 flex items-center gap-2">
                                    <InventoryIcon className="w-4 h-4" /> Baixa de Estoque Mínimo (Uso Interno)
                                </h4>
                                
                                <div className="flex flex-wrap items-end gap-3 mb-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <SearchableSelect 
                                            label="Selecionar Item do Estoque"
                                            options={inventoryData.map(p => ({
                                                value: p.id,
                                                label: `${p.name} (Saldo: ${p.currentStock} ${p.unit})`,
                                                category: p.location
                                            }))}
                                            value={selectedPartId}
                                            onChange={setSelectedPartId}
                                            placeholder="Buscar peça..."
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Qtd</label>
                                        <input type="number" min="1" value={useQuantity} onChange={e => setUseQuantity(Number(e.target.value))} className="w-full form-input text-sm" />
                                    </div>
                                    <button onClick={handleAddMaterial} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-blue-700 shadow-sm">
                                        Registrar Uso
                                    </button>
                                </div>

                                {materialsUsed.length > 0 && (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase text-left">
                                                <tr>
                                                    <th className="px-4 py-2">Peça</th>
                                                    <th className="px-4 py-2 text-center">Qtd</th>
                                                    <th className="px-4 py-2 text-right">Custo Total</th>
                                                    <th className="px-4 py-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {materialsUsed.map((mat, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2">{mat.partName}</td>
                                                        <td className="px-4 py-2 text-center">{mat.quantity}</td>
                                                        <td className="px-4 py-2 text-right font-mono">R$ {mat.totalCost.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button onClick={() => handleRemoveMaterial(i)} className="text-red-400 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* SEÇÃO 2: REQUISIÇÃO DE COMPRAS */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                                        <ShoppingCartIcon className="w-4 h-4" /> Requisição de Compras (Item Não Cadastrado)
                                    </h4>
                                    <button onClick={() => setPurchaseRequests([...purchaseRequests, { id: crypto.randomUUID(), itemDescription: '', requisitionDate: new Date().toISOString().split('T')[0], status: 'Pendente', managerAware: false }])}
                                        className="text-xs text-blue-600 font-bold hover:underline">
                                        + Nova Requisição
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {purchaseRequests.map((req) => {
                                        const start = new Date(req.requisitionDate);
                                        const end = req.arrivalDate ? new Date(req.arrivalDate) : new Date();
                                        const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24));

                                        return (
                                            <div key={req.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-wrap items-center gap-2">
                                                <input type="text" placeholder="Descrição do item para compra..." value={req.itemDescription} onChange={e => setPurchaseRequests(prev => prev.map(p => p.id === req.id ? {...p, itemDescription: e.target.value} : p))} className="flex-[2] min-w-[200px] text-xs font-bold bg-white border border-gray-200 rounded px-2 py-1" />
                                                <input type="number" placeholder="Custo R$" value={req.cost || ''} onChange={e => setPurchaseRequests(prev => prev.map(p => p.id === req.id ? {...p, cost: parseFloat(e.target.value)} : p))} className="w-24 text-xs bg-white border border-gray-200 rounded px-2 py-1" />
                                                
                                                <select value={req.status} onChange={e => setPurchaseRequests(prev => prev.map(p => p.id === req.id ? {...p, status: e.target.value as any} : p))} className="text-[10px] font-black border-none bg-white rounded-full px-3 py-1 shadow-sm w-24">
                                                    <option value="Pendente">PENDENTE</option>
                                                    <option value="Comprado">COMPRADO</option>
                                                    <option value="Entregue">ENTREGUE</option>
                                                </select>
                                                
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${req.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {days} dias
                                                </span>

                                                <button onClick={() => setPurchaseRequests(prev => prev.filter(p => p.id !== req.id))} className="text-gray-300 hover:text-red-500 ml-auto"><DeleteIcon className="w-4 h-4"/></button>
                                            </div>
                                        );
                                    })}
                                    {purchaseRequests.length === 0 && <p className="text-xs text-gray-400 italic">Nenhuma compra externa solicitada.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABA EXECUÇÃO */}
                    {activeTab === 'execution' && (
                        <div className="space-y-6 animate-fade-in">
                            {dateError && (
                                <div className="p-3 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2 border border-red-200">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    {dateError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Início da Atividade (Técnico)</label>
                                    <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full form-input text-xs font-bold" />
                                </div>
                                <div className={`p-4 rounded-xl border ${dateError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Término da Atividade</label>
                                    <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full form-input text-xs font-bold" />
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Homem-Hora (Downtime)</p>
                                    <p className="text-2xl font-black text-blue-800">{calculatedHH}h</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Observações / Relatório Final</label>
                                <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={6} className="w-full form-input text-sm" placeholder="Descreva o que foi realizado, ajustes feitos e condições encontradas..." />
                            </div>
                        </div>
                    )}

                    {/* ABA ANÁLISE */}
                    {activeTab === 'analysis' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100">
                                <h5 className="text-[11px] font-black text-rose-700 uppercase mb-3 tracking-widest flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4" /> Investigação de Causa (Padrão IATF)
                                </h5>
                                <textarea value={rootCause} onChange={e => setRootCause(e.target.value)} rows={4} className="w-full form-input bg-white border-rose-200 text-sm" placeholder="Análise de porquês da falha..." />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 font-bold text-xs text-gray-500 hover:bg-gray-100 transition-all uppercase">Cancelar</button>
                    <button onClick={() => handleSave()} className="px-6 py-2.5 rounded-xl bg-slate-700 text-white font-black text-xs shadow-md hover:bg-slate-800 transition-all uppercase">Salvar Rascunho</button>
                    <button onClick={() => {
                        if (!endDate) setEndDate(new Date().toISOString().slice(0, 16));
                        handleSave(MaintenanceStatus.Executed);
                    }} className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-wider flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Concluir & Baixar Estoque
                    </button>
                </div>
            </div>
        </div>
    );
};