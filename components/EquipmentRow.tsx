
import React, { useState, useMemo } from 'react';
import { Equipment, MaintenanceStatus, StatusConfig, MaintenanceTask } from '../types';
import { MONTHS } from '../constants';
import { ScheduleCell } from './ScheduleCell';
import { MonthTasksModal } from './MonthTasksModal';
import { EditIcon, DeleteIcon, InfoIcon, PlusIcon, ChevronDownIcon } from './icons';

interface EquipmentRowProps {
  equipment: Equipment;
  viewYear: number;
  statusMap: Map<string, StatusConfig>;
  onCellClick: (equipment: Equipment, monthIndex: number, task: MaintenanceTask) => void;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
  onViewDetails: (equipment: Equipment) => void;
  onAddCorrective: (equipment: Equipment) => void;
  isLast: boolean;
}

export const EquipmentRow: React.FC<EquipmentRowProps> = ({
  equipment,
  viewYear,
  statusMap,
  onCellClick,
  onEdit,
  onDelete,
  onViewDetails,
  onAddCorrective,
  isLast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpenForMonth, setModalOpenForMonth] = useState<number | null>(null);
  
  // Organiza as tarefas por mês para renderização no grid 12 colunas
  const tasksByMonth = useMemo(() => {
    return MONTHS.map((_, monthIndex) =>
        equipment.schedule.filter(task => 
            task.year === viewYear && 
            MONTHS.indexOf(task.month) === monthIndex &&
            task.status !== MaintenanceStatus.None &&
            task.status !== MaintenanceStatus.Deactivated
        )
    );
  }, [equipment.schedule, viewYear]);

  const handleCellClick = (monthIndex: number) => {
    const tasks = tasksByMonth[monthIndex];
    if (tasks.length === 0) {
      // Se não há tarefa, permite adicionar uma nova diretamente naquele mês (corretiva por padrão)
      onAddCorrective(equipment);
    } else if (tasks.length === 1) {
      onCellClick(equipment, monthIndex, tasks[0]);
    } else {
      setModalOpenForMonth(monthIndex);
    }
  };

  const borderClass = isLast ? '' : 'border-b border-gray-200 dark:border-gray-700';

  return (
    <>
      <div className={`grid grid-cols-[1fr_120px] gap-4 px-6 py-2 transition-colors duration-200 ${borderClass} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
        <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
           <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
             <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
           </button>
           <div>
               <p className="font-bold text-sm text-gray-900 dark:text-white uppercase">{equipment.id} - {equipment.name}</p>
               <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{equipment.location}</p>
           </div>
        </div>
        
        <div className="flex items-center justify-center gap-1">
            <button onClick={() => onAddCorrective(equipment)} className="p-2 text-gray-400 hover:text-red-500" title="Nova Corretiva"><PlusIcon className="w-4 h-4"/></button>
            <button onClick={() => onViewDetails(equipment)} className="p-2 text-gray-400 hover:text-green-500" title="Relatório de Confiabilidade"><InfoIcon className="w-4 h-4"/></button>
            <button onClick={() => onEdit(equipment)} className="p-2 text-gray-400 hover:text-blue-500" title="Editar Ficha"><EditIcon className="w-4 h-4"/></button>
            <button onClick={() => onDelete(equipment)} className="p-2 text-gray-400 hover:text-red-600" title="Excluir Ativo"><DeleteIcon className="w-4 h-4"/></button>
        </div>
      </div>
      
      {isExpanded && (
        <div className={`bg-white dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800 animate-fade-in overflow-x-auto custom-scrollbar`}>
            <div style={{ minWidth: '960px' }}>
                <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800/50">
                    {MONTHS.map(month => (
                        <div key={month} className="h-6 text-center text-[9px] font-black uppercase text-gray-400 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 flex items-center justify-center">
                            {month.substring(0, 3)}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-12">
                    {tasksByMonth.map((tasks, monthIndex) => (
                        <ScheduleCell
                            key={monthIndex}
                            tasks={tasks}
                            onClick={() => handleCellClick(monthIndex)}
                        />
                    ))}
                </div>
            </div>
        </div>
      )}

      {modalOpenForMonth !== null && (
        <MonthTasksModal
          isOpen={true}
          onClose={() => setModalOpenForMonth(null)}
          tasks={tasksByMonth[modalOpenForMonth]}
          equipment={equipment}
          month={MONTHS[modalOpenForMonth]}
          year={viewYear}
          onTaskSelect={(task) => {
            onCellClick(equipment, modalOpenForMonth, task);
            setModalOpenForMonth(null);
          }}
        />
      )}
    </>
  );
};
