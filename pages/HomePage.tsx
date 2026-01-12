
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Page } from '../types';
import { 
    WrenchIcon, 
    UsersIcon, 
    ClipboardListIcon, 
    HomeIcon, 
    ScheduleIcon, 
    PackageIcon, 
    InventoryIcon, 
    ChartIcon, 
    SearchIcon, 
    DocumentTextIcon, 
    ShieldCheckIcon, 
    InfoIcon, 
    SettingsIcon, 
    TargetIcon, 
    ClockIcon, 
    ArrowRightIcon 
} from '../components/icons';

// --- Componentes Visuais ---

const PrimaryActionCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactElement<{ className?: string }>; 
    page: Page; 
    colorFrom: string; 
    colorTo: string;
    iconColor: string;
}> = ({ title, description, icon, page, colorFrom, colorTo, iconColor }) => {
    const { setCurrentPage } = useAppContext();

    return (
        <button 
            onClick={() => setCurrentPage(page)}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left flex flex-col justify-between h-full min-h-[200px]"
        >
            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-15 transition-opacity transform group-hover:scale-110 duration-500`}>
                {React.cloneElement(icon, { className: 'w-40 h-40' })}
            </div>

            <div className="relative z-10 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center text-white shadow-lg mb-5 group-hover:rotate-6 transition-transform duration-300`}>
                    {React.cloneElement(icon, { className: 'w-7 h-7' })}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[90%]">
                    {description}
                </p>
            </div>

            <div className="relative z-10 flex items-center text-xs font-black uppercase tracking-wider text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-auto">
                Acessar Módulo <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
};

const SecondaryActionCard: React.FC<{
    title: string;
    icon: React.ReactElement<{ className?: string }>;
    page: Page;
}> = ({ title, icon, page }) => {
    const { setCurrentPage } = useAppContext();
    return (
        <button
            onClick={() => setCurrentPage(page)}
            className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group text-left shadow-sm"
        >
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors mr-3">
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                {title}
            </span>
        </button>
    );
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 mt-6 pl-1 border-l-2 border-blue-500 pl-3">
        {title}
    </h4>
);

// --- Página Principal ---

export const HomePage: React.FC = () => {
    
    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-0">
            
            {/* Cabeçalho */}
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <WrenchIcon className="w-10 h-10 text-blue-600" />
                        Sistema de Manutenção
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                        Plataforma integrada para controle total de ativos, planejamento preventivo e execução de ordens de serviço.
                    </p>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Sistema Operacional
                    </span>
                </div>
            </div>

            {/* DESTAQUE: 3 PILARES SOLICITADOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <PrimaryActionCard 
                    title="1. Ordens de Serviço" 
                    description="Central de abertura, acompanhamento e fechamento de corretivas e preventivas."
                    icon={<ClipboardListIcon />} 
                    page="work_orders"
                    colorFrom="from-blue-500"
                    colorTo="to-indigo-600"
                    iconColor="text-blue-600"
                />
                <PrimaryActionCard 
                    title="2. Planejamento" 
                    description="Definição de planos de manutenção, frequências e checklists padrão por ativo."
                    icon={<TargetIcon />} 
                    page="plans"
                    colorFrom="from-emerald-500"
                    colorTo="to-teal-600"
                    iconColor="text-emerald-600"
                />
                <PrimaryActionCard 
                    title="3. Cronograma" 
                    description="Visualização Gantt/Grade anual de todas as manutenções programadas."
                    icon={<ScheduleIcon />} 
                    page="schedule"
                    colorFrom="from-amber-500"
                    colorTo="to-orange-600"
                    iconColor="text-amber-600"
                />
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 mb-6"></div>

            {/* Módulos Secundários (Grid Organizado) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                
                {/* Coluna 1: Execução */}
                <div>
                    <SectionTitle title="Execução & Controle" />
                    <div className="space-y-3">
                        <SecondaryActionCard title="Kanban Diário (Work Center)" icon={<UsersIcon />} page="work_center" />
                        <SecondaryActionCard title="Controle de Estoque" icon={<InventoryIcon />} page="inventory" />
                        <SecondaryActionCard title="Gestão de Equipamentos" icon={<PackageIcon />} page="equipment" />
                    </div>
                </div>

                {/* Coluna 2: Inteligência */}
                <div>
                    <SectionTitle title="Métricas & KPIs" />
                    <div className="space-y-3">
                        <SecondaryActionCard title="Dashboard Geral" icon={<HomeIcon />} page="dashboard" />
                        <SecondaryActionCard title="Relatórios Gerenciais" icon={<ChartIcon />} page="managerial_report" />
                        <SecondaryActionCard title="Análise de Confiabilidade" icon={<ChartIcon />} page="advanced_reports" />
                    </div>
                </div>

                {/* Coluna 3: Histórico */}
                <div>
                    <SectionTitle title="Auditoria & Histórico" />
                    <div className="space-y-3">
                        <SecondaryActionCard title="Histórico Completo" icon={<ClockIcon />} page="history" />
                        <SecondaryActionCard title="Pesquisa Avançada O.S." icon={<SearchIcon />} page="search_os" />
                        <SecondaryActionCard title="Impressão em Lote" icon={<DocumentTextIcon />} page="documentation" />
                    </div>
                </div>

                {/* Coluna 4: Sistema */}
                <div>
                    <SectionTitle title="Configuração" />
                    <div className="space-y-3">
                        <SecondaryActionCard title="Conformidade IATF" icon={<ShieldCheckIcon />} page="quality" />
                        <SecondaryActionCard title="Ajustes do Sistema" icon={<SettingsIcon />} page="settings" />
                        <SecondaryActionCard title="Ajuda / Manuais" icon={<InfoIcon />} page="information" />
                    </div>
                </div>

            </div>
        </div>
    );
};
