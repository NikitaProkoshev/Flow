import React, { createContext, useContext, useState } from 'react';

const SideBarContext = createContext();

export const useSideBar = () => {
    const context = useContext(SideBarContext);
    if (!context) {
        throw new Error('useSideBar must be used within a SideBarProvider');
    }
    return context;
};

export const SideBarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const toggleSideBar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const value = {
        isCollapsed,
        toggleSideBar,
        setIsCollapsed,
    };

    return (
        <SideBarContext.Provider value={value}>
            {children}
        </SideBarContext.Provider>
    );
};
