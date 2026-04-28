import type React from 'react';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Input } from './Input';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  icon?: React.ReactNode;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ icon, options, value, onChange, error, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)}>
        <View pointerEvents="none">
          <Input leftIcon={icon} placeholder={placeholder} value={displayValue} error={error} editable={false} />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{placeholder}</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  {options.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                        onPress={() => {
                          onChange?.(opt.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff5e1',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    maxHeight: '80%',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 2,
    borderColor: '#1a1a1a',
    backgroundColor: '#ffb380',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  optionsList: {
    padding: 10,
  },
  optionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#ffe0b2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5d4037',
  },
  optionTextSelected: {
    fontWeight: '800',
    color: '#1a1a1a',
  },
});
