import React from 'react';
import { useSideBar } from '../context/SideBarContext';
import { Box } from '@chakra-ui/react';

export const MainContent = ({ children }) => {
    const { isCollapsed } = useSideBar();

    return (
        <Box className={`main-content ${isCollapsed && 'collapsed'}`} maxH='100vh' overflowY='auto' scrollbarColor='#e0e0e0 #161616' ml={isCollapsed ? 16 : 48}>
            {children}
        </Box>
    );
};
