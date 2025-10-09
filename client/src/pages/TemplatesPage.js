import { Tabs } from "@chakra-ui/react";
import { useState, useCallback, useEffect, useContext } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Templates } from "../components/Templates.ts";

export const TemplatesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [tab, setTab] = useState("tasks");
    var habitsTemplates, eventsTemplates, tasksTemplates;
    const { request } = useHttp();
    const { token } = useContext(AuthContext);

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
        // habits = tasksCopy.filter(task => [`Привычки_${yesterdayString}`, `Привычки_${todayString}`, 'Привычки_шаблон'].includes(task.title) && task.epic === 'Привычки');
        // tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки');
        eventsTemplates = tasksCopy.filter(task => task.isEvent && task.isTemplate);
        tasksCopy = tasksCopy.filter(task => !task.isEvent);
        tasksTemplates = tasksCopy.filter(task => task.isTemplate);
    }

    return (<div className='dashboard m-4'>
        {Object.keys(tasks).length !== 0 && splitTasks(tasks)}
        <Tabs.Root value={tab} variant='line' css={{'--tabs-trigger-radius': 'var(--chakra-radii-2xl)', '--bg-currentcolor': '#121213'}} onValueChange={(e) => setTab(e.value)}>
          <Tabs.List>
            <Tabs.Trigger value="tasks">
              Задачи
            </Tabs.Trigger>
            <Tabs.Trigger value="events">
              Мероприятия
            </Tabs.Trigger>
            {/* <Tabs.Trigger value="habits">
              Привычки
            </Tabs.Trigger> */}
          </Tabs.List>

          <Tabs.Content value="tasks"><Templates templates={tasksTemplates}/></Tabs.Content>
          <Tabs.Content value="events"><Templates templates={eventsTemplates}/></Tabs.Content>
          {/* <Tabs.Content value="month"><Dashboard tasks={monthTasks}/></Tabs.Content> */}
        </Tabs.Root>
    </div>)
}