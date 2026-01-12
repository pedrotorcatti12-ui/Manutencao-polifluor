
import { Equipment, WorkOrder } from '../types';

/**
 * Calcula o próximo número de Ordem de Serviço disponível de forma sequencial.
 * Varre o ecossistema completo (avulsas + cronograma) para evitar saltos ou duplicidade.
 * Retorna uma string formatada com 4 dígitos (ex: "0001", "0002").
 */
export const getNextOSNumber = (equipmentData: Equipment[], workOrders: WorkOrder[]): string => {
    let maxId = 0;

    // 1. Analisa as tarefas dentro do cronograma (Preventivas/Preditivas agendadas)
    equipmentData.forEach(eq => {
        eq.schedule.forEach(task => {
            if (task.osNumber) {
                // Remove prefixos se existirem e converte para número
                const num = parseInt(task.osNumber.replace(/\D/g, ''), 10);
                if (!isNaN(num) && num > maxId) {
                    maxId = num;
                }
            }
        });
    });

    // 2. Analisa as ordens de serviço avulsas (Corretivas/Melhorias)
    workOrders.forEach(order => {
        if (order.id) {
            const num = parseInt(order.id.replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxId) {
                maxId = num;
            }
        }
    });

    // 3. Incrementa e formata com zeros à esquerda (Padrão 0001)
    const nextNum = maxId + 1;
    return String(nextNum).padStart(4, '0');
};
