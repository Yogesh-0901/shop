import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import cartService, { CartItem } from '../services/cartService';

export default function BasketPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!isLoggedIn) {
        return;
      }

      const items = await cartService.getCart();
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn) {
        fetchCart();
      }
    }, [isLoggedIn])
  );

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    } else if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn, isLoading]);

  const handleUpdate = async (productId: string, action: 'plus' | 'minus' | 'remove') => {
    try {
      await cartService.updateCart(productId, action);
      await fetchCart();
    } catch (error) {
      Alert.alert("Error", "Failed to update cart");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  if (isLoading || !isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#05103A" />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#05103A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
        <Text style={styles.mainTitle}>My Bag</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#666" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/home')}>
            <Text style={styles.shopBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {cartItems.map((item) => (
            <View key={item.productId} style={styles.cartCard}>
              <View style={styles.itemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              </View>
              
              <View style={styles.itemDetails}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleUpdate(item.productId, 'remove')}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.itemSubDetail}>Color: Black  Size: M</Text>
                
                <View style={styles.bottomRow}>
                  <View style={styles.counter}>
                    <TouchableOpacity onPress={() => handleUpdate(item.productId, 'minus')} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={18} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                    <TouchableOpacity onPress={() => handleUpdate(item.productId, 'plus')} style={styles.qtyBtn}>
                      <Ionicons name="add" size={18} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>{((item.price || 0) * (item.quantity || 1)).toFixed(0)}$</Text>
                </View>
              </View>
            </View>
          ))}
          
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Total amount:</Text>
            <Text style={styles.summaryValue}>{totalAmount.toFixed(0)}$</Text>
          </View>
          
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
            <Text style={styles.checkoutText}>CHECK OUT</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      
      <View style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <Ionicons name="list-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
            <Ionicons name="basket" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20, paddingHorizontal: 20 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', marginTop: 20, marginLeft: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 18, color: '#333', marginTop: 20, fontWeight: '600' },
  shopBtn: { backgroundColor: '#05103A', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginTop: 25 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cartCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 12,
    marginBottom: 15, 
    elevation: 2
  },
  itemImageContainer: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1, marginRight: 10 },
  itemSubDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  counter: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#fff',
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  qtyText: { marginHorizontal: 12, fontWeight: '600', color: '#000', fontSize: 14 },
  itemPrice: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  summarySection: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    marginTop: 30,
    paddingHorizontal: 5
  },
  summaryLabel: { fontSize: 16, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  checkoutBtn: { 
    backgroundColor: '#1E2034', 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30,
    elevation: 2
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  navBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  navBar: { 
    backgroundColor: '#fff', 
    borderRadius: 40, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    height: 70,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
