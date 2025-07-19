import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {TasksList} from "../components/TasksList";
import {dateToString, todayString, yesterdayString, epicToIcon, epicToColor} from "../methods";
import {CreateTask} from "../components/CreateTask";
import {Habits} from "../components/Habits";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [creatingTask, setCreatingTask] = useState(false);
    const [taskEdit, setTaskEdit] = useState('');
    const [checkingTask, setCheckingTask] = useState('');
    const [isTodayVisible, setIsTodayVisible] = useState(true);
    const [epics, setEpics] = useState(Object.keys(epicToIcon))
    const {request} = useHttp();
    const {token} = useContext(AuthContext);
    const calendarRef = useRef(null);
    document.documentElement.style.setProperty('--fc-today-bg-color', "#1A1A1A");
    document.documentElement.style.setProperty('--epicsCount', Object.keys(epicToIcon).length);
    document.documentElement.style.setProperty('--tasksLength', Math.round(Object.keys(epicToIcon).length/10*6));
    document.documentElement.style.setProperty('--otherLength', Math.round(Object.keys(epicToIcon).length - (Object.keys(epicToIcon).length/10*6)));



    const today = new Date(), week = new Date(), nextWeek = new Date();
    week.setDate(week.getDate() + 7);
    nextWeek.setDate(nextWeek.getDate() + 14);

    const fetchTasks = useCallback( async () => {
        try{
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}`});
            setTasks(fetched);
        } catch (e) {}
    }, [token, request])

    useEffect(() => { if (!creatingTask && taskEdit === '' && checkingTask === '') fetchTasks() }, [fetchTasks, creatingTask, taskEdit, checkingTask]);

    function eventsToCalendar(events) {
        var calendar = [];
        events.map(event => { calendar.push({ title: event.title, start: event.dateStart, end: event.dateEnd, backgroundColor: epicToColor[event.epic]+"1)", textColor: "#212121", status: event.status}) });
        return calendar
    }

    const sortFunc = (a,b) => {
        const typeOrder= {'A': 1, 'B': 2, 'C': 3, 'D': 4};
        const typeDifference = typeOrder[a.eisenhower] - typeOrder[b.eisenhower];
        if (typeDifference !== 0) { return typeDifference }
        return new Date(a.dateEnd) - new Date(b.dateEnd);
    }

    const handleDatesSet = useCallback((dateInfo) => { setIsTodayVisible(today >= dateInfo.view.activeStart && today < dateInfo.view.activeEnd) }, [])

    const epicsChanging = async event => {
        let target = event.target.closest(".epicOption");
        let epicsCopy = epics.slice(0);
        if (target.classList.contains("selected")) { epicsCopy.splice(epicsCopy.indexOf(target.value), 1) }
        else { epicsCopy.push(target.value) }
        setEpics(epicsCopy);
    }

    return (
        <div id="tasksDashBoard">
            <div id="epicsBlock">
                {Object.keys(epicToIcon).map((epic) =>
                    <button className={"btn-flat waves-effect epicOption waves-grey " + (epics.includes(epic) ? "selected" : "grey-text text-darken-3")} id={"epic"+epic} value={epic} style={{borderBottomColor: `${epics.includes(epic) ? epicToColor[epic] : "rgba(66, 66, 66,"}1)`, color: `${epicToColor[epic]}1)`}} onClick={epicsChanging}>
                        {epic === "Flow"
                            ? <i className="epicIcon val-font gradient-font" id={"epic"+epic+"Icon"} style={{width: "auto", height: "auto", marginRight: 0}}>FLOW</i>
                            : ["МегаФон", "РУДН", "ФК_Краснодар"].includes(epic)
                                ? <><img className="epicIcon" id={"epic"+epic+"Icon"} src={`..\\img\\${epicToIcon[epic]}.png`} alt={epic} width="32px" height="32px"/>{epic.replace("_", " ")}</>
                                : <><i className="material-icons epicIcon" id={"epic"+epic+"Icon"}>{epicToIcon[epic]}</i>{epic.replace("_", " ")}</>
                        }
                        </button>)}
            </div>
            <div id="tasksBlock">
                <div id="block1">
                    <div id="subBlock1-1">
                        <h2 className="gradient-font">Сегодня</h2>
                        {!creatingTask && <button className="btn" id="createTask" onClick={e => {setCreatingTask(true)}}>
                            <i className="large material-icons">add</i>Новая задача</button>}
                    </div>
                    {creatingTask && <CreateTask state={setCreatingTask}/>}
                    <TasksList editState={[taskEdit, setTaskEdit]}
                               checkingState={[checkingTask, setCheckingTask]}
                               tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) <= dateToString(today) && epics.includes(task.epic)).sort(sortFunc)}
                               doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) <= dateToString(today) && epics.includes(task.epic))}
                    />
                    <h2 className="gradient-font">Неделя</h2>
                    <TasksList editState={[taskEdit, setTaskEdit]}
                               checkingState={[checkingTask, setCheckingTask]}
                               tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(today) && dateToString(task.dateEnd) <= dateToString(week) && epics.includes(task.epic)).sort(sortFunc)}
                               doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(today) && dateToString(task.dateEnd) <= dateToString(week) && epics.includes(task.epic))}
                    />
                    <h2 className="gradient-font">Следующая неделя</h2>
                    <TasksList editState={[taskEdit, setTaskEdit]}
                               checkingState={[checkingTask, setCheckingTask]}
                               tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(week) && dateToString(task.dateEnd) <= dateToString(nextWeek) && epics.includes(task.epic)).sort(sortFunc)}
                               doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(week) && dateToString(task.dateEnd) <= dateToString(nextWeek) && epics.includes(task.epic))}
                    />
                </div>
                <div id="block2">
                    <h2 className="gradient-font">Привычки</h2>
                    <Habits editState={[taskEdit, setTaskEdit]}
                            checkingState={[checkingTask, setCheckingTask]}
                            todayTask={tasks.filter(task => task.epic === 'Привычки' && task.title === ('Привычки_' + todayString))[0]}
                            yesterdayTask={tasks.filter(task => task.epic === 'Привычки' && task.title === ('Привычки_' + yesterdayString))[0]}
                            templateTask={tasks.filter(task => task.epic === 'Привычки' && task.title === 'Привычки_шаблон')[0]}
                    />
                    <div className="eventsPage">
                        <h2 className="gradient-font">Мероприятия</h2>
                        <div className="eventsButtonsArea">
                            <button className="btn-flat waves-effect waves-grey" id="isEvent" onClick={ () => {calendarRef.current.getApi().prev()} }>
                                <i className="material-icons">chevron_left</i></button>
                            <button className={"btn-flat " + (isTodayVisible ? "disabled" : "waves-effect waves-grey")} id="isEvent" onClick={() => { calendarRef.current.getApi().today()} }>
                                Сегодня</button>
                            <button className="btn-flat waves-effect waves-grey" id="isEvent" onClick={ () => {calendarRef.current.getApi().next()} }>
                                <i className="material-icons">chevron_right</i></button>
                        </div>
                    </div>
                    <FullCalendar ref={calendarRef}
                                  plugins={[ timeGridPlugin ]}
                                  initialView="fourDay"
                                  locale="rulocale"
                                  slotMinTime="09:00:00"
                                  slotMaxTime="22:30:00"
                                  contentHeight={1080}
                                  expandRows={true}
                                  headerToolbar={false}
                                  slotLabelFormat={{
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false  // 24-часовой формат
                                  }}
                                  dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit'}}
                                  views={{
                                      fourDay: {
                                          type: 'timeGrid',
                                          duration: { days: 4 },
                                          buttonText: '4 days'
                                      }
                                  }}
                                  eventContent={(arg) => (
                                      <div className="custom-event">
                                          <label><input type="checkbox" checked={arg.event.status ? "checked" : false}
                                                        /><span></span></label>
                                          <b>{arg.event.title}</b>
                                      </div>
                                  )}
                                  events={eventsToCalendar(tasks.filter(task => task.isEvent && epics.includes(task.epic)))}
                                  datesSet={handleDatesSet}/>
                </div>
            </div>
        </div>
    )
}