import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
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