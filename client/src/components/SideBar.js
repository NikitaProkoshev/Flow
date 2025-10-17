import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHouse, FaRightFromBracket } from 'react-icons/fa6';
import { BsGraphUp, BsRepeat, BsListCheck, BsPatchCheckFill, BsArchiveFill, BsClipboard2DataFill } from 'react-icons/bs';
import { Button } from '@chakra-ui/react';
import { epicToIcon, epicToColor } from '../methods';
import { EpicsContext } from '../App';

export const SideBar = () => {
    const [epics, setEpics] = useContext(EpicsContext);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const sidebarRef = useRef(null);
    let isButtonDown = false;
    var holdTimer;

    const epicsChanging = async (event, only) => {
        let target = event.target.closest('.epicOptionFilter');
        let epicsCopy = epics.slice(0);
        if (only) return typeof only === "object" ? setEpics(only) : setEpics([target.value])
        if (target.classList.contains('selected')) epicsCopy.splice(epicsCopy.indexOf(target.value), 1);
        else epicsCopy.push(target.value)
        setEpics(epicsCopy);
    };

    const pages= [{i: BsGraphUp, t: 'Дашборд', n: '/dashboard'}, {i: BsRepeat, t: 'Шаблоны', n: '/templates'}, { i: BsListCheck, t: 'Задачи', n: '/tasks'}, { i: BsPatchCheckFill, t: 'Привычки', n: '/habits'}, {i: BsArchiveFill, t: 'Архив', n: '/archive'}, {i:BsClipboard2DataFill, t: 'Проекты', n: '/projects'}];

    return (
        <div ref={sidebarRef} className={`fixed m-4 h-[calc(100dvh-1.5rem)] text-white transition-all duration-300 ease-in-out z-50 w-12`} id="sideBar">
            <div className="flex items-center px-2 py-1"><img className='size-8' id='Logo' src={`..\\img\\logo.png`} alt='Logo' /></div>
            <nav className="rounded-2xl bg-[#131315] my-4">
                <Button id="homeButton" w='100%' h={12} p={3} justifyContent='flex-start' fontSize='md' lineHeight='1.5' borderWidth={0} color='#e0e0e0' rounded="2xl" variant="ghost" colorPalette="gray" onClick={() => navigate('/')}>
                    <FaHouse className="text-white min-w-6 min-h-6" />
                    <span className={`font-medium transition-all duration-300 opacity-0 w-0 overflow-hidden`}>Главная</span>
                </Button>
                { pages.map(btn => (
                    <Button w='100%' h={12} p={3} justifyContent='flex-start' fontSize='md' lineHeight='1.5' borderWidth={0} color='#e0e0e0' rounded="2xl" variant="ghost" colorPalette="gray" title={btn.t} onClick={() => navigate(btn.n)}>
                        <btn.i className="text-white min-w-6 min-h-6" />
                    </Button>
                ))}
            </nav>
            <nav className=" flex flex-col items-start rounded-2xl bg-[#131315] my-4">
                {Object.keys(epicToIcon).map((epic) => (
                    <Button className={`epicOptionFilter ${(epics.includes(epic) ? 'selected' : '')}`} id={'epic' + epic} w={12} h={12} p={3} justifyContent='flex-start' fontSize='md' lineHeight='1.5' color={`${epicToColor[epic]}1)`}
                        rounded="2xl" filter={epics.includes(epic) ? 'grayscale(0%)' : 'grayscale(100%)'} borderWidth={0} variant="ghost" colorPalette="gray" value={epic}
                        onMouseDown={(e) => { isButtonDown = true; holdTimer = setTimeout(() => {if (isButtonDown) epicsChanging(e, epics.length == 1 && epics[0] == epic ? Object.keys(epicToIcon) : true) }, 500) }}
                        onTouchStart={(e) => { isButtonDown = true; holdTimer = setTimeout(() => {if (isButtonDown) epicsChanging(e, epics.length == 1 && epics[0] == epic ? Object.keys(epicToIcon) : true) }, 500) }}
                        onMouseUp={(e) => { isButtonDown = false; if (holdTimer) epicsChanging(e) }}
                    >
                        {['МегаФон', 'РУДН', 'ФК_Краснодар', 'Flow'].includes(epic) ? <img className="epicIcon size-6" id={`epic${epic}Icon`} src={`..\\img\\${epicToIcon[epic]}.png`} alt={epic} /> : epicToIcon[epic]}
                        <span className={`hidden sm:inline transition-all duration-300 overflow-hidden opacity-0 w-0`}>{epic.replace('_', ' ')}</span>
                    </Button>
                ))}
            </nav>
            <nav className="absolute bottom-0 w-full rounded-2xl bg-[#131315] my-4">
                <Button id="logOutButton" w='100%' h={12} p={3} justifyContent='flex-start' fontSize='md' lineHeight='1.5' borderWidth={0} color='#e0e0e0' rounded="2xl" variant="ghost" colorPalette="gray" onClick={() => logout()}>
                    <FaRightFromBracket className="text-white min-w-6 min-h-6" />
                    <span className={`font-medium transition-all duration-300 opacity-0 w-0 overflow-hidden`}>Выйти</span>
                </Button>
            </nav>
        </div>
    );
};
