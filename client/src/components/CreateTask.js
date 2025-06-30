import React, {useContext, useEffect, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {useMessage} from "../hooks/message.hook";
import {AuthContext} from "../context/AuthContext";
import "../img/megafon.png";
import {dateToString} from "../methods";

export const CreateTask = ({ state, task={} }) => {
    const auth = useContext(AuthContext);
    const {request} = useHttp();
    const message = useMessage();

    const [epic, setEpic] = useState(task.epic || '');
    const [title, setTitle] = useState(task.title || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState((task.dateStart === undefined) ? undefined : dateToString(task.dateStart));
    const [timeStart, setTimeStart] = useState(task.timeStart || undefined);
    const [dateEnd, setDateEnd] = useState(dateToString(task.dateEnd) || dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState(task.timeEnd || undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || '');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [editing, setEditing] = useState(true);

    const epic_to_color = {"МегаФон": "rgb(0, 185, 86)", "РУДН": "rgb(0, 121, 194)", "Личное": "rgb(149, 117, 205)", "Семья": "rgb(255, 241, 118)", "Уля": "rgb(240, 98, 146)"}

    useEffect(() => {
        window.M.updateTextFields()

        if (epic !== '') {
            let selected = document.getElementsByClassName("epicOption selected");
            if (selected.length !== 0) {
                selected[0].classList.add("waves-grey", "grey-text", "text-darken-3");
                selected[0].classList.remove("waves-"+selected[0].id.slice(4), "selected");
            }
            let epicElem = document.getElementById('epic'+epic);
            epicElem.classList.remove("waves-grey", "grey-text", "text-darken-3");
            epicElem.classList.add("waves-"+epic, "selected");
        }

        let eventButton = document.querySelector('button#isEvent');
        if (isEvent) {
            eventButton.classList.add("Event", ("waves-" + (epic !== '' ? epic : "grey")), "grey-text")
            eventButton.classList.remove("notEvent", "waves-grey", "grey-text", "text-darken-3")
        } else {
            eventButton.classList.add("notEvent", "waves-grey", "grey-text", "text-darken-2")
            eventButton.classList.remove("Event", ("waves-" + (epic !== '' ? epic : "grey")), "teal-text")
        }

        if (editing && task.eisenhower !== undefined) {
            setEditing(false);
            eisenhowerSelecting({"target": document.getElementById("eisenhower"+task.eisenhower)})
        }
    })

    const pressHandler = async event => {
        try {
            if (epic !== '' && title !== '' && (!isEvent || dateStart !== undefined || timeStart !== undefined || timeEnd !== undefined) && dateEnd !== undefined && eisenhower !== '') {
                if (task._id === undefined) {
                    const data = await request('/api/task/create', "POST",
                        { epic: epic, status: false, title: title, description: desc, isEvent: isEvent, dateStart: dateStart, dateEnd: dateEnd, eisenhower: eisenhower, subTasks: subTasks },
                        {Authorization: `Bearer ${auth.token}`
                    });
                    if (data) {
                        message("Задача создана!", "OK");
                        state(false);
                    }
                } else {
                    const data = await request(`/api/task/update/${task._id}`, "PUT",
                        {_id: task._id, epic: epic, status: false, title: title, description: desc, isEvent: isEvent, dateStart: dateStart, dateEnd: dateEnd, eisenhower: eisenhower, subTasks: subTasks },
                        {Authorization: `Bearer ${auth.token}`
                        });
                    if (data) {
                        message("Задача обновлена!", "OK");
                        state('');
                    }
                }
            } else { message("Не все обязательные поля заполнены!", "Warning") }
        } catch (e) {}
    }

    const eventChanging = async event => {
        try {
            if (isEvent && epic !== '') { document.querySelector("input.required#taskDateStart").style.borderBottomColor = '#424242' }
            // else { document.querySelector("input#taskDateStart").style.borderBottomColor = (epic !== '' ? epic_to_color[epic] : '') }
            setIsEvent(!isEvent);
        } catch (e) {}
    }

    const epicChanging = async event => {
        try {
            let target = event.target;
            if (!target.classList.contains("epicOption")) { target = event.target.parentElement }
            const wavesEpic = document.getElementsByClassName("waves-"+(epic !== '' ? epic : "grey"));
            for (let elem of wavesEpic) {
                if (elem.classList.contains("epicOption")) { continue }
                elem.classList.add("waves-"+target.value);
                elem.classList.remove("waves-"+epic);
            }
            const requireds = document.getElementsByClassName("required");
            for (let required of requireds) { required.style.borderBottomColor = epic_to_color[target.value] }
            document.querySelector("button.btn#createTask").style.backgroundColor = epic_to_color[target.value];
            setEpic(target.value);
        } catch (e) {}
    }

    const eisenhowerSelecting = async event => {
        console.log(event.target);
        try {
            const matrix = event.target.parentElement;
            if (!event.target.classList.contains('selected')) {
                if (matrix.getElementsByClassName('selected').length !== 0) { matrix.getElementsByClassName('selected')[0].classList.remove('selected', 'teal', 'darken-3') }
                event.target.classList.add("selected", "teal", "darken-3");
                setEisenhower(event.target.id.slice(-1));
            }
        } catch (e) {}
    }

    const addRemoveRequired = (target) => {
        if (target.value != null && target.value.length !== 0) {
            target.classList.remove('required');
            target.style.borderBottomColor = "#424242";
        } else {
            target.classList.add('required');
            target.style.borderBottomColor = (epic !== '' ? epic_to_color[epic] : "#e0e0e0") }
    }

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="createTask">
            <div className="input-block0">
                <button className="btn-flat waves-effect epicOption waves-grey grey-text text-darken-3" id="epicМегаФон"
                        onClick={epicChanging} value="МегаФон">
                    <img className="epicIcon" id="epicМегаФонIcon" src="..\img\megafon.png" alt="МегаФон" width="22px" height="22px"/>Мегафон
                </button>
                <button className="btn-flat waves-effect epicOption waves-grey grey-text text-darken-3" id="epicРУДН"
                        onClick={epicChanging} value="РУДН">
                    <img className="epicIcon" id="epicРУДНIcon" src="..\img\rudn.png" alt="РУДН" width="22px" height="22px"/>РУДН
                </button>
                <button className="btn-flat waves-effect epicOption waves-grey grey-text text-darken-3" id="epicЛичное"
                        onClick={epicChanging} value="Личное">
                    <i className="material-icons epicIcon" id="epicЛичноеIcon">person_outline</i>Личное
                </button>
                <button className="btn-flat waves-effect epicOption waves-grey grey-text text-darken-3" id="epicСемья"
                        onClick={epicChanging} value="Семья">
                    <i className="material-icons epicIcon" id="epicСемьяIcon">people_outline</i>Семья
                </button>
                <button className="btn-flat waves-effect epicOption waves-grey grey-text text-darken-3" id="epicУля"
                        onClick={epicChanging} value="Уля">
                    <i className="material-icons epicIcon" id="epicУляIcon">person</i>Уля
                </button>
            </div>
            <div className="input-block1">
                <div className="input-fields1">
                    <button className="btn-flat waves-effect notEvent waves-grey grey-text text-darken-3" id="isEvent" style={{minWidth: "45px"}} onClick={eventChanging}>Event</button>
                    <input
                        className="required"
                        id="taskTitle"
                        type="text"
                        value={title}
                        placeholder={"Название " + (isEvent ? "мероприятия" : "задачи")}
                        onChange={e => {
                            addRemoveRequired(e.target);
                            setTitle(e.target.value);
                        }}
                    />
                </div>
                <div className="input-fields2">
                    <input
                        id="taskDescription"
                        type="text"
                        value={desc}
                        placeholder={"Описание " + (isEvent ? "мероприятия" : "задачи")}
                        onChange={e => setDesc(e.target.value)}
                    />
                </div>
                <div className="input-fields3">
                    <input
                        className={isEvent ? "required" : undefined}
                        id="taskDateStart"
                        type="date"
                        value={dateStart}
                        min="2002-11-22"
                        max={dateEnd}
                        onChange={e => {
                            if (isEvent) {
                                addRemoveRequired(e.target)
                            }
                            setDateStart(e.target.value);
                        }}
                        style={{width: '101px'}}
                    /><input
                    className={isEvent ? "required" : undefined}
                    id="taskTimeStart"
                    type="time"
                    value={timeStart}
                    onChange={e => {
                        if (isEvent) {
                            addRemoveRequired(e.target)
                        }
                        setTimeStart(e.target.value);
                    }}
                    style={{width: '72px'}}
                /><p>➜</p><input
                    className="required"
                    id="taskDateEnd"
                    type="date"
                    value={dateEnd}
                    min={dateStart === undefined ? "2002-11-22" : dateStart}
                    max="2099-12-31"
                    onChange={e => {
                        addRemoveRequired(e.target);
                        setDateEnd(e.target.value);
                    }}
                    style={{width: '101px'}}
                /><input
                    className={isEvent ? "required" : undefined}
                    id="taskTimeEnd"
                    type="time"
                    value={timeEnd}
                    onChange={e => {
                        if (isEvent) { addRemoveRequired(e.target) }
                        setTimeEnd(e.target.value);
                    }}
                    style={{width: '72px'}}
                />
                </div>
            </div>
            <div className="input-block2">
                <div id="eisenhowerMatrix">
                    <div className="eisenhowerOption" id="eisenhowerA" onClick={eisenhowerSelecting}>A</div>
                    <div className="eisenhowerOption" id="eisenhowerB" onClick={eisenhowerSelecting}>B</div>
                    <div className="eisenhowerOption" id="eisenhowerC" onClick={eisenhowerSelecting}>C</div>
                    <div className="eisenhowerOption" id="eisenhowerD" onClick={eisenhowerSelecting}>D</div>
                </div>
            </div>
            <div className="input-block3">
                {subTasks.map(subTask => {
                    return (<div key={subTask._id} className="subTask">
                        <div className="subTaskCheckerBlock">
                            <label><input type="checkbox" onClick={(e) => setSubTasks(subTasks.map(t => t._id === subTask._id ? { ...t, status: e.target.checked } : t ))}/><span></span></label>
                        </div>
                        <input
                            type="text"
                            value={subTask.name}
                            onChange={ (e) => setSubTasks(subTasks.map(t =>
                                t._id === subTask._id
                                    ? { ...t, name: e.target.value }
                                    : t )) }
                        />
                        <button className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                                onClick={() => setSubTasks(subTasks.filter(t => t._id !== subTask._id))}><i className="large material-icons">clear</i>
                        </button>
                    </div>
                )})}
            </div>
            <div className="input-block4">
                <button className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                        onClick={newSubTask}><i className="large material-icons">add</i>Добавить подзадачу</button>
                <button className="btn waves-effect waves-grey" id="createTask" onClick={pressHandler}>{task._id === undefined ? "Создать задачу" : "Обновить задачу"}</button>
            </div>
        </div>
    )
}