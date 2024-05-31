import { createSlice } from "@reduxjs/toolkit";
import { UserTransaction } from "../models/UserTransaction";

interface LastTransactionState {
  transactionId: string | null;
}

const initialState: LastTransactionState = {
  transactionId: null,
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
