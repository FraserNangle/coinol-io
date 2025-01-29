import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React from "react";
import { Button, Modal, Portal } from "react-native-paper";
import Toast from 'react-native-root-toast';
import { Folio } from "@/app/models/Folio";
import { SQLiteDatabase } from "expo-sqlite";
import { deleteFolioById } from "@/app/services/folioService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { deleteFolioFromSliceById } from "@/app/slices/foliosSlice";

interface FolioDeletionModalProps {
    db: SQLiteDatabase;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    folioToDelete?: Folio;
}

export default function FolioDeletionModal({ db, visible, setVisible, folioToDelete }: FolioDeletionModalProps) {
    const dispatch = useDispatch();

    const hideModal = () => setVisible(false);

    const deleteFolio = (db: SQLiteDatabase, folio: Folio) => {
        deleteFolioById(db, folio.folioId)
            .then(() => {
                dispatch(deleteFolioFromSliceById(folio.folioId));
                Toast.show(`Deleted "${folio.folioName}".`, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                });
                hideModal();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Delete {folioToDelete?.folioName}?</Text>
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
                            if (folioToDelete) {
                                deleteFolio(db, folioToDelete);
                            } else {
                                Toast.show(`Folio to delete is not selected.`, {
                                    backgroundColor: "hsl(0, 0%, 15%)",
                                    duration: Toast.durations.LONG,
                                });
                            }
                        }}>
                        DELETE
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