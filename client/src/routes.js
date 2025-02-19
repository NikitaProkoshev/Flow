import React from "react";
import {Route, Navigate, Routes} from 'react-router-dom';
import {LinksPage} from "./pages/LinksPage";
import {DetailPage} from "./pages/DetailPage";
import {CreatePage} from "./pages/CreatePage";
import {AuthPage} from "./pages/AuthPage";

export const useRoutes = isAuthenticated => {
    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/links" exact element={<LinksPage />} />
                <Route path="/create" exact element={<CreatePage />} />
            <Route path="/detail/:id" exact element={<DetailPage />} />
                <Route path="*" exact element={<Navigate to="/create" />} />
            </Routes>
        )
    }

    return (
        <Routes>
            <Route path="/" exact element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}