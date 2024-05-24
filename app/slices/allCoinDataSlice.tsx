import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coin } from "../models/Coin";

interface AllCoinDataSliceState {
    allCoinData: Coin[] | null;
}

const initialState: AllCoinDataSliceState = {
    allCoinData: null,
};

const allCoinDataSlice = createSlice({
    name: "allCoinData",
    initialState,
    reducers: {
        setAllCoinData: (state, action: PayloadAction<Coin[] | null>) => {
            state.allCoinData = action.payload;
        },
    },
});

export const { setAllCoinData } = allCoinDataSlice.actions;

export default allCoinDataSlice.reducer;