import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'info' | 'error';
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
}) => {
  const translateY = React.useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getStyle = () => {
    switch (type) {
      case 'error':
        return { bg: '#FCE8E6', color: '#D93025', icon: 'close-circle' };
      case 'info':
        return { bg: '#E8F0FE', color: '#1A73E8', icon: 'information-circle' };
      case 'success':
      default:
        return { bg: '#E6F4EA', color: '#137333', icon: 'checkmark-circle' };
    }
  };

  const styleInfo = getStyle();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={[styles.toastCard, { backgroundColor: styleInfo.bg }]}>
        <Ionicons name={styleInfo.icon as any} size={22} color={styleInfo.color} style={{ marginRight: 10 }} />
        <Text style={[styles.toastText, { color: styleInfo.color }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    maxWidth: 400,
    width: '100%',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
