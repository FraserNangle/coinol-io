import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { Button, Modal, Portal } from "react-native-paper";
import { randomUUID } from "expo-crypto";
import Toast from 'react-native-root-toast';
import { Folio } from "@/app/models/Folio";
import { SQLiteDatabase } from "expo-sqlite";
import { addNewFolio } from "@/app/services/folioService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { addFolioToSlice } from "@/app/slices/foliosSlice";
import { setCurrentlySelectedFolio } from "@/app/slices/currentlySelectedFolioSlice";

interface FolioCreationModalProps {
    db: SQLiteDatabase;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onNewFolio: (folio: Folio) => void;
}

export default function FolioCreationModal({ db, visible, setVisible, onNewFolio }: FolioCreationModalProps) {
    const dispatch = useDispatch();

    const [name, setName] = useState('');

    const hideModal = () => setVisible(false);

    const handleNameInputChange = (text: string) => {
        setName(text);
    };

    const addFolio = (db: SQLiteDatabase, folio: Folio) => {
        addNewFolio(db, folio)
            .then(() => {
                dispatch(addFolioToSlice(folio));
                Toast.show(`Added new folio "${folio.folioName}" to your folios.`, {
                    backgroundColor: "hsl(0, 0%, 15%)",
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                });
                dispatch(setCurrentlySelectedFolio(folio));
                onNewFolio(folio);
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
                    <Text style={{ fontWeight: 'bold' }}>Create New Folio</Text>
                    <TouchableOpacity onPress={hideModal}>
                        <MaterialIcons color="white" name="cancel" size={20} />
                    </TouchableOpacity>
                </View>
                <View style={styles.modalRowContainer}>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalTag}>Name</Text>
                        <View style={styles.modalInputContainer}>
                            <TextInput
                                style={styles.textInput}
                                multiline={false}
                                numberOfLines={1}
                                keyboardType='default'
                                onChangeText={handleNameInputChange}
                                selectionColor={"rgba(255, 255, 255, 0.5)"}
                                cursorColor="white"
                                maxLength={20}
                                textAlign="right" />
                        </View>
                    </View>
                </View>
                <Button
                    buttonColor="black"
                    textColor={"white"}
                    rippleColor="white"
                    style={styles.bigButton}
                    compact
                    mode="contained"
                    onPress={() => {
                        if (name.length === 0) {
                            Toast.show(`Please choose a name for your new folio. `, {
                                backgroundColor: "hsl(0, 0%, 15%)",
                                duration: Toast.durations.LONG,
                            });
                            return;
                        }

                        const newFolio: Folio = {
                            folioId: randomUUID(),
                            folioName: name,
                        };
                        addFolio(db, newFolio);
                    }}>
                    CREATE NEW FOLIO
                </Button>
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
    modalRowContainer: {
        width: "100%",
        borderRadius: 5,
        padding: 5,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    modalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 40,
        padding: 10,
    },
    modalTag: {
        paddingRight: 10
    },
    modalInputContainer: {
        position: "relative",
        flex: 1,
        justifyContent: "flex-end",
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        width: "80%",
        color: 'white',
    },
    bigButton: {
        width: "100%",
        borderRadius: 5,
        borderWidth: 1,
        borderBottomWidth: 5,
        borderColor: "rgba(255, 255, 255, .3)",
        marginTop: 10,
    },
});