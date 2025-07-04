import React, {useContext, useEffect, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {useMessage} from "../hooks/message.hook";
import {AuthContext} from "../context/AuthContext";
import {dateToString} from "../methods";
import {epicToIcon, epicToColor} from "../methods";

export const CreateTask = ({ state, task={} }) => {
    const auth = useContext(AuthContext);
    const {request} = useHttp();
    const message = useMessage();

    const [epic, setEpic] = useState(task.epic || '');
    const [title, setTitle] = useState(task.title || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState(task.dateStart !== undefined ? dateToString(task.dateStart) : undefined);
    const [timeStart, setTimeStart] = useState(new Date(task.dateStart).toLocaleTimeString('ru-RU') !== "Invalid Date" ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [dateEnd, setDateEnd] = useState(task.dateEnd !== undefined ? dateToString(task.dateEnd) : dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState(new Date(task.dateEnd).toLocaleTimeString('ru-RU') !== "Invalid Date" ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || '');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [editing, setEditing] = useState(true);
    const [required, setRequired] = useState(2);

    useEffect(() => {
        window.M.updateTextFields();
        setRequired(document.getElementsByClassName("required").length + (epic === '' ? 1 : 0) + (eisenhower === '' ? 1 : 0));
        document.documentElement.style.setProperty('--epicColor', epicToColor[epic]+"1)");
        if (editing && task.eisenhower !== undefined) {
            eisenhowerSelecting({target: document.getElementById("eisenhower"+task.eisenhower)});
            setEditing(false);
        }
    })

    const cancelChanges = async event => {
        if (task._id === undefined) { state(false) }
        else { state('') }
    }

    const saveChanges = async event => {
        try {
            if (required === 0) {
                if (task._id === undefined) {
                    const data = await request('/api/task/create', "POST",
                        { epic: epic, status: false, title: title, description: desc, isEvent: isEvent, dateStart: dateStart.slice(0,11)+"T"+timeStart, dateEnd: dateEnd.slice(0,11)+"T"+timeEnd, eisenhower: eisenhower, subTasks: subTasks },
                        {Authorization: `Bearer ${auth.token}`});
                    if (data) {
                        message("Задача создана!", "OK");
                        state(false);
                    }
                } else {
                    const data = await request(`/api/task/update/${task._id}`, "PUT",
                        {_id: task._id, epic: epic, status: false, title: title, description: desc, isEvent: isEvent, dateStart: dateStart.slice(0,11)+"T"+timeStart, dateEnd: dateEnd.slice(0,11)+"T"+timeEnd, eisenhower: eisenhower, subTasks: subTasks },
                        {Authorization: `Bearer ${auth.token}`});
                    if (data) {
                        message("Задача обновлена!", "OK");
                        state('');
                    }
                }
            } else { message("Не все обязательные поля заполнены!", "Warning") }
        } catch (e) {}
    }

    const eventChanging = async event => { setIsEvent(!isEvent) };

    const epicChanging = async event => {
        let target = event.target.closest(".epicOption");
        document.documentElement.style.setProperty('--epicColor', epicToColor[target.value]+"1)");
        setEpic(target.value);
    }

    const eisenhowerSelecting = async event => { if (event.target.id.slice(-1) !== eisenhower) setEisenhower(event.target.id.slice(-1)) }

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="createTask">
            <div className="input-block0">
                {["МегаФон", "РУДН", "Личное", "Семья", "Уля", "ФК_Краснодар"].map(e =>
                    <button className={"btn-flat waves-effect epicOption waves-" + (epic !== e ? "grey grey-text text-darken-3" : "epic epic-text selected")} id={"epic"+e} onClick={epicChanging} value={e}>
                        {["МегаФон", "РУДН", "ФК_Краснодар"].includes(e)
                            ? <img className="epicIcon" id={"epic"+e+"Icon"} src={`..\\img\\${epicToIcon[e]}.png`} alt={e} width="24px" height="24px"/>
                            : <i className="material-icons epicIcon" id={"epic"+e+"Icon"}>{epicToIcon[e]}</i>
                        }
                        {e.replace("_", " ")}</button>
                )}
            </div>
            <div className="input-block1">
                <div className="input-fields1">
                    <button className={"btn-flat waves-effect "+(isEvent ? "Event waves-epic" : "notEvent waves-grey grey-text text-darken-3")} id="isEvent"
                            style={{minWidth: "45px"}} onClick={eventChanging}>Event
                    </button>
                    <input
                        className={title.length === 0 ? "required" : ""}
                        id="taskTitle"
                        type="text"
                        value={title}
                        placeholder={"Название " + (isEvent ? "мероприятия" : "задачи")}
                        onChange={e => { setTitle(e.target.value) }}/>
                </div>
                <div className="input-fields2">
                    <input
                        id="taskDescription"
                        type="text"
                        value={desc}
                        placeholder={"Описание " + (isEvent ? "мероприятия" : "задачи")}
                        onChange={e => setDesc(e.target.value)}/>
                </div>
                <div className="input-fields3">
                    <input
                        className={((isEvent && dateStart === undefined) || (timeStart !== undefined && dateStart === undefined)) ? "required" : ""}
                        id="taskDateStart"
                        type="date"
                        value={dateStart}
                        min="2002-11-22"
                        max={dateEnd}
                        onChange={e => { setDateStart(e.target.value) }}
                        style={{width: 'auto'}}/>
                    <input
                        className={isEvent && timeStart === undefined ? "required" : ""}
                        id="taskTimeStart"
                        type="time"
                        value={timeStart}
                        onChange={e => { setTimeStart(e.target.value) }}
                        style={{width: 'auto'}}/>
                    <p>➜</p><input
                        className={dateEnd === "Invalid Date" ? "required" : ""}
                        id="taskDateEnd"
                        type="date"
                        value={dateEnd}
                        min={dateStart === undefined ? "2002-11-22" : dateStart}
                        max="2099-12-31"
                        onChange={e => { setDateEnd(e.target.value) }}
                        style={{width: 'auto'}}/>
                    <input
                        className={isEvent && timeEnd === undefined ? "required" : ""}
                        id="taskTimeEnd"
                        type="time"
                        value={timeEnd}
                        onChange={e => { setTimeEnd(e.target.value) }}
                        style={{width: 'auto'}}/>
                </div>
            </div>
            <div className="input-block2">
                <div id="eisenhowerMatrix">
                    {["A","B","C","D"].map(val =>
                        <div className={"eisenhowerOption waves-effect waves-epic" + (eisenhower === val ? " epic-background selected" : "")} id={"eisenhower"+val} onClick={eisenhowerSelecting}>{val}</div>)}
                </div>
            </div>
            <div className="input-block3">
                {subTasks.map(subTask => {
                    return (<div key={subTask._id} className="subTask">
                        <div className="subTaskCheckerBlock"><label>
                            <input type="checkbox" onClick={(e) => setSubTasks(subTasks.map(t => t._id === subTask._id ? { ...t, status: e.target.checked } : t ))}/>
                            <span></span></label></div>
                        <input
                            className={subTask.name.length === 0 ? "required" : ""}
                            type="text"
                            value={subTask.name}
                            onChange={ (e) => setSubTasks(subTasks.map(t => t._id === subTask._id ? { ...t, name: e.target.value } : t )) }/>
                        <button className="btn-flat newSubTask grey-text text-darken-3" onClick={() => setSubTasks(subTasks.filter(t => t._id !== subTask._id))}>
                            <i className="large material-icons">clear</i></button>
                    </div>
                )})}
            </div>
            <div className="input-block4">
                <button className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3" id="createSubTask" onClick={newSubTask}><i className="large material-icons">add</i>Добавить подзадачу</button>
                <div>
                    <button className="btn waves-effect waves-epic epic-background" id="createTask" onClick={cancelChanges}><i className="large material-icons">clear</i></button>
                    <button className={"btn waves-effect " + (required === 0 ? "waves-epic epic-background" : "someRequired")} id="createTask" onClick={saveChanges}>{task._id === undefined ? "Создать задачу" : "Обновить задачу"}</button>
                </div>
            </div>
        </div>
    )
}