import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { todayString, yesterdayString } from '../methods';
import { AuthContext } from '../context/AuthContext';
import { upDownSubTask } from '../methods';
import { FaPen, FaChevronLeft } from 'react-icons/fa';
import { Checkbox} from '@chakra-ui/react';

export const Habits = ({ editState, checkingState, todayTask, yesterdayTask, templateTask, }) => {
    const auth = useContext(AuthContext);
    const { request } = useHttp();
    const { token } = useContext(AuthContext);
    const message = useMessage();
    const [subTasks, setSubTasks] = useState([]);
    const [frontDay, setFrontDay] = useState(todayString);

    useEffect(() => {setSubTasks(templateTask?.subTasks)}, [todayTask]);

    async function checkingSubTask(e, task, subTask) {
        const { _id, status, subTasks } = task;
        let subTasksCopy = subTasks.slice(0);
        var newSubTasks = [];
        subTasksCopy.map((sT) => {
            if (sT._id === subTask._id) {
                newSubTasks.push({
                    name: subTask.name,
                    status: !subTask.status,
                    _id: subTask._id,
                });
            } else {
                newSubTasks.push(sT);
            }
        });
        checkingState[1](_id);
        const data = await request(
            '/api/task/check/' + task._id,
            'PUT',
            { _id: _id, status: status, subTasks: newSubTasks },
            { Authorization: `Bearer ${token}` }
        );
        checkingState[1]('');
    }

    function syncSubTasks(sourceTask, newTask) {
        var resultTask = [];
        newTask.map((subTask) => {
            const isExist = sourceTask.find((sT) => sT._id === subTask._id);
            if (isExist)
                resultTask.push({
                    _id: isExist._id,
                    name: subTask.name,
                    status: isExist.status,
                });
            else resultTask.push(subTask);
        });
        return resultTask;
    }

    const cancelChanges = async (event) => {
        editState[1]('');
    };

    const saveChanges = async (event) => {
        try {
            await request(
                `/api/task/habits/${templateTask._id}`,
                'PUT',
                { ...templateTask, subTasks: subTasks },
                { Authorization: `Bearer ${auth.token}` }
            );
            const newTask = subTasks.slice(0);
            const newYesterdaySubTask = syncSubTasks(
                yesterdayTask.subTasks,
                newTask
            );
            await request(
                `/api/task/habits/${yesterdayTask._id}`,
                'PUT',
                { ...yesterdayTask, subTasks: newYesterdaySubTask },
                { Authorization: `Bearer ${auth.token}` }
            );
            const newTodaySubTask = syncSubTasks(todayTask.subTasks, subTasks);
            const frontData = await request(
                `/api/task/habits/${todayTask._id}`,
                'PUT',
                { ...todayTask, subTasks: newTodaySubTask },
                { Authorization: `Bearer ${auth.token}` }
            );
            if (frontData) {
                message('Задача обновлена!', 'OK');
                editState[1]('');
            }
        } catch (e) {}
    };

    const newSubTask = () => {
        const newId = Math.max(subTasks?.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    return (
        <div className="habitsPage my-8">
            {editState[0] !== 'Привычки_шаблон' ? (
                <div className="backHabits">
                    {frontDay === todayString && (
                        <div className="backHabitsInfo flex flex-col items-center">
                            <div className="h-8 m-4 mb-2 flex flex-row items-center" onClick={(e) => setFrontDay(yesterdayString)}>
                                <FaChevronLeft className="text-2xl text-[#e0e0e0]" />
                            </div>
                            {yesterdayTask &&
                                yesterdayTask.subTasks.map((subTask) => (
                                    <div className="subTask my-2">
                                        <Checkbox.Root
                                            className="size-4 w-auto"
                                            size="md"
                                            spacing="1rem"
                                            isDisabled={true}
                                            onCheckedChange={ (e) => checkingSubTask(e, frontDay === todayString ? todayTask : yesterdayTask, subTask) }
                                            defaultChecked={subTask.status && 'checked'}
                                            variant='subtle'
                                            colorPalette='gray'
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                        </Checkbox.Root>
                                    </div>
                                ))}
                        </div>
                    )}
                    <div className="frontHabits w-full p-4 backdrop-blur-sm">
                        <div className="habitsInfoBlock w-full">
                            <h3 className="text-2xl w-full">
                                {frontDay === todayString ? 'Сегодня' : 'Вчера'}
                            </h3>
                            <FaPen
                                className="text-[1.5rem] text-[#e0e0e0] ml-4"
                                onClick={(e) => {
                                    editState[1]('Привычки_шаблон');
                                }}
                            />
                        </div>
                        <div className="habitsSubTasksBlock grid grid-rows-auto gap-4 mt-4">
                            {[0, undefined].includes(subTasks?.length) ? (
                                <div className="noHabitsMessage">
                                    Пока привычек нет(
                                </div>
                            ) : (
                                (frontDay === todayString
                                    ? todayTask
                                    : yesterdayTask
                                ).subTasks.map((subTask) => (
                                    <div
                                        key={subTask.id}
                                        className="subTask w-full"
                                    >
                                        <Checkbox.Root
                                            className="size-4 w-auto max-w-full text-xl"
                                            size="md"
                                            spacing="1rem"
                                            onCheckedChange={ (e) => checkingSubTask(e, frontDay === todayString ? todayTask : yesterdayTask, subTask) }
                                            defaultChecked={subTask.status && 'checked'}
                                            variant='subtle'
                                            colorPalette='gray'
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                            <Checkbox.Label><p className="text-xl">{subTask.name}</p></Checkbox.Label>
                                        </Checkbox.Root>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {frontDay === yesterdayString && (
                        <div className="backHabitsInfo flex flex-col items-center">
                            <div className="h-8 m-4 mb-2 flex flex-row items-center" onClick={(e) => setFrontDay(yesterdayString)}>
                                <FaChevronLeft className="text-2xl text-[#e0e0e0]" />
                            </div>
                            {todayTask !== undefined &&
                                todayTask.subTasks.map((subTask) => (
                                    <div className="subTask my-2">
                                        <Checkbox.Root
                                            className="size-4 w-auto"
                                            size="md"
                                            spacing="1rem"
                                            isDisabled={true}
                                            onCheckedChange={(e) => checkingSubTask(e, frontDay === todayString ? todayTask : yesterdayTask, subTask)}
                                            defaultChecked={subTask.status && 'checked'}
                                            variant='subtle'
                                            colorPalette='gray'
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                        </Checkbox.Root>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="habitsEdit">
                    <div className="habitsSubTasksBlock">
                        {![0, undefined].includes(subTasks?.length) &&
                            subTasks.map((subTask, index) => {
                                return (
                                    <div key={subTask._id} className="subTask">
                                        <input
                                            type="text"
                                            value={subTask.name}
                                            onChange={(e) =>
                                                setSubTasks(
                                                    subTasks.map((t) =>
                                                        t._id === subTask._id
                                                            ? {
                                                                  ...t,
                                                                  name: e.target
                                                                      .value,
                                                              }
                                                            : t
                                                    )
                                                )
                                            }
                                        />
                                        <div className="upDownSubTask">
                                            {index !== 0 && (
                                                <i
                                                    className="material-icons upIcon"
                                                    onClick={(e) => {
                                                        upDownSubTask(
                                                            e,
                                                            subTasks,
                                                            subTask,
                                                            setSubTasks
                                                        );
                                                    }}
                                                >
                                                    expand_less
                                                </i>
                                            )}
                                            {index !== subTasks.length - 1 && (
                                                <i
                                                    className="material-icons downIcon"
                                                    onClick={(e) => {
                                                        upDownSubTask(
                                                            e,
                                                            subTasks,
                                                            subTask,
                                                            setSubTasks
                                                        );
                                                    }}
                                                >
                                                    expand_more
                                                </i>
                                            )}
                                        </div>
                                        <button
                                            className="btn-flat waves-effect deleteSubTask waves-grey grey-text text-darken-3"
                                            onClick={() =>
                                                setSubTasks(
                                                    subTasks.filter((t) => {
                                                        return (
                                                            t._id !==
                                                            subTask._id
                                                        );
                                                    })
                                                )
                                            }
                                        >
                                            <i className="large material-icons">
                                                clear
                                            </i>
                                        </button>
                                    </div>
                                );
                            })}
                        <div className="habitsButtons">
                            <button
                                className="btn-flat waves-effect newSubTask waves-grey grey-text text-darken-3"
                                onClick={newSubTask}
                            >
                                <i className="large material-icons">add</i>
                                Добавить подзадачу
                            </button>
                            <div>
                                <button
                                    className="btn waves-effect waves-grey"
                                    id="createTask"
                                    onClick={cancelChanges}
                                >
                                    <i className="large material-icons">
                                        clear
                                    </i>
                                </button>
                                <button
                                    className="btn waves-effect waves-grey"
                                    id="createTask"
                                    onClick={saveChanges}
                                >
                                    Обновить привычки
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
