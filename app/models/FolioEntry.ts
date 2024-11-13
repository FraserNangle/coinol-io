export type FolioEntry = {
    coinId: string;
    ticker: string;
    name: string;
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
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
};

export interface SectionFolioEntry extends FolioEntry {
    startAngle: number;
    endAngle: number;
    accumulatedValue: number;
    color: string;
}