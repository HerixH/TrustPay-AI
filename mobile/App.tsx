import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import type { HomeStackParamList, RootTabParamList } from "./src/navigation/types";
import { HomeScreen } from "./src/screens/HomeScreen";
import { DealCreateScreen } from "./src/screens/DealCreateScreen";
import { DealDetailScreen } from "./src/screens/DealDetailScreen";
import { WalletScreen } from "./src/screens/WalletScreen";
import { LandingScreen } from "./src/screens/LandingScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { EscrowMarketingScreen } from "./src/screens/EscrowMarketingScreen";
import { WalletProvider } from "./src/wallet/WalletContext";
import { COLORS } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const stackScreenOptions = {
  contentStyle: { backgroundColor: COLORS.bg },
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { color: COLORS.text },
} as const;

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Deals"
        component={HomeScreen}
        options={{ title: "My deals" }}
      />
      <HomeStack.Screen name="Wallet" component={WalletScreen} options={{ title: "Wallets" }} />
      <HomeStack.Screen
        name="DealCreate"
        component={DealCreateScreen}
        options={{ title: "New deal" }}
      />
      <HomeStack.Screen
        name="DealDetail"
        component={DealDetailScreen}
        options={{ title: "Deal room" }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.borderSubtle,
        },
        tabBarActiveTintColor: COLORS.accentMint,
        tabBarInactiveTintColor: COLORS.textFaint,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Escrow"
        component={EscrowMarketingScreen}
        options={{
          title: "Escrow",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-closed-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Live"
        component={FeedScreen}
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accentMint,
    background: COLORS.bg,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.borderSubtle,
    notification: COLORS.accentPurple,
  },
};

export default function App() {
  return (
    <WalletProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <MainTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </WalletProvider>
  );
}
