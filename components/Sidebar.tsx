
import React from 'react';
import { Page } from '../types';
import { useAppContext } from '../contexts/AppContext';
import {
    SettingsIcon, UsersIcon, InventoryIcon, PackageIcon, ClipboardListIcon,
    ScheduleIcon, HomeIcon, ChartIcon, ShieldCheckIcon, SearchIcon,
    WrenchIcon, InfoIcon, DocumentTextIcon, TargetIcon
} from './icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  page: Page;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, page, onClick }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  const isActive = currentPage === page;
  
  const handleClick = () => {
      setCurrentPage(page);
      onClick();
  };
  
  return (
    <li>
      <button
        onClick={handleClick}
        className={`flex items-center w-full px-3 py-2 text-sm font-medium text-left rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <div className="w-5 h-5 mr-3">{icon}</div>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { setCurrentPage } = useAppContext();
  
  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 flex-shrink-0 no-print flex flex-col border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 cursor-pointer" onClick={() => { setCurrentPage('home'); onCloseMobile?.(); }}>
         <WrenchIcon className="h-8 w-8 text-blue-600" />
         <div className="ml-2 flex flex-col">
            <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight leading-none">SGMI 2.0</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Polifluor</span>
         </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div>
            <NavItem icon={<HomeIcon />} label="Visão Geral" page="home" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<ChartIcon />} label="Dashboard KPI" page="dashboard" onClick={() => onCloseMobile?.()} />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-2 border border-blue-100 dark:border-blue-800/30">
            <h3 className="px-2 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest mb-2">Pilares</h3>
            <ul className="space-y-1">
                <NavItem icon={<ClipboardListIcon />} label="Ordens de Serviço" page="work_orders" onClick={() => onCloseMobile?.()} />
                <NavItem icon={<TargetIcon />} label="Planejamento" page="plans" onClick={() => onCloseMobile?.()} />
                <NavItem icon={<ScheduleIcon />} label="Cronograma" page="schedule" onClick={() => onCloseMobile?.()} />
            </ul>
        </div>

        <div className="space-y-1">
            <h3 className="px-3 text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 mt-4">Recursos</h3>
            <NavItem icon={<UsersIcon />} label="Centro de Trabalho" page="work_center" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<InventoryIcon />} label="Estoque & Materiais" page="inventory" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<PackageIcon />} label="Equipamentos" page="equipment" onClick={() => onCloseMobile?.()} />
        </div>

        <div className="space-y-1">
            <h3 className="px-3 text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 mt-4">Sistema</h3>
            <NavItem icon={<DocumentTextIcon />} label="Impressão em Lote" page="documentation" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<ShieldCheckIcon />} label="Qualidade IATF" page="quality" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<InfoIcon />} label="Informações & ROI" page="information" onClick={() => onCloseMobile?.()} />
            <NavItem icon={<SettingsIcon />} label="Configurações" page="settings" onClick={() => onCloseMobile?.()} />
        </div>
      </nav>
    </aside>
  );
};
