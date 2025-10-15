import React from 'react';
import { Box, IconButton, Float } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';
import { CreateTask } from './CreateTask.tsx';

export const MainContent = ({ children }) => (
    <Box className={`main-content collapsed`} maxH='100dvh' h='100dvh' overflowY='auto' scrollbarColor='#e0e0e0 #161616' ml={16}>
        {children}
        <Float placement='top-end' offsetX='3rem' offsetY='calc(100dvh - 3.5rem)' zIndex={10}>
            <IconButton id="createTask" bgGradient="to-br" gradientFrom="#42e695" gradientTo="#3bb2b8" rounded='full' variant="solid" colorPalette="gray" size="2xl" onClick={() => CreateTask.open('a', { task: {} }) }>
                <FaPlus className="text-2xl text-[#e0e0e0]" />
            </IconButton>
        </Float>
    </Box>
)
