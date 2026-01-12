
import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { useDataContext } from '../contexts/DataContext';
import { MaintenanceStatus, MaintenanceType, Equipment, FlatTask, MaintenanceTask } from '../types';
import { 
    PackageIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ShoppingCartIcon,
    ShieldCheckIcon
} from '../components/icons';
import { HealthGauge } from '../components/HealthGauge';

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
    const { equipmentData, workOrders } = useDataContext();
    const [dashboardYear, setDashboardYear] = useState<number>(2026);

    const dashboardData = useMemo(() => {
        const tasks: any[] = [];
        
        equipmentData.forEach(eq => {
            eq.schedule.forEach(t => {
                if (t.status !== MaintenanceStatus.None && t.status !== MaintenanceStatus.Deactivated) {
                    tasks.push({ ...t, equipmentId: eq.id, equipmentName: eq.name, fullEquipment: eq });
                }
            });
        });

        workOrders.forEach(wo => {
            const eq = equipmentData.find(e => e.id === wo.equipmentId);
            tasks.push({ ...wo, equipmentId: wo.equipmentId, equipmentName: eq?.name || 'Avulso', fullEquipment: eq });
        });

        const filtered = tasks.filter(t => t.year === dashboardYear || (t.scheduledDate && new Date(t.scheduledDate).getFullYear() === dashboardYear));
        const executed = filtered.filter(t => t.status === MaintenanceStatus.Executed).length;
        const delayed = filtered.filter(t => t.status === MaintenanceStatus.Delayed).length;
        const inField = filtered.filter(t => t.isPrepared && t.status !== MaintenanceStatus.Executed).length;
        const total = filtered.length || 1;

        // INOVAÇÃO: Extração de Alertas baseada em inteligência textual
        const criticalKeywords = ['vazamento', 'orçamento', 'diretoria', 'compra', 'peça', 'aguardando', 'cipa', 'sensor', 'laércio', 'vicari'];
        const engineeringAlerts = tasks.filter(t => {
            const obs = (t.observations || t.description || '').toLowerCase();
            return criticalKeywords.some(key => obs.includes(key)) && t.status !== MaintenanceStatus.Executed;
        }).slice(0, 8);

        return { 
            executed, 
            delayed, 
            inField, 
            total, 
            health: Math.max(5, Math.min(100, (executed / total) * 100)),
            engineeringAlerts 
        };
    }, [equipmentData, workOrders, dashboardYear]);

    return (
        <div className="space-y-6">
            <Header 
                title={`Dashboard Operacional ${dashboardYear}`} 
                subtitle="Performance global e monitoramento de alertas de engenharia."
                actions={
                    <select value={dashboardYear} onChange={e => setDashboardYear(Number(e.target.value))} className="form-input font-black text-blue-600 border-blue-200 bg-blue-50">
                        <option value={2026}>Operação Real 2026</option>
                        <option value={2025}>Histórico 2025</option>
                    </select>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<DocumentTextIcon className="w-5 h-5 text-indigo-600"/>} label="O.S. em Campo" value={dashboardData.inField} color="border-indigo-500" />
                <KpiCard icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600"/>} label="O.S. Concluídas" value={dashboardData.executed} color="border-emerald-500" />
                <KpiCard icon={<ExclamationTriangleIcon className="w-5 h-5 text-rose-600"/>} label="Atrasadas" value={dashboardData.delayed} color="border-rose-500" />
                <KpiCard icon={<PackageIcon className="w-5 h-5 text-blue-600"/>} label="Ativos Totais" value={equipmentData.length} color="border-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                    <HealthGauge score={dashboardData.health} />
                    <p className="mt-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Saúde do Cronograma</p>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-rose-600 tracking-widest flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4 text-rose-600"/> Alertas de Engenharia (Identificados em Campo)
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dashboardData.engineeringAlerts.map(alert => (
                            <div key={alert.id} className="p-3 rounded-lg border-l-4 border-rose-500 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded uppercase">{alert.equipmentId}</span>
                                    <span className="text-[9px] font-bold text-gray-400">OS #{alert.osNumber || 'S/N'}</span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium italic line-clamp-2">"{alert.observations || alert.description}"</p>
                                <div className="mt-2 flex justify-end">
                                     <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                </div>
                            </div>
                        ))}
                        {dashboardData.engineeringAlerts.length === 0 && (
                            <div className="col-span-2 py-12 text-center text-gray-400 text-sm">Nenhum alerta crítico detectado nas observações.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
