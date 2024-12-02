import { FolioEntry } from "../models/FolioEntry";
import { UserTransaction } from "../models/UserTransaction";
import { getTransactionList } from "./transactionService";
import { fetchCoinDataByCoinsList } from "./coinService";
import { CoinsMarkets } from "../models/CoinsMarkets";
import { SQLiteDatabase } from "expo-sqlite";
import { Image } from 'expo-image';

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
            function adjustColor(color: string): string {
                // Parse the HSL color
                const hsl = RegExp(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/).exec(color);
                if (!hsl) return color; // Return the original color if it's not in HSL format

                let [hue, saturation, lightness] = hsl.slice(1).map(Number);

                // Adjust the lightness and saturation if the color is dark
                if (lightness < 30) {
                    lightness += 25; // Increase lightness
                    saturation += 10; // Increase saturation
                }

                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }

            const newQuantity = transaction.type === 'BUY' ? transaction.quantity : -transaction.quantity;
            if (newQuantity > 0) {
                folioEntries.push({
                    coinId: transaction.coinId,
                    quantity: newQuantity,
                    ticker: coinMarket ? coinMarket.symbol : "",
                    name: coinMarket ? coinMarket.name : "",
                    image: coinMarket ? coinMarket.image : "",
                    color: coinMarket ? adjustColor(coinMarket.color) : "hsl(0, 0%, 50%)",
                    currentPrice: coinMarket ? coinMarket.current_price : 0,
                    priceChange24h: coinMarket ? coinMarket.price_change_24h : 0,
                    priceChangePercentage24h: coinMarket ? coinMarket.price_change_percentage_24h : 0,
                    ranking: coinMarket ? coinMarket.market_cap_rank : 0,
                    marketCap: coinMarket ? coinMarket.market_cap : 0,
                    fullyDilutedValuation: coinMarket ? coinMarket.fully_diluted_valuation : 0,
                    totalVolume: coinMarket ? coinMarket.total_volume : 0,
                    high24h: coinMarket ? coinMarket.high_24h : 0,
                    low24h: coinMarket ? coinMarket.low_24h : 0,
                    circulatingSupply: coinMarket ? coinMarket.circulating_supply : 0,
                    totalSupply: coinMarket ? coinMarket.total_supply : 0,
                    maxSupply: coinMarket ? coinMarket.max_supply : 0,
                    ath: coinMarket ? coinMarket.ath : 0,
                    athChangePercentage: coinMarket ? coinMarket.ath_change_percentage : 0,
                    athDate: coinMarket ? coinMarket.ath_date : "",
                    atl: coinMarket ? coinMarket.atl : 0,
                    atlChangePercentage: coinMarket ? coinMarket.atl_change_percentage : 0,
                    atlDate: coinMarket ? coinMarket.atl_date : "",
                });
                //Prefetch the images for the folio entries to improve the performance
                folioEntries.forEach(async (folioEntry) => {
                    // Prefetch the image
                    Image.prefetch(folioEntry.image, 'memory-disk');
                });
            }
        }
    });

    return folioEntries;
}