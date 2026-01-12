
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
import { useAdvancedMetrics, AdvancedReportData } from '../hooks/useAdvancedMetrics';
import { ChevronDownIcon, ExclamationTriangleIcon, TargetIcon } from '../components/icons';
import { useDebounce } from '../hooks/useDebounce';
import { useDataContext } from '../contexts/DataContext';

// METAS DEFINIDAS PELA GESTÃO
const TARGETS = {
    MTBF_MIN: 100,      // Objetivo Mínimo: 100 horas
    MTTR_MAX: 5,        // Objetivo Máximo (calculado para sustentar 95% disp): 5 horas
    AVAILABILITY_MIN: 95 // Objetivo Mínimo: 95%
};

interface MultiSelectDropdownProps {
    equipmentData: { id: string, name: string }[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

// Componente de Seleção Múltipla com Busca
const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ equipmentData, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 200);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredEquipment = useMemo(() =>
        equipmentData.filter(eq =>
            `${eq.id} - ${eq.name}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ), [equipmentData, debouncedSearchTerm]);

    const handleToggle = (id: string) => {
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onChange(newSelectedIds);
    };

    const handleSelectAll = () => {
        onChange(filteredEquipment.map(eq => eq.id));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipamentos</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-left text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none flex justify-between items-center"
            >
                <span className="truncate">{selectedIds.length > 0 ? `${selectedIds.length} selecionado(s)` : 'Selecione um ou mais equipamentos'}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="sticky top-0 w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none"
                    />
                    <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                        <button onClick={handleSelectAll} className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Selecionar Todos</button>
                        <button onClick={handleClearAll} className="text-xs text-red-600 dark:text-red-400 font-semibold">Limpar Seleção</button>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredEquipment.map(eq => (
                            <li key={eq.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleToggle(eq.id)}>
                                <label className="flex items-center space-x-2 w-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(eq.id)}
                                        readOnly
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm">{eq.id} - {eq.name}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const KPIGoalLegend: React.FC = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">Metas da Manutenção:</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200">MTBF &ge; {TARGETS.MTBF_MIN}h</span>
            <span className="text-xs text-gray-500">Quanto maior, melhor</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200">MTTR &le; {TARGETS.MTTR_MAX}h</span>
            <span className="text-xs text-gray-500">Quanto menor, melhor</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200">Disp. &ge; {TARGETS.AVAILABILITY_MIN}%</span>
            <span className="text-xs text-gray-500">Objetivo Mínimo</span>
        </div>
    </div>
);

export const AdvancedReportsPage: React.FC = () => {
    const { equipmentData, workOrders } = useDataContext(); 
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState<AdvancedReportData[] | null>(null);

    const calculateMetrics = useAdvancedMetrics();

    const handleGenerateReport = () => {
        if (selectedEquipmentIds.length === 0 || !startDate || !endDate) {
            alert('Por favor, selecione pelo menos um equipamento e um período de datas válido.');
            return;
        }
        const data = calculateMetrics(equipmentData, workOrders, selectedEquipmentIds, startDate, endDate);
        setReportData(data);
    };

    const handleSetDatePreset = (preset: '2026' | 'from_2026' | '2025') => {
        if (preset === '2026') {
            setStartDate('2026-01-01');
            setEndDate('2026-12-31');
        } else if (preset === 'from_2026') {
            setStartDate('2026-01-01');
            const allYears = equipmentData.flatMap(eq => eq.schedule.map(t => t.year));
            const maxYear = Math.max(...allYears, new Date().getFullYear());
            setEndDate(`${maxYear}-12-31`);
        } else if (preset === '2025') {
            setStartDate('2025-01-01');
            setEndDate('2025-12-31');
        }
    };

    const isGenerateDisabled = selectedEquipmentIds.length === 0 || !startDate || !endDate;

    const getValueColorClass = (value: number | null, type: 'mtbf' | 'mttr' | 'availability') => {
        if (value === null) return 'text-gray-400';
        
        switch (type) {
            case 'mtbf':
                return value >= TARGETS.MTBF_MIN ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold';
            case 'mttr':
                return value <= TARGETS.MTTR_MAX ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold';
            case 'availability':
                return value >= TARGETS.AVAILABILITY_MIN ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold';
            default:
                return '';
        }
    };

    return (
        <div>
            <Header
                title="Relatórios Avançados de KPI"
                subtitle="Gere relatórios de confiabilidade com análise de metas."
            />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros do Relatório</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <MultiSelectDropdown
                            equipmentData={equipmentData}
                            selectedIds={selectedEquipmentIds}
                            onChange={setSelectedEquipmentIds}
                        />
                    </div>
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full form-input"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Fim</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full form-input"/>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Períodos Rápidos:</span>
                    <button type="button" onClick={() => handleSetDatePreset('2025')} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 rounded-md text-xs font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                        Ano de 2025 (Histórico)
                    </button>
                    <button type="button" onClick={() => handleSetDatePreset('2026')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Ano de 2026
                    </button>
                    <button type="button" onClick={() => handleSetDatePreset('from_2026')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Desde o início de 2026
                    </button>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerateReport} disabled={isGenerateDisabled} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Gerar Relatório
                    </button>
                </div>
            </div>

            {reportData && (
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados (Ordenado por Nº de Paradas)</h3>
                    </div>
                    
                    <KPIGoalLegend />

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Equipamento</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">TOTAL DE PARADAS</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-1/3">Análise de Recorrência</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">HH Corretivas</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">MTTR (h)</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">MTBF (h)</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Disponibilidade (%)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.length > 0 ? reportData.map((item, index) => (
                                    <tr key={item.equipmentId} className={index < 3 && item.totalFailures > 0 ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                {index < 3 && item.totalFailures > 0 && <span className="mr-2 text-xs font-bold text-red-600 border border-red-600 rounded px-1">TOP {index+1}</span>}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.equipmentId}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.equipmentName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-bold text-gray-800 dark:text-white">{item.totalFailures}</td>
                                        <td className="px-4 py-4 text-sm">
                                            {item.topCauses.length > 0 ? (
                                                <div className="space-y-1">
                                                    {item.topCauses.map((c, i) => (
                                                        <div key={i} className={`flex items-center justify-between text-xs p-1 rounded ${c.count > 1 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                            <span className="truncate max-w-[200px]" title={c.cause}>{c.cause}</span>
                                                            <span className="ml-2 font-bold">{c.count}x</span>
                                                        </div>
                                                    ))}
                                                    {item.hasRecurrence && (
                                                        <div className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
                                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                                            <span>Reincidência</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm">{item.totalCorrectiveHours.toFixed(2)}</td>
                                        <td className={`px-4 py-4 text-center text-sm ${getValueColorClass(item.mttr, 'mttr')}`}>
                                            {item.mttr?.toFixed(2) ?? <span className="text-gray-400 font-normal">N/A</span>}
                                        </td>
                                        <td className={`px-4 py-4 text-center text-sm ${getValueColorClass(item.mtbf, 'mtbf')}`}>
                                            {item.mtbf?.toFixed(2) ?? <span className="text-gray-400 font-normal">N/A</span>}
                                        </td>
                                        <td className={`px-4 py-4 text-center text-sm ${getValueColorClass(item.availability, 'availability')}`}>
                                            {item.availability !== null ? item.availability.toFixed(2) : <span className="text-gray-400 font-normal">N/A</span>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                            Nenhum dado de falha encontrado para os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
