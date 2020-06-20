import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const ListScreen = ({ navigation }) => {
    const [initializing, setInitializing] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setInitializing(false);
        }, 3000);
    }, []);

    const [todos, setTodos] = useState([]);
    useEffect(() => {
        AsyncStorage.getItem('todos')
            .then(response => {
                if (response !== null) {
                    setTodos(JSON.parse(response));
                }
            })
            .catch(error => { });
    }, [todos]);

    if (initializing) {
        return <Text>Cargando...</Text>;
    }

    const data = todos.map((todo, index) => ({
        id: index.toString(),
        title: todo.name,
    }));

    function Item({ title }) {
        return (
            <View style={styles.item}>
                <Text style={styles.text}>☐ {title}</Text>
            </View>
        );
    }

    const list =
        todos.length === 0 ? null : (
            <FlatList
                data={data}
                renderItem={({ item }) => <Item title={item.title} />}
                keyExtractor={item => item.id}
            />
        );

    return (
        <View style={styles.container}>
            {list}
            <Button title="Agregar" onPress={() => navigation.navigate('Form')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 40,
        marginVertical: 30,
        alignContent: 'center',
        justifyContent: 'center',
    },
    item: {
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
    },
});

export default ListScreen;