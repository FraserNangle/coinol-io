import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Folio } from "../models/Folio";

interface FoliosSliceState {
    folios: Folio[] | null;
}

const initialState: FoliosSliceState = {
    folios: null,
};

const foliosSlice = createSlice({
    name: "folios",
    initialState,
    reducers: {
        setFolios: (state, action: PayloadAction<Folio[] | null>) => {
            state.folios = action.payload;
        },
        addFolioToSlice(state, action: PayloadAction<Folio>) {
            state?.folios?.push(action.payload);
        },
        deleteFolioFromSliceById: (state, action: PayloadAction<string>) => {
            const folioId = action.payload;
            state.folios = state.folios?.filter(folio => folio.folioId !== folioId) || null;
        },
        setFavoriteFolioReducer: (state, action: PayloadAction<string>) => {
            const folioId = action.payload;
            state.folios?.forEach(folio => {
                folio.isFavorite = folio.folioId === folioId ? 1 : 0;
            });
        },
        updateFolioNameReducer: (state, action: PayloadAction<{ folioId: string, newFolioName: string }>) => {
            const { folioId, newFolioName } = action.payload;
            state.folios?.forEach(folio => {
                if (folio.folioId === folioId) {
                    folio.folioName = newFolioName;
                }
            });
        }
    },
});

export const { setFolios, addFolioToSlice, deleteFolioFromSliceById, setFavoriteFolioReducer, updateFolioNameReducer } = foliosSlice.actions;

export default foliosSlice.reducer;