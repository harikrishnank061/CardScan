import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DynamicListInputProps {
  title: string;
  items: string[];
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  addButtonText: string;
  onChangeItems: (items: string[]) => void;
}

export const DynamicListInput: React.FC<DynamicListInputProps> = ({
  title,
  items,
  placeholder,
  keyboardType = 'default',
  addButtonText,
  onChangeItems,
}) => {
  const handleTextChange = (text: string, index: number) => {
    const updated = [...items];
    updated[index] = text;
    onChangeItems(updated);
  };

  const handleAddItem = () => {
    onChangeItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChangeItems(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No entries added yet.</Text>
      ) : (
        items.map((item, index) => (
          <View key={`item_${index}`} style={styles.row}>
            <TextInput
              style={styles.input}
              value={item}
              onChangeText={(text) => handleTextChange(text, index)}
              placeholder={placeholder}
              placeholderTextColor="#9AA0A6"
              keyboardType={keyboardType}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveItem(index)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#D93025" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddItem}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color="#1A73E8" />
        <Text style={styles.addButtonText}>{addButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C4043',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#80868B',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#202124',
  },
  deleteButton: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: '#FCE8E6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A73E8',
    marginLeft: 6,
  },
});
