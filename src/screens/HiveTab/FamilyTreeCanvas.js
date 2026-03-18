/**
 * FamilyTreeCanvas.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Root canvas with flex: 0.9
 *
 * Everything — card Y positions, SVG height, header, Add Hiver button —
 * is calculated relative to CANVAS_H = SH * 0.9, so nothing overflows.
 *
 * Required packages:
 *   npm install react-native-reanimated react-native-svg react-native-gesture-handler
 *   # Expo:  npx expo install react-native-reanimated react-native-svg react-native-gesture-handler
 *
 * babel.config.js → plugins: ['react-native-reanimated/plugin']
 */

import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PEOPLE }                      from './data';
import { buildLayout, CARD_W, CARD_H, SW, CANVAS_H } from './layout';
import AnimatedNode                    from './AnimatedNode';
import PersonCard                      from './PersonCard';
import RelationshipConnector           from './RelationshipConnector';
import FloatingActionButtons           from './FloatingActionButtons';
import HeartBadge                      from './HeartBadge';
import Header                          from './Header';
import AddHiver                        from './AddHiver';

export default function FamilyTreeCanvas({ initialFocusId = 'sandhya' }) {
  const [focusedPersonId, setFocusedPersonId] = useState(initialFocusId);

  const layout = useMemo(() => buildLayout(focusedPersonId), [focusedPersonId]);

  const handlePress = useCallback((id) => {
    if (id !== focusedPersonId) setFocusedPersonId(id);
  }, [focusedPersonId]);

  // Paint lowest zIndex first (behind), highest last (on top)
  const renderOrder = useMemo(
    () => Object.entries(layout).sort((a, b) => a[1].zIndex - b[1].zIndex),
    [layout],
  );

  return (
    <View style={styles.canvas}>

      {/* ── SVG connectors — below everything ── */}
      <RelationshipConnector layout={layout} focusedId={focusedPersonId} />

      {/* ── Floating ⇄ / ✏ side buttons ── */}
      <FloatingActionButtons layout={layout} focusedId={focusedPersonId} />

      {/* ── ❤️ between parent cards ── */}
      <HeartBadge layout={layout} />

      {/* ── Animated person cards ── */}
      {renderOrder.map(([id, nodeData]) => (
        <AnimatedNode
          key={id}
          x={nodeData.x}
          y={nodeData.y}
          zIndex={nodeData.zIndex}
          width={nodeData.w}
          height={nodeData.h}
        >
          <PersonCard
            person={PEOPLE[id]}
            nodeData={nodeData}
            isCenter={id === focusedPersonId}
            onPress={() => handlePress(id)}
            cardW={nodeData.w}
            cardH={nodeData.h}
          />
        </AnimatedNode>
      ))}

      {/* ── Header — floats above all cards ── */}
      <Header />

      {/* ── Add Hiver pill ── */}
      <AddHiver />

    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    // ── KEY CHANGE: flex 0.9 ──────────────────────────────────────────────
    flex: 0.9,
    width: SW,
    // height is driven by flex:0.9 at runtime; CANVAS_H = SH*0.9 mirrors this
    backgroundColor: '#FDF6EE',
    overflow: 'hidden',
  },
});
