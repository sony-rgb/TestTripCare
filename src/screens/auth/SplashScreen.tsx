import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

type Nav = StackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.logo}>
          Trip<Text style={styles.logoAccent}>Care</Text>
        </Text>
        <Text style={styles.tagline}>Where Every Trip Finds Its Flow</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { alignItems: 'center', gap: 12 },
  logo: {
    fontFamily: Fonts.bold,
    fontSize: 42,
    color: Colors.white,
    letterSpacing: -1,
  },
  logoAccent: {
    color: 'rgba(255,255,255,0.75)',
  },
  tagline: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
});
