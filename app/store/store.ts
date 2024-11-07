import { configureStore } from '@reduxjs/toolkit';
import selectedSectionReducer from '../slices/selectedSectionSlice';
import totalPortfolioValueReducer from '../slices/totalPortfolioValueSlice';
import userFolioReducer from '../slices/userFolioSlice';
import allCoinDataReducer from '../slices/allCoinDataSlice';
import lastTransactionReducer from '../slices/lastTransactionSlice';
import currencyTypeReducer from '../slices/currencyTypeSlice';
import refreshReducer from "../slices/refreshSlice";

const store = configureStore({
    reducer: {
        selectedSection: selectedSectionReducer,
        lastTransaction: lastTransactionReducer,
        totalPortfolioValue: totalPortfolioValueReducer,
        userFolio: userFolioReducer,
        allCoinData: allCoinDataReducer,
        currencyType: currencyTypeReducer,
        refresh: refreshReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;