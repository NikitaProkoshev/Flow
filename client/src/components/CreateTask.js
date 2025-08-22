import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString } from '../methods';
import { epicToIcon, epicToColor, upDownSubTask } from '../methods';
import { Button, IconButton, Input, Combobox, Portal, useFilter, useListCollection, Box } from '@chakra-ui/react';
import { FaChevronUp, FaChevronDown, FaPlus, FaXmark, FaRegCalendarXmark, FaRegCalendarCheck } from 'react-icons/fa6';
import { toaster } from './ui/toaster';

export const CreateTask = ({ state, allTasks, task = {} }) => {
    const auth = useContext(AuthContext);
    const { request } = useHttp();

    const [epic, setEpic] = useState(task.epic || '');
    const [parentId, setParentId] = useState([task.parentId] || []);
    const [title, setTitle] = useState(task.title || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState((task.dateStart !== undefined && task.dateStart.slice(0,4) !== '1970') ? dateToString(task.dateStart) : undefined);
    const [timeStart, setTimeStart] = useState((task.dateStart?.slice(11,16) !== '00:00' && new Date(task.dateStart).toLocaleTimeString('ru-RU') !== 'Invalid Date')
        ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5)
        : undefined);
    const [dateEnd, setDateEnd] = useState(task.dateEnd !== undefined ? dateToString(task.dateEnd) : dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState((task.dateEnd?.slice(11,16) !== '00:00' && new Date(task.dateEnd).toLocaleTimeString('ru-RU') !== 'Invalid Date')
        ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5)
        : undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || '');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [editing, setEditing] = useState(true);
    const [required, setRequired] = useState(2);

    useEffect(() => {
        setRequired(document.getElementsByClassName('required').length + (epic === '' ? 1 : 0) + (eisenhower === '' ? 1 : 0));
        document.documentElement.style.setProperty('--epicColor', epicToColor[epic] + '1)');
        if (editing && task.eisenhower !== undefined) {
            eisenhowerSelecting({ target: document.getElementById('eisenhower' + task.eisenhower) });
            setEditing(false);
        }
    });

    const cancelChanges = async (event) => {
        if (task._id === undefined) state(false)
        else state('');
    };

    const saveChanges = async (event) => {
        try {
            if (required === 0) {
                const parentTask = (parentId.length !== 0) ? allTasks.filter(task => task._id == parentId[0])[0] : undefined;
                if (task._id === undefined) {
                    const data = await request(
                        '/api/task/create',
                        'POST',
                        {
                            epic: epic,
                            parentId: parentId,
                            parentsTitles: (parentTask) ? (parentTask.parentsTitles ? parentTask.parentsTitles+' • ' : '') + parentTask.title : undefined,
                            status: false,
                            title: title,
                            description: desc,
                            isEvent: isEvent,
                            dateStart: !([undefined, ''].includes(dateStart))
                                ? dateStart.slice(0, 11) + ([undefined, ''].includes(timeStart) ? '' : 'T' + timeStart)
                                : '',
                            dateEnd: dateEnd.slice(0, 11) + ([undefined, ''].includes(timeEnd) ? '' : 'T' + timeEnd),
                            eisenhower: eisenhower,
                            subTasks: subTasks,
                        },
                        { Authorization: `Bearer ${auth.token}` }
                    );
                    toaster.create({ description: data.error || 'Задача создана!' , type: data.error ? 'error' : 'success' })
                    if (!data.error) state(false)
                } else {
                    const data = await request(
                        `/api/task/update/${task._id}`,
                        'PUT',
                        {
                            _id: task._id,
                            parentId: parentId,
                            parentsTitles: (parentTask) ? (parentTask.parentsTitles ? parentTask.parentsTitles+' • ' : '') + parentTask.title : undefined,
                            epic: epic,
                            status: false,
                            title: title,
                            description: desc,
                            isEvent: isEvent,
                            dateStart: !([undefined, ''].includes(dateStart))
                                    ? dateStart.slice(0, 11) + ([undefined, ''].includes(timeStart) ? '' : 'T' + timeStart)
                                    : '',
                            dateEnd: dateEnd.slice(0, 11) + ([undefined, ''].includes(timeEnd) ? '' : 'T' + timeEnd),
                            eisenhower: eisenhower,
                            subTasks: subTasks,
                        },
                        { Authorization: `Bearer ${auth.token}` }
                    );
                    console.log(data.error);
                    console.log(!data.error);
                    console.log(data.error || "Задача создана!");
                    toaster.create({ description: data.error || "Задача обновлена!" , type: data.error ? "error" : "success" })
                    if (!data.error) state('')
                }
            } else toaster.create({ description: 'Не все обязательные поля заполнены!' , type: 'warning' })
        } catch (e) {}
    };

    const epicChanging = async (event) => {
        let target = event.target.closest('.epicOption');
        document.documentElement.style.setProperty('--epicColor', epicToColor[target.value] + '1)');
        setEpic(target.value);
    };

    const eisenhowerSelecting = async (event) => {
        if (event.target.id.slice(-1) !== eisenhower)
            setEisenhower(event.target.id.slice(-1));
    };

    const newSubTask = () => {
        const newId = Math.max(subTasks.length, 0) + 1;
        setSubTasks([...subTasks, { _id: newId, name: ``, status: false }]);
    };

    const { contains } = useFilter({ sensitivity: "base" })

    const { collection, filter } = useListCollection({
        initialItems: allTasks.map(({ title, _id }) => ({ label: title, value: _id })),
        filter: contains,
    })

    return (
        <div className={`createTask grid grid-cols-${Object.keys(epicToIcon).length} gap-4 w-full my-8 px-4 py-4 items-start bg-[#161616] rounded-2xl`}>
            {Object.keys(epicToIcon).map((e) => (
                <Button className={`epicOption ${epic !== e ? 'grayscale' : 'epic-text selected'}`} id={'epic' + e} variant="ghost" colorPalette='gray' size="sm" value={e} onClick={epicChanging}>
                    {['МегаФон', 'РУДН', 'ФК_Краснодар', 'Flow'].includes(e) ? <img className="epicIcon size-6" id={`epic${e}Icon`} src={`..\\img\\${epicToIcon[e]}.png`} alt={e}/> : epicToIcon[e]}</Button>
            ))}
            <div className="col-span-8 grid grid-cols-subgrid gap-4">
                <div className="input-block1 col-span-6 grid grid-cols-subgrid gap-4">
                    <Box className="col-span-2 flex">
                        <IconButton className={`col-span-1 mr-4 ${isEvent ? 'Event' : 'notEvent grey-text text-darken-3'}`} id="isEvent" color='#9e9e9e' variant="ghost" colorPalette='gray' onClick={() => setIsEvent(!isEvent)}>
                            {isEvent ? <FaRegCalendarCheck /> : <FaRegCalendarXmark />}</IconButton>
                        <Combobox.Root variant='flushed' collection={collection} color='#e0e0e0' defaultValue={parentId}
                            value={parentId} onValueChange={(e) => setParentId(e.value)} onInputValueChange={(e) => filter(e.inputValue)}>
                            <Combobox.Control>
                                <Combobox.Input placeholder="Родитель" />
                                <Combobox.IndicatorGroup>
                                    <Combobox.ClearTrigger />
                                    <Combobox.Trigger color='#e0e0e0' />
                                </Combobox.IndicatorGroup>
                            </Combobox.Control>
                            <Portal>
                                <Combobox.Positioner>
                                <Combobox.Content backgroundColor='#161616' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616'>
                                    <Combobox.Empty>No items found</Combobox.Empty>
                                    {collection.items.map((item) => (
                                    <Combobox.Item item={item} key={item.value}>
                                        {item.label}
                                        <Combobox.ItemIndicator />
                                    </Combobox.Item>
                                    ))}
                                </Combobox.Content>
                                </Combobox.Positioner>
                            </Portal>
                        </Combobox.Root>
                    </Box>
                    <Input
                        className={'col-span-4 border-b' +(title.length === 0 ? ' required' : '')} id="taskTitle" variant="flushed" color='#e0e0e0'
                        value={title} placeholder={'Название ' + (isEvent ? 'мероприятия' : 'задачи')} onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        className="col-span-6" id="taskDescription" variant="flushed" color='#e0e0e0'
                        value={desc} placeholder={`Описание ${isEvent ? 'мероприятия' : 'задачи'}`} onChange={(e) => setDesc(e.target.value)}
                    />
                    <div className="input-fields3 col-span-6">
                        <Input 
                            className={(isEvent && dateStart === undefined) || (timeStart !== undefined && dateStart === undefined) ? 'required' : ''}
                            id="taskDateStart" variant="flushed" type="date" value={dateStart} min="2002-11-22" max={dateEnd} width='auto' color='#e0e0e0'
                            onChange={(e) => setDateStart(e.target.value)}
                        />
                        <Input
                            className={`ml-4${isEvent && timeStart === undefined ? ' required' : ''}`} id="taskTimeStart" color='#e0e0e0'
                            variant="flushed" type="time" value={timeStart} max={(dateStart === dateEnd && timeEnd) ? timeEnd : undefined} width='auto'
                            onChange={(e) => setTimeStart(e.target.value)}
                        />
                        <p className="ml-4">➜</p>
                        <Input
                            className={`ml-4${dateEnd === 'Invalid Date' ? ' required' : ''}`} id="taskDateEnd" color='#e0e0e0'
                            variant="flushed" type="date" value={dateEnd}
                            min={dateStart === undefined ? '2002-11-22' : dateStart} max="2099-12-31" width='auto'
                            onChange={(e) => setDateEnd(e.target.value)}
                        />
                        <Input
                            className={`ml-4${isEvent && timeEnd === undefined ? ' required' : ''}`} id="taskTimeEnd" colorPalette='gray'
                            variant="flushed" type="time" value={timeEnd} width='auto' color='#e0e0e0'
                            min={(dateStart === dateEnd && timeStart) ? timeStart : undefined}
                            onChange={(e) => setTimeEnd(e.target.value)}
                        />
                    </div>
                </div>
                <div className="input-block2 col-span-2 h-full grid grid-cols-subgrid grid-rows-2 gap-0">
                    {['A', 'B', 'C', 'D'].map((val) => (
                        <div className={`eisenhowerOption flex justify-center items-center${eisenhower === val ? ' epic-background selected' : ''}`}
                            id={'eisenhower' + val} onClick={eisenhowerSelecting}
                        >{val}</div>
                    ))}
                </div>
            </div>
            {subTasks.map((subTask, index) => {
                return (
                    <div key={subTask._id} className="subTask col-span-8 pl-6">
                        <Input className={subTask.name.length === 0 ? 'required' : ''}
                            variant="flushed" colorPalette='gray' value={subTask.name} color='#e0e0e0'
                            onChange={(e) => setSubTasks(subTasks.map((t) => t._id === subTask._id ? { ...t, name: e.target.value } : t))}
                        />
                        {subTasks.length !== 0 && (
                            <IconButton className="upDownSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e'
                                flexDirection='column' gap={0} border={0}>
                                <div
                                    className='upIcon w-full flex justify-center'
                                    onClick={(e) => upDownSubTask(e.target.closest('.upIcon'), subTasks, subTask, setSubTasks)}
                                ><FaChevronUp /></div>
                                {index !== subTasks.length - 1 && (
                                    <div
                                        className='downIcon w-full flex justify-center'
                                        onClick={(e) => upDownSubTask(e.target.closest('.downIcon'), subTasks, subTask, setSubTasks)}
                                    ><FaChevronDown /></div>
                                )}
                            </IconButton>
                        )}
                        <IconButton 
                            className="deleteSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e'
                            onClick={() => setSubTasks( subTasks.filter((t) => t._id !== subTask._id))}
                        ><FaXmark /></IconButton>
                    </div>
                );
            })}
            <div className="input-block4 col-span-8 pl-6">
                <Button
                    className="newSubTask" id="createSubTask" color='#4e4e4e'
                    variant="ghost" colorPalette='gray' size="sm" onClick={newSubTask}
                ><FaPlus />Добавить подзадачу</Button>
                <div>
                    <IconButton id="createTask" color='#4e4e4e' variant="ghost" colorPalette="gray" size="sm" onClick={cancelChanges}>
                        <FaXmark className="text-[1.5rem]" /></IconButton>
                    <Button id="createTask" color='#e0e0e0' disabled={required !== 0}
                        variant="solid" colorPalette="teal" size="sm" onClick={saveChanges}
                    >{task._id === undefined ? 'Создать задачу' : 'Обновить задачу'} </Button>
                </div>
            </div>
        </div>
    );
};
