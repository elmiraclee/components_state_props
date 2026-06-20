import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';

type CounterButtonProps = {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  backgroundColor: string;
};

export default function CounterButton({
  title,
  onPress,
  onLongPress,
  onPressOut,
  backgroundColor,
}: CounterButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const holdAnim = useRef(new Animated.Value(0)).current;
  const holdAnimRef = useRef<any>(null);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handleLongPress = () => {
    // Animate the hold fill bar across the button
    holdAnim.setValue(0);
    holdAnimRef.current = Animated.loop(
      Animated.timing(holdAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    );
    holdAnimRef.current.start();
    onLongPress?.();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

    if (holdAnimRef.current) {
      holdAnimRef.current.stop();
      holdAnimRef.current = null;
      Animated.timing(holdAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    onPressOut?.();
  };

  const holdWidth = holdAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
        activeOpacity={1}
        delayLongPress={400}
      >
        {/* Hold sweep indicator */}
        <Animated.View
          style={[
            styles.holdIndicator,
            { width: holdWidth },
          ]}
        />

        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    borderRadius: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  holdIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});