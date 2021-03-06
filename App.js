import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//import { FormScreen, ListScreen } from './src';
import {
    // PermissionsAndroid,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    PermissionsAndroid,
    AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import mapbox from '@mapbox/mapbox-sdk';
import mapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import Geolocation from '@react-native-community/geolocation';
import MapboxGL from '@react-native-mapbox-gl/maps';

const mapboxClient = mapbox({
    accessToken:
        'pk.eyJ1IjoianNycyIsImEiOiJjazYyaWtwemIwZXg1M2xxb2dqOGM3amZqIn0.m8Awk3x73yPIIIvUnsTi4w',
});
const directionsClient = mapboxDirections(mapboxClient);

MapboxGL.setAccessToken(
    'pk.eyJ1IjoianNycyIsImEiOiJjazYyaWtwemIwZXg1M2xxb2dqOGM3amZqIn0.m8Awk3x73yPIIIvUnsTi4w',
);

const { Navigator, Screen } = createStackNavigator();

const QUITO_CENTER = [-78.507751, -0.208946];

const App = () => {
    const [centerCoordinate, setCenterCoordinate] = useState(QUITO_CENTER);
    const [waypoints, setWaypoints] = useState([]);
    const addWaypoint = event => {
        const newWaypoint = { coordinates: event.geometry.coordinates };
        setWaypoints([...waypoints, newWaypoint]);
    };

    const [directions, setDirections] = useState([]);
    const getDirections = () => {
        if (waypoints.length >= 2) {               
            directionsClient
                .getDirections({
                    profile: 'driving-traffic',
                    waypoints,
                    geometries: 'geojson',
                })
                .send()
                .then(response => {
                    setDirections(response.body.routes[0].geometry.coordinates);
                })
                .catch(error =>
                    alert(
                        'Asegurate que los marcadores se encuentran en una dirección válida',
                    ),
                );
        }
    };

    const route = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: directions,
                },
            },
        ],
    };

    const setCurrentPosition = () => {
        PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then(granted => {
            if (granted) {
                Geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    //console.log(position.coords.latitude + ', ' + position.coords.longitude);
                    AsyncStorage.clear()
                    AsyncStorage.setItem('velocidad', position.coords.speed +' m/s')
                    setCenterCoordinate([longitude, latitude]);
                });
            }
        });
    };

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('velocidad');
            //console.log(jsonValue);
            alert(jsonValue)
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    }

    //const retrieveData = async () => {
    //    try {
    //        const name = await AsyncStorage.getItem('velocidad')
    //        alert(name);
    //        if (name !== null) {
    //            this.setState({ name })
    //        }
    //    } catch (e) {
    //        alert('Failed to load name.')
    //    }
    //}

    const reset = () => {
        setWaypoints([]);
        setDirections([]);
        setCurrentPosition();
    };

    const [newTodo, setNewTodo] = useState('');

    useEffect(() => {
        setCurrentPosition();
        MapboxGL.setTelemetryEnabled(false);
        MapboxGL.requestAndroidLocationPermissions();
    }, []);

    return (
        <>
            <View style={styles.container}>

                <MapboxGL.MapView
                    attributionEnabled={false}
                    logoEnabled={false}
                    onPress={addWaypoint}
                    style={styles.map}
                    styleURL={MapboxGL.StyleURL.Street}>
                    <MapboxGL.Camera
                        zoomLevel={14}
                        centerCoordinate={centerCoordinate}
                        ce
                    />

                    {waypoints.map((waypoint, index) => (
                        <MapboxGL.PointAnnotation
                            key={index}
                            anchor={{ x: 0.5, y: 0.8 }}
                            coordinate={waypoint.coordinates}
                            id="pt-ann">
                            <Icon name="map-marker" size={35} color="#900" />
                        </MapboxGL.PointAnnotation>
                    ))}

                    <MapboxGL.ShapeSource id="line" shape={route}>
                        <MapboxGL.LineLayer
                            id="linelayer"
                            style={{ lineColor: 'black', lineWidth: 4 }}
                        />
                    </MapboxGL.ShapeSource>

                    <MapboxGL.UserLocation />
                </MapboxGL.MapView>

                <TouchableOpacity style={styles.button} onPress={getDirections}>
                    <Text style={styles.text}>Direcciones</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ ...styles.button, backgroundColor: '#81020E' }}
                    onPress={reset}>
                    <Text style={styles.text}>Reset</Text>
                </TouchableOpacity>           

                <TouchableOpacity style={styles.button} onPress={getData}>
                    <Text style={styles.text}>Obtener velocidad local</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        marginTop: 10,
        marginHorizontal: 40,
        backgroundColor: 'grey',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    text: {
        fontSize: 20,
        color: 'white',
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: 'black',
    },
    map: {
        flex: 1,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#81020E',
    },
});

export default App;
