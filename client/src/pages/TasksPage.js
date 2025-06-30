import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {TasksList} from "../components/TasksList";
import {dateToString} from "../methods";
import {CreateTask} from "../components/CreateTask";
import {Habits} from "../components/Habits";
import {todayString, yesterdayString} from "../methods";

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [creatingTask, setCreatingTask] = useState(false);
    const [taskEdit, setTaskEdit] = useState('');
    const {loading, request} = useHttp();
    const {token} = useContext(AuthContext);
    const isFirstRender = useRef(true);

    const today = new Date(), week = new Date(), nextWeek = new Date();
    week.setDate(week.getDate() + 7);
    nextWeek.setDate(nextWeek.getDate() + 14);


    const fetchTasks = useCallback( async () => {
        try{
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}`});
            setTasks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!creatingTask && taskEdit === '') { fetchTasks() }
    }, [fetchTasks, creatingTask, taskEdit]);

    return (
        <div id="tasksDashBoard">
            {!loading &&
                <>
                    <div id="block1">
                        {creatingTask
                            ? <CreateTask state={setCreatingTask}/>
                            : <button className="btn-flat" id="createTask" onClick={e => {setCreatingTask(true)}}>
                                <i className="large material-icons">add</i>Новая задача</button>}
                        <h2>Сегодня</h2>
                        <TasksList state={[taskEdit, setTaskEdit]} tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) <= dateToString(today))}/>
                        <h2>Неделя</h2>
                        <TasksList state={[taskEdit, setTaskEdit]} tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(today) && dateToString(task.dateEnd) <= dateToString(week))}/>
                        <h2>Следующая неделя</h2>
                        <TasksList state={[taskEdit, setTaskEdit]} tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(week) && dateToString(task.dateEnd) <= dateToString(nextWeek))}/>
                    </div>
                    <div id="block2">
                        <Habits state={[taskEdit, setTaskEdit]} tasks={tasks.filter(task => task.epic === 'Привычки' && ['Привычки_' + todayString, 'Привычки_' + yesterdayString, 'Привычки_шаблон'].includes(task.title) && !task.status)}/>
                    </div>
                </>
            }
        </div>
    )
}