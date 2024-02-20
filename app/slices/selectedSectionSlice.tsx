import { createSlice } from "@reduxjs/toolkit";

interface SelectedSliceState {
  value: string | null;
}

const initialState: SelectedSliceState = {
  value: null,
};

const selectedSectionSlice = createSlice({
  name: "selectedSection",
  initialState,
  reducers: {
    setSelectedSection: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setSelectedSection } = selectedSectionSlice.actions;

export default selectedSectionSlice.reducer;
