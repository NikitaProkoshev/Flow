import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString, getEisenhowerColor, formatDateDisplay, toUTCString } from '../methods';
import { epicToIcon, epicToColor, upDownSubTask, formatRecurrenceFrequency, formatRecurrencePeriod } from '../methods';
import { Button, IconButton, Input, Combobox, Portal, useFilter, useListCollection, Box, Select, createListCollection, createOverlay, Dialog, Badge, Textarea, Popover, Editable, Text, Field } from '@chakra-ui/react';
import { FaChevronUp, FaChevronDown, FaPlus, FaXmark, FaAt, FaRepeat, FaTrash } from 'react-icons/fa6';
import { toaster } from './ui/toaster';
import { BsCalendar3Range, BsCalendar, BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { useTasks } from '../context/TasksContext';
import { FloatLabelInput } from './ui/FloatLabelInput.tsx';

interface Task {
    _id?: string;
    epic?: string;
    parentId?: string;
    title?: string;
    shortTitle?: string;
    description?: string;
    isEvent?: boolean;
    isProject?: boolean;
    dateStart?: string ;
    dateEnd?: string | Date;
    eisenhower?: string;
    subTasks?: Array<{_id: number; name: string; status: boolean}>;
    isTemplate?: boolean;
    templateId?: string;
    recurrence?: {
        frequency?: string;
        interval?: number;
        startDate?: string | Date;
        endDate?: string | Date;
    };
}

interface CreateTaskProps {
    task: Task;
}

export const CreateTask = createOverlay<CreateTaskProps>((props) => {
    const { projects, updateTasks } = useTasks();
    const { task, ...rest } = props;
    const auth = useContext(AuthContext);
    const { request } = useHttp();

    const [epic, setEpic] = useState(task.epic || Object.keys(epicToIcon)[0]);
    const [parentId, setParentId] = useState(task.parentId ? [task.parentId] : []);
    const [title, setTitle] = useState(task.title || '');
    const [shortTitle, setShortTitle] = useState(task.shortTitle || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState((task.dateStart && task?.dateStart?.slice(0,4) !== '1970') ? dateToString(task.dateStart) : undefined);
    const [timeStart, setTimeStart] = useState((typeof task.dateStart === 'string' && !task.dateStart.endsWith('T21:00:00.000Z')) ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [dateEnd, setDateEnd] = useState(task.dateEnd !== undefined ? dateToString(task.dateEnd) : dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState((typeof task.dateEnd === 'string' && !task.dateEnd.endsWith('T21:00:00.000Z')) ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || 'A');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [required, setRequired] = useState(2);
    const [frequency, setFrequency] = useState(task.recurrence?.frequency || 'daily');
    const [interval, setInterval] = useState(task.recurrence?.interval || 1);
    const [recStartDate, setRecStartDate] = useState(task.recurrence?.startDate ? dateToString(task.recurrence.startDate) : undefined);
    const [recEndDate, setRecEndDate] = useState(task.recurrence?.endDate ? dateToString(task.recurrence.endDate) : undefined);

    const [tab, setTab] = useState(window.location.pathname === '/templates' ? 'r' : (window.location.pathname === '/habits' ? 'h' : (window.location.pathname === '/projects' ? 'p' : (task.isTemplate ? 'r' : 't'))));

    // useEffect(() => {
    //     setRequired(document.getElementsByClassName('required').length + (epic === '' ? 1 : 0) + (eisenhower === '' ? 1 : 0));
    //     document.documentElement.style.setProperty('--epicColor', epicToColor[epic] + '1)');
    // }, [setRequired]);

    const saveChanges = async () => {
        try {
            if (required === 0) {
                var data;
                const taskData = {
                    _id: Object.keys(task).length === 0 ? undefined : task._id,
                    isEvent: ['t', 'r'].includes(tab) && isEvent,
                    isTemplate: ['h', 'r'].includes(tab),
                    isProject: tab === 'p',
                    status: false,
                    eisenhower: tab === 'h' ? 'A' : eisenhower,
                    epic: tab === 'h' ? 'Привычки' : epic,
                    title: title,
                    shortTitle: tab === 'p' && title.length > 10 ? shortTitle : '',
                    dateEnd: toUTCString(dateEnd, timeEnd),
                    parentId: tab === 'h' ? '' : parentId[0],
                    dateStart: tab === 'h' ? undefined : toUTCString(dateStart, timeStart),
                    description: tab === 'h' ? '' : desc,
                    subTasks: ['h', 'p'].includes(tab) ? [] : subTasks,
                    recurrence: ['p', 't'].includes(tab) ? {} : { frequency, interval, startDate: tab === 'h' ? new Date() : recStartDate, endDate: tab === 'h' ? new Date('2099-12-31') : recEndDate },
                }
                if (Object.keys(task).length === 0) data = await request('/api/task/create', 'POST', taskData as any, { Authorization: `Bearer ${auth.token}` })
                else {
                    if (task.templateId) data = await request(`/api/task/updateInstance/${task._id}`, 'PUT', taskData as any, { Authorization: `Bearer ${auth.token}` })
                    else data = await request(`/api/task/update/${task._id}`, 'PUT', taskData as any, { Authorization: `Bearer ${auth.token}` })
                }
                toaster.create({description: data.error || `Задача ${Object.keys(task).length > 0 ? 'обновлена' : 'создана'}!`, type: data.error ? 'error' : 'success' });
                if (!data.error) {
                    props.onOpenChange?.({ open: false })
                    updateTasks(true)
                }
            } else toaster.create({ description: 'Не все обязательные поля заполнены!' , type: 'warning' })
        } catch (e) {}
    };

    const newSubTask = () => { setSubTasks([...subTasks, { _id: Math.max(subTasks.length, 0) + 1, name: ``, status: false }]) };

    const { contains } = useFilter({ sensitivity: "base" })
    const { collection, filter } = useListCollection({ initialItems: projects?.map(({ title, _id }) => (_id ? { label: title, value: _id } : null)).filter(Boolean) || [], filter: contains })
    const tabsCollection = createListCollection({items: [{label: "Задача", value: "t"}, {label: "Повторяющаяся задача", value: "r"}, {label: "Привычка", value: "h"}, {label: "Проект", value: "p"}]})
    const eisenhowerCollection = createListCollection({items: [{ label: "A", value: "A" }, { label: "B", value: "B" }, { label: "C", value: "C" }, { label: "D", value: "D" }]})
    const epicCollection = createListCollection({items: [{label: "МегаФон", value: "МегаФон"}, {label: "РУДН", value: "РУДН"}, {label: "Личное", value: "Личное"}, {label: "Семья", value: "Семья"}, {label: "Уля", value: "Уля"}, {label: "Поездки", value: "Поездки"}, {label: "ФК Краснодар", value: "ФК_Краснодар"}, {label: "Flow", value: "Flow"}]})
    const frequencyCollection = createListCollection({items: [{label: 'Ежеденевно', value: 'daily'},{label: 'Еженедельно', value: 'weekly'},{label: 'Ежемесячно', value: 'monthly'},{label: 'Ежегодно', value: 'yearly'}]})

    function stringWidth(text: string, font: string) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return 0;
        context.font = font;
        const textMetrics = context.measureText(text);
        return textMetrics.width;
    }

    const parentWidth = `calc(${stringWidth(parentId.length > 0 ? projects?.filter(task => task._id === parentId[0])?.[0]?.title : 'Родитель', "0.75rem 'Inter'")}px${parentId.length > 0 ? ' + 0.875rem' : ''}`;
    const tabWidth = `calc(${stringWidth(tabsCollection.items.find(item => item.value === tab[0])?.label || '', "bold 0.875rem 'Inter'")}px`;

    async function deleteTask(taskId: string) {
        const data = await request(`/api/task/${taskId}`, 'DELETE', null, { Authorization: `Bearer ${auth.token}` });
        console.log(data);
        toaster.create({
            description: data.message,
            type: data.error ? 'error' : 'success',
            duration: 5000,
            action: { label: "Отменить", onClick: async () => {
                if (data.task.isTemplate) await request(`/api/task/${taskId}`, 'DELETE', null, { Authorization: `Bearer ${auth.token}` })
                else await request('/api/task/create', 'POST', data.task, { Authorization: `Bearer ${auth.token}` }); 
                updateTasks(true)} }
        })
        props.onOpenChange?.({ open: false })
        updateTasks(true)
    }

    return (<Dialog.Root {...rest} placement='top'>
        <Portal>
            <Dialog.Backdrop bg="rgba(0,0,0,0.35)" style={{ backdropFilter: 'blur(1px)' }} />
            <Dialog.Positioner>
                <Dialog.Content alignItems='start' bg='#131315' borderRadius='2xl' maxW={{base: '80vw', lg: '60vw'}} w='full'>
                    <Dialog.Header w='full'>
                        {/* Тип объекта */}
                        <Dialog.Title w='full' display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
                            <Select.Root variant='subtle' w='14rem' collection={tabsCollection} value={[tab]} onValueChange={(e) => setTab(e.value[0])}>
                                <Select.Control w={`${tabWidth} + 2.5rem)`}>
                                    <Select.Trigger backgroundColor='transparent' p={0} border='none' _focusVisible={{outlineWidth: '0px !important'}}>
                                        <Select.ValueText maxW={`${tabWidth})`} />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner style={{ zIndex: 1500, width: '14rem' }}>
                                    <Select.Content backgroundColor='#222222' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #222222'>
                                        {tabsCollection.items.map((tab) => (<Select.Item item={tab} key={tab.value}>{tab.label}<Select.ItemIndicator /></Select.Item>))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                            <div>
                                {Object.keys(task).length > 0 && <Button color='#e0e0e0' variant="solid" colorPalette="teal" size="sm" disabled={required !== 0} onClick={() =>deleteTask(task._id)} mr={3}><FaTrash /></Button>}
                                <Button color='#e0e0e0' variant="solid" colorPalette="teal" size="sm" disabled={required !== 0} onClick={saveChanges}>{task._id ? 'Сохранить' : 'Создать'}</Button>
                            </div>
                        </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body w='full' display='flex' flexDirection='column' gap={4}>
                        <Box display='flex'>
                            {/* Выбор Эйзенхауэра */}
                            {tab !== 'h' && <Badge className='dark' w={10} h={10} p={0} mr={3} rounded='md' textAlign='center' fontSize='xs' lineHeight='1' variant='subtle' colorPalette={getEisenhowerColor[eisenhower]}>
                                <Select.Root variant='subtle' collection={eisenhowerCollection} value={[eisenhower]} onValueChange={(e) => setEisenhower(e.value[0])}>
                                    <Select.Trigger backgroundColor='transparent' px={0} justifyContent='center'><Select.ValueText /></Select.Trigger>
                                    <Select.Positioner style={{ zIndex: 1500 }}>
                                        <Select.Content backgroundColor='#222222' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #222222' px={0}>
                                            {eisenhowerCollection.items.map((e) => <Select.Item item={e} value={e.value} id={'eisenhower'+e.value} px={0} py={2} justifyContent='center'>{e.label}</Select.Item>)}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                            </Badge>}
                            {/* Выбор Эпика */}
                            {tab !== 'h' && <Box w={10} h={10} mr={3} rounded='md' justifyContent='center'>
                                <Select.Root variant='subtle' collection={epicCollection} value={[epic]} color='#e0e0e0' onValueChange={(e) => setEpic(e.value[0])}>
                                    <Select.Trigger backgroundColor='transparent' px={0} justifyContent='center'>
                                        {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(epic)
                                            ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[epic]}.png`} alt={epic} />
                                            : epicToIcon[epic]
                                        }
                                    </Select.Trigger>
                                    <Select.Positioner style={{ zIndex: 1500, width: '10rem' }}>
                                        <Select.Content backgroundColor='#222222' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #222222'>
                                            {epicCollection.items.map((e) => (
                                                <Select.Item item={e} value={e.value} id={'epic'+e.value} justifyContent='flex-start' alignItems='center'>
                                                    {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(e.value)
                                                        ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[e.value]}.png`} alt={e.value} />
                                                        : epicToIcon[e.value]
                                                    }{e.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                            </Box>}
                            {/* Название */}
                            <Editable.Root  w={tab === 'p' && title.length > 10 ? 'calc(100% - 17rem)' : 'calc(100% - 6.5rem)'} invalid={title.length === 0 ? true : false} activationMode="dblclick" value={title} onValueChange={(e) => setTitle(e.value)} placeholder={'Название ' + (isEvent ? 'мероприятия' : 'задачи')}>
                                <Editable.Preview w='full'/>
                                <Editable.Input w='full' color='#e0e0e0' />
                            </Editable.Root>
                            {/* Короткое название */}
                            {(tab === 'p' && title.length > 10) && <FloatLabelInput label='Короткое название' value={shortTitle} onValueChange={(e) => {console.log(e); console.log(shortTitle);setShortTitle(e)}} invalid={title.length > 10 && shortTitle?.length === 0} />}
                        </Box>
                        <Box display='flex'>
                            {/* Мероприятие */}
                            {!['h', 'p'].includes(tab) && <Badge h={8} variant="outline" colorPalette="grey" rounded='md' fontSize='md' mr={2} onClick={() => setIsEvent(!isEvent)} px={2} color={isEvent ? '#e0e0e0' : '#52525b'} boxShadowColor={isEvent ? '#e4e4e7' : '#52525b'}>{isEvent ? <BsCalendarCheck /> : <BsCalendarX />}</Badge>}
                            {/* Родитель (для всех, кроме привычек)*/}
                            { tab !== 'h' && (
                                <Combobox.Root variant='subtle' collection={collection} openOnClick value={parentId} onValueChange={(e) => setParentId(e.value)} onInputValueChange={(e) => filter(e.inputValue)} 
                                    w='auto' size='xs' color='#e0e0e0' mr={2} positioning={{placement: 'bottom-start'}} >
                                    <Badge variant="outline" colorPalette="grey" w={`${parentWidth}${parentId.length > 0 ? ' + 0.375rem' : ''} + 2.375rem)`} h={8} px={0} rounded='md' fontSize='md' color={parentId.length > 0 ? '#e0e0e0' : '#52525b'} boxShadowColor={parentId.length > 0 ? '#e4e4e7' : '#52525b'}> {/* 9ca3af */}
                                        <Combobox.Control display='flex' alignItems='center' px={2}>
                                                <FaAt />
                                                <Combobox.Input placeholder="Родитель" _placeholder={{color: '#52525b'}} value={collection.items.find((item: any) => item.value === parentId[0])?.label} px={0} backgroundColor='transparent' border='none' _focusVisible={{outlineWidth: '0px !important'}} w={`${parentWidth})`} ml='0.375rem'/>
                                            <Combobox.IndicatorGroup px={0}><Combobox.ClearTrigger /></Combobox.IndicatorGroup>
                                        </Combobox.Control>
                                    </Badge>
                                    <Combobox.Positioner style={{ zIndex: 1500, minWidth: '13rem' }}>
                                    <Combobox.Content backgroundColor='#161616' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' gap='0.375rem'>
                                        <Combobox.Empty>Не найдено задач</Combobox.Empty>
                                        {collection.items.filter((item: any) => item && item.value && item.label).map((item: any) => (
                                            <Combobox.Item item={item} key={item.value} wordBreak='break-word'>
                                                {item.label}
                                                <Combobox.ItemIndicator />
                                            </Combobox.Item>
                                        ))}
                                    </Combobox.Content>
                                    </Combobox.Positioner>
                                </Combobox.Root>
                            )}
                            {/* Частота повторений (для привычек и повторяющихся задач)*/}
                            { ['h', 'r'].includes(tab) && (
                                <Popover.Root lazyMount unmountOnExit positioning={{placement: 'bottom-start'}}>
                                    <Popover.Trigger fontSize='xs' color='#e0e0e0' mr={2} asChild>
                                        <Badge h={8} variant="outline" colorPalette="grey" rounded='md' color={frequency && interval ? '#e0e0e0' : '#52525b'} boxShadowColor={frequency && interval ? '#e4e4e7' : '#52525b'}>
                                            <FaRepeat />
                                            {((interval === 1 ? frequencyCollection.items.find(e => e.value === frequency)?.label : interval+' '+ formatRecurrenceFrequency({recurrence: { frequency, interval }}))) || 'Частота'}
                                        </Badge>
                                    </Popover.Trigger>
                                    <Popover.Positioner>
                                        <Popover.Content backgroundColor='#161616' w='auto !important'>
                                            <Popover.Body p={3}>
                                                <Box display='flex' alignItems='center'>
                                                    <Text mr={2}>{`Повтор ${interval > 1 ? 'каждые' : (frequency === 'weekly' ? 'каждую' : 'каждый')}`}</Text>
                                                    <Input type="number" min={1} value={interval} onChange={(e)=> setInterval(parseInt(e.target.value))} variant="flushed" color="#e0e0e0" placeholder="Интервал" textAlign='center' minW={4} w={4}/>
                                                    <Select.Root variant='subtle' collection={frequencyCollection} value={[frequency]} color='#e0e0e0' onValueChange={(e) => setFrequency(e.value[0])} w='6rem'>
                                                        <Select.Control>
                                                            <Select.Trigger backgroundColor='#161616' color='#e0e0e0'>
                                                                <Select.ValueText placeholder="Периодичность" maxW='full' w='full' > {formatRecurrenceFrequency({recurrence: { frequency, interval }})}</Select.ValueText>
                                                            </Select.Trigger>
                                                            <Select.IndicatorGroup>
                                                                <Select.Indicator />
                                                            </Select.IndicatorGroup>
                                                        </Select.Control>
                                                        <Select.Positioner style={{ zIndex: 1500 }}>
                                                            <Select.Content backgroundColor='#161616' color='#e0e0e0' scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616'>
                                                                {frequencyCollection.items.map((e) => <Select.Item item={e} value={e.value}>{formatRecurrenceFrequency({recurrence: { frequency: e.value, interval }})}<Select.ItemIndicator /></Select.Item>)}
                                                            </Select.Content>
                                                        </Select.Positioner>
                                                    </Select.Root>
                                                </Box>
                                            </Popover.Body>
                                        </Popover.Content>
                                    </Popover.Positioner>
                                </Popover.Root>
                            )}
                            {/* Интервал повторений (для повторяющихся задач)*/}
                            { tab === 'r' && (
                                <Popover.Root lazyMount unmountOnExit>
                                    <Popover.Trigger fontSize='xs' mr={2} asChild>
                                        <Badge h={8} variant="outline" colorPalette="grey" rounded='md' color={recStartDate && recEndDate  ? '#e0e0e0' : '#52525b'} boxShadowColor={recStartDate && recEndDate ? '#e4e4e7' : '#52525b'}><BsCalendar3Range />{formatRecurrencePeriod({ recurrence: { startDate: recStartDate, endDate: recEndDate } }) || 'Интервал'}</Badge>
                                    </Popover.Trigger>
                                    <Popover.Positioner>
                                        <Popover.Content backgroundColor='#161616' w='auto !important'>
                                            <Popover.Body p={3} display='flex' alignItems='center'>
                                                <Input w={24} type="date" value={recStartDate} onChange={(e)=> setRecStartDate(e.target.value)} variant="flushed" color="#e0e0e0" placeholder="Старт серии" mr={3}/>
                                                <p>➜</p>
                                                <Input w={24} type="date" value={recEndDate} onChange={(e)=> setRecEndDate(e.target.value)} variant="flushed" color="#e0e0e0" placeholder="Конец серии" ml={3}/>
                                            </Popover.Body>
                                        </Popover.Content>
                                    </Popover.Positioner>
                                </Popover.Root>
                            )}                            
                            {/* Дата (для всех)*/}
                            <Popover.Root lazyMount unmountOnExit>
                                <Popover.Trigger asChild>
                                    <Badge h={8} variant="outline" colorPalette="grey" rounded='md' fontSize='md' mr={2} px={2} color={dateEnd ? '#e0e0e0' : '#52525b'} boxShadowColor={dateEnd ? '#e4e4e7' : '#52525b'}>
                                        <BsCalendar />
                                        {formatDateDisplay(dateStart ? new Date(dateStart + (timeStart ? 'T'+timeStart+':00' : 'T00:00:00')) : undefined,
                                            new Date(dateEnd + (timeEnd ? 'T'+timeEnd+':00' : 'T00:00:00')), !!timeStart, 'xs', '#e0e0e0')}
                                    </Badge>
                                </Popover.Trigger>
                                <Popover.Positioner>
                                    <Popover.Content backgroundColor='#161616' w='auto !important'>
                                        <Popover.Body p={3}>
                                            <div className="input-fields3 flex items-center">
                                                {tab !== 'h' && (<>
                                                    <Box w={28}>
                                                        <Input required={(isEvent && dateStart === undefined) || (timeStart !== undefined && dateStart === undefined)}
                                                            id="taskDateStart" variant="flushed" type="date" value={dateStart} min="2002-11-22" max={dateEnd} width='7rem' color='#e0e0e0'
                                                            onChange={(e) => setDateStart(e.target.value)}
                                                        />
                                                        <Input required={isEvent && timeStart === undefined} id="taskTimeStart" color='#e0e0e0'
                                                            variant="flushed" type="time" value={timeStart} max={(dateStart === dateEnd && timeEnd) ? timeEnd : undefined} width='auto'
                                                            onChange={(e) => setTimeStart(e.target.value)}
                                                        />
                                                    </Box>
                                                    <p className='mx-3'>➜</p>
                                                </>)}
                                                <Box w={28}>
                                                    <Input required={dateEnd === 'Invalid Date'} id="taskDateEnd" color='#e0e0e0'
                                                        variant="flushed" type="date" value={dateEnd}
                                                        min={dateStart === undefined ? '2002-11-22' : dateStart} max="2099-12-31" width='7rem'
                                                        onChange={(e) => setDateEnd(e.target.value)}
                                                    />
                                                    {tab !== 'h' && (<Input required={isEvent && timeEnd === undefined} id="taskTimeEnd" colorPalette='gray'
                                                        variant="flushed" type="time" value={timeEnd} width='auto' color='#e0e0e0'
                                                        min={(dateStart === dateEnd && timeStart) ? timeStart : undefined}
                                                        onChange={(e) => setTimeEnd(e.target.value)}
                                                    />)}
                                                </Box>
                                            </div>
                                        </Popover.Body>
                                    </Popover.Content>
                                </Popover.Positioner>
                            </Popover.Root>
                        </Box>
                        {/* Описание (для всех, кроме привычек)*/}
                        { tab !== 'h' && (<>
                            <Textarea autoresize maxH="13lh" scrollbarWidth='thin' scrollbarColor='#e0e0e0 #161616' value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={'Описание ' + (isEvent ? 'мероприятия' : 'задачи')} />
                        </>)}
                        {/* Подзадачи (для всех, кроме привычек)*/}
                        { !['h', 'p'].includes(tab) && (<>
                            {subTasks.map((subTask, index) => (
                                <div key={subTask._id} className="subTask pl-6">
                                    <Input required={subTask.name.length === 0} variant="flushed" colorPalette='gray' value={subTask.name} color='#e0e0e0' mr={3} w='calc(100% - 6.5rem)'
                                        onChange={(e) => setSubTasks(subTasks.map((t) => t._id === subTask._id ? { ...t, name: e.target.value } : t))}/>
                                    {subTasks.length !== 0 && ( <IconButton className="upDownSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e' flexDirection='column' gap={0} border={0}>
                                        {index !== 0 && (<div className='upIcon w-full flex justify-center' onClick={(e) => upDownSubTask(e.target.closest('.upIcon'), subTasks, subTask, setSubTasks)}><FaChevronUp /></div>)}
                                        {index !== subTasks.length - 1 && (<div className='downIcon w-full flex justify-center' onClick={(e) => upDownSubTask(e.target.closest('.downIcon'), subTasks, subTask, setSubTasks)}><FaChevronDown /></div>)}
                                    </IconButton>)}
                                    <IconButton ml={3} variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e' onClick={() => setSubTasks( subTasks.filter((t) => t._id !== subTask._id))}><FaXmark /></IconButton>
                                </div>
                            ))}
                            <Button color='#4e4e4e' ml={6} variant="ghost" colorPalette='gray' size="sm" justifyContent='flex-start' onClick={newSubTask}><FaPlus />Добавить подзадачу</Button>
                        </>)}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>)
})
