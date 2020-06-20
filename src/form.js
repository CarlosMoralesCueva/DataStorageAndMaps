import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const FormScreen = ({ navigation }) => {
    const [todos, setTodos] = useState([]);
    useEffect(() => {
        AsyncStorage.getItem('todos')
            .then(response => {
                if (response !== null) {
                    setTodos(JSON.parse(response));
                }
            })
            .catch(error => { });
    }, []);

    const [newTodo, setNewTodo] = useState('');

    const saveTodo = () => {
        if (newTodo !== '') {
            const jsonValue = JSON.stringify([
                ...todos,
                { name: newTodo, done: false },
            ]);
            AsyncStorage.setItem('todos', jsonValue).then(() =>
                navigation.navigate('List'),
            );
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nombre de la tarea"
                onChangeText={name => setNewTodo(name)}
                value={newTodo}
            />
            <Button title="Guardar" onPress={saveTodo} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        marginHorizontal: 40,
    },
    input: {
        borderWidth: 1,
        borderRadius: 3,
        borderColor: 'lightgrey',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginBottom: 40,
    },
});

export default FormScreen;