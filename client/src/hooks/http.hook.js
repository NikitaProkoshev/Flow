import {useState, useCallback} from 'react'

export const useHttp = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const request = useCallback(async (url, method = 'GET', body = null, headers={}) => {
        setLoading(true)

        try {
            console.log(body);
            if (body) {
                body = JSON.stringify(body);
                console.log(body);
                headers['Content-Type'] = 'application/json';
            }

            console.log(url);
            console.log({method, body, headers});

            const response = await fetch(url, {method, body, headers})
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message  || 'Что-то пошло не так!')
            }

            setLoading(false)

            return data
        } catch (e) {
            setLoading(false)
            setError(e.message)
            throw e
        }

    }, [])

    const clearError = useCallback( () => {setError(null)}, [])

    return {loading, request, error, clearError}
}