import React, { createContext, useCallback, useEffect, useContext, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from './AuthContext';

const TasksContext = createContext();

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};

export const TasksProvider = ({ children }) => {
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [allTasks, setAllTasks] = useState([]);
    const [loading, updateTasks] = useState(true);

    const fetchTasks = useCallback(async () => {
        try {
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}` });
            setAllTasks(fetched);
            updateTasks(false);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        if (!!token && loading) fetchTasks();
    }, [fetchTasks, loading]);

    const value = {
        allTasks,
        loading,
        updateTasks
    };

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
};
