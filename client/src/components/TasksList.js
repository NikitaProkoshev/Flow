import React, { useContext, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { today } from '../methods';
import { CreateTask } from './CreateTask';
import { epicToIcon, epicToColor, checkingSome } from '../methods';
import { Checkbox, ButtonGroup, Button, Badge } from '@chakra-ui/react';
import { FaPen, FaArrowRight, FaTrash, FaEllipsis } from 'react-icons/fa6';

export const TasksList = ({ editState, checkingState, deletingState, allTasks, tasks, doneTasks }) => {
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [showDone, setShowDone] = useState(false);
    const [editMenuTaskId, setEditMenuTaskId] = useState(null);

    async function checkingSubTask(e, task, subTask) {
        const { _id, status, subTasks } = task;
        let subTasksCopy = subTasks.slice(0);
        var sT_id;
        var newSubTasks = [];
        subTasksCopy.map((sT) => {
            if (sT._id === subTask._id) {
                newSubTasks.push({
                    name: subTask.name,
                    status: !subTask.status,
                    _id: subTask._id,
                });
                sT_id = subTask._id;
            } else { newSubTasks.push(sT) }
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

    const getEisenhowerColor = {'A': 'red', 'B': 'yellow', 'C': 'teal', 'D': 'gray'}

    function formatDateDisplay(dateStart, dateEnd) {
        const isToday = (date) =>  date.toDateString() === today.toDateString();

        const formatTime = (date) =>  date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

        const formatDate = (date, showYear = false) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', ...(showYear && { year: 'numeric' }) });

        if (!dateStart) {
            return (
                <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-2xl font-medium"> {isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear())} </span>
                    {dateEnd.getHours() !== 0 ||
                        (dateEnd.getMinutes() !== 0 && (
                            <>
                                <span className="text-gray-500">•</span>
                                <span className="text-2xl">
                                    {formatTime(dateEnd)}
                                </span>
                            </>
                        ))}
                </div>
            );
        }

        const sameDay = dateStart.toDateString() === dateEnd.toDateString();
        return (
            <div className="flex items-center space-x-2 text-gray-300">
                <div className="flex items-center space-x-1">
                    <span className="text-2xl font-medium">
                        {isToday(dateStart)
                            ? 'Сегодня'
                            : formatDate(
                                  dateStart,
                                  dateStart.getFullYear() !==
                                      today.getFullYear()
                              )}
                    </span>
                    {(dateStart.getHours() !== 0 ||
                        dateStart.getMinutes() !== 0) && (
                        <>
                            <span className="text-gray-500">•</span>
                            <span className="text-2xl">
                                {formatTime(dateStart)}
                            </span>
                        </>
                    )}
                </div>
                <FaArrowRight className="text-gray-500 text-xl" />
                <div className="flex items-center space-x-1">
                    {!sameDay && (
                        <span className="text-2xl font-medium">
                            {isToday(dateEnd)
                                ? 'Сегодня'
                                : formatDate(
                                      dateEnd,
                                      dateEnd.getFullYear() !==
                                          today.getFullYear()
                                  )}
                        </span>
                    )}
                    {(dateEnd.getHours() !== 0 ||
                        dateEnd.getMinutes() !== 0) && (
                        <>
                            {!sameDay && (
                                <span className="text-gray-500">•</span>
                            )}
                            <span className="text-2xl">
                                {formatTime(dateEnd)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="tasksList">
            {tasks.length !== 0 ? (
                tasks.map((task) => {
                    if (editState[0] !== task._id) {
                        return (
                            <div key={task._id} className="task my-4 rounded-2xl">
                                <div className="taskBlock1 backdrop-blur-xl rounded-2xl">
                                    <div className="taskCheckerBlock ml-4 mr-2">
                                        <Checkbox.Root
                                            className="size-6"
                                            variant='subtle'
                                            colorPalette='gray'
                                            onCheckedChange={(e) => checkingSome(e, task, checkingState[1], request, token)}
                                            defaultChecked={checkingState[0] === task._id}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                        </Checkbox.Root>
                                    </div>
                                    <div className="taskInfoBlock mx-2 my-4">
                                        <div className="taskSubBlock" id="subBlock1">
                                            <Badge
                                                className='w-6 text-center px-2 py-1 rounded-md text-xs font-medium border mr-2'
                                                variant='subtle'
                                                colorScheme={getEisenhowerColor[task.eisenhower]}
                                            >{task.eisenhower}</Badge>
                                            {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(task.epic)
                                                ? <img
                                                    className="epicIcon size-6"
                                                    src={`..\\img\\${epicToIcon[task.epic]}.png`}
                                                    alt={task.epic}
                                                />
                                                : <i
                                                    className="material-icons epicIcon"
                                                    style={{ color: epicToColor[task.epic] + '1)' }}
                                                >{epicToIcon[task.epic]}</i>
                                            }
                                            <h3 className="text-2xl ml-3">{task.title}</h3>
                                        </div>
                                        <div className="taskSubBlock mt-3" id="subBlock2">
                                            <div className="text-lg">
                                                {formatDateDisplay(
                                                    task.dateStart ? new Date(task.dateStart) : undefined,
                                                    new Date(task.dateEnd)
                                                )}
                                            </div>
                                        </div>
                                        {task.description
                                            ? <div className="taskSubBlock mt-3" id="subBlock3">
                                                <h3 className="text-2xl">{task.description}</h3>
                                            </div>
                                            : <div style={{ margin: 0 }} />
                                        }
                                    </div>
                                        {editMenuTaskId === task._id
                                            ? <ButtonGroup
                                                className="rounded-lg w-[3.5rem]"
                                                variant="ghost"
                                                orientation='vertical'
                                                spacing="3"
                                            >
                                                <Button
                                                    className="px-2 py-1 rounded"
                                                    colorScheme='whiteAlpha'
                                                    onClick={() => {
                                                        setEditMenuTaskId(null);
                                                        editState[1](task._id);
                                                    }}
                                                ><FaPen className="text-2xl text-[#e0e0e0] leading-6 min-w-6 min-h-6" /></Button>
                                                <Button
                                                    className="px-2 py-1 rounded"
                                                    colorScheme='whiteAlpha'
                                                    onClick={() => deleteTask(task._id)}
                                                ><FaTrash className="text-2xl text-[#e0e0e0] leading-6 min-w-6 min-h-6" /></Button>
                                                    
                                            </ButtonGroup>
                                        : <Button
                                                className="px-2 py-1 rounded"
                                                variant="ghost"
                                                colorScheme="whiteAlpha"
                                                onClick={() => setEditMenuTaskId(task._id)}
                                            ><FaEllipsis className="text-[1.5rem] text-[#e0e0e0] cursor-pointer" /></Button>
                                        }
                                </div>
                                <div className="taskBlock2 rounded-2xl">
                                    <div className="taskSubTasksBlock">
                                        {task.subTasks.map((subTask) => (
                                            <div key={subTask._id} className="subTask my-3">
                                                <Checkbox.Root
                                                    className="w-6"
                                                    onCheckedChange={(e) => checkingSubTask(e, task, subTask)}
                                                    defaultChecked={checkingState[0] === subTask._id || subTask.status}
                                                    variant='subtle'
                                                    colorPalette='gray'
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control />
                                                </Checkbox.Root>
                                                <p class="text-lg ml-3">{subTask.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        return <CreateTask state={editState[1]} allTasks={allTasks} task={task} />;
                    }
                })
            ) : (
                <p className="center">Пока задач нет(</p>
            )}
            {doneTasks.length !== 0 && (
                <>
                    <Button
                        className="text-base"
                        id="showDoneTasks"
                        colorScheme="whiteAlpha"
                        variant="ghost"
                        onClick={(e) => setShowDone(!showDone)}
                    >
                        <i className="large material-icons">
                            {'arrow_drop_' + (showDone ? 'up' : 'down')}
                        </i>
                        {(showDone ? 'Скрыть' : 'Показать') +
                            ' выполненные задачи'}
                    </Button>
                    {showDone &&
                        doneTasks.map((task) => (
                            <div className="task doneTask my-4">
                                <div className="taskBlock1 backdrop-blur-sm">
                                    <div className="taskCheckerBlock ml-4 mr-2">
                                        <Checkbox.Root
                                            className="size-6" 
                                            onCheckedChange={(e) => checkingSome(e, task, checkingState[1], request, token)}
                                            defaultChecked
                                            variant='subtle'
                                            colorPalette='gray'
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                        </Checkbox.Root>
                                    </div>
                                    <div className="taskInfoBlock mx-2 my-4">
                                        <div className="taskSubBlock" id="subBlock1">
                                            <Badge
                                                className='w-6 text-center px-2 py-1 rounded-md text-xs font-medium border mr-2'
                                                variant='subtle'
                                                colorScheme={getEisenhowerColor[task.eisenhower]}
                                            >{task.eisenhower}</Badge>
                                            {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(task.epic)
                                                ? <img
                                                    className="epicIcon size-6"
                                                    src={`..\\img\\${epicToIcon[task.epic]}.png`}
                                                    alt={task.epic}
                                                />
                                                : <i
                                                    className="epicIcon"
                                                    style={{ color: epicToColor[task.epic] + '1)' }}
                                                >{epicToIcon[task.epic]}</i>
                                            }
                                            <h3 className="text-2xl ml-3">{task.title}</h3>
                                        </div>
                                        <div className="taskSubBlock" id="subBlock2">
                                            <div className="text-lg">
                                                {formatDateDisplay(
                                                    task.dateStart ? new Date(task.dateStart) : undefined,
                                                    new Date(task.dateEnd)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="taskBlock2">
                                    <div className="taskSubTasksBlock">
                                        {task.subTasks.map((subTask) => (
                                            <div key={subTask._id} className="subTask my-3">
                                                <Checkbox.Root
                                                    className="w-6"
                                                    defaultChecked={checkingState[0] === subTask._id || subTask.status ? 'checked' : false}
                                                    variant='subtle'
                                                    colorPalette='gray'
                                                >
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control />
                                                </Checkbox.Root>
                                                <p class="text-lg ml-3">{subTask.name}</p>
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
