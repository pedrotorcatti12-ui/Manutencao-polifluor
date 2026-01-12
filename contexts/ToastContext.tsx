import React, { createContext, useContext, ReactNode } from 'react';
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const showToast = (msg: string, type: string) => alert(msg);
    return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>;
};
const ToastContext = createContext({ showToast: (msg: string, type: string) => {} });
export const useToast = () => useContext(ToastContext);
