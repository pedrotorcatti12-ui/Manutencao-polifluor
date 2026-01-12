
import { useCallback } from 'react';
import { Equipment, MaintenanceStatus, MaintenanceType, WorkOrder } from '../types';

export interface AdvancedReportData {
    equipmentId: string;
    equipmentName: string;
    period: string;
    mtbf: number | null;
    mttr: number | null;
    availability: number | null;
    totalFailures: number;
    totalCorrectiveHours: number;
    // Novos campos para análise de recorrência
    topCauses: { cause: string; count: number }[];
    hasRecurrence: boolean;
}

export const useAdvancedMetrics = () => {
    const calculateMetrics = useCallback((
        equipmentData: Equipment[], 
        workOrders: WorkOrder[], 
        selectedIds: string[], 
        startDateStr: string, 
        endDateStr: string
    ): AdvancedReportData[] => {
        
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);

        // Validação de Datas
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            return [];
        }

        // 1. TD = TEMPO TOTAL DE FUNCIONAMENTO (Tempo de Calendário no período selecionado)
        const diffTimeMs = Math.abs(end.getTime() - start.getTime());
        const totalAvailableTimeHours = diffTimeMs / (1000 * 60 * 60); // TD

        const selectedEquipment = equipmentData.filter(eq => selectedIds.includes(eq.id));

        const results: AdvancedReportData[] = selectedEquipment.map(equipment => {
            const causeMap = new Map<string, number>();

            const countCause = (cause: string) => {
                if (!cause) return;
                const normalizedCause = cause.trim(); 
                causeMap.set(normalizedCause, (causeMap.get(normalizedCause) || 0) + 1);
            };

            // Helper para calcular horas de parada (Downtime)
            const getDowntimeHours = (startStr?: string, endStr?: string) => {
                if (!startStr || !endStr) return 0;
                const s = new Date(startStr);
                const e = new Date(endStr);
                if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
                const diff = e.getTime() - s.getTime();
                return Math.max(0, diff / (1000 * 60 * 60));
            };

            // --- Coleta de Dados ---

            // A. Falhas no Cronograma (Schedule)
            const internalCorrectives = equipment.schedule.filter(task => {
                const isCorrective = task.type === MaintenanceType.Corrective;
                const isExecuted = task.status === MaintenanceStatus.Executed;
                const hasDate = !!task.startDate; 
                
                if (!isCorrective || !isExecuted || !hasDate) return false;

                const taskDate = new Date(task.startDate!);
                // Verifica se a falha ocorreu DENTRO do período selecionado
                const isInRange = taskDate >= start && taskDate <= end;

                if (isInRange) {
                    const reason = task.rootCause || task.correctiveCategory || task.description || "Não especificado";
                    countCause(reason);
                }

                return isInRange;
            });

            // B. Falhas nas Ordens Avulsas (WorkOrders)
            const externalCorrectives = workOrders.filter(wo => {
                const isMatch = wo.equipmentId === equipment.id;
                const isCorrective = wo.type === MaintenanceType.Corrective;
                const isExecuted = wo.status === MaintenanceStatus.Executed;
                const hasDate = !!wo.scheduledDate;

                if (!isMatch || !isCorrective || !isExecuted || !hasDate) return false;
                
                const woDate = new Date(wo.scheduledDate);
                const isInRange = woDate >= start && woDate <= end;

                if (isInRange) {
                     const reason = wo.correctiveCategory || wo.description || "Não especificado";
                     countCause(reason);
                }

                return isInRange;
            });
            
            // --- Cálculos das Variáveis ---

            // 2. P = Nº DE PARADAS
            const totalFailures = internalCorrectives.length + externalCorrectives.length; 
            
            // 3. TM = TEMPO DE REPARO/MANUTENÇÃO (Soma dos tempos de parada)
            const internalDowntime = internalCorrectives.reduce((sum, task) => sum + getDowntimeHours(task.startDate, task.endDate), 0);
            const externalDowntime = externalCorrectives.reduce((sum, wo) => sum + getDowntimeHours(wo.scheduledDate, wo.endDate), 0);
            const totalCorrectiveHours = internalDowntime + externalDowntime; 

            // --- Aplicação das Fórmulas ---
            
            let mttr: number | null = null;
            let mtbf: number | null = null;
            let availability: number | null = null;

            if (totalFailures > 0) {
                // MTTR = (TEMPO DE MANUTENÇÃO / Nº DE PARADAS)
                mttr = totalCorrectiveHours / totalFailures;
                
                // Cálculo do Tempo Operacional (Uptime) = TD - TM
                const operationalTime = totalAvailableTimeHours - totalCorrectiveHours;
                
                // MTBF = (TEMPO TOTAL DE FUNCIONAMENTO - TEMPO DE REPARO) / Nº DE PARADAS
                // MTBF = Uptime / P
                mtbf = operationalTime > 0 ? operationalTime / totalFailures : 0;

                // % DISPONIBILIDADE = (MTBF / (MTBF + MTTR)) * 100
                if (mtbf + mttr > 0) {
                    availability = (mtbf / (mtbf + mttr)) * 100;
                } else {
                    availability = 0;
                }
            } else {
                // Se não houve paradas, Disponibilidade é 100%
                availability = 100;
                mtbf = null; // Indefinido (ou poderia ser o próprio período)
                mttr = 0;
            }

            // Processar Top Causes
            const topCauses = Array.from(causeMap.entries())
                .map(([cause, count]) => ({ cause, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            const hasRecurrence = topCauses.some(c => c.count > 1);

            return {
                equipmentId: equipment.id,
                equipmentName: equipment.name,
                period: `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`,
                mtbf,
                mttr,
                availability,
                totalFailures,
                totalCorrectiveHours,
                topCauses,
                hasRecurrence
            };
        });

        return results.sort((a, b) => b.totalFailures - a.totalFailures);
    }, []);

    return calculateMetrics;
};
