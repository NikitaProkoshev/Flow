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
import { Grid, GridItem, ButtonGroup, Button, Checkbox } from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [creatingTask, setCreatingTask] = useState(false);
    const [taskEdit, setTaskEdit] = useState('');
    const [checkingTask, setCheckingTask] = useState('');
    const [deletingTask, setDeletingTask] = useState('');
    const [isTodayVisible, setIsTodayVisible] = useState(true);
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [epics, setEpics] = useContext(EpicsContext);
    const calendarRef = useRef(null);
    document.documentElement.style.setProperty('--fc-today-bg-color', 'rgb(22,22,22)');
    document.documentElement.style.setProperty('--epicsCount', Object.keys(epicToIcon).length);
    document.documentElement.style.setProperty('--tasksLength', Math.round((Object.keys(epicToIcon).length / 10) * 6));
    document.documentElement.style.setProperty('--otherLength', Math.round(Object.keys(epicToIcon).length - (Object.keys(epicToIcon).length / 10) * 6));

    const today = new Date(), week = new Date(), nextWeek = new Date();
    week.setDate(week.getDate() + 7);
    nextWeek.setDate(nextWeek.getDate() + 14);

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
        var calendar = [];
        events.map((event) => {
            calendar.push({
                id: event._id,
                title: event.title,
                start: event.dateStart,
                end: event.dateEnd,
                backgroundColor: event.status ? '#424242' : epicToColor[event.epic] + '1)',
                textColor: '#212121',
                status: event.status,
                allDay: event.dateStart.slice(11,16) === "21:00" && event.dateEnd.slice(11,16) === "20:59"
            });
        });
        return calendar;
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
        setIsTodayVisible(
            today >= dateInfo.view.activeStart &&
                today < dateInfo.view.activeEnd
        );
    }, []);

    return (
        <Grid
            id="tasksDashBoard"
            templateColumns="repeat(8, 1fr)"
            gap={8}
            width="100%"
            padding={4}
            paddingX={12}
            alignItems='start'
        >
            {/* <div
                id="tasksDashBoard"
                className={`grid grid-cols-${
                    Object.keys(epicToIcon).length
                } gap-8 w-full p-4 items-start sm:px-12`}
            > */}
            {/* <div
                
                className={`sm:px-12`}
            > */}
                <GridItem  id="block1"colSpan={5}>
                    {/* <div className="col-span-8 lg:col-span-5"> */}
                        <div id="subBlock1-1">
                            <h2 className="gradient-font text-3xl">Сегодня</h2>
                            {!creatingTask && (
                                <Button
                                    id="createTask"
                                    bgGradient="linear(to-br, #42e695, #3bb2b8)"
                                    variant="solid"
                                    colorPalette="gray"
                                    size="md"
                                    onClick={(e) => setCreatingTask(true) }
                                >
                                    <i className="large material-icons">add</i>
                                    Новая задача
                                </Button>
                            )}
                        </div>
                        {creatingTask && <CreateTask state={setCreatingTask} allTasks={tasks} />}
                        <TasksList
                            editState={[taskEdit, setTaskEdit]}
                            checkingState={[checkingTask, setCheckingTask]}
                            deletingState={[deletingTask, setDeletingTask]}
                            allTasks={tasks}
                            tasks={tasks.filter((task) =>
                                        !task.status &&
                                        !task.isEvent &&
                                        task.epic !== 'Привычки' &&
                                        dateToString(task.dateEnd) <=
                                            dateToString(today) &&
                                        epics.includes(task.epic)
                                )
                                .sort(sortFunc)}
                            doneTasks={tasks.filter(
                                (task) =>
                                    task.status &&
                                    !task.isEvent &&
                                    task.epic !== 'Привычки' &&
                                    dateToString(task.dateEnd) <= dateToString(today) &&
                                    epics.includes(task.epic)
                            )}
                        />
                        <h2 className="gradient-font text-3xl">Неделя</h2>
                        <TasksList
                            editState={[taskEdit, setTaskEdit]}
                            checkingState={[checkingTask, setCheckingTask]}
                            deletingState={[deletingTask, setDeletingTask]}
                            allTasks={tasks}
                            tasks={tasks
                                .filter(
                                    (task) =>
                                        !task.status &&
                                        !task.isEvent &&
                                        task.epic !== 'Привычки' &&
                                        dateToString(task.dateEnd) >
                                            dateToString(today) &&
                                        dateToString(task.dateEnd) <=
                                            dateToString(week) &&
                                        epics.includes(task.epic)
                                )
                                .sort(sortFunc)}
                            doneTasks={tasks.filter(
                                (task) =>
                                    task.status &&
                                    !task.isEvent &&
                                    task.epic !== 'Привычки' &&
                                    dateToString(task.dateEnd) > dateToString(today) &&
                                    dateToString(task.dateEnd) <= dateToString(week) &&
                                    epics.includes(task.epic)
                            )}
                        />
                        <h2 className="gradient-font text-3xl">Следующая неделя</h2>
                        <TasksList
                            editState={[taskEdit, setTaskEdit]}
                            checkingState={[checkingTask, setCheckingTask]}
                            deletingState={[deletingTask, setDeletingTask]}
                            allTasks={tasks}
                            tasks={tasks
                                .filter(
                                    (task) =>
                                        !task.status &&
                                        !task.isEvent &&
                                        task.epic !== 'Привычки' &&
                                        dateToString(task.dateEnd) >
                                            dateToString(week) &&
                                        dateToString(task.dateEnd) <=
                                            dateToString(nextWeek) &&
                                        epics.includes(task.epic)
                                )
                                .sort(sortFunc)}
                            doneTasks={tasks.filter(
                                (task) =>
                                    task.status &&
                                    !task.isEvent &&
                                    task.epic !== 'Привычки' &&
                                    dateToString(task.dateEnd) > dateToString(week) &&
                                    dateToString(task.dateEnd) <=
                                        dateToString(nextWeek) &&
                                    epics.includes(task.epic)
                            )}
                        />
                    {/* </div> */}
                </GridItem>
                <GridItem colSpan={3}>
                    <div id="block2" className="col-span-7 lg:col-span-3">
                        <h2 className="gradient-font text-3xl">Привычки</h2>
                        <Habits
                            editState={[taskEdit, setTaskEdit]}
                            checkingState={[checkingTask, setCheckingTask]}
                            todayTask={
                                tasks.filter(
                                    (task) =>
                                        task.epic === 'Привычки' &&
                                        task.title === 'Привычки_' + todayString
                                )[0]
                            }
                            yesterdayTask={
                                tasks.filter(
                                    (task) =>
                                        task.epic === 'Привычки' &&
                                        task.title === 'Привычки_' + yesterdayString
                                )[0]
                            }
                            templateTask={
                                tasks.filter(
                                    (task) =>
                                        task.epic === 'Привычки' &&
                                        task.title === 'Привычки_шаблон'
                                )[0]
                            }
                        />
                        <div className="eventsPage">
                            <h2 className="gradient-font text-3xl">Мероприятия</h2>
                            <ButtonGroup
                                className="backdrop-blur-sm rounded-lg"
                                variant="ghost"
                                spacing="0"
                            >
                                <Button
                                    id="isEvent"
                                    colorScheme="whiteAlpha"
                                    leftIcon={
                                        <FaAngleLeft className="text-2xl text-[#e0e0e0]" />
                                    }
                                    onClick={() => {
                                        calendarRef.current.getApi().prev();
                                    }}
                                />
                                <Button
                                    id="isEvent"
                                    colorScheme="whiteAlpha"
                                    isDisabled={isTodayVisible}
                                    onClick={() => {
                                        calendarRef.current.getApi().today();
                                    }}
                                >
                                    <p
                                        className={
                                            'text-2xl' +
                                            (!isTodayVisible ? ' text-[#e0e0e0]' : '')
                                        }
                                    >
                                        Сегодня
                                    </p>
                                </Button>
                                <Button
                                    id="isEvent"
                                    colorScheme="whiteAlpha"
                                    leftIcon={
                                        <FaAngleRight className="text-2xl text-[#e0e0e0]" />
                                    }
                                    onClick={() => {
                                        calendarRef.current.getApi().next();
                                    }}
                                />
                            </ButtonGroup>
                        </div>
                        <FullCalendar
                            className="backdrop-blur-sm"
                            ref={calendarRef}
                            plugins={[timeGridPlugin]}
                            initialView="fourDay"
                            locale="rulocale"
                            slotMinTime="09:00:00"
                            slotMaxTime="22:30:00"
                            contentHeight={1080}
                            expandRows={true}
                            headerToolbar={false}
                            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                            dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit' }}
                            views={{ fourDay: { type: 'timeGrid', duration: { days: 4 }, buttonText: '4 days' } }}
                            eventContent={arg => (
                                <div className={`custom-event p-1 text-[#e0e0e0]${arg.event.extendedProps.status ? ' grayscale' : ''}`}>
                                    <Checkbox.Root
                                        onChange={(e) => checkingSome(e, tasks.filter(task => arg.event.title === task.title)[0], setCheckingTask, request, token)}
                                        defaultChecked={checkingTask[0] === arg.event.id || arg.event.extendedProps.status}
                                        variant='subtle'
                                        colorPalette='gray'
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label>{arg.event.title}</Checkbox.Label>
                                    </Checkbox.Root>
                                </div>
                            )}
                            events={eventsToCalendar( tasks.filter(task => task.isEvent && epics.includes(task.epic)) )}
                            datesSet={handleDatesSet}
                        />
                    </div>
                </GridItem>
            {/* </div> */}
        </Grid>
    );
};
