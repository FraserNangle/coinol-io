import { FolioEntry } from "../models/FolioEntry";

export const getFolioCoinImages = (folioId: string, folioEntries: FolioEntry[]) => {
    let folioCoinImages: string[] = [];

    folioEntries.forEach((folioEntry) => {
        if (folioEntry.folio.folioId === folioId) {
            folioCoinImages.push(folioEntry.image);
        }
    });

    return folioCoinImages.reverse();
};