import { createSlice } from "@reduxjs/toolkit";
import { SectionFolioEntry } from "../models/FolioEntry";

interface SelectedSectionState {
  section: { details: SectionFolioEntry | undefined, index: number | null } | undefined;
}

const initialState: SelectedSectionState = {
  section: undefined,
};

const selectedSectionSlice = createSlice({
  name: "selectedSection",
  initialState,
  reducers: {
    setSelectedSection: (state, action) => {
      state.section = action.payload;
    },
  },
});

export const { setSelectedSection } = selectedSectionSlice.actions;

export default selectedSectionSlice.reducer;
