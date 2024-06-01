import { createSlice } from "@reduxjs/toolkit";

interface LastTransactionState {
  transactionId: string | null;
}

const initialState: LastTransactionState = {
  transactionId: "",
};

const lastTransactionSlice = createSlice({
  name: "lastTransaction",
  initialState,
  reducers: {
    setLastTransaction: (state, action) => {
      state.transactionId = action.payload;
    },
  },
});

export const { setLastTransaction } = lastTransactionSlice.actions;

export default lastTransactionSlice.reducer;
