import { Middleware } from "@reduxjs/toolkit";

export const loginMiddleware: Middleware = (store) => (next) => (action) => {
    return next(action)
}