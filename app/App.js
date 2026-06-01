import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const value = await AsyncStorage.getItem('hasOnboarded');
    setHasOnboarded(value === 'true');
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    setHasOnboarded(true);
  };

  if (hasOnboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#080808',
            borderTopColor: '#141414',
            borderTopWidth: 0.5,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: '#333',
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 0.5,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color }}>⚡</Text> }}
        />
        <Tab.Screen
          name="stats"
          component={StatsScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color }}>📊</Text> }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color }}>⚙️</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}