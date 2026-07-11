import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        
        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.yellowCard]}>
            <Ionicons name="bag-handle" size={70} color="#fff" />
          </View>
          <View style={[styles.card, styles.redCard]}>
            <Ionicons name="bag-handle" size={70} color="#fff" />
          </View>
          
          <View style={[styles.dot, styles.dotOrange]} />
          <View style={[styles.dot, styles.dotBlue]} />
          <View style={[styles.dot, styles.dotGreen]} />
        </View>

        <Text style={styles.successTitle}>SUCCESS!</Text>
        <Text style={styles.successMessage}>
          Your order will be delivered soon.{"\n"}
          Thank you for choosing our app.
        </Text>

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
    backgroundColor: '#D8B4A0' 
  },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%', 
    paddingHorizontal: 30
  },
  cardsContainer: {
    height: 160,
    width: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    marginTop: -40
  },
  card: {
    width: 90,
    height: 120,
    borderRadius: 20,
    position: 'absolute',
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  yellowCard: {
    backgroundColor: '#FACC15', 
    transform: [{ rotate: '-12deg' }, { translateX: -20 }, { translateY: 5 }],
    zIndex: 1
  },
  redCard: {
    backgroundColor: '#DC2626',
    transform: [{ rotate: '8deg' }, { translateX: 20 }],
    zIndex: 2
  },
  dot: {
    position: 'absolute',
    borderRadius: 50
  },
  dotOrange: { width: 12, height: 12, backgroundColor: '#FF5722', top: -30, left: 10 },
  dotBlue: { width: 10, height: 10, backgroundColor: '#2196F3', top: 10, right: -10 },
  dotGreen: { width: 10, height: 10, backgroundColor: '#4CAF50', bottom: -10, left: -10 },
  successTitle: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#000', 
    marginVertical: 10,
    letterSpacing: 1
  },
  successMessage: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#444', 
    lineHeight: 26,
    marginBottom: 60 
  },
  buttonWrapper: {
    width: '100%',
  },
  continueBtn: { 
    backgroundColor: '#05103A', 
    width: '100%', 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  continueText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold'
  }
});
