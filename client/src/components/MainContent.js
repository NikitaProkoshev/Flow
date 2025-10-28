import React from 'react';
import { Box, IconButton, Float, Spinner } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';
import { CreateTask } from './CreateTask.tsx';
import { useTasks } from '../context/TasksContext';

export const MainContent = ({ children }) => {
    const { loading } = useTasks();
    
    return (<Box className={`main-content collapsed`} maxH='100dvh' h='100dvh' overflowY='auto' scrollbarColor='#e0e0e0 #161616' ml={16}>
        {children}
        <Float placement='top-end' offsetX='3rem' offsetY='calc(100dvh - 3.5rem)' zIndex={10}>
            <IconButton id="createTask" bgGradient="to-br" gradientFrom={loading ? '#b3b3b3' : "#42e695"} gradientTo={loading ? '#b3b3b3' : "#3bb2b8"} rounded='full' variant="solid" colorPalette="gray" size="2xl" onClick={() => CreateTask.open('a', { task: {} }) }>
                {loading ? <Spinner color="#4fc8a7" borderWidth="4px" filter='grayscale(0%)' /> : <FaPlus className="text-2xl text-[#e0e0e0]" />}
            </IconButton>
        </Float>
    </Box>)
}
