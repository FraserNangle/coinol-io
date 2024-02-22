import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../slices/exampleSlice';
import selectedSectionReducer from '../slices/selectedSectionSlice';

const store = configureStore({
    reducer: {
        counter: counterReducer,
        selectedSlice: selectedSectionReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;