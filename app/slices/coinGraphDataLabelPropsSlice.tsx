import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DataPointLabelProps {
    x: number,
    y: number,
    width: number,
    height: number,
    pageX: number,
    pageY: number,
    value: number,
    isMax: boolean,
    xAdjustment: number,
}

interface CoinGraphDataLabelPropsSliceState {
    coinGraphDataLabelProps: DataPointLabelProps | null;
}

const initialState: CoinGraphDataLabelPropsSliceState = {
    coinGraphDataLabelProps: null,
};

const coinGraphDataLabelPropsSlice = createSlice({
    name: "coinGraphDataLabelProps",
    initialState,
    reducers: {
        setCoinGraphDataLabelProps: (state, action: PayloadAction<DataPointLabelProps | null>) => {
            state.coinGraphDataLabelProps = action.payload;
        },
    },
});

export const { setCoinGraphDataLabelProps } = coinGraphDataLabelPropsSlice.actions;

export default coinGraphDataLabelPropsSlice.reducer;