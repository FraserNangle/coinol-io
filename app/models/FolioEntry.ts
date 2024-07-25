export type FolioEntry = {
    coinId: string;
    ticker: string;
    name: string;
    currentPrice: number;
    priceChangePercentage24h: number;
    ranking: number;
    quantity: number;
};

export interface SectionFolioEntry extends FolioEntry {
    startAngle: number;
    endAngle: number;
    accumulatedValue: number;
    color: string;
}