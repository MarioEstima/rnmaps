import { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { View } from "react-native";
import { styles } from "./styles";

import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  watchPositionAsync,
  LocationAccuracy,
  type LocationObject,
  type LocationSubscription,
} from "expo-location";

export default function App() {
  const [location, setLocation] = useState<LocationObject | null>(null);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    async function requestLocationPermission() {
      const { granted } = await requestForegroundPermissionsAsync();

      if (!granted) {
        console.log("Permissão de localização negada");
        return;
      }

      const currentPosition = await getCurrentPositionAsync({
        accuracy: LocationAccuracy.High,
      });

      setLocation(currentPosition);
    }

    requestLocationPermission();
  }, []);

  useEffect(() => {
    let subscription: LocationSubscription | null = null;

    async function watchLocation() {
      const { granted } = await requestForegroundPermissionsAsync();

      if (!granted) return;

      subscription = await watchPositionAsync(
        {
          accuracy: LocationAccuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (response) => {
          setLocation(response);

          mapRef.current?.animateCamera({
            pitch: 70,
            center: {
              latitude: response.coords.latitude,
              longitude: response.coords.longitude,
            },
          });
        },
      );
    }

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        </MapView>
      )}
    </View>
  );
}
