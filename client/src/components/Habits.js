import React, {useState} from 'react';

export const Habits = ({ state, tasks }) => {
    const [subTasks, setSubTasks] = useState([]);

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="habitsPage">
            {tasks.map(task => {
                return (
                    <div className="habitsDay">
                        <div className="habitsInfoBlock">
                            <h2>Привычки</h2>
                            <i className="material-icons epicIcon" onClick={e => {
                                state[1](task._id)
                            }}>create</i>
                        </div>
                        <div className="habitsSubTasksBlock">
                            {(state[0] !== task._id)
                                ? ((task.subTasks.length === 0)
                                        ? <div className="noHabitsMessage">Пока привычек нет(</div>
                                        : task.subTasks.map(subTask => (
                                            <div key={subTask.id} className="subTask">
                                                <label><input type="checkbox"/><span></span></label>
                                                <p>{subTask.name}</p>
                                            </div>
                                        ))
                                ) : <>
                                    <button
                                        className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                                        onClick={newSubTask}><i className="large material-icons">add</i>Добавить
                                        подзадачу
                                    </button>
                                </>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}