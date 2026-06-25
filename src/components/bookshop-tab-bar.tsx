import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChartIcon, BookshelfIcon, SettingsIcon, type IconProps } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';

type IconComponent = (props: IconProps) => React.ReactElement;

const TABS: Record<string, { label: string; Icon: IconComponent }> = {
  index: { label: '책장', Icon: BookshelfIcon },
  stats: { label: '통계', Icon: BarChartIcon },
  settings: { label: '설정', Icon: SettingsIcon },
};

/**
 * Brown bottom-nav container. Used as the `asChild` target of `<TabList>`, so it
 * receives the TabTrigger children and lays them out in a row (matches the
 * tikitaka handoff: blurred bar, top border, safe-area aware).
 */
export const BookshopTabBar = forwardRef<View, TabListProps>(function BookshopTabBar(
  { children, style, ...rest },
  ref,
) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...rest}
      ref={ref}
      style={[
        styles.bar,
        {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 14 : 22),
        },
        style,
      ]}>
      {children}
    </View>
  );
});

/**
 * A single tab button. Spread as the `asChild` target of `<TabTrigger>`, so it
 * receives press handlers + `isFocused` and just renders icon + label.
 */
export const TabBarButton = forwardRef<View, TabTriggerSlotProps & { routeName: string }>(
  function TabBarButton({ routeName, isFocused, style, ...props }, ref) {
    const theme = useTheme();
    const tab = TABS[routeName];
    if (!tab) return null;
    const color = isFocused ? theme.tabActive : theme.tabInactive;
    const { Icon, label } = tab;
    return (
      <Pressable
        {...props}
        ref={ref}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}
        style={styles.item}>
        <Icon size={23} color={color} strokeWidth={2} />
        <Text style={[styles.label, { color, fontWeight: isFocused ? '600' : '500' }]}>{label}</Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10.5,
  },
});
