import React, { createContext, useCallback, useEffect, useContext, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from './AuthContext';
import { dateToString } from '../methods';

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
        } catch (e) { console.log(e) }
    }, [token, request]);

    useEffect(() => {
        if (!!token && loading) fetchTasks();
    }, [fetchTasks, loading]);

    const today = new Date(), yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    var tasksCopy = JSON.parse(JSON.stringify(allTasks));
    const habitsTemplates = tasksCopy.filter(task => task.isTemplate && task.epic === 'Привычки'); // Шаблоны привычек
    tasksCopy = tasksCopy.filter(task => !(task.isTemplate && task.epic === 'Привычки'));
    const eventsTemplates = tasksCopy.filter(task => task.isTemplate && task.isEvent); // Шаблоны мероприятий
    tasksCopy = tasksCopy.filter(task => !(task.isTemplate && task.isEvent));
    const tasksTemplates = tasksCopy.filter(task => task.isTemplate); // Шаблоны задач
    tasksCopy = tasksCopy.filter(task => !task.isTemplate);
    const habits = tasksCopy.filter(task => task.epic === 'Привычки' && task.templateId && [dateToString(today), dateToString(yesterday)].includes(task.instanceDate.slice(0, 10))); // Экземпляры привычек
    tasksCopy = tasksCopy.filter(task => !(task.epic === 'Привычки' && task.templateId && [dateToString(today), dateToString(yesterday)].includes(task.instanceDate.slice(0, 10))));
    const projects = tasksCopy.filter(task => task.isProject); // Проекты
    tasksCopy = tasksCopy.filter(task => !task.isProject);
    const events = tasksCopy.filter(task => task.isEvent); // Мероприятия
    tasksCopy = tasksCopy.filter(task => !task.isEvent);
    const doneTasks = tasksCopy.filter(task => task.status); // Выполненные задачи
    const tasks = tasksCopy.filter(task => !task.status); // Не выполненные задачи

    const value = {
        allTasks,
        loading,
        updateTasks,
        habitsTemplates,
        eventsTemplates,
        tasksTemplates,
        habits,
        projects,
        events,
        tasks,
        doneTasks
    };

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
};
