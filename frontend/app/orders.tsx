import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import orderService, { Order } from '../services/orderService';

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const items = await orderService.getOrders();
      setOrders(Array.isArray(items) ? items : []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    } else if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn, isLoading]);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'processing': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading || isLoading || !isLoggedIn ? (
        <ActivityIndicator size="large" color="#05103A" style={{ marginTop: 50 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>You have no orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item._id.substring(0, 8).toUpperCase()}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              
              <View style={styles.itemsContainer}>
                {item.items.slice(0, 2).map((prod: any, idx: number) => (
                  <Text key={idx} style={styles.itemText} numberOfLines={1}>
                    • {prod.name} (x{prod.quantity})
                  </Text>
                ))}
                {item.items.length > 2 && (
                  <Text style={styles.moreItemsText}>and {item.items.length - 2} more items...</Text>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>${item.totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.detailsBtn} onPress={() => Alert.alert("Order Details", "Delivery to: \n" + item.deliveryAddress)}>
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  status: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  date: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 10 },
  itemsContainer: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8, marginBottom: 15 },
  itemText: { fontSize: 14, color: '#444', marginBottom: 4 },
  moreItemsText: { fontSize: 13, color: '#888', fontStyle: 'italic', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  totalLabel: { fontSize: 12, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  detailsBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#05103A' },
  detailsBtnText: { color: '#05103A', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 18, color: '#333', fontWeight: 'bold' }
});
