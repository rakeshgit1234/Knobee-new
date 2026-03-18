import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HEADER_H, SW } from './layout';

const BG  = '#FDF6EE';
const BLK = '#111111';

function HouseIcon() {
  return (
    <View style={styles.houseWrap}>
      <View style={styles.roof} />
      <View style={styles.chimney} />
      <View style={styles.body}>
        <View style={styles.door} />
      </View>
    </View>
  );
}

function ChatIcon({ dotColor }) {
  return (
    <TouchableOpacity style={styles.iconWrap}>
      <Text style={styles.iconChar}>⇄</Text>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
    </TouchableOpacity>
  );
}

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.homeBtn}>
        <HouseIcon />
      </TouchableOpacity>
      <View style={styles.right}>
        <ChatIcon dotColor="#5BB8D4" />
        <ChatIcon dotColor="#E879A0" />
        <TouchableOpacity style={styles.iconWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW,
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD0',
    zIndex: 200,
  },
  homeBtn: { padding: 3 },

  houseWrap: { alignItems: 'center', width: 26, height: 26 },
  roof: {
    width: 0, height: 0,
    borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: BLK,
    marginBottom: -1,
  },
  chimney: {
    position: 'absolute', top: 0, right: 7,
    width: 4, height: 5,
    backgroundColor: BLK,
    borderTopLeftRadius: 1, borderTopRightRadius: 1,
  },
  body: {
    width: 18, height: 13,
    backgroundColor: BLK, borderRadius: 1,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  door: {
    width: 5, height: 7,
    backgroundColor: BG,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },

  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrap: {
    position: 'relative', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26,
  },
  iconChar: { fontSize: 21, color: BLK, fontWeight: '700' },
  searchIcon: { fontSize: 18 },
  dot: {
    position: 'absolute', bottom: -1, right: -2,
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1.5, borderColor: BG,
  },
});
