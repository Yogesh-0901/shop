import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

type DeliveryCarrier = 'fedex' | 'usps' | 'dhl';
const { width } = Dimensions.get('window');

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  
  const userId = "rose@gmail.com"; 
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryCarrier>('fedex');

  const deliveryFee = 15;
  const total = subtotal + deliveryFee;

  // 1. Fetch current cart subtotal with safety checks
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Updated path to use /api prefix as per your server.js
        const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`);
        const text = await response.text();
        
        try {
          const items = JSON.parse(text);
          if (response.ok) {
            const calculatedSubtotal = items.reduce((sum: number, item: any) => 
              sum + (item.price * item.quantity), 0
            );
            setSubtotal(calculatedSubtotal);
          } else {
            console.error("Cart fetch failed", items.error);
          }
        } catch (e) {
          // This catches the HTML "<" error
          console.error("Server returned HTML instead of JSON in fetchSummary");
        }
      } catch (error) {
        console.error("Summary fetch error", error);
        Alert.alert("Error", "Could not load order summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // 2. Submit Final Order to Backend
  const handleSubmitOrder = async () => {
    if (subtotal === 0) {
      Alert.alert("Empty Cart", "You cannot place an order with an empty cart.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Updated path to match /api/orders or /api/checkout prefix
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          deliveryCarrier: selectedDelivery,
          totalAmount: total
        }),
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (response.ok) {
          Alert.alert("Success", "Order placed successfully!");
          router.push('/success' as any); 
        } else {
          Alert.alert("Checkout Error", result.error || "Something went wrong.");
        }
      } catch (e) {
        Alert.alert("Server Error", "Invalid response from server during checkout.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#050A30" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Shipping address</Text>
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.addressName}>Jony ,</Text>
            <TouchableOpacity><Text style={styles.changeLink}>change</Text></TouchableOpacity>
          </View>
          <Text style={styles.addressDetail}>3 NewBridge,{"\n"}Hills, Canada</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <TouchableOpacity><Text style={styles.changeLink}>change</Text></TouchableOpacity>
        </View>
        <View style={styles.paymentRow}>
          <View style={styles.cardIconBox}>
             <FontAwesome name="cc-mastercard" size={28} color="#EB001B" />
          </View>
          <Text style={styles.cardNumber}>**** **** **** 3947</Text>
        </View>

        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <View style={styles.deliveryGrid}>
          <TouchableOpacity 
            style={[styles.deliveryBox, selectedDelivery === 'fedex' && styles.selectedBox]} 
            onPress={() => setSelectedDelivery('fedex')}
          >
            <Text style={[styles.carrierText, { color: '#4D148C', fontWeight: 'bold' }]}>
              Fed<Text style={{color: '#FF6200'}}>Ex.</Text>
            </Text>
            <Text style={styles.deliveryDays}>2-3 days</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deliveryBox, selectedDelivery === 'usps' && styles.selectedBox]} 
            onPress={() => setSelectedDelivery('usps')}
          >
            <Text style={[styles.carrierText, { color: '#333366', fontStyle: 'italic', fontWeight: '900' }]}>USPS</Text>
            <Text style={styles.deliveryDays}>2-3 days</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deliveryBox, selectedDelivery === 'dhl' && styles.selectedBox]} 
            onPress={() => setSelectedDelivery('dhl')}
          >
            <View style={styles.dhlBadge}><Text style={styles.dhlText}>DHL</Text></View>
            <Text style={styles.deliveryDays}>2-3 days</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order:</Text>
            <Text style={styles.summaryValue}>{subtotal}$</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery:</Text>
            <Text style={styles.summaryValue}>{deliveryFee}$</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Summary:</Text>
            <Text style={styles.totalValue}>{total}$</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmitOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>SUBMIT ORDER</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CheckoutPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D1B2B0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 30, marginBottom: 15, color: '#000' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  addressName: { fontSize: 16, fontWeight: '600' },
  changeLink: { color: '#E91E63', fontSize: 14, fontWeight: '500' },
  addressDetail: { fontSize: 14, color: '#555', lineHeight: 22 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  cardIconBox: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 15, elevation: 2 },
  cardNumber: { fontSize: 15, color: '#000' },
  deliveryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  deliveryBox: { backgroundColor: '#FFF', width: (width - 60) / 3, height: 75, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectedBox: { borderColor: '#050A30' },
  carrierText: { fontSize: 13 },
  dhlBadge: { backgroundColor: '#D40511', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  dhlText: { color: '#FFCC00', fontWeight: '900', fontSize: 13 },
  deliveryDays: { fontSize: 10, color: '#888', marginTop: 6 },
  summaryContainer: { marginTop: 40 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryLabel: { fontSize: 16, color: '#777' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  totalLabel: { fontSize: 18, color: '#777', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#000' },
  submitBtn: { backgroundColor: '#050A30', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 35 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});
