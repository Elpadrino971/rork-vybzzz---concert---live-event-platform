import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/theme-context";
import { UserProvider } from "@/hooks/user-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile/[id]" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="event/[id]" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          presentation: "modal",
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}