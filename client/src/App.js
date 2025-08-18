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

export const EpicsContext = createContext(null);

function App() {
    const { token, login, logout, userId, ready } = useAuth();
    const [epics, setEpics] = useState(Object.keys(epicToIcon));
    const isAuthenticated = !!token;
    const routes = useRoutes(isAuthenticated);

    if (!ready) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider
            value={{ token, login, logout, userId, isAuthenticated }}
        >
            <ChakraProvider value={defaultSystem}>
                <SideBarProvider>
                    <EpicsContext.Provider value={[epics, setEpics]}>
                        <Router>
                            {isAuthenticated && <SideBar />}
                            <MainContent>{routes}</MainContent>
                        </Router>
                    </EpicsContext.Provider>
                </SideBarProvider>
            </ChakraProvider>
        </AuthContext.Provider>
    );
}

export default App;
