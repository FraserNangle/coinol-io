import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TotalPortfolioValueSliceState {
    totalPortfolioValue: number | null;
    totalPortfolioPercentageChange24hr: number | null;
}

const initialState: TotalPortfolioValueSliceState = {
    totalPortfolioValue: null,
    totalPortfolioPercentageChange24hr: null,
};

const totalPortfolioValueSlice = createSlice({
    name: "totalPortfolioValue",
    initialState,
    reducers: {
        setTotalPortfolioValue: (state, action: PayloadAction<number | null>) => {
            state.totalPortfolioValue = action.payload;
        },
        setTotalPortfolioPercentageChange24hr: (state, action: PayloadAction<number | null>) => {
            state.totalPortfolioPercentageChange24hr = action.payload;
        },
    },
});

export const { setTotalPortfolioValue, setTotalPortfolioPercentageChange24hr } = totalPortfolioValueSlice.actions;

export default totalPortfolioValueSlice.reducer;