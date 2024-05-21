import { configureStore } from '@reduxjs/toolkit';
import selectedSectionReducer from '../slices/selectedSectionSlice';
import totalPortfolioValueReducer from '../slices/totalPortfolioValueSlice';
import userFolioReducer from '../slices/userFolioSlice';

const store = configureStore({
    reducer: {
        selectedSlice: selectedSectionReducer,
        totalPortfolioValue: totalPortfolioValueReducer,
        userFolio: userFolioReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;