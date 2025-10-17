import {useState, useCallback, useContext} from 'react';
import { toaster } from '../components/ui/toaster';
import { AuthContext } from '../context/AuthContext';

export const useHttp = () => {
    const { logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const request = useCallback(async (url, method = 'GET', body = null, headers={}) => {
        setLoading(true)
        try {
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {method, body, headers});
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message  || 'Что-то пошло не так!')
            setLoading(false)
            return data
        } catch (e) {
            if (e.message === 'Нет авторизации') logout();
            toaster.create({ description: e.message , type: 'error' })
            setLoading(false)
            setError(e.message)
            throw e
        }

    }, [])

    const clearError = useCallback( () => {setError(null)}, [])

    return {loading, request, error, clearError}
}