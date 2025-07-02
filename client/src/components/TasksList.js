import React, {useContext, useState} from 'react';
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {dateToString} from "../methods";
import {CreateTask} from "./CreateTask";

export const TasksList = ({ editState, checkingState, tasks, doneTasks }) => {
    const epicToIcon = {"МегаФон": "megafon", "РУДН": "rudn", "Личное": "person_outline", "Семья": "people_outline", "Уля": "favorite_border", "ФК_Краснодар": "FC_Krasnodar"}
    const epicToColor = {"МегаФон": "0, 185, 86", "РУДН": "0, 121, 194", "Личное": "149, 117, 205", "Семья": "255, 241, 118", "Уля": "240, 98, 146", "ФК_Краснодар": "0,73,35"}
    const {request} = useHttp();
    const {token} = useContext(AuthContext);
    const [showDone, setShowDone] = useState(false)

    // if (!tasks.length) {
    //     return <p className="center">Пока задач нет(</p>
    // }

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
                        return (<div className="task"
                                     style={{boxShadow: `-8px 0 17px 2px rgba(${epicToColor[task.epic]},0.14),-3px 0 14px 2px rgba(${epicToColor[task.epic]},0.12),-5px 0 5px -3px rgba(${epicToColor[task.epic]},0.2)`}}>
                            <div className="taskBlock1">
                                <div className="taskCheckerBlock">
                                    <label><input type="checkbox" checked={checkingState[0] === task._id ? "checked" : false}
                                                  onClick={e => checkingTask(e, task)}/><span></span></label>
                                </div>
                                <div className="taskInfoBlock">
                                    <div className="taskSubBlock" id="subBlock1">
                                        {['МегаФон', 'РУДН', 'ФК_Краснодар'].includes(task.epic)
                                            ?
                                            <img className="epicIcon" src={"..\\img\\" + epicToIcon[task.epic] + ".png"}
                                                 alt={task.epic} width="24px" height="24px"/>
                                            : (['Личное', 'Семья', 'Уля'].includes(task.epic) &&
                                                <i className="material-icons epicIcon"
                                                   style={{color: "rgb(" + epicToColor[task.epic] + ")"}}>{epicToIcon[task.epic]}</i>)}
                                        <h3>{task.title}</h3>
                                    </div>
                                    {task.description && <div className="taskSubBlock" id="subBlock3"><></><h3>{task.description}</h3></div>}
                                    <div className="taskSubBlock" id="subBlock3">
                                        <p>{task.eisenhower}</p>
                                        <p>{dateToString(task.dateStart)} ➜ {dateToString(task.dateEnd)}</p>
                                    </div>
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
                                        <div key={subTask.id} className="subTask">
                                            <label><input type="checkbox"/><span></span></label>
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
                             style={{boxShadow: `-8px 0 17px 2px rgba(${epicToColor[task.epic]},0.14),-3px 0 14px 2px rgba(${epicToColor[task.epic]},0.12),-5px 0 5px -3px rgba(${epicToColor[task.epic]},0.2)`}}>
                            <div className="taskBlock1">
                                <div className="taskCheckerBlock">
                                    <label><input type="checkbox" checked="checked"
                                                  onClick={e => checkingTask(e, task)}/><span></span></label>
                                </div>
                                <div className="taskInfoBlock">
                                    <div className="taskSubBlock" id="subBlock1">
                                        {['МегаФон', 'РУДН', 'ФК_Краснодар'].includes(task.epic)
                                            ?
                                            <img className="epicIcon" src={"..\\img\\" + epicToIcon[task.epic] + ".png"}
                                                 alt={task.epic} width="24px" height="24px"/>
                                            : (['Личное', 'Семья', 'Уля'].includes(task.epic) &&
                                                <i className="material-icons epicIcon"
                                                   style={{color: "rgb(" + epicToColor[task.epic] + ")"}}>{epicToIcon[task.epic]}</i>)}
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