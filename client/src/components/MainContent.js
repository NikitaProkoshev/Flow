import React from 'react';
import { Box } from '@chakra-ui/react';

export const MainContent = ({ children }) => {

    return (
        <Box className={`main-content collapsed`} maxH='100vh' overflowY='auto' scrollbarColor='#e0e0e0 #161616' ml={16}>
            {children}
        </Box>
    );
};
