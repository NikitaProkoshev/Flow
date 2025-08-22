import {useState, useCallback} from 'react';
import { toaster } from '../components/ui/toaster';

export const useHttp = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const request = useCallback(async (url, method = 'GET', body = null, headers={}) => {
        setLoading(true)
        try {
            console.log(body);
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            console.log(body);
            console.log(url, {method, body, headers});

            const response = await fetch(url, {method, body, headers})
            console.log(response);
            const data = await response.json()
            console.log(data);
            
            if (!response.ok) throw new Error(data.message  || 'Что-то пошло не так!')
            setLoading(false)
            return data
        } catch (e) {
            toaster.create({ description: e.message , type: 'error' })
            setLoading(false)
            setError(e.message)
            throw e
        }

    }, [])

    const clearError = useCallback( () => {setError(null)}, [])

    return {loading, request, error, clearError}
}