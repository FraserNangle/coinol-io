import * as React from "react";
import { DataTable, PaperProvider } from "react-native-paper";
import { Coin } from "../models/coinData";

interface FolioTableProps {
  data: Coin[];
}

export const FolioTable: React.FC<FolioTableProps> = ({ data }) => {
  return (
    <PaperProvider>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Token</DataTable.Title>
          <DataTable.Title numeric>Quantity</DataTable.Title>
          <DataTable.Title numeric>Price (USD)</DataTable.Title>
        </DataTable.Header>

        {data.map((item) => (
          <DataTable.Row key={item.key}>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
            <DataTable.Cell numeric>{item.price}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </PaperProvider>
  );
};
