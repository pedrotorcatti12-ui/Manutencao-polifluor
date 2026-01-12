import React, { DragEvent } from 'react';
import { MaintenanceType, FlatTask, MaintenanceStatus } from '../types';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, DeleteIcon } from './icons';

interface TaskCardProps {
    task: FlatTask;
    onTaskClick: (task: FlatTask) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDelete: (task: FlatTask) => void;
}

const typeColorClasses: { [key in MaintenanceType]?: string } = {
    [MaintenanceType.Preventive]: 'border-l-blue-500',
    [MaintenanceType.Corrective]: 'border-l-red-500',
    [MaintenanceType.Predictive]: 'border-l-yellow-500',
    [MaintenanceType.Overhaul]: 'border-l-purple-500',
    [MaintenanceType.RevisaoPeriodica]: 'border-l-lime-500',
    [MaintenanceType.PrestacaoServicos]: 'border-l-indigo-500',
    [MaintenanceType.Predial]: 'border-l-stone-500',
    [MaintenanceType.Melhoria]: 'border-l-sky-500',
};

const statusStyles: { [key in MaintenanceStatus]?: { icon: React.ReactNode; color: string; } } = {
    [MaintenanceStatus.Scheduled]: { 
        icon: <ClockIcon className="w-3.5 h-3.5" />, 
        color: 'text-blue-600 dark:text-blue-400' 
    },
    [MaintenanceStatus.Delayed]: { 
        icon: <ExclamationTriangleIcon className="w-3.5 h-3.5" />, 
        color: 'text-red-600 dark:text-red-400' 
    },
    [MaintenanceStatus.Executed]: { 
        icon: <CheckCircleIcon className="w-3.5 h-3.5" />, 
        color: 'text-green-600 dark:text-green-400' 
    },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick, onDragStart, onDelete }) => {
    const { equipment, task: taskDetails } = task;

    const priorityStyles = {
        'Alta': { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
        'Média': { dot: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' },
        'Baixa': { dot: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
    };

    const hasPriority = taskDetails.type === MaintenanceType.Corrective && taskDetails.priority;
    const borderColorClass = taskDetails.type ? typeColorClasses[taskDetails.type] || 'border-l-gray-400' : 'border-l-gray-400';
    const statusInfo = statusStyles[taskDetails.status];
    const osNumber = taskDetails.osNumber ? `OS: ${taskDetails.osNumber}` : '';

    return (
        <div 
            onClick={() => onTaskClick(task)}
            draggable="true"
            onDragStart={onDragStart}
            className={`group relative bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5 border-l-4 ${borderColorClass}`}
            tabIndex={0}
            role="button"
            aria-label={`Arrastar ou abrir detalhes da tarefa para ${equipment.name}`}
        >
            {/* Delete Button (visible on hover) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Excluir Tarefa"
            >
                <DeleteIcon className="w-4 h-4" />
            </button>

            {/* Header with Equipment Name */}
            <div className="flex justify-between items-start pr-6">
                <div className="flex flex-col">
                    {osNumber && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-0.5">{osNumber}</span>}
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-2" title={`${equipment.id} - ${equipment.name}`}>
                        {equipment.id} - {equipment.name}
                    </h4>
                </div>
                {hasPriority && (
                    <div className="flex items-center gap-1.5 flex-shrink-0" title={`Prioridade: ${taskDetails.priority}`}>
                        <span className={`w-2 h-2 rounded-full ${priorityStyles[taskDetails.priority!].dot}`}></span>
                        <span className={`text-xs font-semibold ${priorityStyles[taskDetails.priority!].text}`}>{taskDetails.priority}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5" title={taskDetails.description}>
                {taskDetails.description || "Nenhuma descrição fornecida."}
            </p>
            
            {/* Footer with Type and Date */}
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-full font-semibold truncate max-w-[100px]">
                    {taskDetails.type}
                </span>
                <div className="flex items-center gap-3">
                    {statusInfo && (
                        <div className={`flex items-center gap-1 font-semibold ${statusInfo.color}`} title={`Status: ${taskDetails.status}`}>
                            {statusInfo.icon}
                        </div>
                    )}
                    <span>{taskDetails.month ? `${taskDetails.month.substring(0,3)}/${taskDetails.year}` : new Date(taskDetails.startDate || '').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                </div>
            </div>
        </div>
    );
};