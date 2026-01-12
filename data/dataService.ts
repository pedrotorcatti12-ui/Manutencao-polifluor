
// data/dataService.ts
import {
  Equipment,
  MaintenanceStatus,
  MaintenanceTask,
  MaintenanceType,
  StatusConfig,
  TaskDetail,
  EquipmentType,
  MaintenancePlan,
  SparePart
} from '../types';
import { MONTHS } from '../constants';
import { rawEquipmentData, rawInventoryData, rawScheduleRules } from './initialData';

const processedEquipmentData: Equipment[] = rawEquipmentData.map(item => {
    let model = 'OUTROS';
    const match = item.identificacao.match(/^([A-Z\s]+)/);
    if (match) model = match[1].trim().replace(/-$/, '');
    
    return {
        id: item.identificacao,
        name: item.descricao,
        location: item.localizacao,
        status: item.status as 'Ativo' | 'Inativo',
        manufacturer: item.fabricante !== '-' ? item.fabricante : undefined,
        machineModel: item.modelo !== '-' ? item.modelo : undefined,
        yearOfManufacture: item.ano !== '-' ? item.ano : undefined,
        isKeyEquipment: (item as any).isKey || false,
        model: model, 
        schedule: []
    };
});

const ONLY_CORRECTIVE_TYPES = ['BEB', 'QI', 'QD', 'QUADRO', 'CH', 'PO', 'CS', 'CPR', 'QDF', 'QGC'];

export const initialStatusConfig: StatusConfig[] = [
  { id: 'scheduled', label: MaintenanceStatus.Scheduled, color: '#3b82f6', symbol: 'P' },
  { id: 'executed', label: MaintenanceStatus.Executed, color: '#22c55e', symbol: 'E' },
  { id: 'waiting_parts', label: MaintenanceStatus.WaitingParts, color: '#f59e0b', symbol: 'AP' }, 
  { id: 'delayed', label: MaintenanceStatus.Delayed, color: '#ef4444', symbol: 'A' },
  { id: 'deactivated', label: MaintenanceStatus.Deactivated, color: '#6b7280', symbol: 'D' },
  { id: 'none', label: MaintenanceStatus.None, color: 'transparent', symbol: '' },
];

export const initialInventoryData: SparePart[] = rawInventoryData;

export const initialEquipmentTypes: EquipmentType[] = (() => {
    const typesMap = new Map<string, string>();
    processedEquipmentData.forEach(eq => {
        if (!typesMap.has(eq.model)) typesMap.set(eq.model, eq.name);
    });
    return Array.from(typesMap, ([id, description]) => ({ id, description }))
        .sort((a,b) => a.description.localeCompare(b.description));
})();

const toISO = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
};

const generateSchedulesAndPlans = () => {
    const plans: MaintenancePlan[] = [];
    const equipmentWithSchedules: Equipment[] = JSON.parse(JSON.stringify(processedEquipmentData));
    let globalSequence = 1; 

    // A) Gerar Planos e Preventivas para 2026
    for (const rule of rawScheduleRules) {
        if (ONLY_CORRECTIVE_TYPES.some(t => rule.typeId.startsWith(t))) continue;

        const planId = `PLANO-${rule.typeId}`;
        plans.push({ id: planId, description: rule.description, equipmentTypeId: rule.typeId, frequency: rule.frequency, tasks: rule.checklist });

        const targetEquipment = equipmentWithSchedules.filter(eq => eq.model === rule.typeId);
        for (const equipment of targetEquipment) {
            if (equipment.status === 'Inativo') continue;
            let effectiveStartMonth = (equipment.id === 'CF-01') ? 0 : rule.startMonth;

            for (let monthIndex = effectiveStartMonth; monthIndex < 12; monthIndex += rule.frequency) {
                 equipment.schedule.push({
                    id: crypto.randomUUID(),
                    year: 2026,
                    month: MONTHS[monthIndex],
                    status: MaintenanceStatus.Scheduled,
                    type: MaintenanceType.Preventive, 
                    description: rule.description,
                    planId: planId,
                    details: rule.checklist,
                    osNumber: String(globalSequence++).padStart(4, '0'),
                    isPrepared: false 
                });
            }
        }
    }

    // B) Preditivas 2026 (Novembro) - Restaurado conforme solicitado
    const predictiveChecklist: TaskDetail[] = [
        { action: "Análise de Vibração" }, { action: "Termografia" }, { action: "Análise de Óleo" }
    ];
    
    equipmentWithSchedules.forEach(equipment => {
        // Pula preditivas para itens prediais/acessórios
        if (ONLY_CORRECTIVE_TYPES.some(t => equipment.id.startsWith(t) || equipment.model.startsWith(t))) return;

        if (equipment.status === 'Ativo') {
            equipment.schedule.push({
                id: crypto.randomUUID(),
                year: 2026,
                month: 'Novembro',
                status: MaintenanceStatus.Scheduled,
                type: MaintenanceType.Predictive,
                description: `Manutenção Preditiva Anual - ${equipment.name}`,
                details: predictiveChecklist,
                osNumber: String(globalSequence++).padStart(4, '0') // Segue a sequência global
            });
        }
    });

    // C) Dados de 2025 (Histórico Retroativo)
    equipmentWithSchedules.forEach(eq => {
        if (eq.status === 'Inativo') return;
        const isPredial = ONLY_CORRECTIVE_TYPES.some(t => eq.id.startsWith(t));
        const numEntries = isPredial ? 2 : 1;

        for (let i = 0; i < numEntries; i++) {
            const month = Math.floor(Math.random() * 11);
            eq.schedule.push({
                id: crypto.randomUUID(),
                year: 2025,
                month: MONTHS[month],
                status: MaintenanceStatus.Executed,
                type: isPredial ? MaintenanceType.Predial : MaintenanceType.Corrective,
                description: "Registro histórico de manutenção",
                osNumber: String(globalSequence++).padStart(4, '0'),
                startDate: toISO(new Date(2025, month, 10, 8, 0)),
                endDate: toISO(new Date(2025, month, 10, 10, 30)),
                manHours: 2.5,
                maintainer: { name: 'Manutenção Interna', isExternal: false }
            });
        }
    });

    return { plans, equipmentWithSchedules };
};

let initialPlans: MaintenancePlan[] | null = null;
let initialEquipment: Equipment[] | null = null;

const initializeData = () => {
    if (!initialPlans || !initialEquipment) {
        const { plans, equipmentWithSchedules } = generateSchedulesAndPlans();
        initialPlans = plans;
        initialEquipment = equipmentWithSchedules;
    }
};

export const getInitialMaintenancePlans = (): MaintenancePlan[] => { initializeData(); return initialPlans!; };
export const getInitialEquipmentData = (): Equipment[] => { initializeData(); return initialEquipment!; };
