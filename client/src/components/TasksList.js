import React, { useContext } from 'react';
import { getEisenhowerColor } from '../methods';
import { CreateTask } from './CreateTask.tsx';
import { epicToIcon, formatDateDisplay } from '../methods';
import { Badge } from '@chakra-ui/react';
import { TasksListSkeleton } from './TasksListSkeleton';
import { useTasks } from '../context/TasksContext';
import { Check } from './Check';

export const TasksList = ({ tasks, eisenhower = true }) => {
    const { projects, loading } = useTasks();

    if (loading) return <TasksListSkeleton />;

    function getParentsTitles(parentId) {
        const parentsTitles = [];
        while (parentId) {
            const parentTask = projects.filter(task => task._id === parentId)[0];
            parentsTitles.push(parentTask?.title);
            parentId = parentTask?.parentId;
        }
        return parentsTitles.reverse().join(' • ');
    }

    return (
        <div className='tasksList'>
            {![0, undefined].includes(tasks?.length) ? tasks.map((task) => (
                <div key={task._id} className="my-4 pb-[1px] bg-[#0e0e10] rounded-2xl">
                    {task.title === 'ntcn' ? console.log(task._id) : null}
                    <div className="flex items-center bg-[#131315] rounded-2xl">
                        <Check ml={4} mr={2} dChecked={task.status} onClick={{task: task}}/>
                        <div className="flex flex-col items-start w-[calc(100%-3rem)] mx-2 my-4" onClick={() => { CreateTask.open('a', { task: task }) }}>
                            <div className="flex flex-row items-center h-auto break-all">
                                {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(task.epic) ? <img className="size-6" src={`..\\img\\${epicToIcon[task.epic]}.png`} alt={task.epic} /> : epicToIcon[task.epic]}
                                {task.parentId && <Badge h={6} ml={3} px={2} py={1} rounded='md' textAlign='center' fontSize='xs' lineHeight='1' color='#e0e0e0' variant='outline' colorPalette='gray'>{getParentsTitles(task.parentId)}</Badge>}
                                <h3 className="text-xl ml-3 text-[#e0e0e0]">{task.title}</h3>
                            </div>
                            <div className="flex flex-row items-center h-auto break-all mt-3 w-full text-md">
                                {eisenhower && <Badge rW={6} h={6} mr={3} px={2} py={1} rounded='md' textAlign='center' fontSize='xs' lineHeight='1' variant='subtle' colorPalette={getEisenhowerColor[task.eisenhower]}>{task.eisenhower}</Badge>}
                                {formatDateDisplay(task.dateStart ? new Date(task.dateStart) : undefined,new Date(task.dateEnd),
                                    typeof task.dateStart === 'string' ? !task.dateStart.endsWith('T21:00:00.000Z') : false,
                                    typeof task.dateEnd === 'string' ? !task.dateEnd.endsWith('T21:00:00.000Z') : false)}
                            </div>
                        </div>
                    </div>
                    {task.subTasks.length !== 0 && <div className="my-3 ml-14">
                        {task.subTasks.map((subTask) => (
                            <div key={subTask._id} className="my-3 flex flex-row items-center">
                                <Check rW={5} rH={5} cW={5} cH={5} dChecked={subTask.status} onClick={{task: task, subTask: subTask}}/>
                                <p className="text-md ml-3">{subTask.name}</p>
                            </div>
                        ))}
                    </div>}
                </div>))
            : <h3 className="text-2xl text-center">Пока задач нет</h3>}
        </div>
    )
}
