import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserTransaction } from "@/app/models/UserTransaction";

interface LastTransactionState {
  transaction: UserTransaction | null;
}

const initialState: LastTransactionState = {
  transaction: null,
};

const lastTransactionSlice = createSlice({
  name: "lastTransaction",
  initialState,
  reducers: {
    setLastTransaction: (state, action: PayloadAction<UserTransaction | null>) => {
      state.transaction = action.payload;
    },
  },
});

export const { setLastTransaction } = lastTransactionSlice.actions;

export default lastTransactionSlice.reducer;
