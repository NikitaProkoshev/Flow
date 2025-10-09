import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { TasksPage } from './pages/TasksPage';
import { MainPage } from './pages/MainPage';
import { DetailPage } from './pages/DetailPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/" exact element={<MainPage />} />
                <Route path="/dashboard" exact element={<DashboardPage />} />
                <Route path="/today" exact element={<TasksPage period='today'/>} />
                <Route path="/week" exact element={<TasksPage period='week'/>} />
                <Route path="/month" exact element={<TasksPage period='month'/>} />
                <Route path="/detail/:id" exact element={<DetailPage />} />
                <Route path="*" exact element={<Navigate to="/" />} />
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
