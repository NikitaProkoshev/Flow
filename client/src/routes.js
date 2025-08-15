import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { TasksPage } from './pages/TasksPage';
import { DetailPage } from './pages/DetailPage';
import { AuthPage } from './pages/AuthPage';

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/tasks" exact element={<TasksPage />} />
                <Route path="/detail/:id" exact element={<DetailPage />} />
                <Route path="*" exact element={<Navigate to="/tasks" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" exact element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
