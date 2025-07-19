import React, {useContext, useState} from 'react';
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {dateToString, todayString} from "../methods";
import {CreateTask} from "./CreateTask";
import {epicToIcon, epicToColor} from "../methods";

export const TasksList = ({ editState, checkingState, tasks, doneTasks }) => {
    const {request} = useHttp();
    const {token} = useContext(AuthContext);
    const [showDone, setShowDone] = useState(false);

    async function checkingSubTask(e, task, subTask){
        const {_id, status, subTasks} = task;
        let subTasksCopy = subTasks.slice(0);
        var sT_id;
        var newSubTasks = [];
        subTasksCopy.map(sT => {
            if (sT._id === subTask._id) {
                newSubTasks.push({ name: subTask.name, status: !subTask.status, _id: subTask._id });
                sT_id = subTask._id;
            } else { newSubTasks.push(sT) }
        });
        checkingState[1](sT_id);
        const data = await request('/api/task/check/'+task._id, 'PUT', {_id: _id, status: status, subTasks: newSubTasks}, { Authorization: `Bearer ${token}`});
        checkingState[1]('');
    }

    async function checkingTask(e, task){
        const {_id, status, subTasks} = task;
        checkingState[1](_id);
        const data = await request('/api/task/check/'+task._id, 'PUT', {_id: _id, status: !status, subTasks: subTasks}, { Authorization: `Bearer ${token}`});
        checkingState[1]('');
    }

    return (
        <div className="tasksList">
            {tasks.length !== 0
                ? tasks.map(task => {
                    if (editState[0] !== task._id) {
                        return (<div key={task._id} className="task"
                                     style={{boxShadow: `0px 0px 22px 10px ${epicToColor[task.epic]}0.21),0px 0px 13px 5px ${epicToColor[task.epic]}0.18),0px 0px 7px -2px ${epicToColor[task.epic]}0.3)`}}>
                            <div className="taskBlock1">
                                <div className="taskCheckerBlock">
                                    <label><input type="checkbox" checked={checkingState[0] === task._id ? "checked" : false}
                                                  onClick={e => checkingTask(e, task)}/><span></span></label>
                                </div>
                                <div className="taskInfoBlock">
                                    <div className="taskSubBlock" id="subBlock1">
                                        {task.epic === "Flow"
                                            ? <i className="epicIcon val-font gradient-font" id={"epic"+task.epic+"Icon"}>F</i>
                                            : ['МегаФон', 'РУДН', 'ФК_Краснодар'].includes(task.epic)
                                                ?
                                                <img className="epicIcon" src={"..\\img\\" + epicToIcon[task.epic] + ".png"}
                                                     alt={task.epic} width="24px" height="24px"/>
                                                : (['Личное', 'Семья', 'Уля'].includes(task.epic) &&
                                                    <i className="material-icons epicIcon"
                                                       style={{color: epicToColor[task.epic] + "1)"}}>{epicToIcon[task.epic]}</i>)}
                                        <h3>{task.title}</h3>
                                    </div>
                                    <div className="taskSubBlock" id="subBlock2">
                                        <p>{task.eisenhower}</p>
                                        <p>{(dateToString(task.dateStart) !== "Invalid Date" ? dateToString(task.dateStart) + " ➜ " : "") + dateToString(task.dateEnd)}</p>
                                    </div>
                                    {task.description ? <div className="taskSubBlock" id="subBlock3"><></><h3>{task.description}</h3></div> : <div style={{ margin: 0 }}></div>}
                                </div>
                                <div className="taskEditBlock">
                                    <i className="material-icons buttonIcon" onClick={e => {
                                        editState[1](task._id)
                                    }}>create</i>
                                </div>
                            </div>
                            <div className="taskBlock2">
                                <div className="taskSubTasksBlock">
                                    {task.subTasks.map(subTask => (
                                        <div key={subTask._id} className="subTask">
                                            <label><input type="checkbox"
                                                          checked={checkingState[0] === subTask._id || subTask.status ? "checked" : false}
                                                          onClick={e => checkingSubTask(e, task, subTask)}/><span></span></label>
                                            <p>{subTask.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>)
                    } else { return <CreateTask state={editState[1]} task={task}/> }})
                : <p className="center">Пока задач нет(</p>
            }
            {doneTasks.length !== 0 && <>
                <button className="btn-flat" id="showDoneTasks" onClick={e => setShowDone(!showDone)}>
                    <i className="large material-icons">{"arrow_drop_" + (showDone ? "up" : "down")}</i>{(showDone ? "Скрыть" : "Показать") + " выполненные задачи"}</button>
                {(showDone && doneTasks.map(task =>
                        <div className="task doneTask"
                             style={{boxShadow: `-8px 0 17px 2px ${epicToColor[task.epic]}0.14),-3px 0 14px 2px ${epicToColor[task.epic]}0.12),-5px 0 5px -3px ${epicToColor[task.epic]}0.2)`}}>
                            <div className="taskBlock1">
                                <div className="taskCheckerBlock">
                                    <label><input type="checkbox" checked="checked"
                                                  onClick={e => checkingTask(e, task)}/><span></span></label>
                                </div>
                                <div className="taskInfoBlock">
                                    <div className="taskSubBlock" id="subBlock1">
                                        {task.epic === "Flow"
                                            ? <i className="epicIcon val-font gradient-font" id={"epic"+task.epic+"Icon"}>F</i>
                                            : ['МегаФон', 'РУДН', 'ФК_Краснодар'].includes(task.epic)
                                                ?
                                                <img className="epicIcon" src={"..\\img\\" + epicToIcon[task.epic] + ".png"}
                                                     alt={task.epic} width="24px" height="24px"/>
                                                : (['Личное', 'Семья', 'Уля'].includes(task.epic) &&
                                                    <i className="material-icons epicIcon"
                                                       style={{color: epicToColor[task.epic] + "1)"}}>{epicToIcon[task.epic]}</i>)}
                                        <h3>{task.title}</h3>
                                    </div>
                                    <div className="taskSubBlock" id="subBlock2">
                                        <p>{task.eisenhower}</p>
                                        <p>{dateToString(task.dateStart)} ➜ {dateToString(task.dateEnd)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="taskBlock2">
                                <div className="taskSubTasksBlock">
                                    {task.subTasks.map(subTask => (
                                        <div key={subTask.id} className="subTask">
                                            <label><input type="checkbox"/><span></span></label>
                                            <p>{subTask.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            }
        </div>
    )
}