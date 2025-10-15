import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { TasksPage } from './pages/TasksPage';
import { MainPage } from './pages/MainPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { HabitsPage } from './pages/HabitsPage';
import { ArchivePage } from './pages/ArchivePage';

export const useRoutes = (isAuthenticated) => {
    if (isAuthenticated) {
        return (<Routes>
            <Route path="/" exact element={<MainPage />} />
            <Route path="/dashboard" exact element={<DashboardPage />} />
            <Route path="/templates" exact element={<TemplatesPage />} />
            <Route path="/tasks" exact element={<TasksPage />} />
            <Route path="/habits" exact element={<HabitsPage />} />
            <Route path="/archive" exact element={<ArchivePage />} />
            <Route path="*" exact element={<Navigate to="/" />} />
        </Routes>);
    }

    return (<Routes>
        <Route path="/" exact element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>)
};
