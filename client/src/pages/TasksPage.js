import React, { useContext, useState } from 'react';
import { EpicsContext } from '../App';
import { TasksList } from '../components/TasksList';
import { epicToIcon, dateToString } from '../methods';
import { Habits } from '../components/Habits';
import { Box, Tabs } from '@chakra-ui/react';
import { useTasks } from '../context/TasksContext';

export const TasksPage = () => {
    const { habits, events, tasks } = useTasks();
    const [ epics ] = useContext(EpicsContext);
    const [tab, setTab] = useState("t");

    const normalizeDate = (date) => new Date(date).toISOString().slice(0, 10);

    const todayString = normalizeDate(new Date());
    const weekString = normalizeDate(new Date().setDate(new Date().getDate() + 7));
    const monthString = normalizeDate(new Date().setMonth(new Date().getMonth() + 1));

    const todayTasks = tasks.filter(task => todayString >= normalizeDate(task.dateEnd.slice(0,10)) || (task.dateStart ? todayString >= normalizeDate(task.dateStart.slice(0,10)) && todayString <= normalizeDate(task.dateEnd.slice(0,10)) : false))
    const weekTasks = tasks.filter(task => weekString >= normalizeDate(task.dateEnd.slice(0,10)) || (task.dateStart ? weekString >= normalizeDate(task.dateStart.slice(0,10)) && weekString <= normalizeDate(task.dateEnd.slice(0,10)) : false))
    const monthTasks = tasks.filter(task => monthString >= normalizeDate(task.dateEnd.slice(0,10)) || (task.dateStart ? monthString >= normalizeDate(task.dateStart.slice(0,10)) && monthString <= normalizeDate(task.dateEnd.slice(0,10)) : false))

    var tasksCopy = JSON.parse(JSON.stringify(tab === 't' ? todayTasks : tab === 'w' ? weekTasks : monthTasks));
    tasksCopy = tasksCopy.filter(task => epics.includes(task.epic));
    const tasksA = tasksCopy.filter(task =>  task.eisenhower === 'A')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'A')
    const tasksB = tasksCopy.filter(task =>  task.eisenhower === 'B')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'B')
    const tasksC = tasksCopy.filter(task =>  task.eisenhower === 'C')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'C')
    const tasksD = tasksCopy.filter(task =>  task.eisenhower === 'D')
    tasksCopy = tasksCopy.filter(task => task.eisenhower !== 'D')

    return (<div className='m-4'>
        <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)}>
            <Tabs.List>
                <Tabs.Trigger value="t">Сегодня</Tabs.Trigger>
                <Tabs.Trigger value="w">Неделя</Tabs.Trigger>
                <Tabs.Trigger value="m">Месяц</Tabs.Trigger>
            </Tabs.List>
        </Tabs.Root>
        <div className={`grid grid-cols-${Object.keys(epicToIcon).length} lg:h-[${'calc('+document.getElementById('block2')?.clientHeight +'px+2rem)'}] min-h-[100vh] lg:grid-rows-2 gap-8 w-full items-start sm:px-8`} id="tasksDashBoard">
            <div className="col-span-8 lg:row-span-2 lg:col-span-6 grid grid-cols-subgrid lg:grid-rows-subgrid gap-0 h-full" id="block1">
                <Box className='col-span-8 lg:col-span-3' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">A</h2>
                    <TasksList tasks={tasksA.sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false}/>
                </Box>
                <Box className='col-span-8 lg:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">B</h2>
                    <TasksList tasks={tasksB.sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">C</h2>
                    <TasksList tasks={tasksC.sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">D</h2>
                    <TasksList tasks={tasksD.sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} eisenhower={false} />
                </Box>
            </div>
            <div className="col-span-8 lg:col-span-2 lg:row-span-2" id="block2">
                <h2 className="gradient-font text-3xl h-10">Привычки</h2>
                <Habits habits={habits} />
                <h2 className="gradient-font text-3xl h-10">Мероприятия</h2>
                <TasksList tasks={events.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))} />
            </div>
        </div>
    </div>);
};
