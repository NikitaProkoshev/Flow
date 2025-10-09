import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString } from '../methods';
import { epicToIcon, epicToColor, upDownSubTask } from '../methods';
import { Button, IconButton, Input, Combobox, Portal, useFilter, useListCollection, Box, Select, createListCollection, RadioGroup, Checkbox } from '@chakra-ui/react';
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
    console.log(task.dateStart);
    console.log(new Date(task.dateStart).toLocaleTimeString('ru-RU'));
    const [dateStart, setDateStart] = useState((![null, undefined].includes(task.dateStart) && task?.dateStart?.slice(0,4) !== '1970') ? dateToString(task.dateStart) : undefined);
    const [timeStart, setTimeStart] = useState((typeof task.dateStart === 'string' && !task.dateStart.endsWith('T00:00:00.000Z'))
        ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5)
        : undefined);
    const [dateEnd, setDateEnd] = useState(task.dateEnd !== undefined ? dateToString(task.dateEnd) : dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState((typeof task.dateEnd === 'string' && !task.dateEnd.endsWith('T00:00:00.000Z'))
        ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5)
        : undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || '');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [editing, setEditing] = useState(true);
    const [required, setRequired] = useState(2);

    // Повторение
    const [isTemplate, setIsTemplate] = useState(task.isTemplate || false);
    const [editScope, setEditScope] = useState('this'); // 'this' | 'series'
    const [frequency, setFrequency] = useState(task.recurrence?.frequency || '');
    const [interval, setInterval] = useState(task.recurrence?.interval || 1);
    const [byWeekDays, setByWeekDays] = useState(task.recurrence?.byWeekDays || []);
    const [byMonthDays, setByMonthDays] = useState(task.recurrence?.byMonthDays || []);
    const [recStartDate, setRecStartDate] = useState(task.recurrence?.startDate ? dateToString(task.recurrence.startDate) : undefined);
    const [recEndDate, setRecEndDate] = useState(task.recurrence?.endDate ? dateToString(task.recurrence.endDate) : undefined);

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
        console.log("AAAAAAA");
        try {
            console.log("BBBBBBBBB")
            if (required === 0) {
                console.log("CCCCCCCC")
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
                            isTemplate: isTemplate || !!frequency,
                            recurrence: frequency ? {
                                frequency, interval,
                                byWeekDays, byMonthDays,
                                startDate: recStartDate,
                                endDate: recEndDate,
                            } : undefined,
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
                            editScope: editScope,
                            recurrence: frequency ? {
                                frequency, interval,
                                byWeekDays, byMonthDays,
                                startDate: recStartDate,
                                endDate: recEndDate,
                            } : undefined,
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

    const eisenhowerCollection = createListCollection({
        items: [
          { label: "A", value: "A" },
          { label: "B", value: "B" },
          { label: "C", value: "C" },
          { label: "D", value: "D" },
        ]
    })

    const frequencyCollection = createListCollection({
        items: [
            {label: 'Ежеденевно', value: 'daily'},
            {label: 'Еженедельно', value: 'weekly'},
            {label: 'Ежемесячно', value: 'monthly'},
            {label: 'Ежегодно', value: 'yearly'},
            {label: 'Кастомное', value: 'custom'}
        ]
    })

    return (
        <div className={`createTask grid grid-cols-${Object.keys(epicToIcon).length} gap-4 w-full my-8 px-4 py-4 items-start bg-[#121213] rounded-2xl`}>
            {Object.keys(epicToIcon).map((e) => (
                <Button className={`epicOption ${epic !== e ? 'grayscale' : 'epic-text selected'}`} id={'epic' + e} variant="ghost" colorPalette='gray' size="sm" value={e} onClick={epicChanging}>
                    {['МегаФон', 'РУДН', 'ФК_Краснодар', 'Flow'].includes(e) ? <img className="epicIcon size-6" id={`epic${e}Icon`} src={`..\\img\\${epicToIcon[e]}.png`} alt={e}/> : epicToIcon[e]}</Button>
            ))}

            <div className="col-span-8 grid grid-cols-subgrid gap-4">
                <Box className="col-span-2 flex">
                    <Combobox.Root variant='subtle' collection={collection} color='#e0e0e0' defaultValue={parentId}
                        value={parentId} onValueChange={(e) => setParentId(e.value)} onInputValueChange={(e) => filter(e.inputValue)}>
                        <Combobox.Control>
                            <Combobox.Input placeholder="Родитель" backgroundColor='#161616' />
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
                    className={'col-span-6 border-b' +(title.length === 0 ? ' required' : '')} id="taskTitle" variant="flushed" color='#e0e0e0'
                    value={title} placeholder={'Название ' + (isEvent ? 'мероприятия' : 'задачи')} onChange={(e) => setTitle(e.target.value)}
                />
                <Box className="col-span-1 flex">
                    <Select.Root variant='subtle' collection={eisenhowerCollection} color='#e0e0e0' onValueChange={(e) => setEisenhower(e.value[0])}>
                        <Select.Trigger color='#e0e0e0' backgroundColor='#161616'>
                            <Select.ValueText placeholder="--" />
                        </Select.Trigger>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content backgroundColor='#161616' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616'>
                                {eisenhowerCollection.items.map((e) => (
                                    <Select.Item item={e} key={e.value} id={'eisenhower'+e.value}>
                                        {e.label}
                                    <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                </Box>
                <Input
                    className="col-span-7" id="taskDescription" variant="flushed" color='#e0e0e0'
                    value={desc} placeholder={`Описание ${isEvent ? 'мероприятия' : 'задачи'}`} onChange={(e) => setDesc(e.target.value)}
                />
                <div className="input-fields3 col-span-8 flex items-center">
                    <IconButton className={`col-span-1 mr-4 ${isEvent ? 'Event' : 'notEvent grey-text text-darken-3'}`} id="isEvent" color='#9e9e9e' variant="ghost" colorPalette='gray' onClick={() => setIsEvent(!isEvent)}>
                        {isEvent ? <FaRegCalendarCheck /> : <FaRegCalendarXmark />}</IconButton>
                    <Input 
                        className={`col-span-2${(isEvent && dateStart === undefined) || (timeStart !== undefined && dateStart === undefined) ? ' required' : ''}`}
                        id="taskDateStart" variant="flushed" type="date" value={dateStart} min="2002-11-22" max={dateEnd} width='auto' color='#e0e0e0'
                        onChange={(e) => setDateStart(e.target.value)}
                    />
                    <Input
                        className={`col-span-1 ml-4${isEvent && timeStart === undefined ? ' required' : ''}`} id="taskTimeStart" color='#e0e0e0'
                        variant="flushed" type="time" value={timeStart} max={(dateStart === dateEnd && timeEnd) ? timeEnd : undefined} width='auto'
                        onChange={(e) => setTimeStart(e.target.value)}
                    />
                    <p className="col-span-1 ml-4">➜</p>
                    <Input
                        className={`col-span-2 ml-4${dateEnd === 'Invalid Date' ? ' required' : ''}`} id="taskDateEnd" color='#e0e0e0'
                        variant="flushed" type="date" value={dateEnd}
                        min={dateStart === undefined ? '2002-11-22' : dateStart} max="2099-12-31" width='auto'
                        onChange={(e) => setDateEnd(e.target.value)}
                    />
                    <Input
                        className={`col-span-1 ml-4${isEvent && timeEnd === undefined ? ' required' : ''}`} id="taskTimeEnd" colorPalette='gray'
                        variant="flushed" type="time" value={timeEnd} width='auto' color='#e0e0e0'
                        min={(dateStart === dateEnd && timeStart) ? timeStart : undefined}
                        onChange={(e) => setTimeEnd(e.target.value)}
                    />
                </div>
            </div>
            {/* Блок повторения */}
            <div className="col-span-8 grid grid-cols-subgrid gap-4">
                <div className="col-span-8 flex items-center gap-4">
                    <Checkbox.Root
                        w={5} h={5} variant='outline' colorPalette='teal'
                        onCheckedChange={(e) => setIsTemplate(e.checked)} defaultChecked={isTemplate}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control w={5} h={5} />
                    </Checkbox.Root>
                    <p className="text-md">Сделать повторяющейся</p>
                </div>
                { (isTemplate || frequency) && (
                    <>
                        <Box className="col-span-2">
                            <Select.Root variant='subtle' collection={frequencyCollection} color='#e0e0e0' onValueChange={(e) => setFrequency(e.value)}>
                                <Select.Trigger color='#e0e0e0' backgroundColor='#161616'>
                                    <Select.ValueText placeholder="Периодичность" />
                                </Select.Trigger>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content backgroundColor='#161616' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616'>
                                        {frequencyCollection.items.map((e) => (
                                            <Select.Item item={e} key={e.value}>
                                                {e.label}
                                            <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>
                        <Input className="col-span-1" type="number" min={1} value={interval}
                            onChange={(e)=> setInterval(parseInt(e.target.value||'1'))}
                            variant="flushed" color="#e0e0e0" placeholder="Интервал" />
                        <Input className="col-span-2" type="date" value={recStartDate}
                            onChange={(e)=> setRecStartDate(e.target.value)}
                            variant="flushed" color="#e0e0e0" placeholder="Старт серии" />
                        <Input className="col-span-2" type="date" value={recEndDate}
                            onChange={(e)=> setRecEndDate(e.target.value)}
                            variant="flushed" color="#e0e0e0" placeholder="Конец серии" />

                        {frequency === 'weekly' && (
                            <Box className="col-span-8">
                                <div className="flex gap-2 flex-wrap">
                                    {[0,1,2,3,4,5,6].map(d => (
                                        <Button key={d} size='xs' variant={byWeekDays.includes(d)?'solid':'outline'} colorPalette='gray'
                                            onClick={()=> setByWeekDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])}
                                        >{['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d]}</Button>
                                    ))}
                                </div>
                            </Box>
                        )}
                        {frequency === 'monthly' && (
                            <Input className="col-span-8" placeholder="Дни месяца, через запятую (напр. 1,15,30)" variant="flushed" color="#e0e0e0"
                                onChange={(e)=> setByMonthDays(e.target.value.split(',').map(v=>parseInt(v.trim())).filter(Boolean))} />
                        )}
                    </>
                )}
            </div>

            {/* Область редактирования для экземпляров */}
            {task.templateId && (
                <div className="col-span-8">
                    <RadioGroup.Root value={editScope} onValueChange={(e)=> setEditScope(e.value)}>
                        <RadioGroup.Item key='this' value='this'>
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>Только этот экземпляр</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item key='series' value='series'>
                            <RadioGroup.ItemText>Шаблон серии</RadioGroup.ItemText>
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                </div>
            )}
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
