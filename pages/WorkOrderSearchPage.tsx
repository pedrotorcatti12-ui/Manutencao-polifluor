import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from '../components/Header';
// FIX: Import missing WorkOrder type.
import { WorkOrder, Equipment, MaintenanceType, MaintenanceStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
// FIX: Corrected import name for constant.
import { INITIAL_REQUESTERS } from '../constants';
import { useDataContext } from '../contexts/DataContext';

interface Filters {
    id: string;
    equipment: string;
    location: string;
    type: string;
    requester: string;
    description: string;
    observations: string;
    status: string;
    startDate: string;
    endDate: string;
}

const FilterInput: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ name, label, value, onChange, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="w-full form-input" />
    </div>
);

const FilterSelect: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string }> = ({ name, label, value, onChange, children, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full form-input">
            {children}
        </select>
    </div>
);

const FilterDate: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ name, label, value, onChange, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</label>
        <input type="date" id={name} name={name} value={value} onChange={onChange} className="w-full form-input" />
    </div>
);

export const WorkOrderSearchPage: React.FC = () => {
    // FIX: Destructure workOrders from context.
    const { workOrders, equipmentData } = useDataContext();
    const [filters, setFilters] = useState<Partial<Filters>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const debouncedFilters = useDebounce(filters, 300);
    const equipmentMap = useMemo(() => new Map(equipmentData.map(e => [e.id, e])), [equipmentData]);
    const uniqueLocations = useMemo(() => [...new Set(equipmentData.map(eq => eq.location).filter(Boolean).sort())], [equipmentData]);

    const filteredWorkOrders = useMemo(() => {
        return workOrders.filter(order => {
            const equipment = equipmentMap.get(order.equipmentId);
            
            // Text filters
            if (debouncedFilters.id && !order.id.toLowerCase().includes(debouncedFilters.id.toLowerCase())) return false;
            if (debouncedFilters.description && !order.description.toLowerCase().includes(debouncedFilters.description.toLowerCase())) return false;
            if (debouncedFilters.observations && !order.observations.toLowerCase().includes(debouncedFilters.observations.toLowerCase())) return false;

            // Select filters
            if (debouncedFilters.equipment && order.equipmentId !== debouncedFilters.equipment) return false;
            if (debouncedFilters.location && (!equipment || equipment.location !== debouncedFilters.location)) return false;
            if (debouncedFilters.type && order.type !== debouncedFilters.type) return false;
            if (debouncedFilters.requester && order.requester !== debouncedFilters.requester) return false;
            if (debouncedFilters.status && order.status !== debouncedFilters.status) return false;

            // Date filters
            if (debouncedFilters.startDate && order.scheduledDate) {
                if (new Date(order.scheduledDate).setHours(0,0,0,0) < new Date(debouncedFilters.startDate).getTime()) return false;
            }
            if (debouncedFilters.endDate && order.scheduledDate) {
                if (new Date(order.scheduledDate).setHours(0,0,0,0) > new Date(debouncedFilters.endDate).getTime()) return false;
            }

            return true;
        }).sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }, [workOrders, debouncedFilters, equipmentMap]);

    useEffect(() => {
        const numSelected = selectedIds.size;
        const numFiltered = filteredWorkOrders.length;
        if (selectAllCheckboxRef.current) {
            if (numSelected === 0 || numFiltered === 0) {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = false;
            } else if (numSelected === numFiltered) {
                selectAllCheckboxRef.current.checked = true;
                selectAllCheckboxRef.current.indeterminate = false;
            } else {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = true;
            }
        }
    }, [selectedIds, filteredWorkOrders]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(new Set(filteredWorkOrders.map(o => o.id)));
        else setSelectedIds(new Set());
    };
    
    return (
        <div>
            <Header title="Filtro de Ordens de Serviço" subtitle="Pesquise e gere relatórios de O.S. com filtros detalhados." />
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
                    <FilterInput name="id" label="Nº Ordem" value={filters.id || ''} onChange={handleFilterChange} className="md:col-span-1" />
                    
                    <FilterSelect name="equipment" label="Equipamento" value={filters.equipment || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos</option>
                        {equipmentData.map(eq => <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="location" label="Localização" value={filters.location || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todas</option>
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="type" label="Tipo de Manutenção" value={filters.type || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos</option>
                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </FilterSelect>
                    
                    <FilterSelect name="requester" label="Solicitante" value={filters.requester || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos</option>
                        {INITIAL_REQUESTERS.map(r => <option key={r} value={r}>{r}</option>)}
                    </FilterSelect>
                    
                    <FilterInput name="description" label="Descrição da Solicitação" value={filters.description || ''} onChange={handleFilterChange} className="md:col-span-5" />
                    <FilterInput name="observations" label="Observações" value={filters.observations || ''} onChange={handleFilterChange} className="md:col-span-5" />
                    
                    <FilterSelect name="status" label="Status" value={filters.status || ''} onChange={handleFilterChange} className="md:col-span-2">
                        <option value="">Todos</option>
                        {Object.values(MaintenanceStatus).filter(s => s !== MaintenanceStatus.None).map(s => <option key={s} value={s}>{s}</option>)}
                    </FilterSelect>

                    <FilterDate name="startDate" label="Data Prog. >=" value={filters.startDate || ''} onChange={handleFilterChange} className="md:col-span-2" />
                    <FilterDate name="endDate" label="Data Prog. <=" value={filters.endDate || ''} onChange={handleFilterChange} className="md:col-span-2" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-3 w-12"><input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} /></th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Nº</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Equipamento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Descrição</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredWorkOrders.length > 0 ? (
                                filteredWorkOrders.map(order => {
                                    const equipment = equipmentMap.get(order.equipmentId);
                                    return (
                                        <tr key={order.id}>
                                            <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => handleSelect(order.id)} /></td>
                                            <td className="px-4 py-4 font-bold">{order.id}</td>
                                            <td className="px-4 py-4 text-sm">{equipment?.name || 'N/A'}</td>
                                            <td className="px-4 py-4 text-sm">{order.type}</td>
                                            <td className="px-4 py-4 text-sm">{order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                            <td className="px-4 py-4 text-sm">{order.status}</td>
                                            <td className="px-4 py-4 text-sm truncate max-w-xs" title={order.description}>{order.description}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Nenhuma ordem de serviço encontrada com os filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4 p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{selectedIds.size} de {filteredWorkOrders.length} selecionado(s)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
