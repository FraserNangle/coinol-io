import { Folio } from "./Folio";

export type FolioEntry = {
    folio: Folio;
    coinId: string;
    ticker: string;
    name: string;
    image: string;
    color: string;
    currentPrice: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    quantity: number;
};

export interface SectionFolioEntry extends FolioEntry {
    startAngle: number;
    endAngle: number;
    accumulatedValue: number;
}