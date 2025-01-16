import { Folio } from "./Folio";
import { UserTransaction } from "./UserTransaction";

export type UserData = {
    transactions: UserTransaction[];
    folios: Folio[];
};
