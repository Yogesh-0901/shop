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
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleResetPassword = async (): Promise<void> => {
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert(
        "Invalid Email", 
        "Only @gmail.com email addresses are allowed to reset password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long and contain both letters and numbers");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          Alert.alert("Success", "Your password has been reset successfully!");
          router.replace('/' as any);
        } else {
          Alert.alert("Error", data.error || "Reset failed");
        }
      } catch (parseError) {
        console.error("Server Error Response:", responseText);
        Alert.alert("Server Error", "Invalid response from server. Please check your backend terminal.");
      }
    } catch (error: unknown) {
      Alert.alert("Error", "Could not connect to the server. Check your IP and Wi-Fi.");
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

            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.instruction}>
              Enter your email and create a new password to regain access to your account.
            </Text>
            
            <View style={styles.formContainer}>
              <TextInput 
                style={styles.input} 
                placeholder="your@gmail.com" 
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput 
                style={styles.input} 
                placeholder="New Password" 
                placeholderTextColor="#666"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Confirm Password" 
                placeholderTextColor="#666"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'RESETTING...' : 'RESET PASSWORD'}</Text>
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
  title: { fontSize: 36, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  instruction: { fontSize: 15, color: '#333', marginBottom: 40, lineHeight: 22 },
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
  button: { 
    backgroundColor: '#05103A', 
    paddingVertical: 18, 
    borderRadius: 30, 
    marginTop: 10, 
    alignItems: 'center'
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
