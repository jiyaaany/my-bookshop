import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { BookshopTabBar, TabBarButton } from '@/components/bookshop-tab-bar';

/**
 * Bottom tabs (책장 / 통계 / 설정) using expo-router/ui primitives.
 * Expo Router 56 vendors its own navigation (no @react-navigation), and the UI
 * primitives let us render the custom brown bar identically on iOS/Android/web.
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <BookshopTabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabBarButton routeName="index" />
          </TabTrigger>
          <TabTrigger name="stats" href="/stats" asChild>
            <TabBarButton routeName="stats" />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabBarButton routeName="settings" />
          </TabTrigger>
        </BookshopTabBar>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
});
