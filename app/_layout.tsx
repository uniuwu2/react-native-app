import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Ngăn màn hình khởi động tự động ẩn
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || !router) return;

    console.log("Segments: ", segments);
    console.log("Trạng thái xác thực:", {
      isAuthenticated,
      currentPath: segments.join("/"),
    });

    const currentPath = segments.length > 0 ? segments[0] : "";
    const inAuthGroup = currentPath === "login";
    const isScannerWithoutAuth = currentPath === "scanner";

    if (isScannerWithoutAuth) {
      console.log("Đang ở màn hình scanner, không yêu cầu đăng nhập.");
      return; // Không redirect nếu đang ở scanner
    }

    if (!isAuthenticated && !inAuthGroup && !isScannerWithoutAuth) {
      console.log("Người dùng chưa đăng nhập, chuyển hướng đến /login");
      router.replace("/login");
      return;
    }

    if (isAuthenticated && currentPath !== "(tabs)") {
      console.log("Người dùng đã đăng nhập, chuyển hướng đến /(tabs)");
      router.replace("/(tabs)");
      return;
    }
  }, [isAuthenticated, loading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
