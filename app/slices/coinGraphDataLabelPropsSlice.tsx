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
}

interface CoinGraphDataLabelPropsSliceState {
    coinGraphDataLabelPropsMax: DataPointLabelProps | null;
    coinGraphDataLabelPropsMin: DataPointLabelProps | null;
}

const initialState: CoinGraphDataLabelPropsSliceState = {
    coinGraphDataLabelPropsMax: null,
    coinGraphDataLabelPropsMin: null,
};

const coinGraphDataLabelPropsSlice = createSlice({
    name: "coinGraphDataLabelProps",
    initialState,
    reducers: {
        setCoinGraphDataLabelPropsMax: (state, action: PayloadAction<DataPointLabelProps | null>) => {
            state.coinGraphDataLabelPropsMax = action.payload;
        },
        setCoinGraphDataLabelPropsMin: (state, action: PayloadAction<DataPointLabelProps | null>) => {
            state.coinGraphDataLabelPropsMin = action.payload;
        },
    },
});

export const { setCoinGraphDataLabelPropsMax, setCoinGraphDataLabelPropsMin } = coinGraphDataLabelPropsSlice.actions;

export default coinGraphDataLabelPropsSlice.reducer;