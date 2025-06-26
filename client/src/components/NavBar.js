import React, {useContext, useEffect} from 'react'
import {NavLink, useNavigate} from 'react-router-dom'
import {AuthContext} from "../context/AuthContext";
import {CreateEPIC} from "./CreateEPIC";
import Materialize from "materialize-css";

export const NavBar = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    useEffect(() => {
        const modalElem = document.querySelectorAll('.modal');
        console.log(modalElem);
        const modalInstance = Materialize.Modal.init(modalElem, {"opacity": 0.22, "inDuration": 250, "outDuration": 250});
        // if (button != null) button.onClick = () => { modalInstance.open() };

        const buttonElem = document.querySelectorAll('.modal-trigger');
        console.log(buttonElem)
        // var buttonInstance = Materialize.FloatingActionButton.init(buttonElem);
        buttonElem.onClick = () => {
            console.log("AAAAAAAAA");
            modalInstance.open() };
    }, [Materialize.Modal]);

    const logoutHandler = event => {
        event.preventDefault();
        auth.logout();
        navigate('/');
    }

    return (
        <nav>
            <div className="nav-wrapper grey darken-4" style={{padding: '0 2rem'}}>
                <span className="brand-logo">Daily Planner</span>
                <ul id="nav" className="right hide-on-med-and-down">
                    <li><a className="modal-trigger" data-target="createEPIC">Создать EPIC</a></li>
                    <div id="createEPIC" className="modal grey darken-4">
                        <CreateEPIC/>
                    </div>
                    <li><NavLink to="/tasks">Дашборд</NavLink></li>
                    <li><a href="/" onClick={logoutHandler}>Выйти</a></li>
                </ul>
            </div>
        </nav>
    )
}