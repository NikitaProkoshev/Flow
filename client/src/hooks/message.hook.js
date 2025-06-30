import {useCallback} from 'react'

export const useMessage = () => {
    return useCallback((text, classes = '') => {
        if (window.M && text) {
            window.M.toast({ html: text, classes: classes })
        }
    }, [])
}