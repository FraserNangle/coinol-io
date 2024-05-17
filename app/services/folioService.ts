import { FolioEntry } from "../models/FolioEntry";
import { folioEntryMock } from "../mocks/folioEntryMock";

export function fetchUserFolio() {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<FolioEntry[]>((resolve) => {
            setTimeout(() => {
                resolve(folioEntryMock);
            }, 1000); // Simulate a delay of 1 second
        });
    } else {
        // Fetch the data from backend in other environments
        // TODO: Replace this with our actual API call
        return fetch('/api/userHoldings').then(response => response.json());
    }
}