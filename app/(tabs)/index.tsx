import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAlarms } from '@/context/AlarmContext';
import { AlarmCard } from '@/components/alarm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Alarm } from '@/types/alarm';

export default function AlarmsScreen() {
  const { sortedAlarms, toggleAlarm, deleteAlarm } = useAlarms();
  const hasAlarms = sortedAlarms.length > 0;

  const handleAddAlarm = () => {
    router.push('/new-alarm');
  };

  const handleEditAlarm = (alarm: Alarm) => {
    router.push({ pathname: '/new-alarm', params: { alarmId: alarm.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Alarms</Text>
          {hasAlarms && (
            <Text style={styles.alarmCount}>
              {sortedAlarms.length} alarm{sortedAlarms.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <Pressable style={styles.addButton} onPress={handleAddAlarm}>
          <IconSymbol name="plus" size={24} color={Colors.card} />
        </Pressable>
      </View>

      {!hasAlarms ? (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No alarms yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + to create your first alarm
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedAlarms.map(alarm => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onToggle={toggleAlarm}
              onDelete={deleteAlarm}
              onPress={handleEditAlarm}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.title.fontSize,
    color: Colors.text,
  },
  alarmCount: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
