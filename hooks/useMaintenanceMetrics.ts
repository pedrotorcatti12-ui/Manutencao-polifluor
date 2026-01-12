
import { useMemo } from 'react';
import { Equipment, MaintenanceStatus, MaintenanceType, ReliabilityMetrics, MaintenanceTask } from '../types';
import { getHoursInYear } from '../constants';

export const useMaintenanceMetrics = (equipment: Equipment, year: number) => {
    const { metrics, executedTasks } = useMemo(() => {
        // Filtra tarefas corretivas executadas no ano
        const correctiveTasks = equipment.schedule.filter(
            task => task.year === year && task.type === MaintenanceType.Corrective && task.status === MaintenanceStatus.Executed
        );
        
        // Lista geral de executadas para exibição no histórico
        const executedTasks = equipment.schedule
            .filter(task => task.year === year && task.status === MaintenanceStatus.Executed && task.startDate)
            .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());

        // P = Nº DE PARADAS
        const totalFailures = correctiveTasks.length; 

        // TM = TEMPO DE REPARO/MANUTENÇÃO (Calculado via Data Fim - Data Início)
        const totalCorrectiveHours = correctiveTasks.reduce((sum, task) => {
            if (task.startDate && task.endDate) {
                const start = new Date(task.startDate);
                const end = new Date(task.endDate);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    return sum + diffHours;
                }
            }
            // Fallback: se não tiver datas precisas, tenta usar manHours (apenas legado)
            return sum + (task.manHours || 0);
        }, 0); 

        // TD = TEMPO TOTAL DE FUNCIONAMENTO (Horas no Ano)
        const ANNUAL_AVAILABLE_HOURS = getHoursInYear(year); 

        let mttr: number | null = null;
        let mtbf: number | null = null;
        let availability: number | null = null;

        if (totalFailures > 0) {
            // MTTR = (TEMPO DE MANUTENÇÃO / Nº DE PARADAS)
            mttr = totalCorrectiveHours / totalFailures;
            
            // Tempo Operacional = TD - TM
            const operationalTime = ANNUAL_AVAILABLE_HOURS - totalCorrectiveHours;
            
            // MTBF = (TEMPO TOTAL DE FUNCIONAMENTO - TEMPO DE REPARO) / Nº DE PARADAS
            mtbf = operationalTime > 0 ? operationalTime / totalFailures : 0;

            // % DISPONIBILIDADE = (MTBF / (MTBF + MTTR)) * 100
            if (mtbf + mttr > 0) {
              availability = (mtbf / (mtbf + mttr)) * 100;
            }
        } else {
            // Sem falhas no período
            availability = 100;
        }

        return {
            metrics: {
                mtbf,
                mttr,
                availability,
                totalFailures,
                totalCorrectiveHours,
            } as ReliabilityMetrics,
            executedTasks,
        };
    }, [equipment, year]);

    return { metrics, executedTasks };
};
