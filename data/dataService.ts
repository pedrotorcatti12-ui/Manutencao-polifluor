import {
  Equipment,
  MaintenanceStatus,
  MaintenanceTask,
  MaintenanceType,
  StatusConfig,
  TaskDetail,
  EquipmentType,
  MaintenancePlan,
  SparePart,
  CorrectiveCategory
} from '../types';
import { MONTHS } from '../constants';
import { rawEquipmentData, rawInventoryData, rawScheduleRules } from './initialData';

// --- SANEAMENTO E MAPEAMENTO INICIAL ---
const processedEquipmentData: Equipment[] = rawEquipmentData.map(item => {
    let model = 'OUTROS';
    const match = item.identificacao.match(/^([A-Z\s]+)/);
    if (match) model = match[1].trim().replace(/-$/, '');
    
    let individualChecklist: TaskDetail[] | undefined = undefined;
    
    // Ajuste AEX-02: Foco em Resistências e Estrutura (Saneamento IATF)
    if (item.identificacao === 'AEX-02') {
        individualChecklist = [
            { action: "VERIFICAR RESISTENCIAS EM ZONAS DE AQUECIMENTO" },
            { action: "VERIFICAR ESTRUTURA FÍSICA DO EQUIPAMENTO" },
            { action: "VERIFICAÇÃO DE VAZAMENTOS" }
        ];
    }

    // Ajuste Proteções: PH-01, 0007 e 0009 agora usam proteção metálica
    if (['PH-01', '0007', '0009'].includes(item.identificacao)) {
        individualChecklist = [
            { action: "VERIFICAR PROTEÇÃO VISUAL METÁLICA" },
            { action: "LUBRIFICAÇÃO DE GUIAS" }
        ];
    }

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
        individualChecklist,
        // CORREÇÃO CRÍTICA: Inicializa como array vazio para evitar erro "not iterable"
        schedule: [] 
    };
});

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

const generateSchedulesAndPlans = () => {
    const plans: MaintenancePlan[] = [];
    const equipmentWithSchedules: Equipment[] = JSON.parse(JSON.stringify(processedEquipmentData));
    
    for (const rule of rawScheduleRules) {
        plans.push({ id: `PLANO-${rule.typeId}`, description: rule.description, equipmentTypeId: rule.typeId, frequency: rule.frequency, tasks: rule.checklist });
    }

    // Função auxiliar para injetar as OS do relatório de Janeiro/2026
    const registerExecution = (eqId: string, os: string, start: string, end: string, obs: string, hh: number) => {
        const eq = equipmentWithSchedules.find(e => e.id === eqId);
        if (eq) {
            // Proteção extra: garante que o schedule exista antes do push
            if (!Array.isArray(eq.schedule)) eq.schedule = [];
            
            eq.schedule.push({
                id: crypto.randomUUID(),
                year: 2026,
                month: 'Janeiro',
                status: MaintenanceStatus.Executed,
                type: MaintenanceType.Preventive,
                description: "Preventiva Realizada (Relatório Jan/26)",
                osNumber: os,
                startDate: `2026-01-${start}`,
                endDate: `2026-01-${end}`,
                manHours: hh,
                observations: obs,
                maintainer: { name: 'Darci', isExternal: false }
            });
        }
    };

    // --- INJEÇÃO DAS 21 ORDENS DE SERVIÇO ---
    registerExecution('PH-15', '0179', '09T11:10', '09T11:45', 'Executado. Verificado por Marcus Amato.', 0.6);
    registerExecution('TA-01', '0183', '09T10:10', '09T11:00', 'Tudo OK.', 0.8);
    registerExecution('TA-02', '0187', '09T08:30', '09T09:10', 'Tudo OK.', 0.7);
    registerExecution('TA-03', '0013', '09T07:30', '09T08:10', 'Tudo OK.', 0.7);
    registerExecution('PH-15', '0043', '08T13:00', '08T13:45', 'MÁQUINA COM VAZAMENTO HIDRÁULICO - AGUARDANDO COTAÇÃO.', 0.75);
    registerExecution('AEX-02', '0303', '08T11:30', '08T12:30', 'Checklist ajustado (Resistências/Estrutura).', 1.0);
    registerExecution('PRD-AC-01', '0006', '08T07:30', '08T08:15', 'Limpeza de grade realizada.', 0.7);
    registerExecution('PH-18', '0127', '07T16:00', '07T16:40', 'Consumo: 10L óleo. FALTA SENSOR CIPA (LAÉRCIO). Vazamento aguarda diretoria.', 0.6);
    registerExecution('PH-01', '0011', '09T13:15', '09T13:40', 'Proteção Metálica OK.', 0.4);
    registerExecution('PH-13', '0147', '09T12:10', '09T12:50', 'Aguardando Diretoria: Buchas colunas.', 0.6);
    registerExecution('TC-01', '0067', '08T08:15', '08T08:50', 'Verificado Correias e Gás.', 0.6);
    registerExecution('TA-04', '0025', '08T15:00', '08T15:40', 'Checklist simplificado.', 0.6);
    registerExecution('TA-05', '0075', '08T10:00', '08T10:30', 'Lubrificação executada.', 0.5);
    registerExecution('FO-01', '0055', '08T14:00', '08T14:35', 'Item Queimador N/A.', 0.6);
    registerExecution('TC-02', '0115', '08T15:40', '08T16:10', 'Adicionado Gás.', 0.5);
    registerExecution('MS-02', '0019', '08T16:30', '08T17:00', 'SOLICITADO COMPRA TOCHA SUMIG.', 0.5);
    registerExecution('EX-01', '0250', '09T14:00', '09T14:35', 'EQUIPAMENTO EM CORRETIVA - AGUARDANDO JUNTA.', 0.6);
    registerExecution('GE-01', '0001', '12T14:00', '12T16:00', 'Manutenção Terceiro (150L Óleo).', 2.0);
    registerExecution('TC-03', '0230', '08T09:00', '08T09:40', 'Sem ressalvas.', 0.6);
    registerExecution('0007', '0007', '08T11:00', '08T11:15', 'Proteção Metálica OK.', 0.25);
    registerExecution('0009', '0009', '08T15:00', '08T15:20', 'Proteção Metálica OK.', 0.3);

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
