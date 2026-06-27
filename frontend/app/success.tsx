import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Success Illustration Section */}
        <View style={styles.imageContainer}>
           <View style={styles.bagGroup}>
              {/* You can replace these Views with your local Image assets */}
              <View style={[styles.bag, styles.bagYellow]} />
              <View style={[styles.bag, styles.bagRed]} />
           </View>
           {/* Decorative dots to match your confetti design */}
           <View style={[styles.dot, {top: '10%', left: '25%', backgroundColor: '#FF5722'}]} />
           <View style={[styles.dot, {top: '30%', right: '20%', backgroundColor: '#2196F3'}]} />
           <View style={[styles.dot, {bottom: '20%', left: '15%', backgroundColor: '#4CAF50'}]} />
        </View>

        {/* Text Section */}
        <Text style={styles.successTitle}>SUCCESS!</Text>
        <Text style={styles.successMessage}>
          Your order will be delivered soon.{"\n"}
          Thank you for choosing our app.
        </Text>

        {/* Full-width Button Section */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.continueBtn} 
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.continueText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#D2B2AE' // This background color will now fill the entire browser
  },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%', // Ensures content spans the whole width
    paddingHorizontal: '5%' // Small breathing room on sides
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bagGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bag: {
    width: 80,
    height: 100,
    borderRadius: 10,
  },
  bagYellow: {
    backgroundColor: '#FFC107',
    transform: [{ rotate: '-15deg' }],
    marginRight: -20,
  },
  bagRed: {
    backgroundColor: '#D32F2F',
    height: 120,
    width: 90,
    transform: [{ rotate: '10deg' }],
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  successTitle: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#000', 
    marginVertical: 20,
    letterSpacing: 2
  },
  successMessage: { 
    fontSize: 18, 
    textAlign: 'center', 
    color: '#333', 
    lineHeight: 28,
    marginBottom: 60 
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 600, // Keeps the button from looking too stretched on massive screens
  },
  continueBtn: { 
    backgroundColor: '#000C33', 
    width: '100%', 
    height: 65, 
    borderRadius: 35, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  continueText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
