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
import { useAuth } from '../contexts/AuthContext';
import cartService from '../services/cartService';

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

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [selectedColor, setSelectedColor] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const { isLoggedIn, user } = useAuth();

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
      const text = await response.text(); 

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

  const addToCart = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      Alert.alert("Please Log In", "You need to log in to add items to your cart.");
      router.push('/');
      return;
    }
    
    try {
      await cartService.updateCart(product._id, 'add');
      Alert.alert("Product added to Basket", `${product.name} has been added successfully.`);
      router.push('/basket' as any); 
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Could not add item.";
      Alert.alert("Error", errorMsg);
    }
  };

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
          user: user?.fullName || 'User', 
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

  if (loading) return <ActivityIndicator size="large" color="#05103A" style={{flex: 1}} />;
  if (!product) return <View style={styles.center}><Text>Product not found</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.subtitle}>{product.category} Style</Text>
            </View>
            <Text style={styles.price}>${product.price}</Text>
          </View>

          <Text style={styles.sectionTitle}>Color</Text>
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
                {selectedColor === c.id && <Ionicons name="checkmark" color="#fff" size={16} />}
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
                      <MaterialIcons key={i} name="star" size={16} color="#FFB800" />
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
              <Ionicons name="basket" size={28} color="#002DFF" />
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
                    color="#FFB800"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: 480, width: '100%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  content: { padding: 25 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  subtitle: { color: '#666', fontSize: 13, marginTop: 4 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  sectionTitle: { marginTop: 25, fontSize: 14, fontWeight: '700', color: '#000' },
  colorRow: { flexDirection: 'row', marginTop: 10, gap: 12 },
  colorCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  selectedCircle: { borderWidth: 2, borderColor: '#fff', transform: [{ scale: 1.1 }] },
  desc: { marginTop: 10, color: '#333', lineHeight: 20, fontSize: 12 },
  reviewCard: { backgroundColor: 'rgba(255,255,255,0.6)', padding: 15, borderRadius: 15, marginTop: 15, elevation: 1 },
  reviewHeader: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 25, marginRight: 15 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  reviewText: { fontStyle: 'italic', color: '#444', fontSize: 14, marginTop: 5 },
  writeBtn: { alignSelf: 'center', backgroundColor: '#05103A', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25, marginTop: 30 },
  writeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', marginTop: 40, paddingBottom: 30, alignItems: 'center' },
  cartBtn: { width: 55, height: 55, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D8B4A0', borderRadius: 15, marginRight: 20 },
  buyBtn: { flex: 1, backgroundColor: '#05103A', borderRadius: 30, height: 55, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  modalInput: { height: 120, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, textAlignVertical: 'top', backgroundColor: '#f9f9f9', fontSize: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, alignItems: 'center' },
  submitBtn: { backgroundColor: '#05103A', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 }
});
