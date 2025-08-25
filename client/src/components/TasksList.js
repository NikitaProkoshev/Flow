import React, { useContext, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { today } from '../methods';
import { CreateTask } from './CreateTask';
import { epicToIcon, epicToColor, checkingSome } from '../methods';
import { Checkbox, ButtonGroup, IconButton, Button, Badge } from '@chakra-ui/react';
import { FaPen, FaArrowRight, FaTrash, FaEllipsis, FaChevronUp, FaChevronDown } from 'react-icons/fa6';

export const TasksList = ({ editState, checkingState, deletingState, allTasks, tasks, doneTasks, eisenhower }) => {
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [showDone, setShowDone] = useState(false);
    const [editMenuTaskId, setEditMenuTaskId] = useState(null);

    async function checkingSubTask(e, task, subTask) {
        const { _id, status, subTasks } = task;
        let subTasksCopy = subTasks.slice(0);
        var sT_id;
        const newSubTasks = subTasksCopy.map((sT) => {
            if (sT._id === subTask._id) {
                sT_id = subTask._id;
                return {
                    name: subTask.name,
                    status: !subTask.status,
                    _id: subTask._id,
                };
            } else { return sT }
        });
        checkingState[1](sT_id);
        await request(
            '/api/task/check/' + task._id,
            'PUT',
            { _id: _id, status: status, subTasks: newSubTasks },
            { Authorization: `Bearer ${token}` }
        );
        checkingState[1]('');
    }

    async function deleteTask(taskId) {
        deletingState[1](taskId)
        await request(`/api/task/${taskId}`, 'DELETE', null, { Authorization: `Bearer ${token}` });
        deletingState[1]('')
    }

    const getEisenhowerColor = {'A': 'red', 'B': 'yellow', 'C': 'green', 'D': 'cyan'}

    function formatDateDisplay(dateStart, dateEnd) {
        const isToday = (date) =>  date.toDateString() === today.toDateString();

        const formatTime = (date) =>  date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

        const formatDate = (date, showYear = false) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', ...(showYear && { year: 'numeric' }) });

        if (!dateStart || dateStart?.getFullYear() === 1970) {
            return (
                <div className="flex items-center space-x-2 text-[#a0a0a0]">
                    <span className="text-md font-medium"> {isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear())} </span>
                    {dateEnd.getHours() !== 3 ||
                        (dateEnd.getMinutes() !== 0 && (
                            <><span className="text-[#a0a0a0]">•</span><span className="text-md">{formatTime(dateEnd)}</span></>
                        ))}
                </div>
            );
        }

        const sameDay = dateStart.toDateString() === dateEnd.toDateString();
        return (
            <div className="flex items-center space-x-2 text-[#a0a0a0]">
                <div className="flex items-center space-x-1">
                    <span className="text-md font-medium">{isToday(dateStart) ? 'Сегодня' : formatDate(dateStart, dateStart.getFullYear() !== today.getFullYear())}</span>
                    {(dateStart.getHours() !== 3 || dateStart.getMinutes() !== 0) && <><span className="text-gray-500">•</span><span className="text-md">{formatTime(dateStart)}</span></>}
                </div>
                <FaArrowRight className="text-[#a0a0a0] text-md" />
                <div className="flex items-center space-x-1">
                    {!sameDay && (<span className="text-md font-medium">{isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear() )}</span>)}
                    {(dateEnd.getHours() !== 3 ||
                        dateEnd.getMinutes() !== 0) && (
                        <>
                            {!sameDay && (
                                <span className="text-[#a0a0a0]">•</span>
                            )}
                            <span className="text-md">
                                {formatTime(dateEnd)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className='tasksList'>
            {![0, undefined].includes(tasks?.length)
            ? tasks.map((task) => {
                if (editState[0] !== task._id) {
                    return <div key={task._id} className="task my-4 rounded-2xl pb-[1px] bg-[rgba(22,22,22,0.5)]">
                        <div className="taskBlock1 bg-[#161616] rounded-2xl flex items-center">
                            <div className="taskCheckerBlock ml-4 mr-2">
                                <Checkbox.Root
                                    w={6} h={6} variant='outline' colorPalette='green'
                                    onCheckedChange={(e) => checkingSome(e, task, checkingState[1], request, token)}
                                    defaultChecked={checkingState[0] === task._id}
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control w={6} h={6} />
                                </Checkbox.Root>
                            </div>
                            <div className="taskInfoBlock mx-2 my-4">
                                <div className="taskSubBlock" id="subBlock1">
                                    {eisenhower && <Badge
                                        w={6} h={6} px={2} py={1} rounded='md' mr={3} textAlign='center' fontSize='xs' lineHeight='1'
                                        variant='subtle' colorPalette={getEisenhowerColor[task.eisenhower]}
                                    >{task.eisenhower}</Badge>}
                                    {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(task.epic)
                                        ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[task.epic]}.png`} alt={task.epic} />
                                        : epicToIcon[task.epic]
                                    }
                                    {task.parentsTitles && <Badge
                                        h={6} px={2} py={1} rounded='md' ml={3} textAlign='center' fontSize='xs' lineHeight='1' color='#e0e0e0'
                                        variant='outline' colorPalette='gray'
                                    >{task.parentsTitles}</Badge>}
                                    <h3 className="text-xl ml-3 text-[#e0e0e0]">{task.title}</h3>
                                </div>
                                {task.description
                                    ? <div className="taskSubBlock mt-3" id="subBlock3"><h3 className="text-lg text-[#c0c0c0]">{task.description}</h3></div>
                                    : <div className='m-0' />
                                }
                                <div className="taskSubBlock mt-3" id="subBlock2">
                                    <div className="text-md">
                                        {formatDateDisplay(task.dateStart ? new Date(task.dateStart) : undefined,new Date(task.dateEnd))}
                                    </div>
                                </div>
                            </div>
                                {editMenuTaskId === task._id
                                    ? <ButtonGroup className='taskControlButtons' w={10} mr={2} variant="ghost" orientation='vertical' spacing="3">
                                        <IconButton rounded='lg' colorPalette='gray' onClick={() => {setEditMenuTaskId(null); editState[1](task._id)}}>
                                            <FaPen className="text-2xl text-[#e0e0e0] leading-6 min-w-6 min-h-6" /></IconButton>
                                        <IconButton rounded='lg' colorPalette='gray' onClick={() => deleteTask(task._id)}>
                                            <FaTrash className="text-2xl text-[#e0e0e0] leading-6 min-w-6 min-h-6" /></IconButton>  
                                    </ButtonGroup>
                                    : <IconButton mr={2} rounded='lg' variant="ghost" colorPalette='gray'
                                        onClick={() => {
                                            document.addEventListener('mousedown', event => { !event.target.closest('.taskControlButtons') && setEditMenuTaskId(null) }, { once: true })
                                            setEditMenuTaskId(task._id);
                                        }}
                                    ><FaEllipsis className="text-[1.5rem] text-[#e0e0e0] cursor-pointer" /></IconButton>
                                }
                        </div>
                        {task.subTasks.length !== 0 && 
                            <div className="taskBlock2 my-3 ml-14">
                                <div className="taskSubTasksBlock">
                                    {task.subTasks.map((subTask) => (
                                        <div key={subTask._id} className="subTask my-3">
                                            <Checkbox.Root
                                                w={6} h={6} variant='outline' colorPalette='green'
                                                onCheckedChange={(e) => checkingSubTask(e, task, subTask)}
                                                defaultChecked={checkingState[0] === subTask._id || subTask.status}
                                            >
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control w={6} h={6} />
                                            </Checkbox.Root>
                                            <p className="text-md ml-3">{subTask.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>
                } else { return <CreateTask state={editState[1]} allTasks={allTasks} task={task} /> }})
            : <h3 className="text-2xl text-center">Пока задач нет</h3>}
            {![0, undefined].includes(doneTasks?.length) && (
                <>
                    <Button id="showDoneTasks" fontSize='md' color='#a0a0a0' variant="ghost" colorPalette='gray.200' onClick={(e) => setShowDone(!showDone)}>
                        {(showDone ? <FaChevronUp/> : <FaChevronDown />)}
                        {(showDone ? 'Скрыть' : 'Показать') +' выполненные задачи'}
                    </Button>
                    {showDone &&
                        doneTasks.map((task) => (
                            <div className="task doneTask my-4 rounded-2xl pb-[1px] bg-[rgba(22,22,22,0.33)] grayscale">
                                <div className="taskBlock1 bg-[rgba(22,22,22,0.5)] flex items-center">
                                    <div className="taskCheckerBlock ml-4 mr-2">
                                        <Checkbox.Root
                                            w={6} h={6} variant='outline' colorPalette='green'
                                            defaultChecked onCheckedChange={(e) => checkingSome(e, task, checkingState[1], request, token)}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control w={6} h={6} />
                                        </Checkbox.Root>
                                    </div>
                                    <div className="taskInfoBlock mx-2 my-4">
                                        <div className="taskSubBlock" id="subBlock1">
                                            <Badge
                                                w={6} h={6} px={2} py={1} rounded='md' mr={2} textAlign='center' fontSize='xs' lineHeight='1'
                                                variant='subtle' colorPalette={getEisenhowerColor[task.eisenhower]}
                                            >{task.eisenhower}</Badge>
                                            {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(task.epic)
                                                ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[task.epic]}.png`} alt={task.epic} />
                                                : epicToIcon[task.epic]
                                            }
                                            <h3 className="text-2xl ml-3">{task.title}</h3>
                                        </div>
                                        <div className="taskSubBlock" id="subBlock2">
                                            <div className="text-md">
                                                {formatDateDisplay(task.dateStart ? new Date(task.dateStart) : undefined, new Date(task.dateEnd))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="taskBlock2">
                                    <div className="taskSubTasksBlock">
                                        {task.subTasks.map((subTask) => (
                                            <div key={subTask._id} className="subTask my-3 ml-14">
                                                <Checkbox.Root
                                                    w={6} h={6} variant='outline' colorPalette='green'
                                                    defaultChecked={checkingState[0] === subTask._id || subTask.status ? 'checked' : false}
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control w={6} h={6} />
                                                </Checkbox.Root>
                                                <p className="text-md ml-3">{subTask.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                </>
            )}
        </div>
    );
};
