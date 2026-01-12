
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Page, Theme, WorkOrder } from '../types';

interface AppContextType {
    isLoggedIn: boolean;
    handleLogin: (success: boolean) => void;
    handleLogout: () => void;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    // Gestão Global do Modal de OS
    isOSModalOpen: boolean;
    setIsOSModalOpen: (isOpen: boolean) => void;
    editingOrder: WorkOrder | null;
    setEditingOrder: (order: WorkOrder | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
    const [currentPage, setCurrentPage] = useLocalStorage<Page>('currentPage', 'home');
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
    
    // Estados do Modal Mestre
    const [isOSModalOpen, setIsOSModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

    const handleLogin = (success: boolean) => {
        setIsLoggedIn(success);
        if (success) setCurrentPage('home');
    };

    const handleLogout = () => setIsLoggedIn(false);

    return (
        <AppContext.Provider value={{
            isLoggedIn, handleLogin, handleLogout,
            currentPage, setCurrentPage,
            theme, setTheme,
            isOSModalOpen, setIsOSModalOpen,
            editingOrder, setEditingOrder
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
