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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import wishlistService from '../services/wishlistService';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const items = await wishlistService.getWishlist();
      setWishlist(Array.isArray(items) ? items : []);
    } catch (error) {
      Alert.alert("Connection Error", "Ensure your PC and Phone are on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    } else if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, isLoading]);

  const removeItem = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item._id !== productId));
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

      {loading || isLoading || !isLoggedIn ? (
        <ActivityIndicator size="large" color="#05103A" style={{ marginTop: 50 }} />
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    paddingTop: 10
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  list: { padding: 20, paddingTop: 10 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    alignItems: 'center',
    elevation: 2
  },
  image: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f0f0f0' },
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#000', marginTop: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 18, color: '#333' }
});
