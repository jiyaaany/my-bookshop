/**
 * Bottom-sheet picker for the library sort order. Replaces the old cycle-tap
 * button so all options are visible and selectable directly (the ▼ affordance
 * now actually opens a list). Shared by 책장(home) and 설정(settings).
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Radii } from '@/constants/theme';
import { SORT_CYCLE, SORT_LABEL, type SortOrder } from '@/features/library/use-library';
import { useTheme } from '@/hooks/use-theme';

export function SortSheet({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SortOrder;
  onSelect: (sort: SortOrder) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.surfaceSunken }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <Text style={[styles.title, { color: theme.heading }]}>정렬</Text>
        <View style={styles.options}>
          {SORT_CYCLE.map((opt, i) => {
            const selected = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => onSelect(opt)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  i > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSoft },
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: selected ? theme.primary : theme.heading, fontWeight: selected ? '700' : '500' },
                  ]}>
                  {SORT_LABEL[opt]}
                </Text>
                {selected ? <CheckIcon size={18} color={theme.primary} strokeWidth={2.6} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,7,5,0.55)' },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 32,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
  },
  handle: { width: 40, height: 4, borderRadius: Radii.full, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center', letterSpacing: -0.2, marginBottom: 12 },
  options: {},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionLabel: { fontSize: 15.5 },
  pressed: { opacity: 0.6 },
});
