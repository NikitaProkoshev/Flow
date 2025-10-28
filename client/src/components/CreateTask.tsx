import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString, getEisenhowerColor, formatDateDisplay, toUTCString } from '../methods';
import { epicToIcon, upDownSubTask, formatRecurrenceFrequency, formatRecurrencePeriod } from '../methods';
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
    const [tab, setTab] = useState(window.location.pathname === '/templates' ? 'r' : (window.location.pathname === '/habits' ? 'h' : (window.location.pathname === '/projects' ? 'p' : (task.isTemplate ? 'r' : 't'))));

    const [epic, setEpic] = useState(task.epic || Object.keys(epicToIcon)[0]);
    const [parentId, setParentId] = useState(task.parentId ? [task.parentId] : []);
    const [title, setTitle] = useState(task.title || '');
    const [shortTitle, setShortTitle] = useState(task.shortTitle || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState((task.dateStart && task?.dateStart?.slice(0,4) !== '1970') ? dateToString(task.dateStart) : dateToString(new Date()));
    const [timeStart, setTimeStart] = useState((typeof task.dateStart === 'string' && !task.dateStart.endsWith('T21:00:00.000Z')) ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [dateEnd, setDateEnd] = useState(task.dateEnd ? dateToString(task.dateEnd) : dateToString(new Date()));
    const [timeEnd, setTimeEnd] = useState((typeof task.dateEnd === 'string' && !task.dateEnd.endsWith('T21:00:00.000Z')) ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5) : undefined);
    const [eisenhower, setEisenhower] = useState(task.eisenhower || 'A');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [required, setRequired] = useState(1);
    const [frequency, setFrequency] = useState(task.recurrence?.frequency || 'daily');
    const [interval, setInterval] = useState(task.recurrence?.interval || 1);
    const [recStartDate, setRecStartDate] = useState(task.recurrence?.startDate ? dateToString(task.recurrence.startDate) : undefined);
    const [recEndDate, setRecEndDate] = useState(task.recurrence?.endDate ? dateToString(task.recurrence.endDate) : undefined); 

    useEffect(() => {
        const requiredNotFilled = document.getElementById('dialog:createTask:content')?.querySelectorAll('[data-invalid=""]');
        console.log(requiredNotFilled);
        setRequired(requiredNotFilled ? requiredNotFilled.length : 0);
    }, [title, shortTitle, dateStart, timeStart, dateEnd, timeEnd, interval, recStartDate, recEndDate, setRequired]);

    const saveChanges = async () => {
        try {
            if (required === 0) {
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
                    dateStart: tab === 'h' ? toUTCString(dateEnd, timeEnd) : toUTCString(dateStart, timeStart),
                    dateEnd: toUTCString(dateEnd, timeEnd),
                    parentId: tab === 'h' ? '' : parentId[0],
                    description: tab === 'h' ? '' : desc,
                    subTasks: ['h', 'p'].includes(tab) ? [] : subTasks,
                    recurrence: ['p', 't'].includes(tab) ? {} : { frequency, interval, startDate: tab === 'h' ? new Date() : recStartDate, endDate: tab === 'h' ? new Date('2099-12-31') : recEndDate },
                }
                const data = Object.keys(task).length === 0 ? await request('/api/task/create', 'POST', taskData as any, { Authorization: `Bearer ${auth.token}` })
                    : (task.templateId ? await request(`/api/task/updateInstance/${task._id}`, 'PUT', taskData as any, { Authorization: `Bearer ${auth.token}` })
                        : await request(`/api/task/update/${task._id}`, 'PUT', taskData as any, { Authorization: `Bearer ${auth.token}` }))
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

    const invalidDatesBadge = (correct, invalid) => isEvent ? (timeStart && timeEnd && dateEnd && dateStart ? ((dateStart === dateEnd && timeStart < timeEnd) ? correct : invalid) : invalid)
        : tab === 'h' ? (dateEnd ? correct : invalid) : (dateStart && dateEnd ? correct : invalid);

    return (<Dialog.Root {...rest} placement='top' id='createTask'>
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
                                {Object.keys(task).length > 0 && <Button color='#e0e0e0' variant="solid" colorPalette="teal" size="sm" onClick={() =>deleteTask(task._id)} mr={3}><FaTrash /></Button>}
                                <Button color='#e0e0e0' variant="solid" colorPalette="teal" size="sm" onClick={saveChanges} disabled={required > 0}>{task._id ? 'Сохранить' : 'Создать'}</Button>
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
                            <Editable.Root w={tab === 'p' && title.length > 10 ? 'calc(100% - 17rem)' : 'calc(100% - 6.5rem)'} invalid={title.length === 0} activationMode="dblclick" 
                                value={title} onValueChange={(e) => setTitle(e.value)} placeholder={'Название ' + (isEvent ? 'мероприятия' : 'задачи')}>
                                <Editable.Preview w='full' _invalid={{ '--focus-ring-color': 'var(--error-color)', borderColor: 'var(--error-color)', '--error-color': '#ef4444', borderBottomWidth: '1px' }} />
                                <Editable.Input w='full' color='#e0e0e0' />
                            </Editable.Root>
                            {/* Короткое название */}
                            {(tab === 'p' && title.length > 10) && <FloatLabelInput label='Короткое название' value={shortTitle} onValueChange={(e) => setShortTitle(e)} invalid={title.length > 10 && shortTitle?.length === 0} />}
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
                                        <Badge h={8} variant="outline" colorPalette="grey" rounded='md' color={Number(interval) > 0 && frequency ? '#e0e0e0' : '#ef4444'} boxShadowColor={Number(interval) > 0 && frequency ? '#e4e4e7' : '#ef4444'}>
                                            <FaRepeat />
                                            {((interval === 1 ? frequencyCollection.items.find(e => e.value === frequency)?.label : interval+' '+ formatRecurrenceFrequency({recurrence: { frequency, interval }}))) || 'Частота'}
                                        </Badge>
                                    </Popover.Trigger>
                                    <Popover.Positioner>
                                        <Popover.Content backgroundColor='#161616' w='auto !important'>
                                            <Popover.Body p={3}>
                                                <Box display='flex' alignItems='center'>
                                                    <Text mr={2}>{`Повтор ${interval > 1 ? 'каждые' : (frequency === 'weekly' ? 'каждую' : 'каждый')}`}</Text>
                                                    <Field.Root w={4} invalid={interval < 1}>
                                                        <Input type="number" value={interval} onChange={(e)=> setInterval(parseInt(e.target.value))} variant="flushed" color="#e0e0e0" textAlign='center' minW={4}/>
                                                    </Field.Root>
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
                                        <Badge h={8} variant="outline" rounded='md' color={recStartDate && recEndDate  ? '#e0e0e0' : '#52525b'} boxShadowColor={recStartDate && recEndDate ? '#e4e4e7' : '#ef4444'}>
                                            <BsCalendar3Range />{formatRecurrencePeriod({ recurrence: { startDate: recStartDate, endDate: recEndDate } }) || 'Интервал'}
                                        </Badge>
                                    </Popover.Trigger>
                                    <Popover.Positioner>
                                        <Popover.Content backgroundColor='#161616' w='auto !important'>
                                            <Popover.Body p={3} display='flex' alignItems='center'>
                                                <Field.Root w={28} mr={3} invalid={[undefined, ''].includes(recStartDate)}>
                                                    <Input type="date" value={recStartDate} onChange={(e)=> setRecStartDate(e.target.value)} variant="flushed" color="#e0e0e0"/>
                                                </Field.Root>
                                                <p>➜</p>
                                                <Field.Root w={28} ml={3} invalid={[undefined, ''].includes(recEndDate)}>
                                                    <Input type="date" value={recEndDate} onChange={(e)=> setRecEndDate(e.target.value)} variant="flushed" color="#e0e0e0"/>
                                                </Field.Root>
                                            </Popover.Body>
                                        </Popover.Content>
                                    </Popover.Positioner>
                                </Popover.Root>
                            )}                            
                            {/* Дата (для всех)*/}
                            <Popover.Root lazyMount unmountOnExit>
                                <Popover.Trigger asChild>
                                    <Badge h={8} variant="outline" colorPalette="grey" rounded='md' fontSize='md' mr={2} px={2} color={invalidDatesBadge('#e0e0e0', '#52525b')} boxShadowColor={invalidDatesBadge('#e4e4e7', '#ef4444')}>
                                        <BsCalendar />
                                        <Field.Root invalid={invalidDatesBadge(false, true)}>
                                            {formatDateDisplay(tab === 'h' ? undefined : (dateStart ? new Date(dateStart + (timeStart ? 'T'+timeStart+':00' : 'T00:00:00')) : undefined),
                                                new Date(dateEnd + (timeEnd ? 'T'+timeEnd+':00' : 'T00:00:00')), !!timeStart, 'xs', '#e0e0e0')}
                                        </Field.Root>
                                    </Badge>
                                </Popover.Trigger>
                                <Popover.Positioner>
                                    <Popover.Content backgroundColor='#161616' w='auto !important'>
                                        <Popover.Body p={3}>
                                            <Box display='flex' alignItems='center' color='#e0e0e0'>
                                                {tab !== 'h' && (<>
                                                    <Box w={28}>
                                                        <Field.Root w={28} invalid={[undefined, ''].includes(dateStart)}>
                                                            <Input variant="flushed" type="date" value={dateStart} min="2002-11-22" max={dateEnd} onChange={(e) => setDateStart(e.target.value)} />
                                                        </Field.Root>
                                                        {isEvent && <Field.Root w='auto' invalid={[undefined, ''].includes(timeStart) || timeEnd < timeStart}>
                                                            <Input variant="flushed" type="time" value={timeStart} textAlign='center' onChange={(e) => setTimeStart(e.target.value)} />
                                                        </Field.Root>}
                                                    </Box>
                                                    <p className='mx-3'>➜</p>
                                                </>)}
                                                <Box w={28}>
                                                    <Field.Root w={28} invalid={[undefined, ''].includes(dateEnd)}>
                                                        <Input variant="flushed" type="date" value={dateEnd} min={dateStart === undefined ? '2002-11-22' : dateStart} max="2099-12-31" onChange={(e) => setDateEnd(e.target.value)} />
                                                    </Field.Root>
                                                    {isEvent && (<Field.Root w='auto' invalid={[undefined, ''].includes(timeEnd) || timeEnd < timeStart}>
                                                        <Input variant="flushed" type="time" value={timeEnd} textAlign='center' onChange={(e) => setTimeEnd(e.target.value)} />
                                                    </Field.Root>)}
                                                </Box>
                                            </Box>
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
                                <Box key={subTask._id} pl={6} display='flex'>
                                    <Field.Root w={`calc(100% - ${subTasks.length > 1 ? '6.5rem' : '3.25rem'})`} invalid={subTask.name.length === 0}>
                                        <Input variant="flushed" value={subTask.name} color='#e0e0e0' onChange={(e) => setSubTasks(subTasks.map((t) => t._id === subTask._id ? { ...t, name: e.target.value } : t))} />
                                    </Field.Root>
                                    {subTasks.length > 1 && <IconButton className="upDownSubTask" variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e' flexDirection='column' gap={0} border={0} ml={3}>
                                        {index !== 0 && (<div className='upIcon w-full flex justify-center' onClick={(e) => upDownSubTask(e.target.closest('.upIcon'), subTasks, subTask, setSubTasks)}><FaChevronUp /></div>)}
                                        {index !== subTasks.length - 1 && (<div className='downIcon w-full flex justify-center' onClick={(e) => upDownSubTask(e.target.closest('.downIcon'), subTasks, subTask, setSubTasks)}><FaChevronDown /></div>)}
                                    </IconButton>}
                                    <IconButton ml={3} variant="ghost" colorPalette='gray' fontSize='2xl' color='#4e4e4e' onClick={() => setSubTasks( subTasks.filter((t) => t._id !== subTask._id))}><FaXmark /></IconButton>
                                </Box>
                            ))}
                            <Button color='#4e4e4e' ml={6} variant="ghost" colorPalette='gray' size="sm" justifyContent='flex-start' onClick={newSubTask}><FaPlus />Добавить подзадачу</Button>
                        </>)}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>)
})
