import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export function convertToCurrencyFormat(value: number) {
    let currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
    }).format(value);
}