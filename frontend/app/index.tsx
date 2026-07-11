import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
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
  const [captcha, setCaptcha] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle Login
  const handleLogin = async (): Promise<void> => {
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
    if (captcha.toUpperCase() !== 'K9S5Y2') {
      Alert.alert('Captcha Failed', 'Please enter the correct code.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home' as any);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.inner} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="rose@gmail.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="......"
            placeholderTextColor="#666"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/forgot-password' as any)}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.captchaRow}>
            <View style={styles.captchaDisplay}>
              <Text style={styles.captchaText}>K 9 S 5 Y 2</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn}>
              <Ionicons name="refresh-outline" size={24} color="#E88358" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Captcha (e.g. K9S5Y2)"
            placeholderTextColor="#666"
            value={captcha}
            onChangeText={setCaptcha}
            autoCapitalize="characters"
            editable={!loading}
          />

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#000', marginBottom: 40 },
  formContainer: { width: '100%' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    fontSize: 16,
    color: '#000'
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -5 },
  forgotText: { color: '#05103A', fontWeight: 'bold', fontSize: 14 },
  captchaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  captchaDisplay: {
    flex: 1,
    backgroundColor: '#05103A',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15
  },
  captchaText: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontStyle: 'italic', letterSpacing: 4 },
  refreshBtn: { padding: 5 },
  button: {
    backgroundColor: '#05103A',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signupLink: { alignItems: 'center' },
  signupText: { fontSize: 15, color: '#333' },
  signupBold: { fontWeight: 'bold', color: '#000' }
});
