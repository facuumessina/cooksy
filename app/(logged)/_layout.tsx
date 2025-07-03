import { LoadingScreen } from '@/components/LoadingScreen';
import { DataProvider, useData } from '@/context/DataProvider';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';

const loggedLayout = () => {
  const { user, isInitialized, isLoading } = useData();

  useEffect(() => {
    if (isInitialized && !isLoading && !user?.Onboarding.completed) {
      router.replace('/(logged)/onboarding/onboardingSteps');
    }
  }, [user, isLoading, isInitialized]);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DataProvider>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding/onboardingSteps" />
          <Stack.Screen name="recipes/create" />
          <Stack.Screen name="recommendations/index" />
          <Stack.Screen name='recommendations/[id]' />
          <Stack.Screen name="tips/[id]" />
        </Stack>
      </BottomSheetModalProvider>
    </DataProvider>
  )
}

export default loggedLayout