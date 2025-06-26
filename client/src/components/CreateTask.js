import React, {useContext, useEffect, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import "../img/megafon.png";

export const CreateTask = () => {
    const auth = useContext(AuthContext);
    const {request} = useHttp();

    const [epic, setEpic] = useState('');
    const [status, setStatus] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [isEvent, setIsEvent] = useState(false);
    const [dateStart, setDateStart] = useState(new Date("2002-11-21T23:59"));
    const [dateEnd, setDateEnd] = useState(new Date("2002-11-21T23:59"));
    const [eisenhower, setEisenhower] = useState('');


    useEffect(() => {
        window.M.updateTextFields()
    })

    const pressHandler = async event => {
        try {
            if (document.getElementsByClassName("required").length == 0) {
                const data = await request('/api/task/create', "POST", { title: title, description: desc, dateStart: dateStart, dateEnd: dateEnd, eisenhower: eisenhower }, {
                    Authorization: `Bearer ${auth.token}`
                });
            }
        } catch (e) {}
    }

    const eventChanging = async event => {
        try {
            let vals = ["notEvent", "Event"];
            if (isEvent) { vals = vals.reverse()}
            event.target.classList.remove(vals[0]);
            event.target.classList.add(vals[1]);
            setIsEvent(!isEvent);
        } catch (e) {}
    }

    const epicChanging = async event => {
        try {
            var target = event.target;
            console.log(target);
            if (!target.classList.contains("epicOption")) { target = event.target.parentElement }
            console.log(target);
            setEpic(target.value);
            let sel = target.parentElement.getElementsByClassName("selected");
            if (sel.length !== 0) { sel[0].classList.remove("selected") }
            target.classList.add("selected");
        } catch (e) {}
    }

    const eisenhowerSelecting = async event => {
        try {
            const matrix = event.target.parentElement;
            matrix.previousSibling.classList.remove('required');
            if (!event.target.classList.contains('selected')) {
                if (matrix.getElementsByClassName('selected').length != 0) { matrix.getElementsByClassName('selected')[0].classList.remove('selected', 'teal', 'darken-3') }
                event.target.classList.add("selected", "teal", "darken-3");
                setEisenhower(event.target.id.slice(-1));
            }
        } catch (e) {}
    }

    console.log(Date.now());

    return (
        <div className="createTask">
            <div className="input-block0">
                <button className={"btn-flat waves-effect epicOption " + (epic === "МегаФон" ? "waves-teal teal-text" : "waves-grey grey-text text-darken-3")} id="epicMegaFon" style={{borderBottomColor: "#00B956"}} onClick={epicChanging} value="МегаФон">
                    <img className="epicIcon" id="epicMegaFonIcon" src="..\img\megafon.png" width="22px" height="22px"/>Мегафон</button>
                <button className={"btn-flat waves-effect epicOption " + (epic === "РУДН" ? "waves-teal teal-text" : "waves-grey grey-text text-darken-3")} id="epicRUDN" onClick={epicChanging} value="РУДН">
                    <img className="epicIcon" id="epicRUDNIcon" src="..\img\rudn.png" width="22px" height="22px"/>РУДН</button>
                <button className={"btn-flat waves-effect epicOption " + (epic === "Личное" ? "waves-teal teal-text" : "waves-grey grey-text text-darken-3")} id="epicPersonal" onClick={epicChanging} value="Личное">
                    <i className="material-icons epicIcon" id="epicPersonalIcon">person_outline</i>Личное</button>
                <button className={"btn-flat waves-effect epicOption " + (epic === "Семья" ? "waves-teal teal-text" : "waves-grey grey-text text-darken-3")} id="epicFamily" onClick={epicChanging} value="Семья">
                    <i className="material-icons epicIcon" id="epicFamilyIcon">people_outline</i>Семья</button>
                <button className={"btn-flat waves-effect epicOption " + (epic === "Уля" ? "waves-teal teal-text" : "waves-grey grey-text text-darken-3")} id="epicUlya" onClick={epicChanging} value="Уля">
                    <i className="material-icons epicIcon" id="epicUlyaIcon">person</i>Уля</button>
            </div>
            <div className="input-block1">
                <div className="input-fields1">
                    <button className={"btn-flat waves-effect " + (isEvent ? "Event waves-teal teal-text" : "notEvent waves-grey grey-text text-darken-3")} id="isEvent" style={{minWidth: "45px"}} onClick={eventChanging}>Event</button>
                    <input
                        className="required"
                        id="taskTitle"
                        type="text"
                        value={title}
                        placeholder={"Название " + (isEvent ? "мероприятия" : "задачи")}
                        onChange={e => {
                            setTitle(e.target.value);
                            if (e.target.value != null && e.target.value.length != 0) { e.target.classList.remove('required') }
                            else { e.target.classList.add('required') }
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
                        type="datetime-local"
                        value={dateStart}
                        onChange={e => {
                            setDateStart(e.target.value);
                            if (isEvent) {
                                if (e.target.value != null && e.target.value.length != 0) { e.target.classList.remove('required') }
                                else { e.target.classList.add('required') }
                            }
                        }}
                        style={{width: '175px'}}
                    /> ➜ <input
                        className="required"
                        id="taskDateEnd"
                        type="datetime-local"
                        value={dateEnd}
                        onChange={e => {
                            setDateEnd(e.target.value);
                            if (e.target.value != null && e.target.value.length != 0) { e.target.classList.remove('required') }
                            else { e.target.classList.add('required') }
                        }}
                        style={{width: '175px'}}
                    />
                </div>
            </div>
            <div className="input-block2">
                <p className="required" id="eisenhowerTitle">Матрица Эйзенхауэра</p>
                <div id="eisenhowerMatrix">
                    <div className="eisenhowerOption" id="eisenhowerA" onClick={eisenhowerSelecting}>A</div>
                    <div className="eisenhowerOption" id="eisenhowerB" onClick={eisenhowerSelecting}>B</div>
                    <div className="eisenhowerOption" id="eisenhowerC" onClick={eisenhowerSelecting}>C</div>
                    <div className="eisenhowerOption" id="eisenhowerD" onClick={eisenhowerSelecting}>D</div>
                </div>
            </div>
            <button className="btn waves-effect waves-teal" onClick={pressHandler}>Создать задачу</button>
        </div>
    )
}