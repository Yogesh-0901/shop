import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import orderService, { Order } from '../services/orderService';

export default function SellerOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status Modal State
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getSellerOrders();
      setOrders(data);
    } catch (error) {
      console.error('Fetch seller orders error:', error);
      Alert.alert("Error", "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    } else if (isLoggedIn) {
      fetchSellerOrders();
    }
  }, [isLoggedIn, isLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellerOrders();
    setRefreshing(false);
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    if (selectedOrder.status === newStatus) {
      setStatusModalVisible(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus);
      Alert.alert("Success", `Order status updated to ${newStatus}`);
      setStatusModalVisible(false);
      fetchSellerOrders();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Update failed';
      Alert.alert("Error", errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Processing': return '#F5A623';
      case 'Shipped': return '#4A90E2';
      case 'Delivered': return '#7ED321';
      case 'Cancelled': return '#D0021B';
      default: return '#999';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.substring(item._id.length - 6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        <Text style={styles.detailText}><Text style={styles.boldText}>Total:</Text> ${item.totalAmount.toFixed(2)}</Text>
        <Text style={styles.detailText}><Text style={styles.boldText}>Items:</Text> {item.items.reduce((sum, i) => sum + i.quantity, 0)}</Text>
        <Text style={styles.detailText}><Text style={styles.boldText}>Customer Address:</Text> {item.deliveryAddress || 'Not provided'}</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <TouchableOpacity style={styles.updateBtn} onPress={() => openStatusModal(item)}>
        <Ionicons name="sync-outline" size={18} color="#fff" />
        <Text style={styles.updateBtnText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Orders</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#05103A" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#999" />
          <Text style={styles.emptyText}>You don't have any orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={renderOrderItem}
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={isStatusModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>Select the new status for this order:</Text>
            
            {statusOptions.map(status => (
              <TouchableOpacity 
                key={status} 
                style={[
                  styles.statusOptionBtn, 
                  selectedOrder?.status === status && styles.statusOptionSelected
                ]}
                onPress={() => handleUpdateStatus(status)}
                disabled={isUpdating}
              >
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                <Text style={styles.statusOptionText}>{status}</Text>
                {selectedOrder?.status === status && (
                  <Ionicons name="checkmark-circle" size={20} color="#05103A" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => setStatusModalVisible(false)}
              disabled={isUpdating}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 50 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 15 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  orderBody: { marginBottom: 15 },
  detailText: { fontSize: 14, color: '#333', marginBottom: 4 },
  boldText: { fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#999', marginTop: 4 },
  updateBtn: { backgroundColor: '#05103A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  updateBtnText: { color: '#fff', marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  statusOptionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  statusOptionSelected: { backgroundColor: '#F8F9FA', borderRadius: 8, paddingHorizontal: 10 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  statusOptionText: { flex: 1, fontSize: 16, color: '#333' },
  cancelBtn: { marginTop: 20, paddingVertical: 12, alignItems: 'center', backgroundColor: '#EEE', borderRadius: 10 },
  cancelBtnText: { fontWeight: 'bold', fontSize: 16, color: '#333' }
});
