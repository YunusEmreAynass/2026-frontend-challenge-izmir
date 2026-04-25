import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        // Diğer feature slicelar buraya eklenecek (örn: auth: authReducer)
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Performans veya bazı spesifik objeler (Date vb.) için
        }),
});
