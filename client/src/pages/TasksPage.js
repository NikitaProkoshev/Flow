import React, { useContext, useState } from 'react';
import { EpicsContext } from '../App';
import { TasksList } from '../components/TasksList';
import { dateToString, epicToIcon } from '../methods';
import { Habits } from '../components/Habits';
import { Box, Tabs } from '@chakra-ui/react';
import { useTasks } from '../context/TasksContext';

export const TasksPage = () => {
    const { allTasks } = useTasks();
    var habits, events, tasksA, tasksB, tasksC, tasksD;
    const [ epics ] = useContext(EpicsContext);
    const [tab, setTab] = useState("today");

    const yesterday = new Date(), today = new Date(), week = new Date(), month = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);

    var tasksCopy = JSON.parse(JSON.stringify(allTasks));
    habits = tasksCopy.filter(task => task.epic === 'Привычки' && task.templateId && [dateToString(today), dateToString(yesterday)].includes(task.instanceDate.slice(0, 10)));
    tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки' && epics.includes(task.epic) && !task.status);
    events = tasksCopy.filter(task => task.isEvent);
    tasksCopy = tasksCopy.filter(task => !task.isEvent);
    tasksA = tasksCopy.filter(task =>  task.eisenhower === 'A')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'A')
    tasksB = tasksCopy.filter(task =>  task.eisenhower === 'B')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'B')
    tasksC = tasksCopy.filter(task =>  task.eisenhower === 'C')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'C')
    tasksD = tasksCopy.filter(task =>  task.eisenhower === 'D')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'D')



    return (<div className='m-4'>
        <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)}>
            <Tabs.List>
                <Tabs.Trigger value="today">Сегодня</Tabs.Trigger>
                <Tabs.Trigger value="week">Неделя</Tabs.Trigger>
                <Tabs.Trigger value="month">Месяц</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
        <div className={`grid grid-cols-${Object.keys(epicToIcon).length} lg:h-[${'calc('+document.getElementById('block2')?.clientHeight +'px+2rem)'}] min-h-[100vh] lg:grid-rows-2 gap-8 w-full items-start sm:px-8`} id="tasksDashBoard">
            {console.log(document.getElementById('block2')?.clientHeight)}
            <div className="col-span-8 lg:row-span-2 lg:col-span-6 grid grid-cols-subgrid lg:grid-rows-subgrid gap-0 h-full" id="block1">
                <Box className='col-span-8 lg:col-span-3' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">A</h2>
                    <TasksList tasks={tasksA?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false}/>
                </Box>
                <Box className='col-span-8 lg:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">B</h2>
                    <TasksList tasks={tasksB?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">C</h2>
                    <TasksList tasks={tasksC?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">D</h2>
                    <TasksList tasks={tasksD?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
            </div>
            <div className="col-span-8 lg:col-span-2 lg:row-span-2" id="block2">
                <h2 className="gradient-font text-3xl h-10">Привычки</h2>
                <Habits habits={habits} />
                <h2 className="gradient-font text-3xl h-10">Мероприятия</h2>
                <TasksList tasks={events?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} />
            </div>
        </div>
    </div>);
};
