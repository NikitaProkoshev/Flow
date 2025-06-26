import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {Loader} from "../components/Loader";
import {TasksList} from "../components/TasksList";

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const {loading, request} = useHttp();
    const {token} = useContext(AuthContext);

    const fetchTasks = useCallback( async () => {
        try{
            const fetched = await request('/api/task', 'GET', null, {
                Authorization: `Bearer ${token}`
            });
            setTasks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks]);

    if (loading) {
        return <Loader />
    }

    return (
        <>
            {!loading && <TasksList tasks={tasks} />}
        </>
    )
}