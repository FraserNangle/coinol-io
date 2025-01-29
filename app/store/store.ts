import { configureStore } from '@reduxjs/toolkit';
import selectedSectionReducer from '../slices/selectedSectionSlice';
import totalPortfolioValueReducer from '../slices/totalPortfolioValueSlice';
import allFolioEntriesReducer from '../slices/folioEntriesSlice';
import allCoinDataReducer from '../slices/allCoinDataSlice';
import lastTransactionReducer from '../slices/lastTransactionSlice';
import allTransactionsReducer from '../slices/allTransactionsSlice';
import currencyTypeReducer from '../slices/currencyTypeSlice';
import foliosReducer from "../slices/foliosSlice";
import currentlySelectedFolioReducer from "../slices/currentlySelectedFolioSlice";

const store = configureStore({
    reducer: {
        selectedSection: selectedSectionReducer,
        lastTransaction: lastTransactionReducer,
        allTransactions: allTransactionsReducer,
        totalPortfolioValue: totalPortfolioValueReducer,
        folioEntries: allFolioEntriesReducer,
        allCoinData: allCoinDataReducer,
        currencyType: currencyTypeReducer,
        folios: foliosReducer,
        currentlySelectedFolio: currentlySelectedFolioReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;