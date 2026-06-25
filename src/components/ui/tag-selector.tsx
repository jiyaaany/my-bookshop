import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Tag } from '@/types/models';

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onAddTag?: () => void;
}

/** Multi-select tag chips with a "+ 태그" affordance (책 추가 / 직접 입력). */
export function TagSelector({ tags, selectedIds, onToggle, onAddTag }: TagSelectorProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <Pressable
            key={tag.id}
            onPress={() => onToggle(tag.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: selected ? theme.primary : theme.surfaceMuted },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.label,
                { color: selected ? theme.onPrimary : theme.textTertiary, fontWeight: selected ? '600' : '500' },
              ]}>
              {tag.name}
              {selected ? ' ✓' : ''}
            </Text>
          </Pressable>
        );
      })}
      {onAddTag ? (
        <Pressable
          onPress={onAddTag}
          accessibilityRole="button"
          accessibilityLabel="태그 추가"
          style={({ pressed }) => [styles.addChip, { borderColor: theme.border }, pressed && styles.pressed]}>
          <Text style={[styles.label, { color: theme.primary }]}>+ 태그</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Radii.full,
  },
  addChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  label: { fontSize: 12.5 },
  pressed: { opacity: 0.85 },
});
