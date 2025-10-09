import { Stat, Badge } from "@chakra-ui/react";
import { epicToIcon, today } from "../methods";
import { FaArrowRight } from "react-icons/fa6";

const getEisenhowerColor = {'A': 'red', 'B': 'yellow', 'C': 'green', 'D': 'cyan'}

function formatDateDisplay(dateStart, dateEnd, startHasTime, endHasTime) {
    const isToday = (date) =>  date.toDateString() === today.toDateString();

    const formatTime = (date) =>  date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

    const formatDate = (date, showYear = false) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', ...(showYear && { year: 'numeric' }) });

    if (!dateStart || dateStart?.getFullYear() === 1970) {
        return (
            <div className="flex items-center space-x-2 text-[#a0a0a0]">
                <span className="text-md font-medium"> {isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear())} </span>
                {/* {dateEnd.getHours() !== 3 ||
                    (dateEnd.getMinutes() !== 0 && (
                        <><span className="text-[#a0a0a0]">•</span><span className="text-md">{formatTime(dateEnd)}</span></>
                    ))} */}
                {endHasTime && (
                    <><span className="text-[#a0a0a0]">•</span><span className="text-md">{formatTime(dateEnd)}</span></>
                )}
            </div>
        );
    }

    const sameDay = dateStart.toDateString() === dateEnd.toDateString();
    return (
        <div className="flex items-center space-x-2 text-[#a0a0a0]">
            <div className="flex items-center space-x-1">
                <span className="text-md font-medium">{isToday(dateStart) ? 'Сегодня' : formatDate(dateStart, dateStart.getFullYear() !== today.getFullYear())}</span>
                {startHasTime && <><span className="text-gray-500">•</span><span className="text-md">{formatTime(dateStart)}</span></>}
            </div>
            <FaArrowRight className="text-[#a0a0a0] text-md" />
            <div className="flex items-center space-x-1">
                {!sameDay && (<span className="text-md font-medium">{isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear() )}</span>)}
                {endHasTime && (
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

export const Dashboard = ({ tasks }) => {
    return (<>
        <Stat.Root maxW='240px' m={4} borderWidth="1px" p="4" rounded="md">
            <Stat.Label>Задачи</Stat.Label>
            <Stat.ValueText color='#e0e0e0'>{tasks?.length}</Stat.ValueText>
            <Badge colorPalette="green" variant="outline" px="0">1.9%</Badge>
        </Stat.Root>
        {![0, undefined].includes(tasks?.length) &&
            tasks.map((task) => (<div key={task._id} className="task my-4 rounded-2xl pb-[1px] bg-[#0f0f10]">
                <div className="taskBlock1 bg-[#121213] rounded-2xl flex items-center">
                    <div className="taskInfoBlock mx-2 my-4">
                        <div className="taskSubBlock" id="subBlock1">
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
                        <div className="taskSubBlock mt-3" id="subBlock2">
                            <Badge
                                w={6} h={6} px={2} py={1} rounded='md' mr={3} textAlign='center' fontSize='xs' lineHeight='1'
                                variant='subtle' colorPalette={getEisenhowerColor[task.eisenhower]}
                            >{task.eisenhower}</Badge>
                            <div className="text-md">
                                {(() => {
                                    const startHasTime = typeof task.dateStart === 'string' ? !task.dateStart.endsWith('T00:00:00.000Z') : false;
                                    const endHasTime = typeof task.dateEnd === 'string' ? !task.dateEnd.endsWith('T00:00:00.000Z') : false;
                                    return formatDateDisplay(task.dateStart ? new Date(task.dateStart) : undefined,new Date(task.dateEnd), startHasTime, endHasTime);
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
                {task.subTasks.length !== 0 && 
                    <div className="taskBlock2 my-3 ml-14">
                        <div className="taskSubTasksBlock">
                            {task.subTasks.map((subTask) => (
                                <div key={subTask._id} className="subTask my-3">
                                    <p className="text-md ml-3">{subTask.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>))
        }
    </>)
}
