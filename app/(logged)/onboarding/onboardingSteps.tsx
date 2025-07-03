import CheckboxItem from "@/components/onboarding/CheckboxItem";
import { CategoryItem } from "@/components/onboarding/SelectionGrid";
import StepsIndicator from "@/components/onboarding/StepsIndicator";
import { CUISINE_IMAGES, FOOD_CATEGORY_IMAGES } from "@/constants/categoryImages";
import { useData } from "@/context/DataProvider";
import { Cuisine, DietaryRestriction, FoodCategory } from "@/types/enums";
import { UserPreferences } from "@/types/types";
import { translateCuisine, translateDietaryRestriction, translateFood } from "@/utils/enum-translations";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingFinished from "./onboardingFinished";

const OnboardingSteps: React.FC = () => {
  const colorScheme = useColorScheme();
  const { user, updateUser } = useData();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredCategories: [],
    preferredCuisines: [],
    dietaryRestrictions: [],
    goals: [],
  });

  const SELECTED_CATEGORIES = [
    FoodCategory.VEGETABLES,
    FoodCategory.FRUITS,
    FoodCategory.MEAT,
    FoodCategory.FISH,
    FoodCategory.GRAINS,
    FoodCategory.DAIRY,
    FoodCategory.LEGUMES,
    FoodCategory.SNACKS
  ];

  const SELECTED_CUISINES = [
    Cuisine.ITALIAN,
    Cuisine.MEXICAN,
    Cuisine.CHINESE,
    Cuisine.JAPANESE,
    Cuisine.MEDITERRANEAN,
    Cuisine.FASTFOOD,
    Cuisine.VEGGIE,
    Cuisine.INTERNATIONAL
  ];

  const renderStepContent = () => {
    if (currentStep < 2) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoriesContainer}>
            {steps[currentStep].options.map((option, index): any => (
              <CategoryItem
                key={index}
                category={getTranslation(option, currentStep)}
                imageSource={
                  currentStep === 0
                    ? FOOD_CATEGORY_IMAGES[option as FoodCategory]
                    : CUISINE_IMAGES[option as Cuisine]
                }
                isSelected={steps[currentStep].current.includes(option)}
                onPress={() => steps[currentStep].onSelect(option)}
              />
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.checkboxContainer}>
        {steps[currentStep].options.map((option, index) => (
          <CheckboxItem
            key={index}
            label={getTranslation(option, currentStep)}
            isDarkMode={colorScheme === 'dark'}
            isChecked={steps[currentStep].current.includes(option)}
            onToggle={() => steps[currentStep].onSelect(option)}
          />
        ))}
      </View>
    );
  };

  const steps = useMemo(() => [
    {
      title: "Contanos lo que te gusta",
      options: SELECTED_CATEGORIES,
      current: preferences.preferredCategories,
      onSelect: (option) => {
        if (option in FoodCategory) {
          setPreferences(prev => ({
            ...prev,
            preferredCategories: prev.preferredCategories.includes(option)
              ? prev.preferredCategories.filter(c => c !== option)
              : [...prev.preferredCategories, option]
          }));
        }
      }
    },
    {
      title: "Contanos tus comidas preferidas",
      options: SELECTED_CUISINES,
      current: preferences.preferredCuisines,
      onSelect: (option) => {
        if (option in Cuisine) {
          setPreferences(prev => ({
            ...prev,
            preferredCuisines: prev.preferredCuisines.includes(option)
              ? prev.preferredCuisines.filter(c => c !== option)
              : [...prev.preferredCuisines, option]
          }));
        }
      }
    },
    {
      title: "¿Tenés alguna restricción alimentaria?",
      options: Object.values(DietaryRestriction),
      current: preferences.dietaryRestrictions,
      onSelect: (option) => {
        if (option in DietaryRestriction) {
          setPreferences(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(option)
              ? prev.dietaryRestrictions.filter(r => r !== option)
              : [...prev.dietaryRestrictions, option]
          }));
        }
      }
    }
  ], [preferences]);

  const getTranslation = (option: any, currentStep: number): string => {
    switch (currentStep) {
      case 0:
        return translateFood(option as FoodCategory);
      case 1:
        return translateCuisine(option as Cuisine);
      case 2:
        return translateDietaryRestriction(option as DietaryRestriction);
      default:
        return option.toString();
    }
  };

  const nextStep = () => {
    if (currentStep === steps.length - 1) {
      if (user) {
        updateUser({
          ...user,
          preferences,
          Onboarding: {
            completed: true,
            step: steps.length
          }
        });
      }
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (currentStep >= steps.length) {
    return <OnboardingFinished />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {currentStep === 0 && (
        <TouchableOpacity onPress={() => router.push("/register/step3")} style={{ position: "absolute", left: 20, top: 30 }}>
          <Ionicons name="arrow-back" size={28} color="#FF6600" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{steps[currentStep].title}</Text>
      <StepsIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
      />

      <GestureHandlerRootView style={styles.contentContainer}>
        {renderStepContent()}
      </GestureHandlerRootView>

      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}
        {currentStep < steps.length && (
          <TouchableOpacity
            style={[
              styles.continueButton
            ]}
            onPress={nextStep}
          >
            <Text style={styles.continueButtonText}>
              {currentStep === steps.length - 1 ? "Finalizar" : "Continuar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  checkboxContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#FF6600",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#FF6600",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OnboardingSteps;