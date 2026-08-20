import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface CameraOverlayProps {
  step: 'front' | 'back' | 'ready';
  flashMode: 'off' | 'on';
  onToggleFlash: () => void;
  onFlipCamera: () => void;
  onCapture: () => void;
  onSelectFromGallery: (uri: string) => void;
  onSkipBack?: () => void;
  onRetakeFront?: () => void;
  onRetakeBack?: () => void;
  frontCaptured: boolean;
  backCaptured: boolean;
}

const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.88;
const FRAME_HEIGHT = FRAME_WIDTH * 0.58; // Standard 3.5:2 business card ratio

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
  step,
  flashMode,
  onToggleFlash,
  onFlipCamera,
  onCapture,
  onSelectFromGallery,
  onSkipBack,
  onRetakeFront,
  onRetakeBack,
  frontCaptured,
  backCaptured,
}) => {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [35, 20],
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSelectFromGallery(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onToggleFlash}>
          <Ionicons
            name={flashMode === 'on' ? 'flash' : 'flash-off'}
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {step === 'front' ? 'STEP 1: FRONT' : step === 'back' ? 'STEP 2: BACK' : 'PAIR COMPLETE'}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={onFlipCamera}>
          <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Frame Rectangle Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.frameRect}>
          {/* Corner Markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <Text style={styles.guideText}>
            {step === 'front'
              ? 'Place visiting card FRONT inside frame'
              : step === 'back'
              ? 'Place visiting card BACK inside frame'
              : 'Both sides captured!'}
          </Text>
        </View>
      </View>

      {/* Capture Status Badges */}
      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[styles.statusChip, frontCaptured && styles.statusChipSuccess]}
          onPress={frontCaptured ? onRetakeFront : undefined}
          activeOpacity={frontCaptured ? 0.7 : 1}
        >
          <Ionicons
            name={frontCaptured ? 'checkmark-circle' : 'radio-button-on-outline'}
            size={16}
            color={frontCaptured ? '#137333' : '#80868B'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusChipText, frontCaptured && styles.statusChipTextSuccess]}>
            Front {frontCaptured ? '✓ (Retake)' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusChip, backCaptured && styles.statusChipSuccess]}
          onPress={backCaptured ? onRetakeBack : undefined}
          activeOpacity={backCaptured ? 0.7 : 1}
        >
          <Ionicons
            name={backCaptured ? 'checkmark-circle' : 'radio-button-on-outline'}
            size={16}
            color={backCaptured ? '#137333' : '#80868B'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusChipText, backCaptured && styles.statusChipTextSuccess]}>
            Back {backCaptured ? '✓ (Retake)' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Bar Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
          <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          <Text style={styles.secondaryBtnText}>Gallery</Text>
        </TouchableOpacity>

        {/* Shutter Button */}
        <TouchableOpacity style={styles.shutterOuterBtn} onPress={onCapture} activeOpacity={0.8}>
          <View style={styles.shutterInnerBtn} />
        </TouchableOpacity>

        {step === 'back' && !backCaptured ? (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkipBack}>
            <Text style={styles.skipBtnText}>Skip Back</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1A73E8',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameRect: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#1A73E8',
  },
  topLeft: {
    top: -3,
    left: -3,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -3,
    right: -3,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  statusChipSuccess: {
    backgroundColor: '#E6F4EA',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusChipTextSuccess: {
    color: '#137333',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  shutterOuterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  shutterInnerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    width: 90,
    justifyContent: 'center',
  },
  skipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
});
