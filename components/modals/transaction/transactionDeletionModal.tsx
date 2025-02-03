import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Modal, Portal } from "react-native-paper";
import Toast from 'react-native-root-toast';
import { SQLiteDatabase } from "expo-sqlite";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { UserTransaction } from "@/app/models/UserTransaction";
import { deleteTransactionById, deleteTransactionsByCoinId } from "@/app/services/transactionService";
import { deleteTransactionByIdSlice, deleteTransactionsByCoinIdSlice } from "@/app/slices/allTransactionsSlice";

interface TransactionDeletionModalProps {
    db: SQLiteDatabase;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    transactionToDelete?: UserTransaction;
    deleteAllTransactions: boolean;
}

export default function TransactionDeletionModal({ db, visible, setVisible, transactionToDelete, deleteAllTransactions }: TransactionDeletionModalProps) {
    const [isDeletionLoading, setIsDeletionLoading] = useState(false);
    const dispatch = useDispatch();

    const hideModal = () => setVisible(false);

    const deleteTransaction = (db: SQLiteDatabase, transaction: UserTransaction) => {
        setIsDeletionLoading(true);
        if (!deleteAllTransactions) {
            deleteTransactionById(db, transaction.id)
                .then(() => {
                    dispatch(deleteTransactionByIdSlice(transaction.id));
                    Toast.show(`Transaction Deleted.`, {
                        backgroundColor: "hsl(0, 0%, 15%)",
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                    });
                    hideModal();
                    setIsDeletionLoading(false);
                })
                .catch(error => {
                    console.error('Error:', error);
                    setIsDeletionLoading(false);
                });
        } else {
            console.log('Deleting all transactions for coin:', transaction.coinId);
            deleteTransactionsByCoinId(db, transaction.coinId)
                .then(() => {
                    dispatch(deleteTransactionsByCoinIdSlice(transaction.coinId));
                    Toast.show(`All ${transaction.coinId} transactions Deleted.`, {
                        backgroundColor: "hsl(0, 0%, 15%)",
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                    });
                    hideModal();
                    setIsDeletionLoading(false);
                })
                .catch(error => {
                    console.error('Error:', error);
                    setIsDeletionLoading(false);
                });
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>{deleteAllTransactions ? `Delete all ${transactionToDelete?.coinId} transactions?` : 'Delete this transaction?'}</Text>
                    <TouchableOpacity onPress={hideModal}>
                        <MaterialIcons color="white" name="cancel" size={20} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                    <Button
                        buttonColor="black"
                        textColor={"red"}
                        rippleColor="red"
                        style={styles.bigButton}
                        compact
                        mode="contained"
                        onPress={() => {
                            if (transactionToDelete) {
                                deleteTransaction(db, transactionToDelete);
                            } else {
                                Toast.show(`Transaction to delete is not selected.`, {
                                    backgroundColor: "hsl(0, 0%, 15%)",
                                    duration: Toast.durations.LONG,
                                });
                            }
                        }}>
                        {isDeletionLoading ? (
                            <ActivityIndicator size="small" color={"red"} />
                        ) : (
                            'DELETE'
                        )}
                    </Button>
                    <Button
                        buttonColor="black"
                        textColor={"white"}
                        rippleColor="white"
                        style={styles.bigButton}
                        compact
                        mode="contained"
                        onPress={() => {
                            hideModal();
                        }}>
                        CANCEL
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'black',
        padding: 20,
        margin: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    bigButton: {
        width: "46%",
        borderRadius: 5,
        borderWidth: 1,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
        marginTop: 10,
    },
});