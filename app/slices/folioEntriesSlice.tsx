import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FolioEntry } from "../models/FolioEntry";

interface AllFolioEntriesSliceState {
    allFolioEntries: FolioEntry[];
    currentFolioEntries: FolioEntry[];
}

const initialState: AllFolioEntriesSliceState = {
    allFolioEntries: [],
    currentFolioEntries: []
};

const allFolioEntriesSlice = createSlice({
    name: "allFolioEntries",
    initialState,
    reducers: {
        setAllFolioEntries: (state, action: PayloadAction<FolioEntry[]>) => {
            state.allFolioEntries = action.payload;
        },
        setCurrentFolioEntries: (state, action: PayloadAction<FolioEntry[]>) => {
            state.currentFolioEntries = action.payload;
        },
    },
});

export const { setAllFolioEntries, setCurrentFolioEntries } = allFolioEntriesSlice.actions;

export default allFolioEntriesSlice.reducer;