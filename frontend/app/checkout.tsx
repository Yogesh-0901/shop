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
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';
import cartService from '../services/cartService';
import orderService from '../services/orderService';

type DeliveryCarrier = 'fedex' | 'usps' | 'dhl';
const { width } = Dimensions.get('window');

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  
  const userId = "rose@gmail.com"; 
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryCarrier>('fedex');

  const [name, setName] = useState('John Doe');
  const [phone, setPhone] = useState('1234567890');
  const [address, setAddress] = useState('123 Main St');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10001');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [errorMessage, setErrorMessage] = useState('');

  const deliveryFee = 15;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const items = await cartService.getCart();
        const calculatedSubtotal = items.reduce((sum: number, item: any) => 
          sum + (item.price * item.quantity), 0
        );
        setSubtotal(calculatedSubtotal);
      } catch (error) {
        console.error("Summary fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleSubmitOrder = async () => {
    setErrorMessage('');
    
    if (subtotal === 0) {
      setErrorMessage("You cannot place an order with an empty cart.");
      Alert.alert("Empty Cart", "You cannot place an order with an empty cart.");
      return;
    }

    if (!name || !phone || !address || !city || !state || !zip) {
      setErrorMessage("Please fill in all shipping details.");
      Alert.alert("Missing Details", "Please fill in all shipping details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${name}, ${phone}, ${address}, ${city}, ${state} ${zip}`;
      await orderService.createOrder(
        selectedDelivery,
        fullAddress,
        paymentMethod
      );
      
      router.push('/success'); 
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong.";
      setErrorMessage(errorMsg);
      Alert.alert("Checkout Error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#05103A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Shipping details</Text>
        <View style={styles.formCard}>
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#999" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Delivery Address" placeholderTextColor="#999" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="City" placeholderTextColor="#999" value={city} onChangeText={setCity} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="State" placeholderTextColor="#999" value={state} onChangeText={setState} />
          </View>
          <TextInput style={styles.input} placeholder="Postal Code" placeholderTextColor="#999" keyboardType="number-pad" value={zip} onChangeText={setZip} />
        </View>

        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentCard}>
          <TouchableOpacity 
            style={[styles.paymentMethod, paymentMethod === 'Credit Card' && styles.selectedPayment]} 
            onPress={() => setPaymentMethod('Credit Card')}
          >
            <FontAwesome name="credit-card" size={24} color={paymentMethod === 'Credit Card' ? "#05103A" : "#999"} />
            <Text style={[styles.paymentText, paymentMethod === 'Credit Card' && styles.selectedPaymentText]}>Credit Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentMethod, paymentMethod === 'Cash on Delivery' && styles.selectedPayment]} 
            onPress={() => setPaymentMethod('Cash on Delivery')}
          >
            <Ionicons name="cash-outline" size={26} color={paymentMethod === 'Cash on Delivery' ? "#05103A" : "#999"} />
            <Text style={[styles.paymentText, paymentMethod === 'Cash on Delivery' && styles.selectedPaymentText]}>Cash on Delivery</Text>
          </TouchableOpacity>
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
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)}$</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery:</Text>
            <Text style={styles.summaryValue}>{deliveryFee}$</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Summary:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}$</Text>
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
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginTop: 10 },
  iconButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  errorContainer: { backgroundColor: '#FFEBEB', padding: 12, borderRadius: 10, marginTop: 15, borderWidth: 1, borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 30, marginBottom: 15, color: '#000' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 2 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 14, color: '#000' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentCard: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentMethod: { flex: 1, backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', marginHorizontal: 5, elevation: 2 },
  selectedPayment: { borderColor: '#05103A' },
  paymentText: { marginTop: 8, fontSize: 13, color: '#999', fontWeight: 'bold' },
  selectedPaymentText: { color: '#05103A' },
  deliveryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  deliveryBox: { backgroundColor: '#FFF', width: (width - 60) / 3, height: 80, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 1 },
  selectedBox: { borderColor: '#05103A' },
  carrierText: { fontSize: 14 },
  dhlBadge: { backgroundColor: '#D40511', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  dhlText: { color: '#FFCC00', fontWeight: '900', fontSize: 14 },
  deliveryDays: { fontSize: 11, color: '#888', marginTop: 6 },
  summaryContainer: { marginTop: 40 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  totalLabel: { fontSize: 18, color: '#666', fontWeight: '600' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  submitBtn: { backgroundColor: '#05103A', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 35, elevation: 2 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
