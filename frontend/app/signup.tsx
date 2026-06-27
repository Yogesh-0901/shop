import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle Signup
  const handleSignup = async (): Promise<void> => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Call authService to signup
      const response = await authService.signup(fullName, email, password);
      
      if (response.token) {
        // Update auth context with new user
        await signup(fullName, email, password);
        Alert.alert("Success", "Account created! Logging you in...");
        router.replace('/home' as any);
      } else {
        Alert.alert("Error", response.message || "Signup failed");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Signup failed";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google Signup Logic (UI Only for now)
  const handleGoogleSignup = () => {
    Alert.alert(
      "Coming Soon", 
      "Google authentication will be available soon.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inner}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Email Address" 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Password (min 6 characters)" 
                secureTextEntry={true} 
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Confirm Password" 
                secureTextEntry={true} 
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
          </TouchableOpacity>

          {/* GOOGLE OPTION */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignup}>
            <Ionicons name="logo-google" size={22} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/index' as any)} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  inner: { paddingHorizontal: 35, paddingVertical: 40 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 30, color: '#000' },
  inputGroup: { width: '100%' },
  inputBox: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    paddingVertical: 18, 
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  input: { fontSize: 16, color: '#000' },
  signupBtn: { 
    backgroundColor: '#002DFF', 
    paddingVertical: 18, 
    borderRadius: 40, 
    marginTop: 20, 
    alignItems: 'center',
    elevation: 3
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  orText: { marginHorizontal: 10, color: '#666', fontWeight: '600' },
  googleBtn: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    borderRadius: 40, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1
  },
  googleBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginText: { fontSize: 16, color: '#000' },
  loginBold: { fontWeight: 'bold', color: '#002DFF' }
});
