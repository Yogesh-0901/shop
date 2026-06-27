import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  Image, 
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

// --- STATIC SUB-CATEGORIES DATA ---
const WOMEN_DATA = [
  { id: '1', name: 'New', image: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg' },
  { id: '2', name: 'Clothes', image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg' },
  { id: '3', name: 'Shoes', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg' },
  { id: '4', name: 'Accessories', image: 'https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg' },
];

const MEN_DATA = [
  { id: '1', name: 'New Arrival', image: 'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg' },
  { id: '2', name: 'Suits', image: 'https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg' },
  { id: '3', name: 'Sneakers', image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg' },
  { id: '4', name: 'Watches', image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg' },
];

const KIDS_DATA = [
  { id: '1', name: 'New', image: 'https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg' },
  { id: '2', name: 'T-Shirts', image: 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg' },
  { id: '3', name: 'Toys', image: 'https://images.pexels.com/photos/168866/pexels-photo-168866.jpeg' },
];

export default function CategoriesPage() {
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState('women');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getSubCategories = () => {
    if (activeTab === 'men') return MEN_DATA;
    if (activeTab === 'kids') return KIDS_DATA;
    return WOMEN_DATA;
  };

  const fetchCategories = async (section: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?section=${section}`);
      const text = await response.text();

      if (text.startsWith('<html') || text.startsWith('<!DOCTYPE')) {
        console.error("Categories Error: Server returned HTML. Check backend routes.");
        setProducts([]);
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        setProducts(data.filter((p: any) => p.section === section));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Connection Error", "Could not reach the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(activeTab);
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Top Tabs */}
      <View style={styles.tabs}>
        {['women', 'men', 'kids'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>{activeTab.toUpperCase()} SALES</Text>
          <Text style={styles.promoSub}>upto 50% off</Text>
        </View>

        {/* 1. Updated Sub-Categories with Section + Category Navigation */}
        <Text style={styles.sectionTitle}>Discover {activeTab}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {getSubCategories().map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.subCatCard}
              onPress={() => router.push({ 
                pathname: '/home', 
                params: { category: item.name, section: activeTab } 
              } as any)}
            >
              <Image source={{ uri: item.image }} style={styles.subCatImage} />
              <Text style={styles.subCatName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2. Trending Products List */}
        <Text style={styles.sectionTitle}>Trending Now</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#000C33" style={styles.loader} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No products found for this section.</Text>
        ) : (
          products.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={styles.categoryCard}
              onPress={() => router.push({ pathname: '/product-details', params: { id: item._id } } as any)}
            >
              <View style={styles.cardLabel}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryPrice}>${item.price}</Text>
              </View>
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 120 }} /> 
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home' as any)}><Ionicons name="home" size={26} color="#002DFF" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories' as any)}><Ionicons name="list" size={26} color="#002DFF" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket' as any)}><Ionicons name="basket" size={26} color="#002DFF" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile' as any)}><Ionicons name="person" size={26} color="#002DFF" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'space-around', paddingVertical: 10 },
  tab: { paddingVertical: 10, paddingHorizontal: 20 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#FF6262' },
  tabText: { fontSize: 18, color: '#888' },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  promoBanner: { backgroundColor: '#000C33', margin: 20, borderRadius: 12, padding: 30, alignItems: 'center' },
  promoTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  promoSub: { color: '#fff', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, marginTop: 10 },
  horizontalScroll: { paddingLeft: 20, paddingBottom: 20 },
  subCatCard: { marginRight: 15, alignItems: 'center' },
  subCatImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff' },
  subCatName: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  categoryCard: { backgroundColor: '#fff', height: 100, borderRadius: 12, marginHorizontal: 20, marginBottom: 15, flexDirection: 'row', overflow: 'hidden' },
  cardLabel: { flex: 1, justifyContent: 'center', paddingLeft: 20 },
  categoryName: { fontSize: 18, fontWeight: 'bold' },
  categoryPrice: { fontSize: 14, color: '#002DFF', marginTop: 4 },
  categoryImage: { width: 120, height: '100%', resizeMode: 'cover' },
  loader: { marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
  navBar: { position: 'absolute', bottom: 25, left: 15, right: 15, height: 70, backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
