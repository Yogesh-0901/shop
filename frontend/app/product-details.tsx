import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

const PRODUCT_COLORS = [
  { id: '1', hex: '#E05E2E', name: 'Orange' },
  { id: '2', hex: '#1A1A1A', name: 'Black' },
  { id: '3', hex: '#1E60D8', name: 'Blue' },
  { id: '4', hex: '#5D3D2E', name: 'Brown' },
];

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // --- Backend Sync States ---
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // --- UI States ---
  const [selectedColor, setSelectedColor] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const userId = "rose@gmail.com"; 

  // 1. UPDATED: Fetch Product Data with HTML Safety Check
  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    try {
      // Must include /api prefix to match your server.js setup
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
      const text = await response.text(); 

      // Prevents the "Unexpected character: <" crash by identifying HTML
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        Alert.alert("Configuration Error", "Server returned HTML instead of JSON. Check backend routes.");
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        setProduct(data);
        setReviews(data.reviews || []);
      } else {
        Alert.alert("Error", data.error || "Product not found");
      }
    } catch (error) {
      console.error("Fetch failure:", error);
      Alert.alert("Connection Error", "Check server connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductDetails(id as string);
  }, [id]);

  // 2. UPDATED: New addToCart Function with Safety Checks
  const addToCart = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          action: 'add' 
        }),
      });

      const text = await response.text();
      
      if (text.startsWith('<html')) {
        Alert.alert("Server Error", "Invalid response from server. Check backend console.");
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        Alert.alert("Success", `${product.name} added to basket!`);
        router.push('/basket' as any); 
      } else {
        Alert.alert("Error", data.error || "Could not add item.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  // 3. UPDATED: Submit Review Logic with HTML Safety Check
  const submitReview = async () => {
    if (!rating || !reviewText.trim()) {
      Alert.alert('Error', 'Please give rating and write a review');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'Professor', 
          stars: rating,
          comment: reviewText,
          userImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        }),
      });

      const text = await response.text();

      if (text.startsWith('<html')) {
        Alert.alert("Error", "Server route not found.");
        return;
      }

      const result = JSON.parse(text);
      if (response.ok) {
        setReviews(result.reviews || []); 
        setRating(0);
        setReviewText('');
        setModalVisible(false);
        Alert.alert("Success", "Review posted!");
      } else {
        Alert.alert("Error", result.error || "Could not save review");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000C33" style={{flex: 1}} />;
  if (!product) return <View style={styles.center}><Text>Product not found</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.subtitle}>{product.category}</Text>
            </View>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          <Text style={styles.sectionTitle}>Available Colors</Text>
          <View style={styles.colorRow}>
            {PRODUCT_COLORS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.colorCircle, 
                  { backgroundColor: c.hex },
                  selectedColor === c.id && styles.selectedCircle
                ]}
                onPress={() => setSelectedColor(c.id)}
              >
                {selectedColor === c.id && <Ionicons name="checkmark" color="#fff" size={20} />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>
            {product.description || `This premium ${product.name} is designed for comfort and style. Perfect for your ${product.category} collection.`}
          </Text>

          <Text style={styles.sectionTitle}>{reviews.length} Reviews</Text>
          {reviews.map((r, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: r.userImage || 'https://via.placeholder.com/40' }} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>{r.user}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: r.stars || 0 }).map((_, i) => (
                      <MaterialIcons key={i} name="star" size={16} color="#C4A484" />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{r.comment}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.writeBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.writeText}>Write a review</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cartBtn} onPress={addToCart}>
              <Feather name="shopping-cart" size={26} color="#002DFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={() => router.push('/checkout' as any)}>
              <Text style={styles.buyText}>Buy now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* REVIEW MODAL */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setRating(num)}>
                  <MaterialIcons
                    name={num <= rating ? 'star' : 'star-border'}
                    size={35}
                    color="#C4A484"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Write your review..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
              style={styles.modalInput}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#777', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: 380, width: '100%' },
  productImage: { width: '100%', height: '100%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', borderRadius: 20, padding: 5, zIndex: 10 },
  content: { padding: 25 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#6e5e5b', fontSize: 16, marginTop: 4 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#000C33' },
  sectionTitle: { marginTop: 25, fontSize: 18, fontWeight: 'bold', color: '#000' },
  colorRow: { flexDirection: 'row', marginTop: 15, gap: 15 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  selectedCircle: { borderWidth: 3, borderColor: '#fff' },
  desc: { marginTop: 12, color: '#333', lineHeight: 22, fontSize: 15 },
  reviewCard: { backgroundColor: 'rgba(255,255,255,0.4)', padding: 15, borderRadius: 15, marginTop: 10 },
  reviewHeader: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: '700', fontSize: 14 },
  reviewText: { fontStyle: 'italic', color: '#444', fontSize: 14 },
  writeBtn: { alignSelf: 'center', backgroundColor: '#000C33', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25, marginTop: 25 },
  writeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', marginTop: 40, paddingBottom: 30, alignItems: 'center' },
  cartBtn: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, marginRight: 20 },
  buyBtn: { flex: 1, backgroundColor: '#000C33', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { height: 120, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, textAlignVertical: 'top', backgroundColor: '#f9f9f9', fontSize: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, alignItems: 'center' },
  submitBtn: { backgroundColor: '#000C33', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 }
});
