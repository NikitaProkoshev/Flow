import React from 'react';

export const TaskCard = ({task}) => {
    return (
        <>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p></p>
            <p>Дата создания: <strong>{new Date(task.createDate).toLocaleDateString()}</strong></p>
        </>
    )
}