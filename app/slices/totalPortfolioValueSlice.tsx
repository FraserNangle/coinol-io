import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TotalPortfolioValueSliceState {
    totalPortfolioValue: number | null;
    totalPortfolioValue24h: number | null;
}

const initialState: TotalPortfolioValueSliceState = {
    totalPortfolioValue: null,
    totalPortfolioValue24h: null,
};

const totalPortfolioValueSlice = createSlice({
    name: "totalPortfolioValue",
    initialState,
    reducers: {
        setTotalPortfolioValue: (state, action: PayloadAction<number | null>) => {
            state.totalPortfolioValue = action.payload;
        },
        setTotalPortfolioValue24h: (state, action: PayloadAction<number | null>) => {
            state.totalPortfolioValue24h = action.payload;
        },
    },
});

export const { setTotalPortfolioValue, setTotalPortfolioValue24h } = totalPortfolioValueSlice.actions;

export default totalPortfolioValueSlice.reducer;