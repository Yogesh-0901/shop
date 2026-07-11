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
  Image,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import productService, { Product } from '../services/productService';
import * as ImagePicker from 'expo-image-picker';

export default function SellerProductsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getSellerProducts();
      setProducts(data);
    } catch (error) {
      console.error('Fetch seller products error:', error);
      Alert.alert("Error", "Failed to load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/');
    } else if (isLoggedIn) {
      fetchSellerProducts();
    }
  }, [isLoggedIn, isLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellerProducts();
    setRefreshing(false);
  };

  const handleDelete = (productId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              Alert.alert("Success", "Product deleted.");
              fetchSellerProducts();
            } catch (error) {
              Alert.alert("Error", "Failed to delete product.");
            }
          }
        }
      ]
    );
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditStock((product.stock || 0).toString());
    setEditDescription(product.description);
    setEditImage(null);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('price', editPrice);
      formData.append('stock', editStock);
      formData.append('description', editDescription);

      if (editImage) {
        const uriParts = editImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: editImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await productService.updateProduct(editingProduct._id, formData as any);
      Alert.alert("Success", "Product updated successfully!");
      setEditModalVisible(false);
      fetchSellerProducts();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Update failed';
      Alert.alert("Error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>${(item.price || 0).toFixed(2)}</Text>
        <Text style={styles.productStock}>Stock: {item.stock || 0}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#05103A" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#999" />
          <Text style={styles.emptyText}>You haven't uploaded any products yet.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={renderProductItem}
        />
      )}

      {/* Edit Product Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            
            <TouchableOpacity style={styles.imageUploadPlaceholder} onPress={pickImage}>
              {editImage ? (
                <Image source={{ uri: editImage }} style={styles.selectedPreview} />
              ) : editingProduct?.image ? (
                <Image source={{ uri: editingProduct.image }} style={styles.selectedPreview} />
              ) : (
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#05103A" />
                  <Text style={styles.uploadHintText}>Tap to change image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Product Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput style={styles.input} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Stock</Text>
                <TextInput style={styles.input} value={editStock} onChangeText={setEditStock} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={editDescription} 
              onChangeText={setEditDescription} 
              multiline 
            />
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#CCC' }]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#05103A' }]} onPress={handleUpdateProduct} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Update</Text>}
              </TouchableOpacity>
            </View>
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
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 2,
  },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  productPrice: { fontSize: 14, color: '#E88358', fontWeight: 'bold', marginTop: 4 },
  productStock: { fontSize: 12, color: '#666' },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  editBtn: { backgroundColor: '#05103A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
  btnText: { color: '#fff', marginLeft: 4, fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, color: '#000' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  modalBtnText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  imageUploadPlaceholder: { height: 120, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CCC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden', backgroundColor: '#F9F9F9' },
  uploadIconContainer: { alignItems: 'center' },
  uploadHintText: { color: '#666', marginTop: 8, fontSize: 12 },
  selectedPreview: { width: '100%', height: '100%', resizeMode: 'cover' }
});
