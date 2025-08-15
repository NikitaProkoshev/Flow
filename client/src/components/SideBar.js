import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSideBar } from '../context/SideBarContext';
import { FaHouse, FaRightFromBracket } from 'react-icons/fa6';
import { Button } from '@chakra-ui/react';
import { epicToIcon, epicToColor } from '../methods';
import { EpicsContext } from '../App';

export const SideBar = () => {
    const { isCollapsed, setIsCollapsed } = useSideBar();
    const [epics, setEpics] = useContext(EpicsContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const sidebarRef = useRef(null);
    const isMobile = () => window.innerWidth <= 768;

    // Автоматически сворачивать на мобильных
    useEffect(() => {
        if (isMobile()) setIsCollapsed(true);
    }, [setIsCollapsed]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const epicsChanging = async (event) => {
        let target = event.target.closest('.epicOption');
        let epicsCopy = epics.slice(0);
        if (target.classList.contains('selected')) {
            epicsCopy.splice(epicsCopy.indexOf(target.value), 1);
        } else {
            epicsCopy.push(target.value);
        }
        setEpics(epicsCopy);
    };

    return (
        <div
            ref={sidebarRef}
            className={`fixed m-4 rounded-2xl backdrop-blur-sm h-[calc(100%-1.5rem)] text-white transition-all duration-300 ease-in-out z-50 ${
                isCollapsed ? 'w-[3.5rem]' : 'w-auto'
            }`}
            id="sideBar"
        >
            <div
                className="flex items-center justify-between p-2"
                onClick={() => {
                    if (!isMobile()) setIsCollapsed(!isCollapsed);
                }}
            >
                <i className="val-font gradient-font">
                    <span className="text-4xl not-italic font-normal sm: text-4xl">
                        {isCollapsed ? 'F' : 'FLOW'}
                    </span>
                </i>
            </div>

            <nav className="border-t border-gray-700">
                <Button
                    className="epicOption text-base p-2 my-3"
                    id="homeButton"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    leftIcon={
                        <FaHouse className="w-6 h-6 flex-shrink-0 text-white" />
                    }
                    onClick={() => navigate('/tasks')}
                >
                    <span
                        className={`font-medium transition-all duration-300 ${
                            isCollapsed
                                ? 'opacity-0 w-0 overflow-hidden'
                                : 'opacity-100 w-auto'
                        }`}
                    >
                        Дашборд
                    </span>
                </Button>
            </nav>
            <nav className="border-t border-gray-700 flex flex-col items-start">
                {Object.keys(epicToIcon).map((epic) => (
                    <Button
                        className={
                            'epicOption text-base h-10 my-3 p-2 ' +
                            (epics.includes(epic)
                                ? 'selected'
                                : 'grey-text text-darken-3') +
                            (isCollapsed ? ' w-14' : '')
                        }
                        id={'epic' + epic}
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        value={epic}
                        style={{
                            color: `${epicToColor[epic]}1)`,
                        }}
                        onClick={epicsChanging}
                    >
                        {epic === 'Flow' ? (
                            <i
                                className="epicIcon val-font gradient-font"
                                id={'epic' + epic + 'Icon'}
                            >
                                <span className="text-2xl leading-6 font-normal">
                                    {isCollapsed ? 'F' : 'FLOW'}
                                </span>
                            </i>
                        ) : ['МегаФон', 'РУДН', 'ФК_Краснодар'].includes(
                              epic
                          ) ? (
                            <>
                                <img
                                    className="epicIcon size-6"
                                    id={'epic' + epic + 'Icon'}
                                    src={`..\\img\\${epicToIcon[epic]}.png`}
                                    alt={epic}
                                />
                                <span
                                    className={`hidden sm:inline transition-all duration-300 ${
                                        isCollapsed
                                            ? 'overflow-hidden opacity-0 w-0'
                                            : 'opacity-100 ml-2 w-auto'
                                    }`}
                                >
                                    {epic.replace('_', ' ')}
                                </span>
                            </>
                        ) : (
                            <>
                                {epicToIcon[epic]}
                                <span
                                    className={`hidden sm:inline transition-all duration-300 ${
                                        isCollapsed
                                            ? 'overflow-hidden opacity-0 w-0'
                                            : 'opacity-100 ml-2'
                                    }`}
                                >
                                    {epic.replace('_', ' ')}
                                </span>
                            </>
                        )}
                    </Button>
                ))}
            </nav>
            <nav className="border-t border-gray-700">
                <Button
                    className="epicOption text-base p-2 my-3 flex items-start"
                    id="homeButton"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    leftIcon={
                        <FaRightFromBracket className="w-6 h-6 flex-shrink-0 text-white" />
                    }
                    onClick={handleLogout}
                >
                    <span
                        className={`font-medium transition-all duration-300 ${
                            isCollapsed
                                ? 'opacity-0 w-0 overflow-hidden'
                                : 'opacity-100 w-auto'
                        }`}
                    >
                        Выйти
                    </span>
                </Button>
            </nav>
        </div>
    );
};
