import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CurrencyTypeSliceState {
    currencyType: string | null;
}

const initialState: CurrencyTypeSliceState = {
    currencyType: "USD",
};

const currencyTypeSlice = createSlice({
    name: "currencyType",
    initialState,
    reducers: {
        setCurrencyType: (state, action: PayloadAction<string | null>) => {
            state.currencyType = action.payload;
        },
    },
});

export const { setCurrencyType } = currencyTypeSlice.actions;

export default currencyTypeSlice.reducer;