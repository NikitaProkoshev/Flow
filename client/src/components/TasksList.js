import React from 'react';
import {dateToString} from "../methods";
import {CreateTask} from "./CreateTask";

export const TasksList = ({ state, tasks }) => {
    const epicToIcon = {"МегаФон": "megafon", "РУДН": "rudn", "Личное": "person_outline", "Семья": "people_outline", "Уля": "favorite_border"}
    const epicToColor = {"МегаФон": "0, 185, 86", "РУДН": "0, 121, 194", "Личное": "149, 117, 205", "Семья": "255, 241, 118", "Уля": "240, 98, 146"}

    if (!tasks.length) {
        return <p className="center">Пока задач нет(</p>
    }

    return (
        <div className="tasksList">
            {tasks.map(task => {
                if (state[0] !== task._id) {
                    return (<div className="task" style={{boxShadow: `-8px 0 17px 2px rgba(${epicToColor[task.epic]},0.14),-3px 0 14px 2px rgba(${epicToColor[task.epic]},0.12),-5px 0 5px -3px rgba(${epicToColor[task.epic]},0.2)`}}>
                        <div className="taskBlock1">
                            <div className="taskCheckerBlock">
                                <label><input type="checkbox"/><span></span></label>
                            </div>
                            <div className="taskInfoBlock">
                                <div className="taskSubBlock" id="subBlock1">
                                    {['МегаФон', 'РУДН'].includes(task.epic)
                                        ? <img className="epicIcon" src={"..\\img\\" + epicToIcon[task.epic] + ".png"}
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
                            <div className="taskEditBlock">
                                <i className="material-icons epicIcon" onClick={e => {state[1](task._id)}}>create</i>
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
                } else {return <CreateTask state={state[1]} task={task}/>}

            })}
        </div>
    )
}