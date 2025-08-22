import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { EpicsContext } from '../App';
import { TasksList } from '../components/TasksList';
import { dateToString, todayString, yesterdayString, epicToIcon, epicToColor, checkingSome } from '../methods';
import { CreateTask } from '../components/CreateTask';
import { Habits } from '../components/Habits';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonGroup, Button, IconButton, Checkbox } from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight, FaPlus } from 'react-icons/fa6';

export const MainPage = () => {
    const [tasks, setTasks] = useState([]);
    var habits, events, todayTasks, weekTasks, monthTasks;
    const [creatingTask, setCreatingTask] = useState(false);
    const [taskEdit, setTaskEdit] = useState('');
    const [checkingTask, setCheckingTask] = useState('');
    const [deletingTask, setDeletingTask] = useState('');
    const [isTodayVisible, setIsTodayVisible] = useState(true);
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [ epics ] = useContext(EpicsContext);
    const calendarRef = useRef(null);

    const today = new Date(), week = new Date(), month = new Date(), minusMonth = new Date();
    week.setDate(week.getDate() + 7);
    month.setDate(month.getMonth() + 1);
    minusMonth.setMonth(minusMonth.getMonth() - 1);

    const fetchTasks = useCallback(async () => {
        try {
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}` });
            setTasks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        if (!creatingTask && taskEdit === '' && checkingTask === '') fetchTasks();
    }, [fetchTasks, creatingTask, taskEdit, checkingTask, deletingTask]);

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

    const sortFunc = (a, b) => {
        const typeOrder = { A: 1, B: 2, C: 3, D: 4 };
        const typeDifference =
            typeOrder[a.eisenhower] - typeOrder[b.eisenhower];
        if (typeDifference !== 0) {
            return typeDifference;
        }
        return new Date(a.dateEnd) - new Date(b.dateEnd);
    };

    const handleDatesSet = useCallback((dateInfo) => {
        setIsTodayVisible(today >= dateInfo.view.activeStart && today < dateInfo.view.activeEnd);
    }, [today]);

    function splitTasks(tasks) {
        var tasksCopy = JSON.parse(JSON.stringify(tasks));
        habits = tasksCopy.filter(task => [`Привычки_${yesterdayString}`, `Привычки_${todayString}`, 'Привычки_шаблон'].includes(task.title) && task.epic === 'Привычки');
        tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки' && epics.includes(task.epic));
        events = tasksCopy.filter(task => task.isEvent);
        tasksCopy = tasksCopy.filter(task => !task.isEvent);
        todayTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(today) || dateToString(task.dateEnd) <= dateToString(today))
        tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(today) || dateToString(task.dateEnd) <= dateToString(today)))
        weekTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(week) || dateToString(task.dateEnd) <= dateToString(week))
        tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(week) || dateToString(task.dateEnd) <= dateToString(week)))
        monthTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(month) || dateToString(task.dateEnd) <= dateToString(month))
        tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(month) || dateToString(task.dateEnd) <= dateToString(month)))
    }

    return (
        <div className={`grid grid-cols-${Object.keys(epicToIcon).length} gap-8 w-full p-4 items-start sm:px-8`} id="tasksMainPage">
            {Object.keys(tasks).length !== 0 && splitTasks(tasks)}
            <div className="col-span-8 lg:col-span-5" id="block1">
                <div className='flex justify-between w-full' id="subBlock1-1">
                    <h2 className="gradient-font text-3xl">Сегодня</h2>
                    {!creatingTask && (
                        <Button
                            id="createTask"
                            bgGradient="to-br" gradientFrom="#42e695" gradientTo="#3bb2b8" rounded='lg'
                            variant="solid" colorPalette="gray" size="md"
                            onClick={(e) => setCreatingTask(true)}
                        ><FaPlus className="text-2xl text-[#e0e0e0]" />Новая задача</Button>
                    )}
                </div>
                {creatingTask && <CreateTask state={setCreatingTask} allTasks={tasks.filter((task) => task.epic !== 'Привычки')} />}
                <TasksList
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    deletingState={[deletingTask, setDeletingTask]}
                    allTasks={tasks}
                    tasks={todayTasks?.filter((task) => !task.status).sort(sortFunc)}
                    doneTasks={todayTasks?.filter((task) => task.status && dateToString(task.dateEnd) >= dateToString(minusMonth))}
                    eisenhower={true}
                />
                <h2 className="gradient-font text-3xl">Неделя</h2>
                <TasksList
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    deletingState={[deletingTask, setDeletingTask]}
                    allTasks={tasks}
                    tasks={weekTasks?.filter((task) => !task.status).sort(sortFunc)}
                    doneTasks={weekTasks?.filter((task) => task.status)}
                    eisenhower={true}
                />
                <h2 className="gradient-font text-3xl">Следующая неделя</h2>
                <TasksList
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    deletingState={[deletingTask, setDeletingTask]}
                    allTasks={tasks}
                    tasks={monthTasks?.filter(task => !task.status).sort(sortFunc)}
                    doneTasks={monthTasks?.filter(task => task.status)}
                    eisenhower={true}
                />
            </div>
            <div id="block2" className="col-span-8 lg:col-span-3">
                <h2 className="gradient-font text-3xl h-10">Привычки</h2>
                <Habits
                    editState={[taskEdit, setTaskEdit]}
                    checkingState={[checkingTask, setCheckingTask]}
                    todayTask={habits?.filter(task => task.title === `Привычки_${todayString}`)[0]}
                    yesterdayTask={habits?.filter(task => task.title ===`Привычки_${yesterdayString}`)[0]}
                    templateTask={habits?.filter(task => task.title === 'Привычки_шаблон')[0]}
                />
                <div className="eventsPage">
                    <h2 className="gradient-font text-3xl h-10">Мероприятия</h2>
                    <ButtonGroup variant="ghost" spacing="0" backgroundColor='#161616' rounded='lg' gap={0}>
                        <IconButton colorPalette="gray" onClick={() => calendarRef.current.getApi().prev()}>
                            <FaAngleLeft className="text-2xl text-[#e0e0e0]" /></IconButton>
                        <Button colorPalette="gray" disabled={isTodayVisible} onClick={() => calendarRef.current.getApi().today()}>
                            <p className={`text-2xl${!isTodayVisible ? ' text-[#e0e0e0]' : ''}`}>Сегодня</p></Button>
                        <IconButton colorPalette="gray" onClick={() => calendarRef.current.getApi().next()}>
                            <FaAngleRight className="text-2xl text-[#e0e0e0]" /></IconButton>
                    </ButtonGroup>
                </div>
                <FullCalendar
                    ref={calendarRef} plugins={[timeGridPlugin]} initialView="fourDay" locale="rulocale" slotMinTime="09:00:00" slotMaxTime="22:30:00"
                    contentHeight={1080} expandRows={true} headerToolbar={false} slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit' }}
                    views={{ fourDay: { type: 'timeGrid', duration: { days: 4 }, buttonText: '4 days' } }}
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
                    datesSet={handleDatesSet}
                />
            </div>
        </div>
    );
};
