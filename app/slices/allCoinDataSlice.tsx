import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coin } from "../models/Coin";
import { CoinsMarkets } from "../models/CoinsMarkets";

interface AllCoinDataSliceState {
    allCoinData: Coin[] | null;
    coinsMarketsList: CoinsMarkets[] | [];
}

const initialState: AllCoinDataSliceState = {
    allCoinData: null,
    coinsMarketsList: [],
};

const allCoinDataSlice = createSlice({
    name: "allCoinData",
    initialState,
    reducers: {
        setAllCoinData: (state, action: PayloadAction<Coin[] | null>) => {
            state.allCoinData = action.payload;
        },
        setCoinsMarketsList: (state, action: PayloadAction<CoinsMarkets[]>) => {
            state.coinsMarketsList = action.payload;
        }
    },
});

export const { setAllCoinData, setCoinsMarketsList } = allCoinDataSlice.actions;

export default allCoinDataSlice.reducer;