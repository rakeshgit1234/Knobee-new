import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CARD_W, CARD_H } from './layout';

const TEAL    = '#5BB8D4';
const PINK    = '#E879A0';
const BTN_SZ  = 34;
const BTN_GAP = 6;

export default function FloatingActionButtons({ layout, focusedId }) {
  if (!layout[focusedId]) return null;
  const btns = [];

  const parentEntries = Object.entries(layout).filter(([, n]) => n.role === 'parent');
  if (parentEntries.length > 0) {
    const sorted = parentEntries.sort((a, b) => a[1].x - b[1].x);
    const leftN  = sorted[0][1];
    const rightN = sorted[sorted.length - 1][1];
    const midY   = leftN.y + CARD_H / 2;

    // Left of first parent
    btns.push(<Btn key="pL" x={leftN.x - BTN_SZ - 8} y={midY - BTN_SZ / 2} color={TEAL} icon="⇄" />);
    // Two stacked right of last parent
    btns.push(
      <Btn key="pR1" x={rightN.x + CARD_W + 8} y={midY - BTN_SZ - BTN_GAP / 2} color={TEAL} icon="⇄" />,
      <Btn key="pR2" x={rightN.x + CARD_W + 8} y={midY + BTN_GAP / 2}           color={TEAL} icon="⇄" />,
    );
  }

  const cn = layout[focusedId];
  if (cn) {
    btns.push(
      <Btn key="cL1" x={cn.x - BTN_SZ - 8} y={cn.y + 14}                    color={TEAL} icon="⇄" />,
      <Btn key="cL2" x={cn.x - BTN_SZ - 8} y={cn.y + 14 + BTN_SZ + BTN_GAP} color={PINK} icon="✏" />,
    );
  }

  const childEntries = Object.entries(layout).filter(([, n]) => n.role === 'child');
  if (childEntries.length > 0) {
    const sorted  = childEntries.sort((a, b) => a[1].x - b[1].x);
    const leftCN  = sorted[0][1];
    const rightCN = sorted[sorted.length - 1][1];
    const midY    = leftCN.y + CARD_H / 2;

    btns.push(<Btn key="chL" x={leftCN.x - BTN_SZ - 8} y={midY - BTN_SZ / 2} color={PINK} icon="✏" />);
    btns.push(
      <Btn key="chR1" x={rightCN.x + CARD_W + 8} y={midY - BTN_SZ - BTN_GAP / 2} color={TEAL} icon="⇄" />,
      <Btn key="chR2" x={rightCN.x + CARD_W + 8} y={midY + BTN_GAP / 2}           color={PINK} icon="✏" />,
    );
  }

  return <>{btns}</>;
}

function Btn({ x, y, color, icon }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { left: x, top: y, backgroundColor: color }]}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    width: BTN_SZ,
    height: BTN_SZ,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
