import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditRecipe() {
  const { id } = useLocalSearchParams();
  const [recipeName, setRecipeName] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [ingredientsList, setIngredientsList] = useState([{ name: '', amount: '', unit: 'g' }]);
  const [instructionsList, setInstructionsList] = useState(['']);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`https://cooksy-p77y.onrender.co/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const receta = response.data;
        setRecipeName(receta.nombre || '');
        setRecipeType(receta.tipo || '');
        if (receta.ingredientes) {
          const processedIngredients = receta.ingredientes.map(ing => {
            const cantidad = ing.cantidad.trim();
            const match = cantidad.match(/^([\d.,]+)\s*(\w+)$/);
            const amount = match?.[1] || '';
            const unit = match?.[2] || 'g';
            const result = {
              name: ing.nombre.trim(),
              amount,
              unit
            };
            return result;
          });
          setIngredientsList(processedIngredients);
        }
        if (receta.instrucciones) {
          setInstructionsList(
            receta.instrucciones?.map(i => i.descripcion) || []
          );
        }
      } catch (error) {
        console.error('Error al cargar la receta:', error.message);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleUpdateRecipe = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const ingredientesMapped = ingredientsList.map(item => ({
        nombre: item.name,
        cantidad: `${item.amount} ${item.unit}`
      }));

      const instruccionesMapped = instructionsList.map((desc, idx) => ({
        paso: idx + 1,
        descripcion: desc,
        multimedia: []
      }));

      await axios.put(
        `https://cooksy-p77y.onrender.co/recipes/${id}`,
        {
          nombre: recipeName,
          tipo: recipeType,
          ingredientes: ingredientesMapped,
          instrucciones: instruccionesMapped
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      router.push('/(logged)/profile');
    } catch (error) {
      console.error('Error al actualizar receta:', error.message);
    }
  };

  const addIngredientRow = () => {
    setIngredientsList([...ingredientsList, { name: '', amount: '', unit: 'g' }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredientsList];
    updated[index][field] = value;
    setIngredientsList(updated);
  };

  const removeIngredient = (index) => {
    const updated = [...ingredientsList];
    updated.splice(index, 1);
    setIngredientsList(updated);
  };

  const addInstructionRow = () => {
    setInstructionsList([...instructionsList, '']);
  };

  const updateInstruction = (index, value) => {
    const updated = [...instructionsList];
    updated[index] = value;
    setInstructionsList(updated);
  };

  const removeInstruction = (index) => {
    const updated = [...instructionsList];
    updated.splice(index, 1);
    setInstructionsList(updated);
  };

  const UNITS = [
    { label: 'unidades (u)', value: 'u', short: 'u' },
    { label: 'gramos (g)', value: 'g', short: 'g' },
    { label: 'kilogramos (kg)', value: 'kg', short: 'kg' },
    { label: 'tazas', value: 'taza', short: 'taza' },
    { label: 'cucharadita (cdta)', value: 'cdta', short: 'cdta' },
    { label: 'cucharadas soperas (cda)', value: 'cda', short: 'cda' },
    { label: 'mililitros (ml)', value: 'ml', short: 'ml' },
    { label: 'centímetros cúbicos (cm3)', value: 'cm3', short: 'cm3' },
    { label: 'litros (l)', value: 'l', short: 'l' },
    { label: 'onzas líquidas (oz)', value: 'oz', short: 'oz' },
  ];


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#FF6F00" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Editar Receta</Text>

        <Text style={{ fontSize: 16, marginBottom: 4 }}>Nombre de la receta</Text>
        <TextInput
          value={recipeName}
          onChangeText={setRecipeName}
          placeholder="Nombre"
          style={styles.input}
        />

        <Text style={{ fontSize: 16, marginBottom: 4 }}>Tipo de receta</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={recipeType}
            onValueChange={(value) => setRecipeType(value)}
            mode="dropdown"
            style={{ height: 50 }}
          >
            <Picker.Item label="Selecciona un tipo" value="" />
            {[
              "DESAYUNO", "MERIENDA", "PLATO PRINCIPAL", "ENTRADA", "ITALIANA",
              "MEXICANA", "JAPONESA", "MEDITERRANEA", "AMERICANA", "LATINA",
              "PANADERIA", "COMIDA RAPIDA", "VEGETARIANA", "INDIA", "INTERNACIONAL"
            ].map(tipo => (
              <Picker.Item key={tipo} label={tipo} value={tipo} />
            ))}
          </Picker>
        </View>

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {ingredientsList.map((item, index) => {
          // Forzar que item.unit sea una cadena válida
          const unitValue = typeof item.unit === 'string' ? item.unit : '';
          return (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <TextInput
                value={item.name}
                onChangeText={text => updateIngredient(index, 'name', text)}
                placeholder="Ingrediente"
                style={{
                  flex: 1,
                  borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                  paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
                  height: 44
                }}
              />
              <TextInput
                value={item.amount}
                onChangeText={text => updateIngredient(index, 'amount', text)}
                placeholder="Cant."
                keyboardType="numeric"
                style={{
                  width: 70,
                  borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
                  paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
                  height: 44
                }}
              />
              <View style={{ width: 110, marginRight: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', height: 44, justifyContent: 'center' }}>
                <Text style={{ position: 'absolute', left: 12, color: '#333', fontSize: 16, zIndex: 1 }}>
                  {UNITS.find(u => u.value === item.unit)?.short || ''}
                </Text>
                <Picker
                  selectedValue={item.unit}
                  onValueChange={(value) => updateIngredient(index, 'unit', value)}
                  style={{ height: 44, color: 'transparent' }}
                  itemStyle={{ height: 44, color: '#333' }}
                  mode="dropdown"
                >
                  {UNITS.map(u => (
                    <Picker.Item key={u.value} label={u.label} value={u.value} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Ionicons name="trash-outline" size={24} color="#FF6F00" />
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity onPress={addIngredientRow} style={{ marginBottom: 16 }}>
          <Ionicons name="add-circle-outline" size={32} color="#FF6F00" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Instrucciones</Text>
        {instructionsList.map((step, index) => (
          <View key={index} style={styles.instructionRow}>
            <TextInput
              value={step}
              onChangeText={text => updateInstruction(index, text)}
              placeholder={`Paso ${index + 1}`}
              multiline
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity onPress={() => removeInstruction(index)}>
              <Ionicons name="trash-outline" size={24} color="#FF6F00" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addInstructionRow} style={{ marginBottom: 24 }}>
          <Ionicons name="add-circle-outline" size={32} color="#FF6F00" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdateRecipe}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12
  },
  pickerContainer: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    marginBottom: 16, overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 8
  },
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8
  },
  unitPicker: {
    width: 100, marginRight: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', height: 44, justifyContent: 'center'
  },
  instructionRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8
  },
  submitButton: {
    backgroundColor: '#FF6F00',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 40
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});