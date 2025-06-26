import React, {useEffect} from 'react';
import Materialize from 'materialize-css'
import {CreateTask} from "./CreateTask";

export const TasksList = ({ tasks }) => {

    useEffect(() => {
        const modalElem = document.querySelectorAll('.modal');
        console.log(modalElem);
        const modalInstance = Materialize.Modal.init(modalElem, {"opacity": 0.22, "inDuration": 250, "outDuration": 250});
        // if (button != null) button.onClick = () => { modalInstance.open() };

        const buttonElem = document.querySelectorAll('.fixed-action-btn');
        console.log(buttonElem)
        // var buttonInstance = Materialize.FloatingActionButton.init(buttonElem);
        buttonElem.onClick = () => {
            console.log("AAAAAAAAA");
            modalInstance.open() };
    }, [Materialize.Modal]);


    if (!tasks.length) {
        return <p className="center">Ссылок пока нет</p>
    }

    return (
        <div>
            {/*<button data-target="create" className="btn modal-trigger">Modal</button>*/}

            <div id="create" className="modal grey darken-4">
                <CreateTask/>
            </div>
            <h2>Сегодня</h2>
            {tasks.map(task => {
                return (
                    <div key={task._id}>
                        <h3>{task.title}</h3>
                        <h5>{task.description}</h5>
                        <p>{new Date(task.dateStart).toLocaleDateString()} ➜ {new Date(task.dateEnd).toLocaleDateString()}</p>
                        <p>{task.eisenhower}</p>
                        <p>{new Date(task.createDate).toLocaleDateString()}</p>
                    </div>
                )
            })}
            <div className="fixed-action-btn modal-trigger" data-target="create">
                <a className="btn-floating btn-large teal">
                    <i className="large material-icons">add</i>
                </a>
            </div>
        </div>
        // <table>
        //     <thead>
        //     <tr>
        //         <th>№</th>
        //         <th>Название</th>
        //         <th>Описание</th>
        //         <th>Важность</th>
        //     </tr>
        //     </thead>
        //
        //     <tbody>
        //     { tasks.map((task, index) => {
        //         return (
        //             <tr key={task._id}>
        //                 <td>{index + 1}</td>
        //                 <td>{task.title}</td>
        //                 <td>{task.description}</td>
        //                 <td>{task.eisenhower}</td>
        //                 {/*<td>*/}
        //                 {/*    <Link to={`/detail/${link._id}`}>Открыть</Link>*/}
        //                 {/*</td>*/}
        //             </tr>
        //         )
        //     })}
        //     </tbody>
        // </table>
    )
}