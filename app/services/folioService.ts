import { FolioEntry } from "../models/FolioEntry";
import { UserTransaction } from "../models/UserTransaction";
import { getTransactionList } from "./transactionService";
import { fetchCoinDataByCoinsList } from "./coinService";
import { CoinsMarkets } from "../models/CoinsMarkets";
import { SQLiteDatabase } from "expo-sqlite";

export async function fetchUserFolio(db: SQLiteDatabase) {
    const transactionList: UserTransaction[] = await getTransactionList(db);

    // Send the unique coinIds from the transactionList to the backend to get the complex data of each coin
    const uniqueCoinIds = [...new Set(transactionList.map((transaction) => transaction.coinId))];

    let coinsMarketsList: CoinsMarkets[] = [];

    await fetchCoinDataByCoinsList(uniqueCoinIds).then((data) => {
        coinsMarketsList = data;
    });

    // populate the folio entries based on the transactionList and the coinsMarketsList
    const folioEntries: FolioEntry[] = [];
    transactionList.forEach((transaction) => {
        const existingEntry = folioEntries.find((entry) => entry.coinId === transaction.coinId);
        const coinMarket = coinsMarketsList.find((coinMarket) => coinMarket.id === transaction.coinId);

        if (existingEntry) {
            if (transaction.type === 'BUY') {
                existingEntry.quantity += transaction.quantity;
            } else if (transaction.type === 'SELL') {
                existingEntry.quantity -= transaction.quantity;
            }
            if (existingEntry.quantity <= 0) {
                folioEntries.splice(folioEntries.indexOf(existingEntry), 1);
            }
        } else {
            const newQuantity = transaction.type === 'BUY' ? transaction.quantity : -transaction.quantity;
            if (newQuantity > 0) {
                folioEntries.push({
                    coinId: transaction.coinId,
                    quantity: newQuantity,
                    ticker: coinMarket ? coinMarket.symbol : "",
                    name: coinMarket ? coinMarket.name : "",
                    currentPrice: coinMarket ? coinMarket.current_price : 0,
                    priceChange24h: coinMarket ? coinMarket.price_change_24h : 0,
                    priceChangePercentage24h: coinMarket ? coinMarket.price_change_percentage_24h : 0,
                    ranking: coinMarket ? coinMarket.market_cap_rank : 0,
                    marketCap: coinMarket ? coinMarket.market_cap : 0,
                    fullyDilutedValuation: coinMarket ? coinMarket.fully_diluted_valuation : 0,
                    totalVolume: coinMarket ? coinMarket.total_volume : 0,
                    high24h: coinMarket ? coinMarket.high_24h : 0,
                    low24h: coinMarket ? coinMarket.low_24h : 0,
                    circulating_supply: coinMarket ? coinMarket.circulating_supply : 0,
                    total_supply: coinMarket ? coinMarket.total_supply : 0,
                    max_supply: coinMarket ? coinMarket.max_supply : 0,
                    ath: coinMarket ? coinMarket.ath : 0,
                    ath_change_percentage: coinMarket ? coinMarket.ath_change_percentage : 0,
                    ath_date: coinMarket ? coinMarket.ath_date : "",
                    atl: coinMarket ? coinMarket.atl : 0,
                    atl_change_percentage: coinMarket ? coinMarket.atl_change_percentage : 0,
                    atl_date: coinMarket ? coinMarket.atl_date : "",
                });
            }
        }
    });

    return folioEntries;
}