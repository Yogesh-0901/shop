import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 
import { API_BASE_URL } from '../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import productService, { Product } from '../services/productService';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';

export default function HomePage() {
  const router = useRouter(); 
  const { category } = useLocalSearchParams(); 
  const { isLoggedIn, token } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]); 
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts();
      setProducts(Array.isArray(response.products) ? response.products : response as any);
      setFilteredProducts(Array.isArray(response.products) ? response.products : response as any);
      
      if (isLoggedIn) {
        await fetchUserWishlist();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMsg);
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      if (!isLoggedIn) return;
      const wishlistItems = await wishlistService.getWishlist();
      const favMap: { [key: string]: boolean } = {};
      wishlistItems.forEach((item: Product) => { favMap[item._id] = true; });
      setFavorites(favMap);
    } catch (err) { 
      console.error("Wishlist sync error", err); 
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isLoggedIn]);

  useEffect(() => {
    if (category) {
      const filtered = products.filter(item => 
        item.category && item.category.toLowerCase() === (category as string).toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [category, products]);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = products.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  const toggleFavorite = async (productId: string) => {
    if (!isLoggedIn) {
      Alert.alert("Please Log In", "You need to log in to add items to your wishlist.");
      return;
    }

    const isCurrentlyFavorite = favorites[productId];
    const newFavorites = { ...favorites, [productId]: !isCurrentlyFavorite };
    setFavorites(newFavorites);

    try {
      if (isCurrentlyFavorite) {
        await wishlistService.removeFromWishlist(productId);
        Alert.alert("Removed from Wishlist", "Item removed from your wishlist.");
      } else {
        await wishlistService.addToWishlist(productId);
        Alert.alert("Product added to Wishlist", "Item has been added successfully.");
      }
    } catch (error) {
      setFavorites(favorites);
      Alert.alert("Error", "Failed to update wishlist");
    }
  };

  const addToCart = async (product: Product) => {
    if (!isLoggedIn) {
      Alert.alert("Please Log In", "You need to log in to add items to your cart.");
      return;
    }

    try {
      await cartService.updateCart(product._id, 'add');
      Alert.alert("Product added to Basket", `${product.name} has been added successfully.`);
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: '/product-details' as any,
          params: { id: item._id }
        })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.img} />
          <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(item._id)}>
            <Ionicons 
              name={favorites[item._id] ? "heart" : "heart-outline"} 
              size={22} 
              color={favorites[item._id] ? "#FF0000" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.prodTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.prodPrice}>${item.price?.toFixed(0) || '0'}</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(item)}>
          <Ionicons name="cart-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={() => router.push('/checkout')}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#05103A" />
      
      <View style={styles.header}>
        <SafeAreaView edges={['top']} />
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search product here..." 
              placeholderTextColor="#999"
              value={search}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/categories' as any)}>
            <Ionicons name="options-outline" size={24} color="#05103A" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroRow}>
          <Text style={styles.heroText}>
            {category ? `${category}` : "Shop Smart, Save"}
          </Text>
          {!isLoggedIn && (
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={{color: '#fff'}}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#05103A" style={{ marginTop: 50 }} />
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No products found</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts} 
          numColumns={2}
          keyExtractor={(item) => item._id} 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={renderProductCard}
        />
      )}

      {/* Navigation Bar */}
      <View style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
            <Ionicons name="home" size={26} color="#002DFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <Ionicons name="list" size={26} color="#4A4A4A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
            <Ionicons name="basket" size={26} color="#4A4A4A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <Ionicons name="person" size={26} color="#4A4A4A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  header: { 
    backgroundColor: '#05103A', 
    paddingHorizontal: 20, 
    paddingBottom: 25,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  searchBar: { 
    flex: 1, 
    backgroundColor: '#fff', 
    height: 45, 
    borderRadius: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    marginRight: 10 
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#000' },
  filterBtn: { backgroundColor: '#fff', width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  heroText: { color: '#fff', fontSize: 24, fontWeight: 'bold', fontStyle: 'italic', flex: 1 },
  errorBanner: { backgroundColor: '#FFE0E0', padding: 10, margin: 10, borderRadius: 8 },
  errorText: { color: '#D32F2F', fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 10 },
  retryBtn: { backgroundColor: '#05103A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  grid: { padding: 10, paddingBottom: 100 },
  card: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 12, 
    elevation: 2,
  },
  imageContainer: { width: '100%', aspectRatio: 1, borderRadius: 15, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  heart: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  prodTitle: { fontWeight: 'bold', marginTop: 12, fontSize: 14, color: '#000' },
  prodPrice: { color: '#000', fontSize: 13, marginBottom: 10, marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartBtn: { backgroundColor: '#002DFF', width: 35, height: 35, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buyBtn: { backgroundColor: '#05103A', height: 35, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flex: 1, marginLeft: 10 },
  buyBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  navBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  navBar: { 
    backgroundColor: '#6A6A6A', // Grey translucent look
    borderRadius: 40, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    height: 65,
    opacity: 0.95
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
