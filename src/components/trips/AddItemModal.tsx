import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemType } from '../../types';
import { Colors, EventColors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

const ITEM_OPTIONS: Array<{
  type: ItemType;
  label: string;
  icon: string;
  description: string;
}> = [
  { type: 'flight', label: 'Flight', icon: 'airplane', description: 'Add a flight segment' },
  { type: 'hotel', label: 'Lodging', icon: 'bed', description: 'Hotel, Airbnb, or cruise cabin' },
  { type: 'car', label: 'Car Rental', icon: 'car', description: 'Add a rental car' },
  { type: 'activity', label: 'Activity', icon: 'ticket', description: 'Tours, dining, attractions' },
];

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ItemType) => void;
}

export default function AddItemModal({ visible, onClose, onSelect }: AddItemModalProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handle} />

          <Text style={styles.title}>Add to Itinerary</Text>
          <Text style={styles.subtitle}>What would you like to add?</Text>

          <View style={styles.options}>
            {ITEM_OPTIONS.map((opt) => {
              const palette = EventColors[opt.type];
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={styles.option}
                  onPress={() => { onClose(); onSelect(opt.type); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionIcon, { backgroundColor: palette.bg }]}>
                    <Ionicons name={opt.icon as any} size={22} color={palette.text} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: Fonts.bold, fontSize: 19, color: Colors.text },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, marginTop: 3, marginBottom: 20 },

  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  optionDesc: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted, marginTop: 2 },
});
