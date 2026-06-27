import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle Login
  const handleLogin = async (): Promise<void> => {
    // Frontend Validations
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Call authService to login
      const response = await authService.login(email, password);
      
      if (response.token) {
        // Update auth context with logged-in user
        await login(email, password);
        Alert.alert('Success', 'Logged in successfully!');
        router.replace('/home' as any);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async (): Promise<void> => {
    setEmail('demo@example.com');
    setPassword('password123');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.inner}>
        <View style={styles.headerSection}>
          <Ionicons name="bag" size={52} color="#002DFF" />
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#002DFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#002DFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#002DFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/forgot-password' as any)}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.demoBtn}
          onPress={handleDemoLogin}
          disabled={loading}
        >
          <Text style={styles.demoBtnText}>Demo Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/signup' as any)}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', paddingBottom: 50 },
  headerSection: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#000', marginTop: 15 },
  subtitle: { fontSize: 16, color: '#999', marginTop: 8 },
  inputGroup: { width: '100%', marginBottom: 20 },
  inputBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  forgotBtn: { alignSelf: 'flex-end', marginRight: 5 },
  forgotText: { color: '#002DFF', fontWeight: '600', fontSize: 14 },
  button: {
    backgroundColor: '#002DFF',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { marginHorizontal: 12, color: '#999', fontWeight: '500' },
  demoBtn: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#002DFF',
    marginBottom: 20
  },
  demoBtnText: { color: '#002DFF', fontWeight: 'bold', fontSize: 16 },
  signupLink: { marginTop: 10, alignItems: 'center' },
  signupText: { fontSize: 15, color: '#666' },
  signupBold: { fontWeight: 'bold', color: '#002DFF' }
});
