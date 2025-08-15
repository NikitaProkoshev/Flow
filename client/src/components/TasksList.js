import React, { useContext, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString, todayString, dateToShow, today } from '../methods';
import { CreateTask } from './CreateTask';
import { epicToIcon, epicToColor } from '../methods';
import { Checkbox, Button } from '@chakra-ui/react';
import { FaPen, FaArrowRight } from 'react-icons/fa6';

export const TasksList = ({ editState, checkingState, tasks, doneTasks }) => {
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const [showDone, setShowDone] = useState(false);

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
            } else {
                newSubTasks.push(sT);
            }
        });
        console.log(subTasksCopy);
        checkingState[1](sT_id);
        const data = await request(
            '/api/task/check/' + task._id,
            'PUT',
            { _id: _id, status: status, subTasks: newSubTasks },
            { Authorization: `Bearer ${token}` }
        );
        console.log('AAAAAAAAA');
        console.log(data);
        checkingState[1]('');
    }

    async function checkingTask(e, task) {
        const { _id, status, subTasks } = task;
        checkingState[1](_id);
        const data = await request(
            '/api/task/check/' + task._id,
            'PUT',
            { _id: _id, status: !status, subTasks: subTasks },
            { Authorization: `Bearer ${token}` }
        );
        checkingState[1]('');
    }

    function getEisenhowerPriority(eisenhower) {
        const priorities = {
            A: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'A',
            },
            B: {
                color: 'bg-orange-100 text-orange-800 border-orange-200',
                label: 'B',
            },
            C: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'C',
            },
            D: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                label: 'D',
            },
        };

        return (
            priorities[eisenhower] || {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                label: '-',
            }
        );
    }

    function formatDateDisplay(dateStart, dateEnd) {
        const isToday = (date) => {
            return date.toDateString() === today.toDateString();
        };

        const formatTime = (date) => {
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        };

        const formatDate = (date, showYear = false) => {
            const options = {
                day: '2-digit',
                month: 'short',
                ...(showYear && { year: 'numeric' }),
            };
            return date.toLocaleDateString('ru-RU', options);
        };

        // Если нет даты начала (дедлайн)
        if (!dateStart) {
            return (
                <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-2xl font-medium">
                        {isToday(dateEnd)
                            ? 'Сегодня'
                            : formatDate(
                                  dateEnd,
                                  dateEnd.getFullYear() !== today.getFullYear()
                              )}
                    </span>
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

        // Если есть дата начала и конца
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
                            <div key={task._id} className="task my-4">
                                <div className="taskBlock1 backdrop-blur-sm">
                                    <div className="taskCheckerBlock ml-4 mr-2">
                                        <Checkbox
                                            className="size-6"
                                            onChange={(e) =>
                                                checkingTask(e, task)
                                            }
                                            defaultChecked={
                                                checkingState[0] === task._id
                                                    ? 'checked'
                                                    : false
                                            }
                                        />
                                    </div>
                                    <div className="taskInfoBlock mx-2 my-4">
                                        <div
                                            className="taskSubBlock"
                                            id="subBlock1"
                                        >
                                            {/* Плашка приоритета Эйзенхауэра */}
                                            <div
                                                className={`px-2 py-1 rounded-md text-xs font-medium border ${
                                                    getEisenhowerPriority(
                                                        task.eisenhower
                                                    ).color
                                                } mr-2`}
                                            >
                                                {
                                                    getEisenhowerPriority(
                                                        task.eisenhower
                                                    ).label
                                                }
                                            </div>

                                            {task.epic === 'Flow' ? (
                                                <i
                                                    className="epicIcon val-font gradient-font text-3xl w-6 h-8"
                                                    id={
                                                        'epic' +
                                                        task.epic +
                                                        'Icon'
                                                    }
                                                >
                                                    F
                                                </i>
                                            ) : [
                                                  'МегаФон',
                                                  'РУДН',
                                                  'ФК_Краснодар',
                                              ].includes(task.epic) ? (
                                                <img
                                                    className="epicIcon size-6"
                                                    src={
                                                        '..\\img\\' +
                                                        epicToIcon[task.epic] +
                                                        '.png'
                                                    }
                                                    alt={task.epic}
                                                />
                                            ) : (
                                                [
                                                    'Личное',
                                                    'Семья',
                                                    'Уля',
                                                ].includes(task.epic) && (
                                                    <i
                                                        className="material-icons epicIcon"
                                                        style={{
                                                            color:
                                                                epicToColor[
                                                                    task.epic
                                                                ] + '1)',
                                                        }}
                                                    >
                                                        {epicToIcon[task.epic]}
                                                    </i>
                                                )
                                            )}
                                            <h3 className="text-2xl ml-3">
                                                {task.title}
                                            </h3>
                                        </div>
                                        <div
                                            className="taskSubBlock mt-3"
                                            id="subBlock2"
                                        >
                                            <div className="text-lg">
                                                {formatDateDisplay(
                                                    task.dateStart
                                                        ? new Date(
                                                              task.dateStart
                                                          )
                                                        : undefined,
                                                    new Date(task.dateEnd)
                                                )}
                                            </div>
                                        </div>
                                        {task.description ? (
                                            <div
                                                className="taskSubBlock mt-3"
                                                id="subBlock3"
                                            >
                                                <></>
                                                <h3 className="text-2xl">
                                                    {task.description}
                                                </h3>
                                            </div>
                                        ) : (
                                            <div style={{ margin: 0 }}></div>
                                        )}
                                    </div>
                                    <div className="taskEditBlock ml-2 mr-4">
                                        <FaPen
                                            className="text-[1.5rem] text-[#e0e0e0]"
                                            onClick={(e) => {
                                                editState[1](task._id);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="taskBlock2">
                                    <div className="taskSubTasksBlock">
                                        {task.subTasks.map((subTask) => (
                                            <div
                                                key={subTask._id}
                                                className="subTask my-3"
                                            >
                                                <Checkbox
                                                    className="w-6"
                                                    onChange={(e) =>
                                                        checkingSubTask(
                                                            e,
                                                            task,
                                                            subTask
                                                        )
                                                    }
                                                    defaultChecked={
                                                        checkingState[0] ===
                                                            subTask._id ||
                                                        subTask.status
                                                            ? 'checked'
                                                            : false
                                                    }
                                                />
                                                <p class="text-lg ml-3">
                                                    {subTask.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    } else {
                        return <CreateTask state={editState[1]} task={task} />;
                    }
                })
            ) : (
                <p className="center">Пока задач нет(</p>
            )}
            {doneTasks.length !== 0 && (
                <>
                    <Button
                        className="text-base mb-8"
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
                            <div
                                className="task doneTask"
                                style={{
                                    boxShadow: `-8px 0 17px 2px ${
                                        epicToColor[task.epic]
                                    }0.14),-3px 0 14px 2px ${
                                        epicToColor[task.epic]
                                    }0.12),-5px 0 5px -3px ${
                                        epicToColor[task.epic]
                                    }0.2)`,
                                }}
                            >
                                <div className="taskBlock1">
                                    <div className="taskCheckerBlock">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked="checked"
                                                onClick={(e) =>
                                                    checkingTask(e, task)
                                                }
                                            />
                                            <span></span>
                                        </label>
                                    </div>
                                    <div className="taskInfoBlock">
                                        <div
                                            className="taskSubBlock"
                                            id="subBlock1"
                                        >
                                            {/* Плашка приоритета Эйзенхауэра */}
                                            <div
                                                className={`px-2 py-1 rounded-md text-xs font-medium border opacity-70 ${
                                                    getEisenhowerPriority(
                                                        task.eisenhower
                                                    ).color
                                                } mr-2`}
                                            >
                                                {
                                                    getEisenhowerPriority(
                                                        task.eisenhower
                                                    ).label
                                                }
                                            </div>

                                            {task.epic === 'Flow' ? (
                                                <i
                                                    className="epicIcon val-font gradient-font"
                                                    id={
                                                        'epic' +
                                                        task.epic +
                                                        'Icon'
                                                    }
                                                >
                                                    F
                                                </i>
                                            ) : [
                                                  'МегаФон',
                                                  'РУДН',
                                                  'ФК_Краснодар',
                                              ].includes(task.epic) ? (
                                                <img
                                                    className="epicIcon"
                                                    src={
                                                        '..\\img\\' +
                                                        epicToIcon[task.epic] +
                                                        '.png'
                                                    }
                                                    alt={task.epic}
                                                    width="24px"
                                                    height="24px"
                                                />
                                            ) : (
                                                [
                                                    'Личное',
                                                    'Семья',
                                                    'Уля',
                                                ].includes(task.epic) && (
                                                    <i
                                                        className="material-icons epicIcon"
                                                        style={{
                                                            color:
                                                                epicToColor[
                                                                    task.epic
                                                                ] + '1)',
                                                        }}
                                                    >
                                                        {epicToIcon[task.epic]}
                                                    </i>
                                                )
                                            )}
                                            <h3>{task.title}</h3>
                                        </div>
                                        <div
                                            className="taskSubBlock"
                                            id="subBlock2"
                                        >
                                            <div className="text-sm opacity-70">
                                                {formatDateDisplay(
                                                    task.dateStart
                                                        ? new Date(
                                                              task.dateStart
                                                          )
                                                        : undefined,
                                                    new Date(task.dateEnd)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="taskBlock2">
                                    <div className="taskSubTasksBlock">
                                        {task.subTasks.map((subTask) => (
                                            <div
                                                key={subTask.id}
                                                className="subTask"
                                            >
                                                <label>
                                                    <input type="checkbox" />
                                                    <span></span>
                                                </label>
                                                <p>{subTask.name}</p>
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
