import { Middleware } from "@reduxjs/toolkit";

export const localStorageAuthMiddleware: Middleware = () => (next) => (action) => {
    switch (action.type) {
        case 'login/fulfilled': {
            const { access_token } = action.payload
            localStorage.setItem('access_token', access_token)
            break
        }
        case 'user/clearState': {
            localStorage.removeItem('access_token')
            break
        }
    }
    return next(action)
}