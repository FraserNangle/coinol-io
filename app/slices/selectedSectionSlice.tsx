import { DonutSection } from "@/components/index/donutChart/section";
import { createSlice } from "@reduxjs/toolkit";

interface SelectedSectionState {
  section: { details: DonutSection | undefined, index: number | null, color: string | undefined } | undefined;
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
