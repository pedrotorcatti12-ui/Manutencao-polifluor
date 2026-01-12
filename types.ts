
export enum MaintenanceStatus {
    Scheduled = 'Programado',
    Executed = 'Executado',
    Delayed = 'Atrasado',
    Deactivated = 'Desativado',
    WaitingParts = 'Aguardando Peças',
    None = 'Nenhum',
}

export enum MaintenanceType {
    Preventive = 'Preventiva',
    Predictive = 'Preditiva',
    Corrective = 'Corretiva',
    Overhaul = 'Revisão Geral',
    RevisaoPeriodica = 'Revisão Periódica',
    PrestacaoServicos = 'Serviços',
    Predial = 'Predial',
    Melhoria = 'Melhoria',
}

export enum CorrectiveCategory {
    Mechanical = 'Mecânica',
    Electrical = 'Elétrica',
    Hydraulic = 'Hidráulica',
    Pneumatic = 'Pneumática',
    Software = 'Software',
    Operational = 'Operacional',
    Predial = 'Predial',
    Other = 'Outra',
}

export interface TaskDetail {
  action: string;
  materials?: string;
}

export interface PurchaseRequest {
    id: string;
    itemDescription: string;
    purchaseOrderNumber?: string;
    requisitionDate: string;
    arrivalDate?: string;
    status: 'Pendente' | 'Comprado' | 'Entregue';
    cost?: number;
    // Add optional fields used in modals to ensure compatibility
    requisitionTime?: string;
    managerAware?: boolean;
}

export interface MaterialUsage {
    partId: string;
    partName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
}

export interface StatusConfig {
  id: string;
  label: MaintenanceStatus;
  color: string;
  symbol: string;
}

export interface MaintenanceTask {
  id: string;
  year: number;
  month: string;
  status: MaintenanceStatus;
  type: MaintenanceType | null;
  description: string;
  details?: TaskDetail[];
  osNumber?: string;
  priority?: 'Alta' | 'Média' | 'Baixa';
  correctiveCategory?: CorrectiveCategory;
  rootCause?: string;
  maintainer?: { name: string; isExternal: boolean };
  requester?: string;
  startDate?: string; 
  endDate?: string;   
  manHours?: number;
  requestDate?: string;
  purchaseRequests?: PurchaseRequest[]; 
  materialsUsed?: MaterialUsage[];
  isPrepared?: boolean;
  waitingForParts?: boolean;
  planId?: string;
}

export interface Equipment {
  id: string;
  name: string;
  location: string;
  status: 'Ativo' | 'Inativo';
  model?: string; 
  isKeyEquipment?: boolean;
  schedule: MaintenanceTask[];
  individualChecklist?: TaskDetail[];
  customPlanId?: string;
  manufacturer?: string;
  machineModel?: string;
  yearOfManufacture?: string | number;
}

export interface MaintenancePlan {
    id: string;
    description: string;
    equipmentTypeId: string;
    frequency: number; 
    tasks: TaskDetail[];
}

export interface ManHourEntry {
  maintainer: string;
  hours: number;
  date: string;
}

export interface WorkOrder {
    id: string;
    equipmentId: string;
    type: MaintenanceType;
    status: MaintenanceStatus;
    scheduledDate: string;
    requestDate?: string;
    endDate?: string; 
    machineStopped: boolean;
    description: string;
    observations: string;
    manHours: ManHourEntry[];
    materialsUsed: MaterialUsage[];
    rootCause?: string;
    requester?: string;
    correctiveCategory?: CorrectiveCategory;
    purchaseRequests?: PurchaseRequest[];
    isPrepared?: boolean;
    miscNotes?: string;
    downtimeNotes?: string;
}

export type Page =
  | 'home'
  | 'dashboard'
  | 'work_center'
  | 'schedule'
  | 'work_orders'
  | 'equipment'
  | 'plans'
  | 'inventory'
  | 'history'
  | 'settings'
  | 'managerial_report'
  | 'advanced_reports'
  | 'search_os'
  | 'quality'
  | 'information'
  | 'documentation';

export interface EquipmentType {
    id: string;
    description: string;
}

export interface SparePart {
    id: string;
    name: string;
    location: string;
    unit: string;
    cost: number;
    minStock: number;
    currentStock: number;
}

export interface FlatTask {
    equipment: Equipment;
    task: MaintenanceTask;
    year: number;
    monthIndex: number;
    key: string;
}

// Added SelectedTask to fix import errors in modals
export interface SelectedTask extends FlatTask {}

export interface ReliabilityMetrics {
  mtbf: number | null;
  mttr: number | null;
  availability: number | null;
  totalFailures: number;
  totalCorrectiveHours: number;
}

// Added PrintJob to fix import errors in PrintAuditPage
export interface PrintJob {
    id: string;
    jobName: string;
    user: string;
    computer: string;
    printer: string;
    pages: number;
    submittedAt: string;
    status: 'Printed' | 'Pending' | 'Error';
    cost?: number;
}

export type Theme = 'light' | 'dark';