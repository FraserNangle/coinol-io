import { FolioEntry } from "../models/FolioEntry";
import { UserTransaction } from "../models/UserTransaction";
import { getTransactionList } from "./transactionService";
import { fetchCoinDataByCoinsList } from "./coinService";
import { CoinsMarkets } from "../models/CoinsMarkets";

export async function fetchUserFolio() {
    const transactionList: UserTransaction[] = await getTransactionList();

    // Send the unique coinIds from the transactionList to the backend to get the complex data of each coin
    const uniqueCoinIds = [...new Set(transactionList.map((transaction) => transaction.id))];

    let coinsMarketsList: CoinsMarkets[] = [];

    await fetchCoinDataByCoinsList(uniqueCoinIds).then((data) => {
        coinsMarketsList = data;
    });

    // populate the folio entries based on the transactionList and the coinsMarketsList
    const folioEntries: FolioEntry[] = [];
    transactionList.forEach((transaction) => {
        const existingEntry = folioEntries.find((entry) => entry.id === transaction.id);
        const coinMarket = coinsMarketsList.find((coinMarket) => coinMarket.id === transaction.id);

        if (existingEntry) {
            if (transaction.type === 'BUY') {
                existingEntry.quantity += transaction.quantity;
            } else if (transaction.type === 'SELL') {
                existingEntry.quantity -= transaction.quantity;
            }
        } else {
            const newQuantity = transaction.type === 'BUY' ? transaction.quantity : -transaction.quantity;
            if (newQuantity > 0) {
                folioEntries.push({
                    id: transaction.id,
                    quantity: newQuantity,
                    ticker: coinMarket ? coinMarket.symbol : "",
                    name: coinMarket ? coinMarket.name : "",
                    currentPrice: coinMarket ? coinMarket.current_price : 0,
                    priceChangePercentage24h: coinMarket ? coinMarket.price_change_percentage_24h : 0,
                    ranking: coinMarket ? coinMarket.market_cap_rank : 0
                });
            }
        }
    });

    return folioEntries;
}