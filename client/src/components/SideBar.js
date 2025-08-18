import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSideBar } from '../context/SideBarContext';
import { FaHouse, FaRightFromBracket } from 'react-icons/fa6';
import { Box, Button, Image, Text } from '@chakra-ui/react';
import { epicToIcon, epicToColor } from '../methods';
import { EpicsContext } from '../App';

export const SideBar = () => {
    const { isCollapsed, setIsCollapsed } = useSideBar();
    const [epics, setEpics] = useContext(EpicsContext);
    const navigate = useNavigate();
    // const location = useLocation();
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
        // <div
        //     ref={sidebarRef}
        //     className={`fixed m-4 rounded-2xl backdrop-blur-sm h-[calc(100%-1.5rem)] text-white transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-12' : 'w-44'}`}
        //     id="sideBar"
        // >
        <Box
            ref={sidebarRef}
            className={`text-white transition-all duration-300 ease-in-out z-50`}
            position="fixed" margin={4} borderRadius='2xl' backdropFilter="auto" backdropBlur="5px" height="calc(100% - 1.5rem)" width={isCollapsed ? 12 : 44}
            id="sideBar"
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                onClick={() => { if (!isMobile()) setIsCollapsed(!isCollapsed) }}
            >
                <Image w={8} h={8} id='Logo' src={`..\\img\\logo.png`} />
                {!isCollapsed && <i className="val-font gradient-font">
                    <Text fontSize='2xl' fontWeight="400" ml={2}>FLOW</Text>
                </i>}
            </Box>

            <nav className="border-t border-gray-700">
                <Button
                    className="epicOption text-base size-12 p-3 w-full justify-start"
                    id="homeButton"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => navigate('/tasks')}
                >
                    <FaHouse className="w-6 h-6 flex-shrink-0 text-white" />
                    <span className={`font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>Дашборд</span>
                </Button>
            </nav>
            <nav className="border-t border-gray-700 flex flex-col items-start">
                {Object.keys(epicToIcon).map((epic) => (
                    <Button
                        w={isCollapsed ? 12 : '100%'} h={12} p={3} justifyContent="start"
                        className={'epicOption text-base ' + (epics.includes(epic) ? 'selected grayscale-0' : 'grey-text text-darken-3 grayscale')}
                        id={'epic' + epic}
                        variant="ghost"
                        colorPalette="gray"
                        value={epic}
                        style={{ color: `${epicToColor[epic]}1)`}}
                        onClick={epicsChanging}
                    >
                        {['МегаФон', 'РУДН', 'ФК_Краснодар', 'Flow'].includes(epic)
                            ? <Image
                                w={6} h={6}
                                className="epicIcon"
                                id={`epic${epic}Icon`}
                                src={`..\\img\\${epicToIcon[epic]}.png`}
                                alt={epic}
                            />
                            : epicToIcon[epic]
                        }
                        <span
                            className={`hidden sm:inline transition-all duration-300 ${
                                isCollapsed
                                    ? 'overflow-hidden opacity-0 w-0'
                                    : 'opacity-100'
                            }`}
                        >{epic.replace('_', ' ')}</span>
                    </Button>
                ))}
            </nav>
            <nav className="absolute bottom-0 w-full border-t border-gray-700">
                <Button
                    className="epicOption text-base size-12 p-3 justify-start"
                    id="logOutButton"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={handleLogout}
                >
                    <FaRightFromBracket className="w-6 h-6 flex-shrink-0 text-white" />
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
        </Box>
    );
};
