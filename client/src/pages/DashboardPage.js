import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Stat, Badge, Tabs } from "@chakra-ui/react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString, todayString, yesterdayString, epicToIcon, epicToColor, checkingSome } from '../methods';
import { Dashboard } from '../components/Dashboard'

export const DashboardPage = ({}) => {
    const [tasks, setTasks] = useState([]);
    const [tab, setTab] = useState("today")
    var habits, events, todayTasks, weekTasks, monthTasks;
    const { request } = useHttp();
    const { token } = useContext(AuthContext);

    const today = new Date(), week = new Date(), month = new Date();
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);
    // minusMonth.setMonth(minusMonth.getMonth() - 1);

    const fetchTasks = useCallback(async () => {
        try {
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}` });
            setTasks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    function splitTasks(tasks) {
        var tasksCopy = JSON.parse(JSON.stringify(tasks));
        habits = tasksCopy.filter(task => [`Привычки_${yesterdayString}`, `Привычки_${todayString}`, 'Привычки_шаблон'].includes(task.title) && task.epic === 'Привычки');
        tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки');
        events = tasksCopy.filter(task => task.isEvent);
        tasksCopy = tasksCopy.filter(task => !task.isEvent);
        todayTasks = tasksCopy.filter(task => [task.dateStart, task.dateEnd].includes(dateToString(today)) || (dateToString(task.dateStart) < dateToString(today) && dateToString(task.dateEnd) > dateToString(today)))
        weekTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(today) && dateToString(task.dateEnd) >= dateToString(week))
        monthTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(today) && dateToString(task.dateEnd) >= dateToString(month))
    }

    return (
        <div className='dashboard m-4'>
            {Object.keys(tasks).length !== 0 && splitTasks(tasks)}
            <Tabs.Root value={tab} variant='line' css={{'--tabs-trigger-radius': 'var(--chakra-radii-2xl)', '--bg-currentcolor': '#121213'}} onValueChange={(e) => setTab(e.value)}>
              <Tabs.List>
                <Tabs.Trigger value="today">
                  Сегодня
                </Tabs.Trigger>
                <Tabs.Trigger value="week">
                  Неделя
                </Tabs.Trigger>
                <Tabs.Trigger value="month">
                  Месяц
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="today"><Dashboard tasks={todayTasks}/></Tabs.Content>
              <Tabs.Content value="week"><Dashboard tasks={weekTasks}/></Tabs.Content>
              <Tabs.Content value="month"><Dashboard tasks={monthTasks}/></Tabs.Content>
            </Tabs.Root>
            
        </div>
    )
};
