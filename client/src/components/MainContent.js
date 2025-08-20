import React from 'react';
import { useSideBar } from '../context/SideBarContext';

export const MainContent = ({ children }) => {
    const { isCollapsed } = useSideBar();

    return (
        <div
            className={`main-content ${
                isCollapsed
                    ? 'collapsed ml-16'
                    : `ml-48`
            }`}
        >
            {children}
        </div>
    );
};
