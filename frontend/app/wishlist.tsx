import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';
// RECTIFIED: Corrected import to stop terminal warnings
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Wishlist using your verified IP
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      // Ensure your backend server is running on port 5000
      const response = await fetch(`${API_BASE_URL}/api/wishlist`);
      
      const text = await response.text();
      // Safety check for HTML error responses
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        Alert.alert("Server Error", "Backend returned an error page.");
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        setWishlist(data);
      }
    } catch (error) {
      // Triggers if IP is wrong or phone/PC are on different Wi-Fi
      Alert.alert("Connection Error", "Ensure your PC and Phone are on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 2. Remove Item Logic
  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'remove' }),
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      Alert.alert("Error", "Could not remove item. Check connection.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000C33" style={{ marginTop: 50 }} />
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#888" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>${item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(item._id)}>
                <Ionicons name="trash-outline" size={24} color="#FF6262" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 20 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    alignItems: 'center',
    elevation: 3
  },
  image: { width: 70, height: 70, borderRadius: 10 },
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 14, color: '#555', marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 18, color: '#888' }
});
