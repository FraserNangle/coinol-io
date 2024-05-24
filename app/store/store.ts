import { configureStore } from '@reduxjs/toolkit';
import selectedSectionReducer from '../slices/selectedSectionSlice';
import totalPortfolioValueReducer from '../slices/totalPortfolioValueSlice';
import userFolioReducer from '../slices/userFolioSlice';
import allCoinDataReducer from '../slices/allCoinDataSlice';

const store = configureStore({
    reducer: {
        selectedSlice: selectedSectionReducer,
        totalPortfolioValue: totalPortfolioValueReducer,
        userFolio: userFolioReducer,
        allCoinData: allCoinDataReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;