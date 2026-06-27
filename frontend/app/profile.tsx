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
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import productService from '../services/productService';

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoggedIn } = useAuth();
  
  const [userRole, setUserRole] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedSection, setSelectedSection] = useState('men');
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Order History
  const fetchOrders = async () => {
    if (!isLoggedIn) return;
    
    setLoadingOrders(true);
    try {
      const userOrders = await orderService.getOrders();
      setOrders(Array.isArray(userOrders) ? userOrders : []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && userRole === 'customer') {
        fetchOrders();
      }
    }, [isLoggedIn, userRole])
  );

  useEffect(() => {
    if (!isLoggedIn) {
      Alert.alert("Please Log In", "You need to log in to view your profile.");
      router.replace('/index');
    }
  }, [isLoggedIn]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Upload Product Logic
  const handleUploadProduct = async () => {
    if (!productName || !productPrice || !productDescription || !selectedImage) {
      Alert.alert("Error", "Please fill all fields and select an image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('price', productPrice);
      formData.append('description', productDescription);
      formData.append('category', selectedCategory);
      formData.append('section', selectedSection);

      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: selectedImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const response = await productService.createProduct(formData as any);
      
      Alert.alert("Success", `Product added to ${selectedSection} > ${selectedCategory}`);
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setSelectedImage(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      Alert.alert("Error", errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Logout Logic
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await logout();
            router.replace('/index');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.profileImgContainer}>
            <Ionicons name="person-circle" size={60} color="#002DFF" />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            <Text style={styles.userRole}>Role: {user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.roleTab, userRole === 'customer' && styles.activeTab]} 
            onPress={() => setUserRole('customer')}
          >
            <Ionicons name="people" size={20} color={userRole === 'customer' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, userRole === 'customer' && styles.activeTabText]}>Customer</Text>
          </TouchableOpacity>
          {user?.role === 'seller' && (
            <TouchableOpacity 
              style={[styles.roleTab, userRole === 'seller' && styles.activeTab]} 
              onPress={() => setUserRole('seller')}
            >
              <Ionicons name="briefcase" size={20} color={userRole === 'seller' ? '#fff' : '#666'} />
              <Text style={[styles.tabText, userRole === 'seller' && styles.activeTabText]}>Seller</Text>
            </TouchableOpacity>
          )}
        </View>

        {userRole === 'customer' && (
          <View style={styles.listContainer}>
            <TouchableOpacity 
              style={styles.wishlistNavCard} 
              onPress={() => router.push('/wishlist' as any)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.wishlistIconContainer}>
                  <Ionicons name="heart" size={22} color="#fff" />
                </View>
                <Text style={styles.wishlistNavText}>My Wishlist</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>My Orders ({orders.length})</Text>
            {loadingOrders ? (
              <ActivityIndicator size="large" color="#002DFF" style={{ marginTop: 20 }} />
            ) : orders.length === 0 ? (
              <Text style={styles.emptyText}>No orders yet. Start shopping!</Text>
            ) : (
              orders.map((order) => (
                <View key={order._id} style={styles.optionCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.optionTitle}>Order ID: ...{order._id.slice(-5)}</Text>
                    <Text style={[styles.orderStatus, { color: order.status === 'Delivered' ? '#4CAF50' : '#FF9800' }]}>
                      {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderSubText}>${order.totalAmount?.toFixed(2)} • {order.items?.length || 0} items</Text>
                </View>
              ))
            )}
          </View>
        )}

        {userRole === 'seller' && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Upload New Product</Text>
            <TouchableOpacity style={styles.imageUploadPlaceholder} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedPreview} />
              ) : (
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#002DFF" />
                  <Text style={styles.uploadHintText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput 
              style={styles.input} 
              placeholder="Product Name" 
              placeholderTextColor="#999"
              value={productName} 
              onChangeText={setProductName} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Description" 
              placeholderTextColor="#999"
              value={productDescription} 
              onChangeText={setProductDescription} 
              multiline
              numberOfLines={3}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Price" 
              placeholderTextColor="#999"
              keyboardType="decimal-pad" 
              value={productPrice} 
              onChangeText={setProductPrice} 
            />
            <Text style={styles.label}>Section:</Text>
            <View style={styles.selectorRow}>
              {['men', 'women', 'kids'].map((sec) => (
                <TouchableOpacity 
                  key={sec} 
                  style={[styles.chip, selectedSection === sec && styles.activeChip]} 
                  onPress={() => setSelectedSection(sec)}
                >
                  <Text style={[styles.chipText, selectedSection === sec && styles.activeChipText]}>
                    {sec.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Category:</Text>
            <View style={styles.selectorRow}>
              {['Electronics', 'Clothes', 'Shoes', 'Accessories'].map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, selectedCategory === cat && styles.activeChip]} 
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.uploadBtn, isUploading && { opacity: 0.6 }]} 
              onPress={handleUploadProduct} 
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadBtnText}>POST PRODUCT</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <Ionicons name="list" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
            <Ionicons name="basket" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={28} color="#002DFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 20, textAlign: 'center', color: '#000' },
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  profileImgContainer: { marginRight: 15 },
  nameContainer: { flex: 1 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  userRole: { fontSize: 12, color: '#002DFF', fontWeight: '600', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 5, marginBottom: 25, elevation: 1 },
  roleTab: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 10 
  },
  activeTab: { backgroundColor: '#002DFF' },
  tabText: { marginLeft: 8, fontWeight: '600', color: '#666', fontSize: 14 },
  activeTabText: { color: '#fff' },
  
  // Common Styles
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#000' },
  listContainer: { width: '100%' },
  
  // Wishlist Nav Styles
  wishlistNavCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  wishlistIconContainer: {
    backgroundColor: '#FF1744',
    padding: 10,
    borderRadius: 10,
  },
  wishlistNavText: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 15, 
    color: '#000' 
  },
  
  // Order Styles
  optionCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  optionTitle: { fontWeight: 'bold', color: '#000', fontSize: 14 },
  orderStatus: { fontSize: 12, fontWeight: '600' },
  orderSubText: { color: '#666', marginTop: 5, fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginVertical: 20, fontSize: 14 },
  
  // Seller Section
  sellerSection: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15,
    marginTop: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  imageUploadPlaceholder: { 
    height: 150, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#DDD', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    overflow: 'hidden',
    backgroundColor: '#FAFAFA'
  },
  uploadIconContainer: { alignItems: 'center' },
  uploadHintText: { color: '#666', marginTop: 8, fontSize: 12, fontWeight: '500' },
  selectedPreview: { width: '100%', height: '100%' },
  input: { 
    backgroundColor: '#F5F5F5', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
    color: '#000',
    fontSize: 14
  },
  label: { fontWeight: '600', marginTop: 15, marginBottom: 8, color: '#000' },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    marginRight: 10, 
    marginBottom: 8,
    backgroundColor: '#fff'
  },
  activeChip: { backgroundColor: '#002DFF', borderColor: '#002DFF' },
  chipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  activeChipText: { color: '#fff' },
  uploadBtn: { 
    backgroundColor: '#002DFF', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 15,
    elevation: 2
  },
  uploadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Logout & Nav
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF5F5', 
    padding: 15, 
    borderRadius: 12, 
    marginTop: 30,
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#FF1744'
  },
  logoutText: { color: '#FF1744', fontWeight: '600', fontSize: 16, marginLeft: 10 },
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
