import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Constantes para la configuración del TabBar
const TAB_CONFIG = {
  ACTIVE_COLOR: '#F26E04',
  INACTIVE_COLOR: 'gray',
  BAR_HEIGHT: Platform.OS === 'ios' ? 90 : 60,
  ICON_SIZE: 24,
};

// Configuración de las pestañas
const TAB_SCREENS = [
  {
    name: 'index',
    title: 'Inicio',
    icon: ({ color, size }: any) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),
  },
  {
    name: 'recipes',
    title: 'Recetas',
    icon: ({ color, size }: any) => (
      <Ionicons name="library-outline" size={size} color={color} />
    ),
  },
  {
    name: 'profile',
    title: 'Cuenta',
    icon: ({ color, size }: any) => (
      <Ionicons name="person-outline" size={size} color={color} />
    ),
  },
];

const getTabBarStyle = () => {
  const baseStyle = {
    backgroundColor: 'white',
    height: TAB_CONFIG.BAR_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  };

  if (Platform.OS === 'ios') {
    return {
      ...baseStyle,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
  }

  return {
    ...baseStyle,
    elevation: 8,
  };
};

// Estilos comunes para el TabBar
const tabBarOptions = {
  tabBarActiveTintColor: TAB_CONFIG.ACTIVE_COLOR,
  tabBarInactiveTintColor: TAB_CONFIG.INACTIVE_COLOR,
  tabBarStyle: getTabBarStyle(),
  tabBarLabelStyle: {
    marginTop: Platform.OS === 'ios' ? 0 : -5,
    marginBottom: Platform.OS === 'ios' ? 0 : 5,
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '500' as '500' : undefined,
  },
  tabBarIconStyle: {
    marginTop: Platform.OS === 'ios' ? 10 : 5,
  },
  headerShown: false,
  // Ajustes específicos para iOS
  tabBarItemStyle: Platform.OS === 'ios' ? {
    paddingVertical: 5,
  } : undefined,
  // Configuración del layout del tab bar
  tabBarLayoutStyle: Platform.OS === 'ios' ? {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  } : undefined,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={tabBarOptions}
      // Añadir configuración específica para iOS
      sceneContainerStyle={Platform.OS === 'ios' ? {
        backgroundColor: 'white',
      } : undefined}
    >
      {TAB_SCREENS.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color, size }) => screen.icon({ color, size: TAB_CONFIG.ICON_SIZE }),
            // Ajustes específicos para cada pestaña en iOS
            tabBarItemStyle: Platform.OS === 'ios' ? {
              maxWidth: 'auto',
              marginHorizontal: 0,
            } : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}