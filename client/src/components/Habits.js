import React, {useContext, useEffect, useState} from 'react';
import {useHttp} from "../hooks/http.hook";
import {useMessage} from "../hooks/message.hook";
import {todayString, yesterdayString} from "../methods";
import {AuthContext} from "../context/AuthContext";

export const Habits = ({ editState, checkingState, todayTask, yesterdayTask, templateTask }) => {
    const auth = useContext(AuthContext);
    const {request} = useHttp();
    const {token} = useContext(AuthContext);
    const message = useMessage();
    const [subTasks, setSubTasks] = useState([]);
    const [frontDay, setFrontDay] = useState(todayString);

    useEffect(() => {
        setSubTasks(templateTask?.subTasks);
    }, [todayTask]);

    async function checkingSubTask(e, task, subTask){
        const {_id, status, subTasks} = task;
        let subTasksCopy = subTasks.slice(0);
        var newSubTasks = [];
        subTasksCopy.map(sT => {
            if (sT._id === subTask._id) { newSubTasks.push({ name: subTask.name, status: !subTask.status, _id: subTask._id }) }
            else { newSubTasks.push(sT) }
        })
        checkingState[1](_id);
        const data = await request('/api/task/check/'+task._id, 'PUT', {_id: _id, status: status, subTasks: newSubTasks}, { Authorization: `Bearer ${token}`});
        checkingState[1]('');
    }

    function syncSubTasks(sourceTask, newTask){
        var resultTask = [];
        sourceTask.map(subTask => {
            const isExist = newTask.find(sT => sT._id === subTask._id);
            if (isExist) {
                resultTask.push({_id: subTask._id, name: isExist.name, status: subTask.status});
                const delIndex = newTask.indexOf(isExist);
                newTask.splice(delIndex, 1);
            }
        })
        newTask.map(subTask => resultTask.push(subTask));
        return resultTask
    }

    const pressHandler = async event => {
        try {
            await request(`/api/task/habits/${templateTask._id}`, "PUT",{ ...templateTask, subTasks: subTasks },{Authorization: `Bearer ${auth.token}`});
            const newTask = subTasks.slice(0);
            const newYesterdaySubTask = syncSubTasks(yesterdayTask.subTasks, newTask);
            console.log(newYesterdaySubTask);
            await request(`/api/task/habits/${yesterdayTask._id}`, "PUT",{ ...yesterdayTask, subTasks: newYesterdaySubTask },{Authorization: `Bearer ${auth.token}`});
            const newTodaySubTask = syncSubTasks(todayTask.subTasks, subTasks);
            console.log(newTodaySubTask);
            const frontData = await request(`/api/task/habits/${todayTask._id}`, "PUT",{ ...todayTask, subTasks: newTodaySubTask },{Authorization: `Bearer ${auth.token}`});
            if (frontData) {
                message("Задача обновлена!", "OK");
                editState[1]('');
            }
        } catch (e) {}
    }

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="habitsPage">
            {(editState[0] !== 'Привычки_шаблон')
                ? <div className="backHabits">
                    { frontDay === todayString && <div className="backHabitsInfo">
                        <i className="material-icons buttonIcon" onClick={e => setFrontDay(yesterdayString)}>chevron_left</i>
                        {yesterdayTask && (yesterdayTask.subTasks.map(subTask => {
                            return <div className="subTask">
                                <label><input type="checkbox" checked={subTask.status && "checked"} disabled="disabled"/><span></span></label>
                            </div>
                        }))}
                    </div>}
                    <div className="frontHabits">
                        <div className="habitsInfoBlock">
                            <h2>{frontDay === todayString ? "Сегодня" : "Вчера"}</h2>
                            <i className="material-icons buttonIcon" onClick={e => editState[1]('Привычки_шаблон')}>create</i>
                        </div>
                        <div className="habitsSubTasksBlock">
                            {[0, undefined].includes(subTasks?.length)
                                ? <div className="noHabitsMessage">Пока привычек нет(</div>
                                : (frontDay === todayString ? todayTask : yesterdayTask).subTasks.map(subTask => (
                                    <div key={subTask.id} className="subTask">
                                        <label><input type="checkbox" checked={subTask.status && "checked"} onClick={e => checkingSubTask(e, (frontDay === todayString ? todayTask : yesterdayTask), subTask)}/><span></span></label>
                                        <p>{subTask.name}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                    { frontDay === yesterdayString && <div className="backHabitsInfo">
                        <i className="material-icons buttonIcon" onClick={e => setFrontDay(todayString)}>chevron_right</i>
                        {todayTask !== undefined && (todayTask.subTasks.map(subTask => {
                            return <div className="subTask">
                                <label><input type="checkbox" checked={subTask.status && "checked"} disabled="disabled"/><span></span></label>
                            </div>
                        }))}
                    </div>}
                </div>
                : <div className="habitsEdit">
                    <div className="habitsSubTasksBlock">
                        {subTasks.map(subTask => {
                            return (<div key={subTask._id} className="subTask">
                                    <input
                                        type="text"
                                        value={subTask.name}
                                        onChange={ (e) => setSubTasks(subTasks.map(t =>
                                            t._id === subTask._id
                                                ? { ...t, name: e.target.value }
                                                : t )) }
                                    />
                                    <button className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                                            onClick={() => setSubTasks(subTasks.filter(t => {
                                                return t._id !== subTask._id}))}><i className="large material-icons">clear</i>
                                    </button>
                                </div>
                            )})}
                        <button
                            className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                            onClick={newSubTask}><i className="large material-icons">add</i>Добавить
                            подзадачу
                        </button>
                        <button className="btn waves-effect waves-grey" id="createTask" onClick={pressHandler}>Обновить привычки</button>
                    </div>
                </div>
            }
        </div>
    )
}