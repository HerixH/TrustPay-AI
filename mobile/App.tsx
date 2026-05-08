import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EscrowScreen } from './src/screens/EscrowScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { COLORS } from './src/theme';
import type { RootTabParamList } from './src/navigation/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.bg,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: Platform.OS === 'ios' ? 26 : 18,
          height: 64,
          borderRadius: 32,
          backgroundColor: COLORS.tabBar,
          borderTopWidth: 0,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.borderSubtle,
          paddingHorizontal: 10,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={LandingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Escrow"
        component={EscrowScreen}
        options={{
          title: 'Escrow',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Live"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
