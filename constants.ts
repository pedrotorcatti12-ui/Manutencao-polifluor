
import { MaintenanceType } from './types';

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const INITIAL_INTERNAL_MAINTAINERS = [
    'João Silva',
    'Carlos Pereira',
    'Ana Souza',
    'Marcos Lima',
    'Sampred',
];

export const INITIAL_REQUESTERS = [
    'Produção',
    'Qualidade',
    'Engenharia',
    'Manutenção',
    'ADM'
];

// Added missing predefined lists for plans
export const INITIAL_PREDEFINED_ACTIONS = [
    'Limpeza Geral',
    'Lubrificação de Eixos',
    'Verificação de Terminais',
    'Substituição de Filtros',
    'Inspeção Visual',
    'Teste de Emergência'
];

export const INITIAL_PREDEFINED_MATERIALS = [
    'Óleo Hidráulico',
    'Graxa de Lítio',
    'Pano de Limpeza',
    'Filtro de Ar',
    'Estopa'
];

export const MAINTENANCE_TYPE_CONFIG: { [key in MaintenanceType]: { label: string; color: string; } } = {
    [MaintenanceType.Preventive]: { label: 'Preventiva', color: 'bg-blue-500' },
    [MaintenanceType.Predictive]: { label: 'Preditiva', color: 'bg-yellow-500' },
    [MaintenanceType.Corrective]: { label: 'Corretiva', color: 'bg-red-500' },
    [MaintenanceType.Overhaul]: { label: 'Revisão Geral', color: 'bg-purple-500' },
    [MaintenanceType.RevisaoPeriodica]: { label: 'Revisão Periódica', color: 'bg-lime-500' },
    [MaintenanceType.PrestacaoServicos]: { label: 'Serviços', color: 'bg-indigo-500' },
    [MaintenanceType.Predial]: { label: 'Predial', color: 'bg-stone-500' },
    [MaintenanceType.Melhoria]: { label: 'Melhoria', color: 'bg-sky-500' },
};

// Added missing utility function for metrics
export const getHoursInYear = (year: number): number => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return (isLeapYear ? 366 : 365) * 24;
};