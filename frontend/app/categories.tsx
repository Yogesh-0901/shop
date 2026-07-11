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
        setProducts([]);
        return;
      }

      const data = JSON.parse(text);
      if (response.ok) {
        setProducts(data.filter((p: any) => p.section === section));
      }
    } catch (error) {
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['women', 'Men', 'Kids'].map((tab) => {
          const tabKey = tab.toLowerCase();
          return (
            <TouchableOpacity 
              key={tabKey} 
              onPress={() => setActiveTab(tabKey)}
              style={[styles.tab, activeTab === tabKey && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>{activeTab.toUpperCase()} SALES</Text>
          <Text style={styles.promoSub}>upto 50% off</Text>
        </View>

        <View style={styles.verticalList}>
          {getSubCategories().map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.categoryBlockCard}
              onPress={() => router.push({ 
                pathname: '/home', 
                params: { category: item.name, section: activeTab } 
              } as any)}
            >
              <Text style={styles.categoryBlockName}>{item.name}</Text>
              <Image source={{ uri: item.image }} style={styles.categoryBlockImage} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Trending Now</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#05103A" style={styles.loader} />
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

      <View style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <Ionicons name="list" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
            <Ionicons name="basket-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={26} color="#002DFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#D8B4A0' },
  tab: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#FF6262' },
  tabText: { fontSize: 16, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  promoBanner: { backgroundColor: '#05103A', marginHorizontal: 20, marginTop: 10, marginBottom: 20, borderRadius: 10, padding: 30, alignItems: 'center', elevation: 3 },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  promoSub: { color: '#fff', fontSize: 14, marginTop: 5, color: '#ccc' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, marginTop: 10 },
  verticalList: { paddingHorizontal: 20, paddingBottom: 20 },
  categoryBlockCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, height: 90, marginBottom: 15, alignItems: 'center', overflow: 'hidden' },
  categoryBlockName: { flex: 1, paddingLeft: 20, fontSize: 18, fontWeight: '600', color: '#000' },
  categoryBlockImage: { width: 130, height: '100%', resizeMode: 'cover', borderTopLeftRadius: 30, borderBottomLeftRadius: 30 },
  categoryCard: { backgroundColor: '#fff', height: 100, borderRadius: 12, marginHorizontal: 20, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  cardLabel: { flex: 1, justifyContent: 'center', paddingLeft: 20 },
  categoryName: { fontSize: 18, fontWeight: 'bold' },
  categoryPrice: { fontSize: 14, color: '#000', marginTop: 4, fontWeight: '600' },
  categoryImage: { width: 120, height: '100%', resizeMode: 'cover' },
  loader: { marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
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
