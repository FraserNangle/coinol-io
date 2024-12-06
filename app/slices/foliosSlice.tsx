import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Folio } from "../models/Folio";

interface FoliosSliceState {
    folios: Folio[] | null;
}

const initialState: FoliosSliceState = {
    folios: null,
};

const foliosSlice = createSlice({
    name: "folios",
    initialState,
    reducers: {
        setFolios: (state, action: PayloadAction<Folio[] | null>) => {
            state.folios = action.payload;
        },
        addFolioToSlice(state, action: PayloadAction<Folio>) {
            state?.folios?.push(action.payload);
        },
    },
});

export const { setFolios, addFolioToSlice } = foliosSlice.actions;

export default foliosSlice.reducer;