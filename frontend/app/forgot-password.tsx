import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../config/api';

export default function ForgotPassword() {
  const router = useRouter();

  // State definitions with explicit types
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Integrated single function for validation and backend call
  const handleResetPassword = async (): Promise<void> => {
    // 1. Basic validation (empty check)
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // 2. Gmail Validation
    const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert(
        "Invalid Email", 
        "Only @gmail.com email addresses are allowed to reset password."
      );
      return;
    }

    // 3. Password Match check
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    // 4. Password length check
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // 5. Backend Integration (Using updated IP and safety parsing)
    try {
      // URL UPDATED: Corrected path to match /api/auth prefix
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      // Get response as text first to handle potential HTML errors safely
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
        // This catches the "<" character crash caused by HTML error pages
        console.error("Server Error Response:", responseText);
        Alert.alert("Server Error", "Invalid response from server. Please check your backend terminal.");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Network error";
      Alert.alert("Error", "Could not connect to the server. Check your IP and Wi-Fi.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>〈</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.instruction}>
          Enter your email and create a new password to regain access to your account.
        </Text>
        
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="your@gmail.com" 
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputBox, { marginTop: 20 }]}>
          <Text style={styles.label}>New Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="******" 
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={[styles.inputBox, { marginTop: 20 }]}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="******" 
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>RESET PASSWORD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D2B2AE' },
  backButton: { padding: 25 },
  backArrow: { fontSize: 24, color: '#000' },
  inner: { flex: 1, paddingHorizontal: 35 },
  title: { fontSize: 40, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  instruction: { fontSize: 14, color: '#000', marginBottom: 40, lineHeight: 20 },
  inputBox: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    elevation: 3,
  },
  label: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  input: { fontSize: 16, color: '#000', paddingVertical: 5 },
  button: { 
    backgroundColor: '#000C33', 
    width: '100%', 
    paddingVertical: 20, 
    borderRadius: 40, 
    marginTop: 50, 
    alignItems: 'center' 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
