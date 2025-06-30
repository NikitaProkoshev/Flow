import React, {useEffect, useState} from 'react';
import {todayString, yesterdayString} from "../methods";

export const Habits = ({ state, tasks }) => {
    const [subTasks, setSubTasks] = useState([]);
    const [habitsFrontDay, setHabitsFrontDay] = useState(todayString);
    const habitsShow = tasks.find(t => t.title === "Привычки"+habitsDay);

    const habitsBack = tasks.find(t => t.title === "Привычки"+habitsDay);
    const templateTask = tasks.find(t => t.title === 'Привычки_шаблон' );

    useEffect(() => {

    }, []);

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="habitsPage">
            {(state[0] !== templateTask._id)
                ? <div className="habitsYesterday">
                    <div className="habitsToday">
                        <div className="habitsInfoBlock">
                            <h2>Привычки</h2>
                            <i className="material-icons epicIcon" onClick={e => {state[1](templateTask._id)}}>create</i>
                        </div>
                        <div className="habitsSubTasksBlock">
                            {(task.subTasks.length === 0)
                                ? <div className="noHabitsMessage">Пока привычек нет(</div>
                                : task.subTasks.map(subTask => (
                                    <div key={subTask.id} className="subTask">
                                        <label><input type="checkbox"/><span></span></label>
                                        <p>{subTask.name}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                : <>
                    <button
                        className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                        onClick={newSubTask}><i className="large material-icons">add</i>Добавить
                        подзадачу
                    </button>
                </>
            }
        </div>
    )
}