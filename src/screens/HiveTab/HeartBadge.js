import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARD_W, CARD_H } from './layout';

export default function HeartBadge({ layout }) {
  const parentEntries = Object.entries(layout).filter(([, n]) => n.role === 'parent');
  if (parentEntries.length < 2) return null;

  const sorted = parentEntries.sort((a, b) => a[1].x - b[1].x);
  const leftN  = sorted[0][1];
  const rightN = sorted[sorted.length - 1][1];

  const hx = (leftN.x + CARD_W + rightN.x) / 2 - 11;
  const hy = leftN.y + CARD_H / 2 - 12;

  return (
    <View style={[styles.badge, { left: hx, top: hy }]}>
      <Text style={styles.heart}>❤️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { fontSize: 20 },
});
