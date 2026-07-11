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
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import productService from '../services/productService';
import userService from '../services/userService';

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
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedSection, setSelectedSection] = useState('men');
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSellerVerified, setIsSellerVerified] = useState(false);
  const [sellerPasscode, setSellerPasscode] = useState('');

  // Modal states
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);

  // Form states
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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
      formData.append('description', productDescription || 'No description provided'); 
      formData.append('category', selectedCategory); 
      formData.append('section', selectedSection);

      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('image', file);
      } else {
        const uriParts = selectedImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: selectedImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await productService.createProduct(formData as any);
      
      Alert.alert("Success", "Product uploaded successfully!");
      setProductName('');
      setProductPrice('');
      setProductDescription('');
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload product. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editFullName) {
      Alert.alert("Error", "Full Name is required");
      return;
    }
    setIsSubmittingProfile(true);
    try {
      await userService.updateProfile(editFullName, editPhone);
      Alert.alert("Success", "Profile updated successfully! Please log in again to sync changes.");
      setEditProfileVisible(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Update failed';
      Alert.alert("Error", errorMsg);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert("Weak Password", "New password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully!");
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Password change failed';
      Alert.alert("Error", errorMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        logout().then(() => router.replace('/'));
      }
    } else {
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
    }
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
        <Text style={styles.headerTitle}>User Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.profileImgContainer}>
            <Ionicons name="person-circle" size={60} color="#05103A" />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user?.fullName || 'Professor'}</Text>
            <Text style={styles.userRole}>Role:{userRole.toUpperCase()}</Text>
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
          <TouchableOpacity 
            style={[styles.roleTab, userRole === 'seller' && styles.activeTab]} 
            onPress={() => setUserRole('seller')}
          >
            <Ionicons name="briefcase" size={20} color={userRole === 'seller' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, userRole === 'seller' && styles.activeTabText]}>Seller</Text>
          </TouchableOpacity>
        </View>

        {userRole === 'customer' && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Shopping Settings</Text>
            
            <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/orders' as any)}>
              <Text style={styles.optionTitle}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/wishlist' as any)}>
              <Text style={styles.optionTitle}>My Wishlist</Text>
            </TouchableOpacity>
          </View>
        )}

        {userRole === 'seller' && !isSellerVerified && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller Authentication</Text>
            <Text style={styles.uploadHintText}>Enter the secret passcode to access the Seller Dashboard.</Text>
            <TextInput 
              style={[styles.input, { marginTop: 15 }]} 
              placeholder="Secret Passcode" 
              placeholderTextColor="#999"
              secureTextEntry
              value={sellerPasscode} 
              onChangeText={setSellerPasscode} 
            />
            <TouchableOpacity 
              style={styles.uploadBtn} 
              onPress={() => {
                if (sellerPasscode === '1234') {
                  setIsSellerVerified(true);
                } else {
                  Alert.alert("Access Denied", "Incorrect passcode.");
                }
              }} 
            >
              <Text style={styles.uploadBtnText}>VERIFY</Text>
            </TouchableOpacity>
          </View>
        )}

        {userRole === 'seller' && isSellerVerified && (
          <View style={styles.sellerSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <TouchableOpacity style={styles.dashboardBtn} onPress={() => router.push('/seller-products' as any)}>
                <Ionicons name="cube-outline" size={24} color="#fff" />
                <Text style={styles.dashboardBtnText}>My Products</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dashboardBtn} onPress={() => router.push('/seller-orders' as any)}>
                <Ionicons name="receipt-outline" size={24} color="#fff" />
                <Text style={styles.dashboardBtnText}>Store Orders</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Seller Tools: Upload Product</Text>
            
            <TouchableOpacity style={styles.imageUploadPlaceholder} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedPreview} />
              ) : (
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                  <Text style={styles.uploadHintText}>Tap to select product photo</Text>
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
              placeholder="Price ($)" 
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
              {['Dresses', 'Tops', 'Shirts', 'T-Shirts', 'Pants', 'Sarees', 'Shorts'].map((cat) => (
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
          <Text style={styles.logoutText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditProfileVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={editFullName} onChangeText={setEditFullName} placeholder="John Doe" />
            
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} placeholder="+1 234 567 8900" keyboardType="phone-pad" />
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#CCC' }]} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#05103A' }]} onPress={handleUpdateProfile} disabled={isSubmittingProfile}>
                {isSubmittingProfile ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isChangePasswordVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <Text style={styles.label}>Current Password</Text>
            <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" />
            
            <Text style={styles.label}>New Password</Text>
            <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="••••••••" />
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#CCC' }]} onPress={() => setChangePasswordVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#05103A' }]} onPress={handleChangePassword} disabled={isSubmittingPassword}>
                {isSubmittingPassword ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  header: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
  },
  profileImgContainer: { marginRight: 15 },
  nameContainer: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 18, color: '#000' },
  userRole: { fontSize: 14, color: '#999', marginTop: 2 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, padding: 5, marginBottom: 25, elevation: 2 },
  roleTab: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderRadius: 25 
  },
  activeTab: { backgroundColor: '#05103A' },
  tabText: { marginLeft: 8, fontWeight: 'bold', color: '#000', fontSize: 14 },
  activeTabText: { color: '#fff' },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  listContainer: { width: '100%' },
  
  optionCard: { 
    backgroundColor: '#fff', 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderRadius: 12, 
    marginBottom: 15,
    justifyContent: 'center'
  },
  optionTitle: { fontWeight: 'bold', color: '#000', fontSize: 14 },
  
  sellerSection: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 20,
  },
  dashboardBtn: {
    backgroundColor: '#05103A',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 2
  },
  dashboardBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 15
  },
  imageUploadPlaceholder: { 
    height: 140, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: '#CCC', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    overflow: 'hidden',
    backgroundColor: '#FFF'
  },
  uploadIconContainer: { alignItems: 'center' },
  uploadHintText: { color: '#999', marginTop: 8, fontSize: 14 },
  selectedPreview: { width: '100%', height: '100%' },
  input: { 
    backgroundColor: '#F9F9F9', 
    padding: 16, 
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
    backgroundColor: '#002DFF', 
    padding: 16, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 5,
  },
  uploadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderRadius: 12, 
    marginTop: 15,
    marginBottom: 20,
  },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  modalBtnText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
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
