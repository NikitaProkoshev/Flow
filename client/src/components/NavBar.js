import React, {useContext} from 'react'
import {NavLink, useNavigate} from 'react-router-dom'
import {AuthContext} from "../context/AuthContext";

export const NavBar = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

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
                    <li><NavLink to="/tasks">Дашборд</NavLink></li>
                    <li><a href="/" onClick={logoutHandler}>Выйти</a></li>
                </ul>
            </div>
        </nav>
    )
}