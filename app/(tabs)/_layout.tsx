import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lịch học',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
      name="activities"
      options={{
        title: 'Sự kiện',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
      }}
    />
      <Tabs.Screen
        name="qr-scanner"
        options={{
          title: 'Quét mã QR',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      
    </Tabs>
    // lịch sự kiện
    
  );
}
