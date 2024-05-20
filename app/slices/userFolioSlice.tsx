import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FolioEntry } from "../models/FolioEntry";

interface UserFolioSliceState {
    userFolio: FolioEntry[] | null;
}

const initialState: UserFolioSliceState = {
    userFolio: null,
};

const userFolioSlice = createSlice({
    name: "userFolio",
    initialState,
    reducers: {
        setUserFolio: (state, action: PayloadAction<FolioEntry[] | null>) => {
            state.userFolio = action.payload;
        },
    },
});

export const { setUserFolio } = userFolioSlice.actions;

export default userFolioSlice.reducer;