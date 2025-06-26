import React, {useContext, useEffect, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";

export const CreateEPIC = () => {
    const auth = useContext(AuthContext)
    const {request} = useHttp()
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
                const data = await request('/api/task/create', "POST", { title: title, description: "", dateStart: dateStart, dateEnd: dateEnd, eisenhower: "" }, {
                    Authorization: `Bearer ${auth.token}`
                });
            }
        } catch (e) {}
    }

    return (
        <div className="createTask">
            <div className="input-block1">
                <div className="input-fields1">
                    <input
                        className="required"
                        id="taskTitle"
                        type="text"
                        value={title}
                        placeholder={"Название EPIC'а"}
                        onChange={e => {
                            setTitle(e.target.value);
                            if (e.target.value != null && e.target.value.length != 0) { e.target.classList.remove('required') }
                            else { e.target.classList.add('required') }
                        }}
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
            <button className="btn waves-effect waves-teal" onClick={pressHandler}>Создать EPIC</button>
        </div>
    )
}