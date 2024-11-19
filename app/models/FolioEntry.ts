export type FolioEntry = {
    coinId: string;
    ticker: string;
    name: string;
    image: string;
    color: string;
    currentPrice: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    ranking: number;
    quantity: number;
    marketCap: number;
    fullyDilutedValuation: number;
    totalVolume: number;
    high24h: number;
    low24h: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number;
    ath: number;
    athChangePercentage: number;
    athDate: string;
    atl: number;
    atlChangePercentage: number;
    atlDate: string;
};

export interface SectionFolioEntry extends FolioEntry {
    startAngle: number;
    endAngle: number;
    accumulatedValue: number;
}