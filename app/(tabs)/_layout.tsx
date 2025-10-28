import { Tabs } from "expo-router";
import { Home, Search, Plus, ShoppingBag, User } from "lucide-react-native";
import React from "react";
import { Platform, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/theme-context";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/user-context";
import { Image } from "expo-image";

export default function TabLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentUser } = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-placeholder"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              onPress={() => router.push('../create' as '../create')}
              style={{
                backgroundColor: colors.accent,
                width: 48,
                height: 32,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('../create' as '../create');
          },
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Tickets",
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => 
            currentUser ? (
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: focused ? 2 : 0,
                borderColor: color,
                overflow: 'hidden',
              }}>
                <Image 
                  source={{ uri: currentUser.avatar }} 
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            ) : (
              <User size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}