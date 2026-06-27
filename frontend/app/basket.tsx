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
import cartService from '../services/cartService';
import { Product } from '../services/productService';

interface CartItem extends Product {
  quantity: number;
}

export default function BasketPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!isLoggedIn) {
        Alert.alert("Please Log In", "You need to log in to view your cart.");
        router.push('/index');
        return;
      }

      const items = await cartService.getCart();
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load cart';
      Alert.alert("Error", errorMsg);
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
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn]);

  // Update cart item quantity
  const handleUpdate = async (productId: string, action: 'plus' | 'minus' | 'remove') => {
    try {
      await cartService.updateCart(productId, action);
      await fetchCart(); // Refresh cart after update
      Alert.alert("Success", "Cart updated");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update cart';
      Alert.alert("Error", errorMsg);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#999" />
          <Text style={styles.emptyText}>Please log in to view your cart</Text>
          <TouchableOpacity 
            style={styles.shopBtn} 
            onPress={() => router.push('/index')}
          >
            <Text style={styles.shopBtnText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#002DFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#999" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopBtn} 
            onPress={() => router.push('/home')}
          >
            <Text style={styles.shopBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Basket</Text>
          </View>
          
          <Text style={styles.mainTitle}>My Cart</Text>
          
          {cartItems.map((item) => (
            <View key={item._id} style={styles.cartCard}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.itemImage}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
              <View style={styles.itemDetails}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleUpdate(item._id, 'remove')}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>${(item.price || 0).toFixed(2)}</Text>
                <View style={styles.quantityRow}>
                  <View style={styles.counter}>
                    <TouchableOpacity 
                      onPress={() => handleUpdate(item._id, 'minus')} 
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="remove" size={18} color="#888" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                    <TouchableOpacity 
                      onPress={() => handleUpdate(item._id, 'plus')} 
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="add" size={18} color="#888" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotal}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
          
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 12, marginTop: 12 }]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutBtn} 
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutText}>PROCEED TO CHECKOUT</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={28} color="#777" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
          <Ionicons name="list" size={28} color="#777" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
          <Ionicons name="basket" size={28} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={28} color="#777" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 15 },
  headerTitleText: { fontSize: 18, marginLeft: 20, fontWeight: '500', color: '#000' },
  mainTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 25, color: '#000' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 20, fontWeight: '600' },
  shopBtn: { backgroundColor: '#002DFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginTop: 25 },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cartCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    height: 130, 
    marginBottom: 15, 
    overflow: 'hidden', 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  itemImage: { width: 120, height: '100%', resizeMode: 'cover' },
  itemDetails: { flex: 1, padding: 12, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#000', flex: 1, marginRight: 10 },
  itemPrice: { fontSize: 14, color: '#002DFF', fontWeight: '600', marginVertical: 4 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qtyText: { marginHorizontal: 10, fontWeight: '600', color: '#000' },
  itemTotal: { fontWeight: 'bold', fontSize: 15, color: '#002DFF' },
  summarySection: { 
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  totalLabel: { fontSize: 16, color: '#000', fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#002DFF' },
  checkoutBtn: { 
    backgroundColor: '#002DFF', 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30,
    elevation: 2
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  navBar: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    height: 75, 
    backgroundColor: '#fff', 
    borderRadius: 40, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
