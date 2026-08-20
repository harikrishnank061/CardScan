import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { CardsScreen } from '../screens/CardsScreen';
import { ProcessScreen } from '../screens/ProcessScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { CardDetailScreen } from '../screens/CardDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useCardContext } from '../context/CardContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const { pendingCount } = useCardContext();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'fix-tab-bar-clipping';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Prevent bottom tab bar inner item clipping in React Native Web */
          div[role="tab"] {
            height: 100% !important;
            min-height: 65px !important;
            overflow: visible !important;
            padding-bottom: 8px !important;
            justify-content: center !important;
          }
          div[role="tablist"] {
            height: 75px !important;
            min-height: 75px !important;
            overflow: visible !important;
          }
          span, div {
            overflow: visible !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: '#5F6368',
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: Platform.OS === 'web' ? 76 : 68,
          paddingBottom: Platform.OS === 'web' ? 10 : 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8EAED',
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color }) => <Ionicons name="camera-outline" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          tabBarLabel: 'Cards',
          tabBarIcon: ({ color }) => <Ionicons name="documents-outline" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Process"
        component={ProcessScreen}
        options={{
          tabBarLabel: 'Process',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarIcon: ({ color }) => <Ionicons name="hardware-chip-outline" size={24} color={color} />,
        }}
      />

      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{
          tabBarLabel: 'Export',
          tabBarIcon: ({ color }) => <Ionicons name="download-outline" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
