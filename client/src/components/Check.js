import React, { useContext } from 'react';
import { Checkbox } from '@chakra-ui/react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { toaster } from './ui/toaster';
import { useTasks } from '../context/TasksContext';

export const Check = ({ rW = 6, rH = 6, cW = 6, cH = 6, mt = 0, mr = 0, ml = 0, disabled = false, dChecked, checked, label = undefined, onClick = {} }) => {
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const { updateTasks } = useTasks();
    const {task, subTask} = onClick;

    const toast = (desc, onClick) => { toaster.create({ description: desc, type: 'info', duration: 3000, action: { label: "Отменить", onClick: onClick } }) };

    async function checking(task, subTask) {
        const options = subTask ? [{ _id: task._id, subTasks: task.subTasks.slice(0).map((sT) => sT._id === subTask._id ? { name: subTask.name, status: !subTask.status, _id: subTask._id } : sT) }, 'Подзадача выполнена!', { _id: task._id, subTasks: task.subTasks }]
            : (task.templateId ? [{ _id: task._id }, 'Экземпляр повторяющейся задачи выполнен!', { _id: task._id }]
                : [{ _id: task._id, status: !task.status }, 'Задача выполнена!', { _id: task._id, status: task.status }])
        await request('/api/task/check/' + task._id, 'PUT', options[0], { Authorization: `Bearer ${token}` });
        toast(options[1], async() => { await request('/api/task/check/' + task._id, 'PUT', options[2], { Authorization: `Bearer ${token}` }); updateTasks(true)})
        updateTasks(true);
    }

    return (
        <Checkbox.Root w={rW} h={rH} mt={mt} mr={mr} ml={ml} size="md" spacing="1rem" variant='outline' colorPalette='green' disabled={disabled} defaultChecked={dChecked} checked={checked} onCheckedChange={() => !disabled && (subTask ? checking(task, subTask) : (task?.templateId ? checking(task) : checking(task)))}>
            <Checkbox.HiddenInput /><Checkbox.Control w={cW} h={cH} />{label ? <Checkbox.Label fontSize='md' fontWeight='400'>{label}</Checkbox.Label> : null}
        </Checkbox.Root>
    )
}