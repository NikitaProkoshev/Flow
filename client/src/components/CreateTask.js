import React, { useContext, useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { dateToString } from '../methods';
import { epicToIcon, epicToColor, upDownSubTask } from '../methods';
import { Button, Input, Combobox, Portal, useFilter, useListCollection } from '@chakra-ui/react';
import { FaChevronUp, FaChevronDown, FaTimes, FaPlus } from 'react-icons/fa';

export const CreateTask = ({ state, allTasks, task = {} }) => {
    const auth = useContext(AuthContext);
    const { request } = useHttp();
    const message = useMessage();

    const [epic, setEpic] = useState(task.epic || '');
    const [title, setTitle] = useState(task.title || '');
    const [desc, setDesc] = useState(task.description || '');
    const [isEvent, setIsEvent] = useState(task.isEvent || false);
    const [dateStart, setDateStart] = useState(
        task.dateStart !== undefined ? dateToString(task.dateStart) : undefined
    );
    const [timeStart, setTimeStart] = useState(
        new Date(task.dateStart).toLocaleTimeString('ru-RU') !== 'Invalid Date'
            ? new Date(task.dateStart).toLocaleTimeString('ru-RU').slice(0, 5)
            : undefined
    );
    const [dateEnd, setDateEnd] = useState(
        task.dateEnd !== undefined
            ? dateToString(task.dateEnd)
            : dateToString(new Date())
    );
    const [timeEnd, setTimeEnd] = useState(
        new Date(task.dateEnd).toLocaleTimeString('ru-RU') !== 'Invalid Date'
            ? new Date(task.dateEnd).toLocaleTimeString('ru-RU').slice(0, 5)
            : undefined
    );
    const [eisenhower, setEisenhower] = useState(task.eisenhower || '');
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [editing, setEditing] = useState(true);
    const [required, setRequired] = useState(2);

    useEffect(() => {
        setRequired(
            document.getElementsByClassName('required').length +
                (epic === '' ? 1 : 0) +
                (eisenhower === '' ? 1 : 0)
        );
        document.documentElement.style.setProperty(
            '--epicColor',
            epicToColor[epic] + '1)'
        );
        if (editing && task.eisenhower !== undefined) {
            eisenhowerSelecting({
                target: document.getElementById('eisenhower' + task.eisenhower),
            });
            setEditing(false);
        }
    });

    const cancelChanges = async (event) => {
        if (task._id === undefined) {
            state(false);
        } else {
            state('');
        }
    };

    const saveChanges = async (event) => {
        try {
            if (required === 0) {
                if (task._id === undefined) {
                    const data = await request(
                        '/api/task/create',
                        'POST',
                        {
                            epic: epic,
                            status: false,
                            title: title,
                            description: desc,
                            isEvent: isEvent,
                            dateStart:
                                dateStart !== undefined
                                    ? dateStart.slice(0, 11) +
                                      (timeStart === undefined
                                          ? ''
                                          : 'T' + timeStart)
                                    : undefined,
                            dateEnd:
                                dateEnd.slice(0, 11) +
                                (timeEnd === undefined ? '' : 'T' + timeEnd),
                            eisenhower: eisenhower,
                            subTasks: subTasks,
                        },
                        { Authorization: `Bearer ${auth.token}` }
                    );
                    if (data) {
                        message('Задача создана!', 'OK');
                        state(false);
                    }
                } else {
                    const data = await request(
                        `/api/task/update/${task._id}`,
                        'PUT',
                        {
                            _id: task._id,
                            epic: epic,
                            status: false,
                            title: title,
                            description: desc,
                            isEvent: isEvent,
                            dateStart:
                                dateStart !== undefined
                                    ? dateStart.slice(0, 11) +
                                      (timeStart === undefined
                                          ? ''
                                          : 'T' + timeStart)
                                    : undefined,
                            dateEnd:
                                dateEnd.slice(0, 11) +
                                (timeEnd === undefined ? '' : 'T' + timeEnd),
                            eisenhower: eisenhower,
                            subTasks: subTasks,
                        },
                        { Authorization: `Bearer ${auth.token}` }
                    );
                    if (data) {
                        message('Задача обновлена!', 'OK');
                        state('');
                    }
                }
            } else {
                message('Не все обязательные поля заполнены!', 'Warning');
            }
        } catch (e) {}
    };

    const epicChanging = async (event) => {
        let target = event.target.closest('.epicOption');
        document.documentElement.style.setProperty(
            '--epicColor',
            epicToColor[target.value] + '1)'
        );
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
        <div className={`createTask grid grid-cols-${Object.keys(epicToIcon).length} gap-2 w-full my-8 px-4 py-4 items-start backdrop-blur-sm`}
        >
            {Object.keys(epicToIcon).map((e) => (
                <Button
                    className={
                        'btn-flat waves-effect epicOption waves-' +
                        (epic !== e
                            ? 'grey grey-text text-darken-3'
                            : 'epic epic-text selected')
                    }
                    id={'epic' + e}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    size="sm"
                    onClick={epicChanging}
                    value={e}
                >
                    {['МегаФон', 'РУДН', 'ФК_Краснодар', 'Flow'].includes(e)
                        ? <img
                            className="epicIcon"
                            id={'epic' + e + 'Icon'}
                            src={`..\\img\\${epicToIcon[e]}.png`}
                            alt={e}
                            width="24px"
                            height="24px"
                        />
                        : epicToIcon[e]}
                </Button>
            ))}
            <div className="col-span-8 grid grid-cols-subgrid gap-4">
                <div className="input-block1 col-span-6 grid grid-cols-subgrid gap-4">
                    <Button
                        className={
                            'col-span-1 ' +
                            (isEvent
                                ? 'Event'
                                : 'notEvent grey-text text-darken-3')
                        }
                        id="isEvent"
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        onClick={() => setIsEvent(!isEvent)}
                    >Event</Button>
                    <Combobox.Root
                        className='col-span-1'
                        collection={collection}
                        onInputValueChange={(e) => filter(e.inputValue)}
                        variant='subtle'
                        // width="320px"
                    >
                        <Combobox.Control>
                            <Combobox.Input placeholder="Родительская задача" />
                            <Combobox.IndicatorGroup>
                            <Combobox.ClearTrigger />
                            <Combobox.Trigger />
                            </Combobox.IndicatorGroup>
                        </Combobox.Control>
                        <Portal>
                            <Combobox.Positioner>
                            <Combobox.Content>
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
                    <Input
                        className={'col-span-4' +(title.length === 0 ? ' required' : '')}
                        id="taskTitle"
                        variant="flushed"
                        value={title}
                        placeholder={'Название ' + (isEvent ? 'мероприятия' : 'задачи')}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        className="col-span-6"
                        id="taskDescription"
                        variant="flushed"
                        value={desc}
                        placeholder={
                            'Описание ' + (isEvent ? 'мероприятия' : 'задачи')
                        }
                        onChange={(e) => setDesc(e.target.value)}
                    />
                    <div className="input-fields3 col-span-6">
                        <Input
                            className={
                                (isEvent && dateStart === undefined) ||
                                (timeStart !== undefined &&
                                    dateStart === undefined)
                                    ? 'required'
                                    : ''
                            }
                            id="taskDateStart"
                            variant="flushed"
                            type="date"
                            value={dateStart}
                            min="2002-11-22"
                            max={dateEnd}
                            onChange={(e) => {
                                setDateStart(e.target.value);
                            }}
                            style={{ width: 'auto' }}
                        />
                        <Input
                            className={
                                'ml-4' +
                                (isEvent && timeStart === undefined
                                    ? ' required'
                                    : '')
                            }
                            id="taskTimeStart"
                            variant="flushed"
                            type="time"
                            value={timeStart}
                            max={(dateStart === dateEnd && timeEnd) && timeEnd}
                            onChange={(e) => {
                                setTimeStart(e.target.value);
                            }}
                            style={{ width: 'auto' }}
                        />
                        <p className="ml-4">➜</p>
                        <Input
                            className={
                                'ml-4' +
                                (dateEnd === 'Invalid Date' ? ' required' : '')
                            }
                            id="taskDateEnd"
                            variant="flushed"
                            type="date"
                            value={dateEnd}
                            min={
                                dateStart === undefined
                                    ? '2002-11-22'
                                    : dateStart
                            }
                            max="2099-12-31"
                            onChange={(e) => {
                                setDateEnd(e.target.value);
                            }}
                            style={{ width: 'auto' }}
                        />
                        <Input
                            className={
                                'ml-4' +
                                (isEvent && timeEnd === undefined
                                    ? ' required'
                                    : '')
                            }
                            id="taskTimeEnd"
                            variant="flushed"
                            type="time"
                            value={timeEnd}
                            min={(dateStart === dateEnd && timeStart) && timeStart}
                            onChange={(e) => {
                                setTimeEnd(e.target.value);
                            }}
                            style={{ width: 'auto' }}
                        />
                    </div>
                </div>
                <div className="input-block2 col-span-2 h-full grid grid-cols-subgrid grid-rows-2 gap-0">
                    {['A', 'B', 'C', 'D'].map((val) => (
                        <div
                            className={
                                'eisenhowerOption flex justify-center items-center' +
                                (eisenhower === val
                                    ? ' epic-background selected'
                                    : '')
                            }
                            id={'eisenhower' + val}
                            onClick={eisenhowerSelecting}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            </div>
            {subTasks.map((subTask, index) => {
                return (
                    <div key={subTask._id} className="subTask col-span-8 pl-6">
                        <Input
                            className={
                                subTask.name.length === 0 ? 'required' : ''
                            }
                            variant="flushed"
                            value={subTask.name}
                            onChange={(e) =>
                                setSubTasks(
                                    subTasks.map((t) =>
                                        t._id === subTask._id
                                            ? { ...t, name: e.target.value }
                                            : t
                                    )
                                )
                            }
                        />
                        {subTasks.length !== 0 && (
                            <div className="upDownSubTask flex flex-col justify-center ml-4 h-full text-[1.25rem] grey-text text-darken-3">
                                <FaChevronUp
                                    className="upIcon"
                                    onClick={(e) =>
                                        upDownSubTask(
                                            e,
                                            subTasks,
                                            subTask,
                                            setSubTasks
                                        )
                                    }
                                />
                                {index !== subTasks.length - 1 && (
                                    <FaChevronDown
                                        className="downIcon"
                                        onClick={(e) =>
                                            upDownSubTask(
                                                e,
                                                subTasks,
                                                subTask,
                                                setSubTasks
                                            )
                                        }
                                    />
                                )}
                            </div>
                        )}
                        <Button
                            className="deleteSubTask grey-text text-darken-3 ml-4"
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            onClick={() =>
                                setSubTasks(
                                    subTasks.filter(
                                        (t) => t._id !== subTask._id
                                    )
                                )
                            }
                        >
                            <FaTimes className="text-[1.5rem]" />
                        </Button>
                    </div>
                );
            })}
            <div className="input-block4 col-span-8 pl-6">
                <Button
                    className="newSubTask grey-text text-darken-3"
                    id="createSubTask"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    size="sm"
                    onClick={newSubTask}
                >
                    <FaPlus />
                    Добавить подзадачу
                </Button>
                <div>
                    <Button
                        id="createTask"
                        variant="solid"
                        colorScheme="teal"
                        size="sm"
                        onClick={cancelChanges}
                    >
                        <FaTimes className="text-[1.5rem]" />
                    </Button>
                    <Button
                        className={required !== 0 && 'someRequired'}
                        id="createTask"
                        variant="solid"
                        colorScheme="teal"
                        size="sm"
                        onClick={saveChanges}
                    >
                        {task._id === undefined
                            ? 'Создать задачу'
                            : 'Обновить задачу'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
