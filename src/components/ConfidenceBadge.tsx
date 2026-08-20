import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConfidenceLevel } from '../types/card';

interface ConfidenceBadgeProps {
  label: string;
  level?: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ label, level = 'high' }) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'high':
        return { bg: '#E6F4EA', text: '#137333', labelText: 'High' };
      case 'medium':
        return { bg: '#FEF7E0', text: '#B06000', labelText: 'Medium' };
      case 'low':
        return { bg: '#FCE8E6', text: '#C5221F', labelText: 'Low' };
    }
  };

  const style = getBadgeStyle();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: style.bg }]}>
        <Text style={[styles.badgeText, { color: style.text }]}>{style.labelText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C4043',
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
