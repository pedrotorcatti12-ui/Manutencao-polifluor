
import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceStatus, MaintenanceType, Equipment, FlatTask, MaintenanceTask } from '../types';
import { MONTHS } from '../constants';
import { 
    PackageIcon,
    ClipboardListIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    WrenchIcon,
    TargetIcon,
    DocumentTextIcon,
    ArrowRightIcon
} from '../components/icons';
import { HealthGauge } from '../components/HealthGauge';
import { PreviewWorkOrderModal } from '../components/PreviewWorkOrderModal';
import { PreviewCorrectiveWorkOrderModal } from '../components/PreviewCorrectiveWorkOrderModal';

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; subtext?: string }> = ({ icon, label, value, color, subtext }) => (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${color} transition-all hover:shadow-md`}>
        <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50`}>{icon}</div>
            <div className="ml-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
                {subtext && <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

export const DashboardPage: React.FC = () => {
    const { equipmentData, setEquipmentData, workOrders } = useDataContext();
    const [dashboardYear, setDashboardYear] = useState<number>(2026);
    
    const [selectedPrintTask, setSelectedPrintTask] = useState<FlatTask | null>(null);
    const [printMode, setPrintMode] = useState<'preventive' | 'corrective' | null>(null);

    const dashboardData = useMemo(() => {
        const tasks: any[] = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        equipmentData.forEach(eq => {
            eq.schedule.forEach(t => {
                if (t.status !== MaintenanceStatus.None && t.status !== MaintenanceStatus.Deactivated) {
                    tasks.push({ ...t, equipmentId: eq.id, equipmentName: eq.name, isKey: eq.isKeyEquipment, monthIdx: MONTHS.indexOf(t.month), fullEquipment: eq });
                }
            });
        });

        workOrders.forEach(wo => {
            const eq = equipmentData.find(e => e.id === wo.equipmentId);
            const d = new Date(wo.scheduledDate);
            tasks.push({ ...wo, equipmentId: wo.equipmentId, equipmentName: eq?.name || 'Avulso', isKey: eq?.isKeyEquipment || false, year: d.getFullYear(), monthIdx: d.getMonth(), fullEquipment: eq });
        });

        const filtered = tasks.filter(t => t.year === dashboardYear);
        const executed = filtered.filter(t => t.status === MaintenanceStatus.Executed).length;
        const delayed = filtered.filter(t => t.status === MaintenanceStatus.Delayed).length;
        const correctives = filtered.filter(t => t.type === MaintenanceType.Corrective).length;
        const total = filtered.length || 1;

        // LÓGICA DE 30 DIAS: Varre o cronograma de 2026 para encontrar o que está "no radar"
        const upcomingWindow = tasks.filter(t => {
            if (t.year !== 2026 || t.status !== MaintenanceStatus.Scheduled || t.isPrepared) return false;
            
            // Para tarefas de cronograma que não tem data exata, aproximamos pelo mês
            const currentMonth = now.getMonth();
            const taskMonth = t.monthIdx;
            
            // Mostra tarefas do mês atual e do próximo (equivalente a uma janela de ~30-60 dias no planejamento mensal)
            return taskMonth === currentMonth || taskMonth === (currentMonth + 1) % 12;
        }).sort((a, b) => a.monthIdx - b.monthIdx).slice(0, 6);

        let health = 100;
        if (dashboardYear === 2026) {
            health -= (delayed / total) * 150; 
            health -= (correctives / total) * 50; 
        }
        
        return { executed, delayed, correctives, total, health: Math.max(5, Math.min(100, health)), upcomingWindow };
    }, [equipmentData, workOrders, dashboardYear]);

    const handlePrepareDoc = (task: any) => {
        const fullEq = equipmentData.find(e => e.id === task.equipmentId);
        if (!fullEq) return;

        setEquipmentData(prev => prev.map(eq => {
            if (eq.id === task.equipmentId) {
                return {
                    ...eq,
                    schedule: eq.schedule.map(t => t.id === task.id ? { ...t, isPrepared: true } : t)
                };
            }
            return eq;
        }));

        const flatTask: FlatTask = {
            equipment: fullEq,
            task: { ...task, isPrepared: true },
            year: task.year,
            monthIndex: task.monthIdx,
            key: `dash-${task.id}`
        };

        setSelectedPrintTask(flatTask);
        if (task.type === MaintenanceType.Corrective) setPrintMode('corrective');
        else setPrintMode('preventive');
    };

    return (
        <div className="space-y-6">
            <Header 
                title={`Dashboard Operacional ${dashboardYear}`} 
                subtitle="Visão geral de desempenho e planejamento de curto prazo."
                actions={
                    <select value={dashboardYear} onChange={e => setDashboardYear(Number(e.target.value))} className="form-input font-black text-blue-600 border-blue-200 bg-blue-50">
                        <option value={2026}>Operação Real 2026</option>
                        <option value={2025}>Histórico 2025</option>
                    </select>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<PackageIcon className="w-5 h-5 text-blue-600"/>} label="Ativos em Monitoramento" value={equipmentData.length} color="border-blue-500" />
                <KpiCard icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600"/>} label="O.S. Concluídas" value={dashboardData.executed} color="border-emerald-500" />
                <KpiCard icon={<ExclamationTriangleIcon className="w-5 h-5 text-rose-600"/>} label="Falhas (Corretivas)" value={dashboardData.correctives} color="border-rose-500" />
                <KpiCard icon={<ClockIcon className="w-5 h-5 text-orange-600"/>} label="Ordens Atrasadas" value={dashboardData.delayed} color="border-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                    <HealthGauge score={dashboardData.health} />
                    <p className="mt-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Saúde da Planta baseada em Disponibilidade</p>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-blue-600"/> Janela de Antecedência (Próximos 30 Dias)
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">PLANEJAMENTO</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dashboardData.upcomingWindow.map(item => (
                            <div key={item.id} className="p-3 rounded-lg border border-gray-100 bg-white hover:border-blue-200 transition-all flex justify-between items-center group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">#{item.osNumber || 'PLAN'}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.type === MaintenanceType.Predictive ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                                        <span className="text-[9px] font-black uppercase text-gray-400">{item.month}</span>
                                    </div>
                                    <p className="text-[11px] font-black text-gray-700 uppercase truncate max-w-[180px]">{item.equipmentId} - {item.equipmentName}</p>
                                </div>
                                <button 
                                    onClick={() => handlePrepareDoc(item)}
                                    className="p-2 text-gray-300 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Imprimir Folha de Campo"
                                >
                                    <DocumentTextIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                        {dashboardData.upcomingWindow.length === 0 && (
                            <div className="col-span-2 py-10 text-center text-gray-400 italic text-sm">Nenhuma preventiva programada para o período imediato.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modais de Impressão (Mantidos para funcionalidade do Dashboard) */}
            {printMode === 'preventive' && selectedPrintTask && (
                <PreviewWorkOrderModal
                    isOpen={true}
                    onClose={() => { setSelectedPrintTask(null); setPrintMode(null); }}
                    taskData={selectedPrintTask}
                />
            )}
            {printMode === 'corrective' && selectedPrintTask && (
                <PreviewCorrectiveWorkOrderModal
                    isOpen={true}
                    onClose={() => { setSelectedPrintTask(null); setPrintMode(null); }}
                    taskData={selectedPrintTask}
                />
            )}
        </div>
    );
};
