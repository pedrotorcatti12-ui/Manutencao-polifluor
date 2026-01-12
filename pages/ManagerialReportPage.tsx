
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { WorkOrder, MaintenanceType, MaintenanceStatus } from '../types';
import { MONTHS } from '../constants';
import { useDataContext } from '../contexts/DataContext';
import { ShoppingCartIcon, InventoryIcon, ChartIcon } from '../components/icons';

const TYPE_COLORS: { [key in MaintenanceType]?: string } = {
    [MaintenanceType.RevisaoPeriodica]: '#84cc16', 
    [MaintenanceType.Preventive]: '#22c55e',
    [MaintenanceType.PrestacaoServicos]: '#a855f7',
    [MaintenanceType.Predictive]: '#eab308',
    [MaintenanceType.Predial]: '#78716c',
    [MaintenanceType.Melhoria]: '#38bdf8',
    [MaintenanceType.Corrective]: '#ef4444',
    [MaintenanceType.Overhaul]: '#d946ef',
};

const PieChart: React.FC<{ title: string, data: { name: string; value: number; color: string }[] }> = ({ title, data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            {total === 0 ? <div className="flex items-center justify-center h-full"><p className="text-gray-500">Nenhum dado.</p></div> : (
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-32 h-32 rounded-full" style={{ background: `conic-gradient(${data.reduce((acc, item, i, arr) => {
                        const percent = (item.value / total) * 100;
                        const prevPercent = i > 0 ? arr.slice(0, i).reduce((pAcc, pItem) => pAcc + (pItem.value / total) * 100, 0) : 0;
                        return `${acc}, ${item.color} ${prevPercent}% ${prevPercent + percent}%`;
                    }, '')})` }}></div>
                    <div className="flex-1 w-full space-y-1">
                        {data.map(s => (
                            <li key={s.name} className="flex justify-between text-xs">
                                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: s.color }}></span>{s.name}</span>
                                <span className="font-semibold">{s.value} ({((s.value / total) * 100).toFixed(1)}%)</span>
                            </li>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ManagerialReportPage: React.FC = () => {
    const { workOrders, equipmentData } = useDataContext();
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [activeTab, setActiveTab] = useState<'general' | 'costs'>('general');

    // DADOS GERAIS (EXISTENTE)
    const allMaintenanceItems = useMemo(() => {
        const items: { year: number, monthIndex: number, type: MaintenanceType, status: MaintenanceStatus }[] = [];
        equipmentData.forEach(eq => eq.schedule.forEach(task => {
            if (task.status !== MaintenanceStatus.None && task.status !== MaintenanceStatus.Deactivated && task.type) {
                const monthIndex = task.startDate ? new Date(task.startDate).getMonth() : MONTHS.indexOf(task.month);
                if (monthIndex >= 0) items.push({ year: task.year, monthIndex, type: task.type, status: task.status });
            }
        }));
        workOrders.forEach(order => {
            if (order.scheduledDate && order.type) {
                const date = new Date(order.scheduledDate);
                items.push({ year: date.getFullYear(), monthIndex: date.getMonth(), type: order.type, status: order.status });
            }
        });
        return items;
    }, [equipmentData, workOrders]);

    // DADOS DE COMPRAS E MATERIAIS (NOVO)
    const materialsData = useMemo(() => {
        const reportRows: any[] = [];
        let totalPreventiveCost = 0;
        let totalCorrectiveCost = 0;

        // 1. Processar Uso de Estoque (Geralmente Preventivas e Manutenções de Rotina)
        workOrders.filter(wo => new Date(wo.scheduledDate).getFullYear() === selectedYear).forEach(wo => {
            if (wo.materialsUsed) {
                wo.materialsUsed.forEach(mat => {
                    const cost = mat.totalCost || 0;
                    if (wo.type === MaintenanceType.Corrective) totalCorrectiveCost += cost;
                    else totalPreventiveCost += cost;

                    reportRows.push({
                        date: new Date(wo.scheduledDate),
                        month: MONTHS[new Date(wo.scheduledDate).getMonth()],
                        os: wo.id,
                        type: wo.type,
                        item: mat.partName,
                        qty: mat.quantity,
                        cost: cost,
                        source: 'Estoque Mínimo'
                    });
                });
            }
            
            // 2. Processar Requisições de Compra (Geralmente Corretivas)
            if (wo.purchaseRequests) {
                wo.purchaseRequests.filter(req => req.status === 'Comprado' || req.status === 'Entregue').forEach(req => {
                    const cost = req.cost || 0;
                    if (wo.type === MaintenanceType.Corrective) totalCorrectiveCost += cost;
                    else totalPreventiveCost += cost;

                    reportRows.push({
                        date: new Date(wo.scheduledDate),
                        month: MONTHS[new Date(wo.scheduledDate).getMonth()],
                        os: wo.id,
                        type: wo.type,
                        item: req.itemDescription,
                        qty: 1, // Requisição geralmente é unitária no array ou descritiva
                        cost: cost,
                        source: 'Compra Externa'
                    });
                });
            }
        });

        return { rows: reportRows.sort((a,b) => b.date.getTime() - a.date.getTime()), totalPreventiveCost, totalCorrectiveCost };
    }, [workOrders, selectedYear]);

    // Dados processados para gráficos gerais
    const processedData = useMemo(() => {
        const dataByMonth: { [key: string]: number[] } = {};
        Object.values(MaintenanceType).forEach(type => dataByMonth[type] = Array(12).fill(0));
        const itemsThisYear = allMaintenanceItems.filter(item => item.year === selectedYear);
        itemsThisYear.forEach(item => { if (dataByMonth[item.type]) dataByMonth[item.type]![item.monthIndex]++; });
        
        const monthlyTotals = Array(12).fill(0);
        Object.values(dataByMonth).forEach(monthData => monthData.forEach((count, i) => monthlyTotals[i] += count));
        const typeTotals = Object.values(MaintenanceType).map(type => ({ name: type, value: dataByMonth[type]!.reduce((a, b) => a + b, 0), color: TYPE_COLORS[type] || '#ccc' })).filter(i => i.value > 0);
        const monthlyDistribution = MONTHS.map((month, i) => ({ name: month, value: monthlyTotals[i], color: '#3b82f6' })).filter(i => i.value > 0);
        
        return { typeTotals, monthlyDistribution, maxMonthlyTotal: Math.max(...monthlyTotals, 1), dataByMonth };
    }, [selectedYear, allMaintenanceItems]);

    return (
        <div>
            <Header
                title="Relatórios Gerenciais"
                subtitle={`Análise do ano de ${selectedYear}.`}
                 actions={
                    <div className="flex items-center gap-2">
                        <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value, 10))} className="form-input py-1 font-bold text-blue-600">
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                }
            />

            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('general')} className={`pb-2 px-4 text-sm font-bold uppercase transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <ChartIcon className="inline w-4 h-4 mr-2"/> Visão Geral (Ordens)
                </button>
                <button onClick={() => setActiveTab('costs')} className={`pb-2 px-4 text-sm font-bold uppercase transition-colors ${activeTab === 'costs' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <ShoppingCartIcon className="inline w-4 h-4 mr-2"/> Custos e Materiais
                </button>
            </div>

            {activeTab === 'general' ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Volume de Manutenção (Mensal)</h3>
                        <div className="flex gap-2 h-52 items-end px-4">
                           {MONTHS.map((month, i) => {
                               const total = processedData.monthlyDistribution.find(m => m.name === month)?.value || 0;
                               return (
                                   <div key={month} className="flex-1 flex flex-col items-center group relative">
                                       <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm hover:bg-blue-200 transition-all relative overflow-hidden" style={{ height: `${(total / processedData.maxMonthlyTotal) * 100}%` }}>
                                            {Object.values(MaintenanceType).map(type => {
                                                const count = processedData.dataByMonth[type]![i];
                                                const pct = (count / total) * 100;
                                                return count > 0 ? <div key={type} style={{ height: `${pct}%`, backgroundColor: TYPE_COLORS[type] }} title={`${type}: ${count}`} className="w-full" /> : null;
                                            })}
                                       </div>
                                       <span className="text-[10px] font-bold mt-2 text-gray-500 uppercase rotate-0">{month.substring(0,3)}</span>
                                   </div>
                               );
                           })}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PieChart title="Distribuição por Tipo" data={processedData.typeTotals} />
                        <PieChart title="Volume Mensal" data={processedData.monthlyDistribution} />
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <p className="text-xs font-black text-green-700 uppercase">Total Gasto em Preventivas (Estoque)</p>
                            <p className="text-2xl font-black text-green-800">R$ {materialsData.totalPreventiveCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                            <p className="text-xs font-black text-rose-700 uppercase">Total Gasto em Corretivas (Compras + Estoque)</p>
                            <p className="text-2xl font-black text-rose-800">R$ {materialsData.totalCorrectiveCost.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-black text-sm text-gray-600 uppercase">Relatório Detalhado de Insumos</h3>
                            <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded">{materialsData.rows.length} registros</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase text-left">
                                    <tr>
                                        <th className="px-6 py-3">Mês</th>
                                        <th className="px-6 py-3">Tipo O.S.</th>
                                        <th className="px-6 py-3">Nº O.S.</th>
                                        <th className="px-6 py-3">Item / Peça</th>
                                        <th className="px-6 py-3 text-center">Origem</th>
                                        <th className="px-6 py-3 text-right">Custo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {materialsData.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-600">{row.month}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${row.type === 'Corretiva' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-bold">#{row.os}</td>
                                            <td className="px-6 py-3">{row.item} <span className="text-gray-400 text-xs ml-1">(x{row.qty})</span></td>
                                            <td className="px-6 py-3 text-center">
                                                {row.source === 'Estoque Mínimo' 
                                                    ? <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-indigo-600"><InventoryIcon className="w-3 h-3"/> Estoque</span>
                                                    : <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-orange-600"><ShoppingCartIcon className="w-3 h-3"/> Compra</span>
                                                }
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-bold text-gray-700">R$ {row.cost.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {materialsData.rows.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400 italic">Nenhum custo registrado neste ano.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
