
import React from 'react';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType } from '../types';
import { MAINTENANCE_TYPE_CONFIG } from '../constants';
import { CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface ScheduleCellProps {
  tasks: MaintenanceTask[];
  onClick: () => void;
}

// Ícone específico para Preditiva (Um "Olho" ou Radar simplificado em SVG)
const PredictiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 8.2 1.966 9.336 6.404.147.574.147 1.186 0 1.76C18.2 15.034 14.257 17 10 17c-4.257 0-8.2-1.966-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const TaskIndicator: React.FC<{ task: MaintenanceTask }> = ({ task }) => {
    const typeConfig = task.type ? MAINTENANCE_TYPE_CONFIG[task.type] : null;
    let typeColorClass = typeConfig?.color || 'bg-gray-400';
    
    const isExecuted = task.status === MaintenanceStatus.Executed;
    const isDelayed = task.status === MaintenanceStatus.Delayed;
    const isPredictive = task.type === MaintenanceType.Predictive;

    // Overrides de cor para status críticos
    if (isExecuted) typeColorClass = 'bg-green-500';
    if (isDelayed) typeColorClass = 'bg-red-500';
    if (isPredictive && !isExecuted && !isDelayed) typeColorClass = 'bg-yellow-500';

    const title = `${task.type || 'N/A'}: ${task.description || 'Sem descrição'} (Status: ${task.status})`;

    // Visualização EXECUTADA
    if (isExecuted) {
        return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm border border-white dark:border-gray-800 transition-transform transform group-hover:scale-110">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    // Visualização ATRASADA
    if (isDelayed) {
         return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shadow-md border border-white dark:border-gray-800 animate-pulse transition-transform transform group-hover:scale-110">
                    <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    // Visualização PREDITIVA (Losango Amarelo)
    if (isPredictive) {
        return (
            <div className="relative flex-shrink-0 group z-10" title={title}>
                <div className={`w-5 h-5 rotate-45 ${typeColorClass} flex items-center justify-center shadow-sm border border-white dark:border-gray-800 transition-transform transform group-hover:scale-110 group-hover:rotate-0`}>
                    <div className="-rotate-45 text-white opacity-90">
                        <PredictiveIcon />
                    </div>
                </div>
            </div>
        );
    }

    // Visualização PREVENTIVA / PADRÃO (Círculo)
    return (
        <div className="relative flex-shrink-0 group z-10" title={title}>
            <div className={`w-5 h-5 rounded-full ${typeColorClass} shadow-sm border-2 border-white dark:border-gray-800 transition-transform transform group-hover:scale-110`}></div>
        </div>
    );
};

export const ScheduleCell: React.FC<ScheduleCellProps> = ({ tasks, onClick }) => {
  const MAX_INDICATORS = 3; 
  const visibleTasks = tasks.slice(0, MAX_INDICATORS);
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <div
      onClick={onClick}
      className="h-14 flex items-center justify-center p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors relative group"
      title={tasks.length > 0 ? `${tasks.length} tarefa(s) neste mês. Clique para ver.` : ''}
    >
      <div className="flex items-center gap-1 flex-wrap justify-center content-center h-full w-full">
        {tasks.length === 0 && <div className="w-full h-full"></div>} 
        
        {visibleTasks.map((task, idx) => (
            <div key={task.id} className={idx > 0 ? "-ml-2" : ""}>
                <TaskIndicator task={task} />
            </div>
        ))}
        
        {hiddenCount > 0 && (
          <div className="-ml-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow-sm z-20">
            +{hiddenCount}
          </div>
        )}
      </div>
    </div>
  );
};
