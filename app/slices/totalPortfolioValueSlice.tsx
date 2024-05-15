import { createSlice } from "@reduxjs/toolkit";

interface TotalPortfolioValueSliceState {
    value: string | null;
}

const initialState: TotalPortfolioValueSliceState = {
    value: null,
};

const totalPortfolioValueSlice = createSlice({
    name: "totalPortfolioValue",
    initialState,
    reducers: {
        setTotalPortfolioValue: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { setTotalPortfolioValue } = totalPortfolioValueSlice.actions;

export default totalPortfolioValueSlice.reducer;
