import React, { useCallback, useContext, useRef, useState } from 'react';
import { EpicsContext } from '../App';
import { TasksList } from '../components/TasksList';
import { dateToString, epicToColor } from '../methods';
import { Habits } from '../components/Habits';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonGroup, Button, IconButton, Box, Text } from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { useTasks } from '../context/TasksContext';
import { CreateTask } from '../components/CreateTask.tsx';
import { Check } from '../components/ui/Check';

export const MainPage = () => {
    const { tasks, events } = useTasks();
    const [isTodayVisible, setIsTodayVisible] = useState(true);
    const [ epics ] = useContext(EpicsContext);
    const calendarRef = useRef(null);

    const today = new Date(), week = new Date(), month = new Date();
    week.setDate(week.getDate() + 7);
    month.setDate(month.getMonth() + 1);

    const datesSet = useCallback((dateInfo) => {setIsTodayVisible(today >=  dateInfo.view.activeStart && today < dateInfo.view.activeEnd)}, [today]);

    function eventsToCalendar(events) {
        return events && events.map((event) => ({
            id: event._id || event.parentId+'_'+event.dateEnd,
            title: event.title,
            start: event.dateStart,
            end: event.dateEnd,
            backgroundColor: event.status ? '#424242' : epicToColor[event.epic] + '1)',
            textColor: '#212121',
            status: event.status,
            allDay: ['00:00', '21:00'].includes(event.dateStart.slice(11,16)) && ['00:00', '20:59'].includes(event.dateEnd.slice(11,16))
        }))
    }

    const sortFunc = (a, b) => {
        const typeOrder = { A: 1, B: 2, C: 3, D: 4 };
        return typeOrder[a.eisenhower] - typeOrder[b.eisenhower] || new Date(a.dateEnd) - new Date(b.dateEnd);
    };
    
    var tasksCopy = JSON.parse(JSON.stringify(tasks));
    tasksCopy = tasksCopy.filter(task => (!task.isEvent && !task.status) || (task.epic !== 'Привычки' && epics.includes(task.epic) && !task.isTemplate && !task.isProject));
    const todayTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(today) || dateToString(task.dateEnd) <= dateToString(today))
    tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(today) || dateToString(task.dateEnd) <= dateToString(today)))
    const weekTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(week) || dateToString(task.dateEnd) <= dateToString(week))
    tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(week) || dateToString(task.dateEnd) <= dateToString(week)))
    const monthTasks = tasksCopy.filter(task => dateToString(task.dateStart) <= dateToString(month) || dateToString(task.dateEnd) <= dateToString(month))
    tasksCopy = tasksCopy.filter(task => !(dateToString(task.dateStart) <= dateToString(month) || dateToString(task.dateEnd) <= dateToString(month)))

    return (<div className={`grid grid-cols-12 gap-8 w-full p-4 items-start sm:px-8 scrollbarWidth`}>
        <div className="col-span-12 lg:col-span-7 h-full" id="block1">
            <h2 className="gradient-font text-3xl">Сегодня</h2>
            <TasksList tasks={todayTasks.sort(sortFunc)} />
            {weekTasks.length > 0 && <><h2 className="gradient-font text-3xl">Неделя</h2>
            <TasksList tasks={weekTasks.sort(sortFunc)} /></>}
            {monthTasks.length > 0 && <><h2 className="gradient-font text-3xl">Следующая неделя</h2>
            <TasksList tasks={monthTasks.sort(sortFunc)} /></>}
        </div>
        <div id="block2" className="col-span-12 lg:col-span-5">
            <h2 className="gradient-font text-3xl h-10">Привычки</h2>
            <Habits />
            <div className="eventsPage">
                <h2 className="gradient-font text-3xl h-10">Мероприятия</h2>
                <ButtonGroup variant="ghost" spacing="0" backgroundColor='#161616' rounded='lg' gap={0}>
                    <IconButton colorPalette="gray" onClick={() => calendarRef.current.getApi().prev()}><FaAngleLeft className="text-2xl text-[#e0e0e0]" /></IconButton>
                    <Button colorPalette="gray" disabled={isTodayVisible} onClick={() => calendarRef.current.getApi().today()}><p className={`text-2xl${!isTodayVisible ? ' text-[#e0e0e0]' : ''}`}>Сегодня</p></Button>
                    <IconButton colorPalette="gray" onClick={() => calendarRef.current.getApi().next()}><FaAngleRight className="text-2xl text-[#e0e0e0]" /></IconButton>
                </ButtonGroup>
            </div>
            <FullCalendar
                ref={calendarRef} plugins={[timeGridPlugin]} initialView="fourDay" locale="rulocale" slotMinTime="09:00:00" slotMaxTime="22:30:00"
                contentHeight={1080} expandRows={true} headerToolbar={false} slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit' }}
                views={{ fourDay: { type: 'timeGrid', duration: { days: 4 }, buttonText: '4 days' } }}
                eventContent={arg => (
                    <Box display='flex' flexDirection='row' alignItems='center' h='full' p={1} color='#e0e0e0' filter={arg.event.extendedProps.status ? 'grayscale(1)' : 'none'}>
                        <Check onClick={{task: events.filter(event => arg.event.id === event._id)[0]}} checked={arg.event.extendedProps.status}/>
                        <Text ml={3} maxH='full' overflowY='auto' onClick={() => {if (arg.event.id !== 'undefined') CreateTask.open('a', { task: events.find(event => event._id === arg.event.id) })}}>{arg.event.title}</Text>
                    </Box>
                )}
                events={eventsToCalendar(events)}
                datesSet={datesSet}
            />
        </div>
    </div>);
};
