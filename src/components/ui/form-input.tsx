import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

/** Labeled text field matching the 책 추가 / 직접 입력 mock. */
export function FormInput({ label, containerStyle, multiline, style, ...rest }: FormInputProps) {
  const theme = useTheme();
  return (
    <View style={containerStyle}>
      {label ? <Text style={[styles.label, { color: theme.eyebrow }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.heading,
          },
          multiline && styles.multiline,
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: '500',
  },
  multiline: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
});
