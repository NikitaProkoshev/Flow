import { React, useState, createContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useRoutes } from './routes';
import { useAuth } from './hooks/auth.hook';
import { AuthContext } from './context/AuthContext';
import { SideBar } from './components/SideBar';
import { MainContent } from './components/MainContent';
import { SideBarProvider } from './context/SideBarContext';
import { Loader } from './components/Loader';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { epicToIcon } from './methods';
import { system } from './theme';
import { Toaster, toaster } from './components/ui/toaster';

export const EpicsContext = createContext(null);
document.documentElement.style.setProperty('--fc-today-bg-color', 'rgba(22,22,22)');
document.documentElement.style.setProperty('--epicsCount', Object.keys(epicToIcon).length);
document.documentElement.style.setProperty('--tasksLength', Math.round((Object.keys(epicToIcon).length / 10) * 6));
document.documentElement.style.setProperty('--otherLength', Math.round(Object.keys(epicToIcon).length - (Object.keys(epicToIcon).length / 10) * 6));

function App() {
    const { token, login, logout, userId, ready } = useAuth();
    const [epics, setEpics] = useState(Object.keys(epicToIcon));
    const isAuthenticated = !!token;
    const routes = useRoutes(isAuthenticated);

    if (!ready) {
        return <Loader />;
    }

    function disablecontext(e) {
        var clickedEl = (e==null) ? e.srcElement.tagName : e.target.tagName;
        if (clickedEl == "IMG") return false
    }
    document.oncontextmenu = disablecontext;

    return (
        <AuthContext.Provider value={{ token, login, logout, userId, isAuthenticated }}>
            <ChakraProvider value={system}>
                <SideBarProvider>
                    <EpicsContext.Provider value={[epics, setEpics]}>
                        <Router>
                            {isAuthenticated && <SideBar />}
                            <MainContent>{routes}</MainContent>
                            <Toaster />
                        </Router>
                    </EpicsContext.Provider>
                </SideBarProvider>
            </ChakraProvider>
        </AuthContext.Provider>
    );
}

export default App;
