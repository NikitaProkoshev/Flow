import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { EpicsContext } from '../App';
import { TasksList } from '../components/TasksList';
import { dateToString, todayString, yesterdayString, epicToIcon, epicToColor, checkingSome } from '../methods';
import { Habits } from '../components/Habits';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Checkbox, Box } from '@chakra-ui/react';

export const TasksPage = ({ period }) => {
    const [tasks, setTasks] = useState([]);
    var habits, events, tasksA, tasksB, tasksC, tasksD;
    const [taskEdit, setTaskEdit] = useState('');
    const [checkingTask, setCheckingTask] = useState('');
    const [deletingTask, setDeletingTask] = useState('');
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [ epics ] = useContext(EpicsContext);
    const calendarRef = useRef(null);
    

    const minusMonth = new Date();
    minusMonth.setMonth(minusMonth.getMonth() - 1);

    const fetchTasks = useCallback(async () => {
        try {
            console.log(period);
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}`, period: period });
            console.log(fetched);
            setTasks(fetched);
        } catch (e) {}
    }, [token, request, period]);

    useEffect(() => {
        if (taskEdit === '' && checkingTask === '') fetchTasks();
    }, [fetchTasks, taskEdit, checkingTask, deletingTask, period]);

    function eventsToCalendar(events) {
        return events && events.map((event) => {
            return {
                id: event._id,
                title: event.title,
                start: event.dateStart,
                end: event.dateEnd,
                backgroundColor: event.status ? '#424242' : epicToColor[event.epic] + '1)',
                textColor: '#212121',
                status: event.status,
                allDay: ['00:00', '21:00'].includes(event.dateStart.slice(11,16)) && ['00:00', '20:59'].includes(event.dateEnd.slice(11,16))
            };
        });
    }

    function splitTasks(tasks) {
        var tasksCopy = JSON.parse(JSON.stringify(tasks));
        habits = tasksCopy.filter(task => [`Привычки_${yesterdayString}`, `Привычки_${todayString}`, 'Привычки_шаблон'].includes(task.title) && task.epic === 'Привычки');
        tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки' && epics.includes(task.epic));
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
    }

    return (
        <div className={`grid grid-cols-${Object.keys(epicToIcon).length} lg:h-[${'calc('+document.getElementById('block2')?.clientHeight +'px+2rem)'}] min-h-[100vh] lg:grid-rows-2 gap-8 w-full p-4 items-start sm:px-8`} id="tasksDashBoard">
            {console.log(document.getElementById('block2')?.clientHeight)}
            {Object.keys(tasks).length !== 0 && splitTasks(tasks)}
            <div className="col-span-8 lg:row-span-2 lg:col-span-6 grid grid-cols-subgrid lg:grid-rows-subgrid gap-0 h-full" id="block1">
                <Box className='col-span-8 lg:col-span-3' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">A</h2>
                    <TasksList
                        editState={[taskEdit, setTaskEdit]}
                        checkingState={[checkingTask, setCheckingTask]}
                        deletingState={[deletingTask, setDeletingTask]}
                        allTasks={tasks}
                        tasks={tasksA?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))}
                        doneTasks={tasksA?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                        eisenhower={false}
                    />
                </Box>
                <Box className='col-span-8 lg:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pb: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">B</h2>
                    <TasksList
                        editState={[taskEdit, setTaskEdit]}
                        checkingState={[checkingTask, setCheckingTask]}
                        deletingState={[deletingTask, setDeletingTask]}
                        allTasks={tasks}
                        tasks={tasksB?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))}
                        doneTasks={tasksB?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                        eisenhower={false}
                    />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pr: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">C</h2>
                    <TasksList
                        editState={[taskEdit, setTaskEdit]}
                        checkingState={[checkingTask, setCheckingTask]}
                        deletingState={[deletingTask, setDeletingTask]}
                        allTasks={tasks}
                        tasks={tasksC?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))}
                        doneTasks={tasksC?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                        eisenhower={false}
                    />
                </Box>
                <Box className='col-span-8 sm:col-span-3' maxH='75vh' overflowY='auto' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' lg={{ pl: 4, pt: 4 }}>
                    <h2 className="gradient-font text-3xl w-full text-center">D</h2>
                    <TasksList
                        editState={[taskEdit, setTaskEdit]}
                        checkingState={[checkingTask, setCheckingTask]}
                        deletingState={[deletingTask, setDeletingTask]}
                        allTasks={tasks}
                        tasks={tasksD?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))}
                        doneTasks={tasksD?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                        eisenhower={false}
                    />
                </Box>
            </div>
            <div className="col-span-8 lg:col-span-2 lg:row-span-2" id="block2">
                <h2 className="gradient-font text-3xl h-10">Привычки</h2>
                <Habits
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    todayTask={habits?.filter(task => task.title === `Привычки_${todayString}`)[0]}
                    yesterdayTask={habits?.filter(task => task.title ===`Привычки_${yesterdayString}`)[0]}
                    templateTask={habits?.filter(task => task.title === 'Привычки_шаблон')[0]}
                />
                <h2 className="gradient-font text-3xl h-10">Мероприятия</h2>
                <TasksList
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    deletingState={[deletingTask, setDeletingTask]}
                    allTasks={tasks}
                    tasks={events?.filter((task) => !task.status).sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd))}
                    doneTasks={events?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                    eisenhower={false}
                />
                {/* <FullCalendar
                    ref={calendarRef} plugins={[timeGridPlugin]} initialView="fourDay" locale="rulocale" slotMinTime="09:00:00" slotMaxTime="22:30:00"
                    contentHeight={1080} expandRows={true} headerToolbar={false} slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit' }}
                    views={{ fourDay: { type: 'timeGrid', duration: { days: 1 }, buttonText: '4 days' } }}
                    eventContent={arg => (
                        <div className={`custom-event p-1 text-[#e0e0e0]${arg.event.extendedProps.status ? ' grayscale' : ''}`}>
                            <Checkbox.Root
                                onChange={(e) => checkingSome(e, tasks.filter(task => arg.event.title === task.title)[0], setCheckingTask, request, token)}
                                defaultChecked={checkingTask[0] === arg.event.id || arg.event.extendedProps.status}
                                variant='subtle' colorPalette='gray'
                            >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>{arg.event.title}</Checkbox.Label>
                            </Checkbox.Root>
                        </div>
                    )}
                    events={eventsToCalendar(events)}
                /> */}
            </div>
        </div>
    );
};
