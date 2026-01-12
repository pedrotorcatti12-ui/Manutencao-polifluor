
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useDataContext } from '../contexts/DataContext';
import { LogoutIcon, SunIcon, MoonIcon, PlusIcon, HomeIcon, UsersIcon, ClipboardListIcon, ScheduleIcon, CloudIcon, ArrowPathIcon, ExclamationTriangleIcon, GithubIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

// --- CONFIGURAÇÃO DO GITHUB ---
// Link configurado automaticamente baseado no seu repositório
const GITHUB_REPO_URL = 'https://github.com/pedrotorcatti12-source/sistema-manutencao-v2'; 

interface AppHeaderProps {
    onOpenCorrectiveRequest: () => void;
    onToggleSidebar: () => void;
}

const ShortcutBtn: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        title={`Ir para ${label}`}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 group ${
            active 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
        }`}
    >
        <div className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'scale-100' : ''}`}>{icon}</div>
        <span className={`text-xs font-bold ${active ? 'block' : 'hidden xl:block'}`}>{label}</span>
    </button>
);

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenCorrectiveRequest, onToggleSidebar }) => {
    const { theme, setTheme, handleLogout, currentPage, setCurrentPage } = useAppContext();
    const { isSyncing, isOnline } = useDataContext();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const onLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        handleLogout();
        setIsLogoutModalOpen(false);
    };

    const openGithubRepo = () => {
        window.open(GITHUB_REPO_URL, '_blank');
    };

    // Mobile Menu Icon (Hamburger)
    const MenuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-sm px-4 sm:px-6 flex justify-between items-center no-print sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 h-16 sm:h-20">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MenuIcon />
                    </button>

                    {/* Atalhos de Navegação Rápida */}
                    <div className="hidden md:flex items-center gap-1 md:gap-2">
                        <ShortcutBtn icon={<HomeIcon />} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <ShortcutBtn icon={<UsersIcon />} label="Kanban" active={currentPage === 'work_center'} onClick={() => setCurrentPage('work_center')} />
                        <ShortcutBtn icon={<ClipboardListIcon />} label="Ordens" active={currentPage === 'work_orders'} onClick={() => setCurrentPage('work_orders')} />
                        <ShortcutBtn icon={<ScheduleIcon />} label="Cronograma" active={currentPage === 'schedule'} onClick={() => setCurrentPage('schedule')} />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Status de Nuvem (Supabase) */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                        isSyncing 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' 
                            : isOnline 
                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800'
                                : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                    }`}>
                        {isSyncing ? (
                            <>
                                <ArrowPathIcon className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Sincronizando...</span>
                            </>
                        ) : isOnline ? (
                            <>
                                <CloudIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Conectado</span>
                            </>
                        ) : (
                            <>
                                <ExclamationTriangleIcon className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Offline</span>
                            </>
                        )}
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

                    <button 
                        onClick={onOpenCorrectiveRequest} 
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors text-sm shadow-sm hover:shadow-md"
                        title="Nova Corretiva"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Corretiva</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                        <button onClick={openGithubRepo} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Acessar Repositório GitHub">
                            <GithubIcon className="h-5 w-5" />
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                        </button>
                        <button onClick={onLogoutClick} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors">
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <ConfirmationModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Sair do Sistema"
                message="Deseja realmente sair? Seus dados estão seguros na nuvem."
            />
        </>
    );
};
