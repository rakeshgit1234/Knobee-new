/**
 * RelationFinderScreen.js
 *
 * Relation Finder — shows the relationship path between "Me" and a target person
 * through a chain of connections rendered as circular avatars linked by lines.
 *
 * Layout matches screenshot:
 *  - Light grey background with diagonal "knoBee" watermark
 *  - Header: ← "Relation Finder" share icon
 *  - Vertical graph with branching paths, thin connector lines
 *  - "Me" at top (large circle), target "Abhishek" at bottom (large circle)
 *  - All paths converge at target
 *
 * Props: { onBack, targetPerson }
 */

import React, { useRef } from 'react';
import {
  Dimensions, Image, ImageBackground, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

const HEADER_H  = 54 + 14 + 14; // paddingTop + paddingBottom
const CANVAS_W  = SW;
// Available height after header (no scroll — fits on screen)
const CANVAS_H  = SH - HEADER_H - 34; // 34 = status bar approx

// Node size
const NODE_BIG = 70;
const NODE_SM  = 46;

// Column x-centers
const CX_L = SW * 0.22;
const CX_C = SW * 0.50;
const CX_R = SW * 0.78;

// Helper: map 0–1800 virtual coords to actual canvas height, with top padding
const TOP_PAD = 20;
const sy = (v: number) => TOP_PAD + (v / 1800) * (CANVAS_H - TOP_PAD - 20);

const NODES = [
  { id: 'me',        label: 'Me',      size: NODE_BIG, x: CX_C, y: sy(60),   photo: 'https://i.pravatar.cc/150?img=11' },
  // Left branch — wider gaps
  { id: 'father',    label: 'Father',  size: NODE_SM,  x: CX_L, y: sy(260),  photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  { id: 'sister',    label: 'Sister',  size: NODE_SM,  x: CX_L, y: sy(480),  photo: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { id: 'husband',   label: 'Husband', size: NODE_SM,  x: CX_L, y: sy(700),  photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { id: 'brotherL',  label: 'Brother', size: NODE_SM,  x: CX_L, y: sy(920),  photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
  // Center branch
  { id: 'wife1',     label: 'Wife',    size: NODE_SM,  x: CX_C, y: sy(260),  photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'motherC',   label: 'Mother',  size: NODE_SM,  x: CX_C, y: sy(530),  photo: 'https://randomuser.me/api/portraits/women/55.jpg' },
  // Right branch — wider gaps
  { id: 'motherR',   label: 'Mother',  size: NODE_SM,  x: CX_R, y: sy(260),  photo: 'https://randomuser.me/api/portraits/women/29.jpg' },
  { id: 'brotherR1', label: 'Brother', size: NODE_SM,  x: CX_R, y: sy(430),  photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { id: 'wifeR1',    label: 'Wife',    size: NODE_SM,  x: CX_R, y: sy(600),  photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'brotherR2', label: 'Brother', size: NODE_SM,  x: CX_R, y: sy(770),  photo: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { id: 'wifeR2',    label: 'Wife',    size: NODE_SM,  x: CX_R, y: sy(940),  photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
  { id: 'sisterR',   label: 'Sister',  size: NODE_SM,  x: CX_R, y: sy(1110), photo: 'https://randomuser.me/api/portraits/women/28.jpg' },
  // Convergence
  { id: 'sonL',      label: 'Son',     size: NODE_SM,  x: CX_C - 55, y: sy(1330), photo: null },
  { id: 'sonR',      label: 'Son',     size: NODE_SM,  x: CX_C + 55, y: sy(1330), photo: null },
  // Target
  { id: 'target',    label: 'Abhishek',size: NODE_BIG, x: CX_C, y: sy(1560), photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
];

// Edges: pairs of node IDs
const EDGES = [
  // Me → left/center/right
  ['me', 'father'],
  ['me', 'wife1'],
  ['me', 'motherR'],

  // Left chain
  ['father', 'sister'],
  ['sister', 'husband'],
  ['husband', 'brotherL'],

  // Center chain
  ['wife1', 'motherC'],

  // Right chain
  ['motherR', 'brotherR1'],
  ['brotherR1', 'wifeR1'],
  ['wifeR1', 'brotherR2'],
  ['brotherR2', 'wifeR2'],
  ['wifeR2', 'sisterR'],

  // Convergence: all paths → Son nodes
  ['brotherL', 'sonL'],
  ['motherC', 'sonL'],
  ['sisterR', 'sonR'],

  // Son nodes → Abhishek
  ['sonL', 'target'],
  ['sonR', 'target'],
];

// ─── Build lookup ─────────────────────────────────────────────────────────────
const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]));


// ─── Person node ─────────────────────────────────────────────────────────────
function PersonNode({ node }) {
  const isBig = node.size === NODE_BIG;
  const half  = node.size / 2;

  return (
    <View style={[
      styles.nodeWrap,
      {
        left: node.x - half,
        top:  Math.max(0, node.y - half),
        width: node.size,
      },
    ]}>
      <View style={[
        styles.nodeCircle,
        {
          width: node.size,
          height: node.size,
          borderRadius: node.size / 2,
          borderWidth: isBig ? 3 : 2,
          borderColor: isBig ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
        },
      ]}>
        {node.photo ? (
          <Image
            source={{ uri: node.photo }}
            style={{ width: '100%', height: '100%', borderRadius: node.size / 2 }}
          />
        ) : (
          <View style={[styles.nodePlaceholder, { borderRadius: node.size / 2 }]}>
            <Text style={styles.nodePlaceholderTxt}>?</Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.nodeLabel,
        isBig && styles.nodeLabelBig,
      ]}>
        {node.label}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RelationFinderScreen({ onBack, targetPerson }) {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relation Finder</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Image
            source={require('../../../assets/images/home/share.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Canvas — ImageBackground fills flex:1 */}
      <ImageBackground
        source={require('../../../assets/images/profile/bg.png')}
        style={styles.canvas}
        resizeMode="contain"
      >
        {/* SVG connector lines */}
        <Svg
          width={CANVAS_W}
          height={CANVAS_H}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          {EDGES.map(([fromId, toId], i) => {
            const from = NODE_MAP[fromId];
            const to   = NODE_MAP[toId];
            if (!from || !to) return null;
            return (
              <Line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke="rgba(80,80,80,0.45)"
                strokeWidth={1.2}
              />
            );
          })}
        </Svg>

        {/* Person nodes */}
        {NODES.map(node => (
          <PersonNode key={node.id} node={node} />
        ))}
      </ImageBackground>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8E8E8' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
    zIndex: 10,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#1A1A1A' },
  headerTitle: {
    fontSize: 18, fontWeight: '600', color: '#1A1A1A',
    fontFamily: 'SofiaSansCondensed-SemiBold',
  },

  canvas: { flex: 1 },

  // Node
  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  nodeCircle: {
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    backgroundColor: '#CCC',
  },
  nodePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: '#BBBBBB',
    alignItems: 'center', justifyContent: 'center',
  },
  nodePlaceholderTxt: { fontSize: 22, color: '#888' },
  nodeLabel: {
    marginTop: 5,
    fontSize: 13,
    color: '#1A1A1A',
    fontFamily: 'SofiaSansCondensed-Medium',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  nodeLabelBig: {
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    fontWeight: '600',
  },
});