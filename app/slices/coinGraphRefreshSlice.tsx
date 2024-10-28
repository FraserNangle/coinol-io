import { createSlice } from "@reduxjs/toolkit";

const coinGraphRefreshSlice = createSlice({
    name: "coinGraphRefresh",
    initialState: {
        refresh: false,
    },
    reducers: {
        triggerRefresh: (state) => {
            state.refresh = !state.refresh;
        },
    },
});

export const { triggerRefresh } = coinGraphRefreshSlice.actions;
export default coinGraphRefreshSlice.reducer;