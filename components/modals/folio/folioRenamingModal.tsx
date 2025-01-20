import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { Button, Modal, Portal } from "react-native-paper";
import Toast from 'react-native-root-toast';
import { Folio } from "@/app/models/Folio";
import { SQLiteDatabase } from "expo-sqlite";
import { updateFolioName } from "@/app/services/folioService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { updateFolioNameReducer } from "@/app/slices/foliosSlice";

interface FolioRenamingModalProps {
    db: SQLiteDatabase;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    folioToRename?: Folio;
}

export default function FolioRenamingModal({ db, visible, setVisible, folioToRename }: FolioRenamingModalProps) {
    const dispatch = useDispatch();

    const [name, setName] = useState('');

    const hideModal = () => setVisible(false);

    const handleNameInputChange = (text: string) => {
        setName(text);
    };

    const renameFolio = (db: SQLiteDatabase, folio: Folio) => {
        updateFolioName(db, folio.folioId, name)
            .then(() => {
                dispatch(updateFolioNameReducer({ folioId: folio.folioId, newFolioName: name }));
                Toast.show(`Renamed "${folio.folioName}" to "${name}".`, {
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

    useEffect(() => {
        if (folioToRename) {
            setName(folioToRename.folioName);
        }
    }, [folioToRename]);

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Rename {folioToRename?.folioName}</Text>
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
                                value={name}
                                multiline={false}
                                numberOfLines={1}
                                placeholder="Enter a new name for your folio"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
                            Toast.show(`Please choose a name for "${folioToRename?.folioName}". `, {
                                backgroundColor: "hsl(0, 0%, 15%)",
                                duration: Toast.durations.LONG,
                            });
                            return;
                        }
                        if (folioToRename) {
                            renameFolio(db, folioToRename);
                        } else {
                            Toast.show(`Folio to rename is not selected.`, {
                                backgroundColor: "hsl(0, 0%, 15%)",
                                duration: Toast.durations.LONG,
                            });
                        }
                    }}>
                    RENAME
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