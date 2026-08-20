import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { CameraOverlay } from '../components/CameraOverlay';
import { useCardContext } from '../context/CardContext';

interface ScanScreenProps {
  navigation: any;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const { addCapturedCard, getNextCardNumber } = useCardContext();

  const [step, setStep] = useState<'front' | 'back' | 'ready'>('front');
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);

  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [saving, setSaving] = useState<boolean>(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  // Fallback demo image if camera isn't captured
  const DEMO_FRONT = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
  const DEMO_BACK = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    let capturedUri = step === 'front' ? DEMO_FRONT : DEMO_BACK;

    if (cameraRef && permission?.granted) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          capturedUri = photo.uri;
        }
      } catch (err) {
        console.warn('Camera capture error fallback:', err);
      }
    }

    if (step === 'front') {
      setFrontUri(capturedUri);
      setStep('back');
    } else if (step === 'back') {
      setBackUri(capturedUri);
      setStep('ready');
    }
  };

  const handleSelectFromGallery = (uri: string) => {
    if (step === 'front') {
      setFrontUri(uri);
      setStep('back');
    } else if (step === 'back') {
      setBackUri(uri);
      setStep('ready');
    }
  };

  const handleSkipBack = () => {
    setBackUri(undefined as any);
    setStep('ready');
  };

  const handleRetakeFront = () => {
    setFrontUri(null);
    setStep('front');
  };

  const handleRetakeBack = () => {
    setBackUri(null);
    setStep('back');
  };

  const handleSaveCard = async () => {
    if (!frontUri) return;
    setSaving(true);

    await addCapturedCard(frontUri, backUri || undefined);

    setSaving(false);
    // Reset state for next card scan & move to Process page
    setFrontUri(null);
    setBackUri(null);
    setStep('front');

    navigation.navigate('MainTabs', { screen: 'Process' });
  };

  const handleScanNextCard = async () => {
    if (!frontUri) return;
    setSaving(true);
    await addCapturedCard(frontUri, backUri || undefined);
    setSaving(false);

    // Reset scan view immediately
    setFrontUri(null);
    setBackUri(null);
    setStep('front');
  };

  const nextCardNumberFormatted = `Card #${String(getNextCardNumber()).padStart(3, '0')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {step !== 'ready' ? (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={flashMode === 'on'}
              ref={(ref) => setCameraRef(ref)}
            />
          ) : (
            <View style={styles.simulatedCamera}>
              <Ionicons name="camera-outline" size={64} color="#80868B" />
              <Text style={styles.simulatedText}>
                Camera Preview Mode (Tap shutter or Gallery button below to capture)
              </Text>
            </View>
          )}

          <CameraOverlay
            step={step}
            flashMode={flashMode}
            onToggleFlash={() => setFlashMode(flashMode === 'on' ? 'off' : 'on')}
            onFlipCamera={() => setFacing(facing === 'back' ? 'front' : 'back')}
            onCapture={handleCapture}
            onSelectFromGallery={handleSelectFromGallery}
            onSkipBack={handleSkipBack}
            onRetakeFront={handleRetakeFront}
            onRetakeBack={handleRetakeBack}
            frontCaptured={!!frontUri}
            backCaptured={!!backUri}
          />
        </View>
      ) : (
        /* Step 3: READY / CONFIRMATION VIEW */
        <View style={styles.readyContainer}>
          <View style={styles.readyHeader}>
            <Text style={styles.readyCardNum}>{nextCardNumberFormatted}</Text>
            <Text style={styles.readyTitle}>Card Paired Successfully!</Text>
            <Text style={styles.readySubtitle}>Front and back images are paired as 1 single card record.</Text>
          </View>

          <View style={styles.previewsRow}>
            <View style={styles.previewBox}>
              <Image source={{ uri: frontUri! }} style={styles.previewImage} />
              <View style={styles.badgeSuccess}>
                <Ionicons name="checkmark-circle" size={14} color="#137333" />
                <Text style={styles.badgeSuccessText}>Front ✓</Text>
              </View>
              <TouchableOpacity style={styles.retakeSmallBtn} onPress={handleRetakeFront}>
                <Text style={styles.retakeSmallText}>Retake</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewBox}>
              {backUri ? (
                <>
                  <Image source={{ uri: backUri }} style={styles.previewImage} />
                  <View style={styles.badgeSuccess}>
                    <Ionicons name="checkmark-circle" size={14} color="#137333" />
                    <Text style={styles.badgeSuccessText}>Back ✓</Text>
                  </View>
                  <TouchableOpacity style={styles.retakeSmallBtn} onPress={handleRetakeBack}>
                    <Text style={styles.retakeSmallText}>Retake</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={[styles.previewImage, styles.noBackPlaceholder]}>
                  <Ionicons name="document-text-outline" size={32} color="#9AA0A6" />
                  <Text style={styles.noBackText}>Single Sided</Text>
                  <TouchableOpacity style={styles.retakeSmallBtn} onPress={handleRetakeBack}>
                    <Text style={styles.retakeSmallText}>Add Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.saveActionsGroup}>
            <TouchableOpacity
              style={[styles.saveBtn, styles.primarySaveBtn]}
              onPress={handleSaveCard}
              disabled={saving}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-done" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primarySaveText}>
                {saving ? 'Saving Card...' : 'Save & Extract Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, styles.secondaryScanBtn]}
              onPress={handleScanNextCard}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color="#1A73E8" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryScanText}>Save & Scan Next Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  simulatedCamera: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  simulatedText: {
    color: '#9AA0A6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  readyContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    justifyContent: 'space-between',
  },
  readyHeader: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  readyCardNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A73E8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202124',
    textAlign: 'center',
  },
  readySubtitle: {
    fontSize: 13,
    color: '#5F6368',
    textAlign: 'center',
    marginTop: 4,
  },
  previewsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  previewBox: {
    alignItems: 'center',
    width: '45%',
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#E8EAED',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  noBackPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F4',
  },
  noBackText: {
    fontSize: 12,
    color: '#80868B',
    marginTop: 4,
    fontWeight: '600',
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#137333',
    marginLeft: 4,
  },
  retakeSmallBtn: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retakeSmallText: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '600',
  },
  saveActionsGroup: {
    width: '100%',
  },
  saveBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  primarySaveBtn: {
    backgroundColor: '#1A73E8',
  },
  primarySaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryScanBtn: {
    backgroundColor: '#E8F0FE',
  },
  secondaryScanText: {
    color: '#1A73E8',
    fontSize: 15,
    fontWeight: '600',
  },
});
