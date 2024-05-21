import { FolioEntry } from "../models/FolioEntry";
import { UserTransaction } from "../models/UserTransaction";
import { getTransactionList } from "./transactionService";
import { fetchCoinDataForCoinsList } from "./coinService";
import { CoinsMarkets } from "../models/CoinsMarkets";

export async function fetchUserFolio() {
    const transactionList: UserTransaction[] = await getTransactionList();

    // Send the unique coinIds from the transactionList to the backend to get the complex data of each coin
    const uniqueCoinIds = [...new Set(transactionList.map((transaction) => transaction.coinId))];
    const coinsMarketsList: CoinsMarkets[] = await fetchCoinDataForCoinsList(uniqueCoinIds);

    // populate the folio entries based on the transactionList and the coinsMarketsList
    const folioEntries: FolioEntry[] = [];
    transactionList.forEach((transaction) => {
        const existingEntry = folioEntries.find((entry) => entry.coinId === transaction.coinId);
        const coinMarket = coinsMarketsList.find((coinMarket) => coinMarket.id === transaction.coinId);

        if (existingEntry) {
            if (transaction.type === 'buy') {
                existingEntry.quantity += transaction.quantity;
            } else if (transaction.type === 'sell') {
                existingEntry.quantity -= transaction.quantity;
            }
        } else {
            folioEntries.push({
                coinId: transaction.coinId,
                quantity: transaction.type === 'buy' ? transaction.quantity : -transaction.quantity,
                ticker: coinMarket ? coinMarket.symbol : "",
                name: coinMarket ? coinMarket.name : "",
                currentPrice: coinMarket ? coinMarket.current_price : 0,
                price24h: coinMarket ? coinMarket.price_change_24h : 0,
                ranking: coinMarket ? coinMarket.market_cap_rank : 0
            });
        }
    });

    return folioEntries;
}