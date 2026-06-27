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

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts();
      setProducts(Array.isArray(response.products) ? response.products : response as any);
      setFilteredProducts(Array.isArray(response.products) ? response.products : response as any);
      
      // Fetch user wishlist if logged in
      if (isLoggedIn) {
        await fetchUserWishlist();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMsg);
      console.error('Fetch products error:', err);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      if (!isLoggedIn) return;
      
      const wishlistItems = await wishlistService.getWishlist();
      const favMap: { [key: string]: boolean } = {};
      wishlistItems.forEach((item: Product) => { 
        favMap[item._id] = true; 
      });
      setFavorites(favMap);
    } catch (err) { 
      console.error("Wishlist sync error", err); 
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isLoggedIn]);

  // Filter by category
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

  // Handle search
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
      router.push('/signup');
      return;
    }

    const isCurrentlyFavorite = favorites[productId];
    const newFavorites = { ...favorites, [productId]: !isCurrentlyFavorite };
    setFavorites(newFavorites);

    try {
      if (isCurrentlyFavorite) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
    } catch (error) {
      // Revert on error
      setFavorites(favorites);
      Alert.alert("Error", "Failed to update wishlist");
    }
  };

  const addToCart = async (product: Product) => {
    if (!isLoggedIn) {
      Alert.alert("Please Log In", "You need to log in to add items to your cart.");
      router.push('/signup');
      return;
    }

    try {
      await cartService.updateCart(product._id, 'add');
      Alert.alert("Success", `${product.name} added to basket!`);
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart. Please try again.");
      console.error('Add to cart error:', error);
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
          <Image 
            source={{ uri: item.image }} 
            style={styles.img}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
          <TouchableOpacity 
            style={styles.heart} 
            onPress={() => toggleFavorite(item._id)}
          >
            <Ionicons 
              name={favorites[item._id] ? "heart" : "heart-outline"} 
              size={22} 
              color={favorites[item._id] ? "#FF0000" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.prodTitle} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
        </View>
        <Text style={styles.prodPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.cartBtn} 
          onPress={() => addToCart(item)}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyBtn} 
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#002DFF" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search product..." 
              placeholderTextColor="#999"
              value={search}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => router.push('/categories' as any)}
          >
            <Ionicons name="options-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroRow}>
          <Text style={styles.heroText}>
            {category ? `${category} Collection` : "Welcome to Shop"}
          </Text>
          {!isLoggedIn && (
            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {filteredProducts.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
          <TouchableOpacity 
            style={styles.retryBtn}
            onPress={fetchProducts}
          >
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={renderProductCard}
        />
      )}

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={28} color="#002DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
          <Ionicons name="list" size={28} color="#777" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/basket')}>
          <Ionicons name="basket" size={28} color="#777" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={28} color="#777" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#000C33', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20, 
    paddingBottom: 25 
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchBar: { 
    flex: 1, 
    backgroundColor: '#fff', 
    height: 50, 
    borderRadius: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginRight: 15 
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#000' },
  filterBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  heroRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  heroText: { color: '#fff', fontSize: 22, fontWeight: 'bold', flex: 1 },
  loginBtn: { backgroundColor: '#002DFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  loginBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  errorBanner: { backgroundColor: '#FFE0E0', padding: 10, margin: 10, borderRadius: 8 },
  errorText: { color: '#D32F2F', fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },
  retryBtn: { backgroundColor: '#002DFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15 },
  retryBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  grid: { padding: 10, paddingBottom: 120 },
  card: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 10, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: { width: '100%', aspectRatio: 1, borderRadius: 15, overflow: 'hidden' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  heart: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  prodTitle: { fontWeight: 'bold', marginTop: 10, fontSize: 14, color: '#000' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#666' },
  prodPrice: { color: '#002DFF', fontWeight: 'bold', marginBottom: 5, marginTop: 3 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  cartBtn: { backgroundColor: '#002DFF', padding: 8, borderRadius: 10, flex: 0.4, alignItems: 'center' },
  buyBtn: { backgroundColor: '#000C33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flex: 0.4, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
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

