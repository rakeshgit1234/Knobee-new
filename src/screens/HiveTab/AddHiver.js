import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CANVAS_H } from './layout';

// Sits 16px above the bottom edge of the canvas
const BOTTOM_OFFSET = 16;

export default function AddHiver() {
  return (
    <View style={[styles.wrap, { bottom: BOTTOM_OFFSET }]}>
      <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
        <View style={styles.plusCircle}>
          <Text style={styles.plusTxt}>+</Text>
        </View>
        <Text style={styles.label}>Add Hiver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 11,
    gap: 11,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
  },
  plusCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  plusTxt: { fontSize: 19, color: '#111', fontWeight: '800', lineHeight: 22, marginTop: -1 },
  label: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});
