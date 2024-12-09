import { createSlice } from "@reduxjs/toolkit";
import { Folio } from "../models/Folio";

interface CurrentlySelectedFolioState {
  currentfolio: Folio | undefined;
}

const initialState: CurrentlySelectedFolioState = {
  currentfolio: undefined,
};

const currentlySelectedFolioSlice = createSlice({
  name: "currentlySelectedFolio",
  initialState,
  reducers: {
    setCurrentlySelectedFolio: (state, action) => {
      state.currentfolio = action.payload;
    },
  },
});

export const { setCurrentlySelectedFolio } = currentlySelectedFolioSlice.actions;

export default currentlySelectedFolioSlice.reducer;
