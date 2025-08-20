import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { todayString, yesterdayString } from '../methods';
import { AuthContext } from '../context/AuthContext';
import { upDownSubTask } from '../methods';
import { FaPen, FaChevronLeft, FaChevronUp, FaChevronDown, FaChevronRight, FaXmark, FaPlus } from 'react-icons/fa6';
import { Checkbox, Input, Button, IconButton } from '@chakra-ui/react';

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
        const newSubTasks = subTasksCopy.map((sT) => 
            (sT._id === subTask._id) ? { name: subTask.name, status: !subTask.status, _id: subTask._id } : sT
        );
        checkingState[1](_id);
        await request(
            '/api/task/check/' + task._id,
            'PUT',
            { _id: _id, status: status, subTasks: newSubTasks },
            { Authorization: `Bearer ${token}` }
        );
        checkingState[1]('');
    }

    function syncSubTasks(sourceTask, newTask) {
        return newTask.map((subTask) => {
            const isExist = sourceTask.find((sT) => sT._id === subTask._id);
            return (isExist) ? { _id: isExist._id, name: subTask.name, status: isExist.status } : subTask
        })
    }

    const cancelChanges = async (event) => editState[1]('');

    const saveChanges = async (event) => {
        try {
            await request(
                `/api/task/habits/${templateTask._id}`,
                'PUT',
                { ...templateTask, subTasks: subTasks },
                { Authorization: `Bearer ${auth.token}` }
            );
            const newTask = subTasks.slice(0);
            const newYesterdaySubTask = syncSubTasks(yesterdayTask.subTasks, newTask);
            await request(`/api/task/habits/${yesterdayTask._id}`, 'PUT', { ...yesterdayTask, subTasks: newYesterdaySubTask }, { Authorization: `Bearer ${auth.token}` });
            const newTodaySubTask = syncSubTasks(todayTask.subTasks, subTasks);
            const frontData = await request(`/api/task/habits/${todayTask._id}`, 'PUT', { ...todayTask, subTasks: newTodaySubTask }, { Authorization: `Bearer ${auth.token}` });
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
        <div className="habitsPage my-8 rounded-lg bg-[rgba(22,22,22,0.5)]">
            {editState[0] !== 'Привычки_шаблон'
                ? <div className="backHabits flex flex-row rounded-lg">
                    {frontDay === todayString && (
                        <div className="backHabitsInfo flex flex-col items-center">
                            <div className="h-8 m-4 mb-2 flex flex-row items-center" onClick={(e) => setFrontDay(yesterdayString)}>
                                <FaChevronLeft className="text-2xl text-[#e0e0e0]" />
                            </div>
                            {yesterdayTask &&
                                yesterdayTask.subTasks.map((subTask) => (
                                    <div className="subTask my-2">
                                        <Checkbox.Root
                                            w={4} h={4} size="md" spacing="1rem" variant='outline' colorPalette='green'
                                            disabled={true} defaultChecked={subTask.status && 'checked'}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control w={4} h={4} />
                                        </Checkbox.Root>
                                    </div>
                                ))}
                        </div>
                    )}
                    <div className="frontHabits w-full p-4 bg-[#161616] rounded-lg">
                        <div className="habitsInfoBlock w-full">
                            <h3 className="text-2xl w-full">{frontDay === todayString ? 'Сегодня' : 'Вчера'}</h3>
                            <FaPen className="text-[1.5rem] text-[#e0e0e0] ml-4" onClick={(e) => editState[1]('Привычки_шаблон')} />
                        </div>
                        <div className="habitsSubTasksBlock grid grid-rows-auto gap-2 mt-3">
                            {[0, undefined].includes(subTasks?.length)
                                ? <div className="noHabitsMessage">Пока привычек нет(</div>
                                : (frontDay === todayString ? todayTask : yesterdayTask).subTasks.map((subTask) => 
                                    <div key={subTask.id} className="subTask w-full h-6">
                                        <Checkbox.Root
                                            w='100%' h={4} fontSize='xl' size="md" spacing="1rem" variant='outline' colorPalette='green'
                                            onCheckedChange={ (e) => checkingSubTask(e, frontDay === todayString ? todayTask : yesterdayTask, subTask) }
                                            defaultChecked={subTask.status && 'checked'}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control w={4} h={4} />
                                            <Checkbox.Label><p className="text-xl">{subTask.name}</p></Checkbox.Label>
                                        </Checkbox.Root>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    {frontDay === yesterdayString && (
                        <div className="backHabitsInfo flex flex-col items-center">
                            <div className="h-8 m-4 mb-2 flex flex-row items-center" onClick={(e) => setFrontDay(todayString)}>
                                <FaChevronRight className="text-2xl text-[#e0e0e0]" />
                            </div>
                            {todayTask !== undefined &&
                                todayTask.subTasks.map((subTask) => 
                                    <div className="subTask my-2">
                                        <Checkbox.Root
                                            w={4} h={4} size="md" spacing="1rem" variant='outline' colorPalette='green'
                                            disabled={true} defaultChecked={subTask.status && 'checked'}
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control w={4} h={4} />
                                        </Checkbox.Root>
                                    </div>
                                )}
                        </div>
                    )}</div>
                : <div className="habitsEdit p-4">
                    <div className="habitsSubTasksBlock">
                        {![0, undefined].includes(subTasks?.length) &&
                            subTasks.map((subTask, index) => {
                                return (
                                    <div key={subTask._id} className="subTask w-full mb-3">
                                        <Input value={subTask.name} variant="flushed" color="#e0e0e0"
                                            onChange={(e) => setSubTasks(subTasks.map((t) => t._id === subTask._id ? {...t, name: e.target.value} : t))}
                                        />
                                        {/*  */}
                                        <IconButton className="upDownSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e'
                                            flexDirection='column' gap={0} border={0}>
                                            {/* <div className="upDownSubTask w-full flex-col"> */}
                                            {index !== 0 && (
                                                <div
                                                    className='upIcon w-full flex justify-center'
                                                    onClick={(e) => upDownSubTask(e.target.closest('.upIcon'), subTasks, subTask, setSubTasks)}
                                                ><FaChevronUp /></div>
                                            )}
                                            {index !== subTasks.length - 1 && (
                                                <div
                                                    className='downIcon w-full flex justify-center'
                                                    onClick={(e) => upDownSubTask(e.target.closest('.downIcon'), subTasks, subTask, setSubTasks)}
                                                ><FaChevronDown /></div>
                                            )}
                                            {/* </div> */}
                                        </IconButton>
                                        {/* </div> */}
                                        <IconButton 
                                            className="deleteSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e'
                                            onClick={() => setSubTasks( subTasks.filter((t) => t._id !== subTask._id))}
                                        ><FaXmark /></IconButton>
                                    </div>
                                );
                            })}
                        <div className="habitsButtons flex w-full">
                            <Button className="newSubTask" variant="ghost" colorPalette='gray' size='sm' onClick={newSubTask}>
                                <FaPlus className="text-2xl text-[#e0e0e0]" />Добавить подзадачу</Button>
                            <div>
                                <Button variant="ghost" colorPalette='gray' size='sm' onClick={cancelChanges}>
                                    <FaXmark className="text-[1.5rem]" /></Button>
                                <Button variant="ghost" colorPalette='gray' size='sm' onClick={saveChanges}>Обновить привычки</Button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};
