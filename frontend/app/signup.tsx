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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
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

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSignup = async (): Promise<void> => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.signup(fullName, email, password);
      // Immediately logout to clear the stored token so they must login manually per requirement
      await authService.logout();
      Alert.alert("Success", "Account created successfully. Please log in.");
      router.replace('/');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Signup failed";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Sign Up</Text>

            <View style={styles.formContainer}>
              <TextInput 
                style={styles.input} 
                placeholder="Full Name" 
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Email Address" 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                secureTextEntry={true} 
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Confirm Password" 
                secureTextEntry={true} 
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/' as any)} style={styles.loginLink} disabled={loading}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8B4A0' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  inner: { paddingHorizontal: 30, paddingVertical: 40 },
  backButton: { marginBottom: 20 },
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
  signupBtn: { 
    backgroundColor: '#05103A', 
    paddingVertical: 18, 
    borderRadius: 30, 
    marginTop: 10, 
    marginBottom: 30,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginLink: { alignItems: 'center', marginTop: 15 },
  loginText: { fontSize: 15, color: '#333' },
  loginBold: { fontWeight: 'bold', color: '#000' }
});
