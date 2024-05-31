import { createSlice } from "@reduxjs/toolkit";

interface SelectedSectionState {
  id: string | null;
}

const initialState: SelectedSectionState = {
  id: null,
};

const selectedSectionSlice = createSlice({
  name: "selectedSection",
  initialState,
  reducers: {
    setSelectedSection: (state, action) => {
      state.id = action.payload;
    },
  },
});

export const { setSelectedSection } = selectedSectionSlice.actions;

export default selectedSectionSlice.reducer;
