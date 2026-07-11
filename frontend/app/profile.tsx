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
  const { user, logout, isLoggedIn, isLoading } = useAuth();
  
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

  const fetchOrders = async () => {
    if (!isLoggedIn) return;
    
    setLoadingOrders(true);
    try {
      const userOrders = await orderService.getOrders();
      setOrders(Array.isArray(userOrders) ? userOrders : []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading && !isLoggedIn) {
        router.replace('/');
      } else if (isLoggedIn && userRole === 'customer') {
        fetchOrders();
      }
    }, [isLoggedIn, isLoading, userRole])
  );

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
            router.replace('/');
          }
        }
      ]
    );
  };

  if (isLoading || !isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#05103A" />
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My profile</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.profileImgContainer}>
            <Ionicons name="person-circle" size={70} color="#05103A" />
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
            
            <TouchableOpacity style={styles.optionCard} onPress={() => Alert.alert("My Orders", "You have " + orders.length + " orders")}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>My orders</Text>
                <Text style={styles.optionSubtitle}>Already have {orders.length} orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => Alert.alert("Shipping", "Shipping addresses coming soon")}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Shipping addresses</Text>
                <Text style={styles.optionSubtitle}>3 addresses</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => Alert.alert("Payment", "Payment methods coming soon")}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Payment methods</Text>
                <Text style={styles.optionSubtitle}>Visa  **34</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => Alert.alert("Reviews", "My reviews coming soon")}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>My reviews</Text>
                <Text style={styles.optionSubtitle}>Reviews for 4 items</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => Alert.alert("Settings", "Settings coming soon")}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Settings</Text>
                <Text style={styles.optionSubtitle}>Notifications, password</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/wishlist' as any)}>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>My Wishlist</Text>
                <Text style={styles.optionSubtitle}>Saved items</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
            
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
                  <Ionicons name="cloud-upload-outline" size={40} color="#05103A" />
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

      </ScrollView>

      <View style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <Ionicons name="list-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
            <Ionicons name="basket-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={26} color="#002DFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    marginBottom: 15,
  },
  profileImgContainer: { marginRight: 15 },
  nameContainer: { flex: 1 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  userRole: { fontSize: 12, color: '#05103A', fontWeight: 'bold', marginTop: 6 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 5, marginBottom: 25, elevation: 1 },
  roleTab: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 10 
  },
  activeTab: { backgroundColor: '#05103A' },
  tabText: { marginLeft: 8, fontWeight: '600', color: '#666', fontSize: 14 },
  activeTabText: { color: '#fff' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10, color: '#000' },
  listContainer: { width: '100%', marginTop: 10 },
  
  optionCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    paddingVertical: 15, 
    paddingHorizontal: 20,
    borderRadius: 15, 
    marginBottom: 12,
    elevation: 2,
  },
  optionContent: { flex: 1 },
  optionTitle: { fontWeight: 'bold', color: '#000', fontSize: 16 },
  optionSubtitle: { color: '#999', marginTop: 4, fontSize: 12 },
  
  sellerSection: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15,
    marginTop: 10,
    elevation: 2,
  },
  imageUploadPlaceholder: { 
    height: 150, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#CCC', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    overflow: 'hidden',
    backgroundColor: '#F9F9F9'
  },
  uploadIconContainer: { alignItems: 'center' },
  uploadHintText: { color: '#666', marginTop: 8, fontSize: 14, fontWeight: '500' },
  selectedPreview: { width: '100%', height: '100%' },
  input: { 
    backgroundColor: '#F5F5F5', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    color: '#000',
    fontSize: 14
  },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#000' },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    marginRight: 10, 
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  activeChip: { backgroundColor: '#05103A', borderColor: '#05103A' },
  chipText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  activeChipText: { color: '#fff' },
  uploadBtn: { 
    backgroundColor: '#05103A', 
    padding: 16, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 15,
    elevation: 2
  },
  uploadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 15, 
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#FF3B30',
    elevation: 1
  },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
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
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
