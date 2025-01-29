import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserTransaction } from "@/app/models/UserTransaction";

interface AllTransactionsState {
  transactions: UserTransaction[];
}

const initialState: AllTransactionsState = {
  transactions: [],
};

const allTransactionsSlice = createSlice({
  name: "allTransactions",
  initialState,
  reducers: {
    setAllTransactions: (state, action: PayloadAction<UserTransaction[] | []>) => {
      state.transactions = action.payload;
    },
    addTransactionSlice: (state, action: PayloadAction<UserTransaction>) => {
      state.transactions.push(action.payload);
    },
    deleteTransactionByIdSlice: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((transaction) => transaction.id !== action.payload);
    }
  },
});

export const { setAllTransactions, addTransactionSlice, deleteTransactionByIdSlice } = allTransactionsSlice.actions;

export default allTransactionsSlice.reducer;
