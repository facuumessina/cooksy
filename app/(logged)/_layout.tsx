import { LoadingScreen } from '@/components/LoadingScreen';
import { DataProvider, useData } from '@/context/DataProvider';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import React from 'react';

const loggedLayout = () => {
  const { user, isInitialized, isLoading } = useData();

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DataProvider>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="recipes/create" />
          <Stack.Screen name="recommendations/index" />
          <Stack.Screen name='recommendations/[id]' />
        </Stack>
      </BottomSheetModalProvider>
    </DataProvider>
  )
}

export default loggedLayout