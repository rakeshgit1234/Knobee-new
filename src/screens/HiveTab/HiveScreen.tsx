/**
 * HiveScreen — Fixed-canvas family tree viewer (no bottom tabs)
 *
 * Dependencies:
 *   react-native-reanimated  >= 3
 *   react-native-svg         >= 13
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get('window');

const CARD_W = 158;
const CARD_H = 166;
const DOB_STRIP_H = 32;
const GAP = 18;
const SPOUSE_DX = 12;
const SPOUSE_DY = 10;

const HEADER_H = Platform.OS === 'ios' ? 100 : 72;
const CANVAS_H = SH - HEADER_H;

// Row Y positions inside canvas
const PARENT_Y = 14;
const FOCUS_Y = PARENT_Y + CARD_H + 68;
const CHILD_Y = FOCUS_Y + CARD_H + DOB_STRIP_H + 54;

const SPRING = { damping: 20, stiffness: 200, mass: 0.85 };

// ─── Database ─────────────────────────────────────────────────────────────────

const DB = {
  shubham: {
    id: 'shubham', name: 'Shubham Seth',
    avatar: 'https://i.pravatar.cc/150?img=70',
    profession: 'Doctor', location: 'Noida, Uttar Pradesh',
    flag: '🇮🇳', country: 'IN',
    dob: 'Jan 15, 1960', dod: 'Feb 18, 2026',
    followers: 3, gender: 'male', isDeceased: true,
    spouseIds: ['maya'], childrenIds: ['sandhya'],
    fatherId: null, motherId: null,
  },
  maya: {
    id: 'maya', name: 'Maya Seth',
    avatar: 'https://i.pravatar.cc/150?img=47',
    profession: 'Housewife', location: 'Noida, Uttar Pradesh',
    flag: '🇮🇳', country: 'IN',
    dob: 'March 11, 1968',
    followers: 15, gender: 'female',
    spouseIds: ['shubham'], childrenIds: ['sandhya'],
    fatherId: null, motherId: null,
  },
  sandhya: {
    id: 'sandhya', name: 'Sandhya Kohli',
    avatar: 'https://i.pravatar.cc/150?img=44',
    profession: 'Doctor', location: 'Noida, Uttar Pradesh',
    flag: '🇮🇳', country: 'IN',
    dob: 'March 11, 1990',
    followers: 245, gender: 'female',
    fatherId: 'shubham', motherId: 'maya',
    spouseIds: ['vikram'],
    childrenIds: ['raghav', 'shruti'],
  },
  vikram: {
    id: 'vikram', name: 'Vikram Kohli',
    avatar: 'https://i.pravatar.cc/150?img=15',
    profession: 'Engineer', location: 'Noida, Uttar Pradesh',
    flag: '🇮🇳', country: 'IN',
    dob: 'June 5, 1988',
    followers: 89, gender: 'male',
    spouseIds: ['sandhya'], childrenIds: ['raghav', 'shruti'],
    fatherId: null, motherId: null,
  },
  raghav: {
    id: 'raghav', name: 'Raghav Kohli',
    avatar: 'https://i.pravatar.cc/150?img=12',
    profession: 'Student (BBA)', location: 'Bangalore',
    flag: '🇮🇳', country: 'IN',
    dob: 'February 19, 1998',
    followers: 842, gender: 'male', isFollowing: true,
    fatherId: 'vikram', motherId: 'sandhya',
    spouseIds: [], childrenIds: [],
  },
  shruti: {
    id: 'shruti', name: 'Shruti Kohli',
    avatar: 'https://i.pravatar.cc/150?img=45',
    profession: 'Student (MBBS)', location: 'Ukraine',
    flag: '🇺🇦', country: 'UA',
    dob: 'February 19, 1998',
    followers: '1K', gender: 'female',
    fatherId: 'vikram', motherId: 'sandhya',
    spouseIds: [], childrenIds: [],
  },
};

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildLayout(focusId) {
  const focused = DB[focusId];
  if (!focused) return [];
  const nodes = [];

  // Parents
  const parentIds = [focused.fatherId, focused.motherId].filter(Boolean);
  const pTotal = parentIds.length * CARD_W + Math.max(0, parentIds.length - 1) * GAP;
  const pStartX = (SW - pTotal) / 2;
  parentIds.forEach((pid, i) => {
    nodes.push({ id: pid, role: 'parent', x: pStartX + i * (CARD_W + GAP), y: PARENT_Y, zIndex: 5 });
  });

  // Spouses stacked behind focus
  const focusX = (SW - CARD_W) / 2;
  const spouseIds = focused.spouseIds ?? [];
  spouseIds.forEach((sid, i) => {
    nodes.push({
      id: sid, role: 'spouse',
      x: focusX + (i + 1) * SPOUSE_DX,
      y: FOCUS_Y + (i + 1) * SPOUSE_DY,
      zIndex: 8 - i,
      spouseIndex: i,
    });
  });
  nodes.push({ id: focusId, role: 'focus', x: focusX, y: FOCUS_Y, zIndex: 10 });

  // Children
  const childIds = focused.childrenIds ?? [];
  const cTotal = childIds.length * CARD_W + Math.max(0, childIds.length - 1) * GAP;
  const cStartX = (SW - cTotal) / 2;
  childIds.forEach((cid, i) => {
    nodes.push({ id: cid, role: 'child', x: cStartX + i * (CARD_W + GAP), y: CHILD_Y, zIndex: 5 });
  });

  return nodes;
}

// ─── SVG Connectors ───────────────────────────────────────────────────────────

function Connectors({ nodes, focusId }) {
  const focusNode = nodes.find(n => n.id === focusId);
  if (!focusNode) return null;

  const fCx = focusNode.x + CARD_W / 2;
  const fTop = focusNode.y;
  const fBot = focusNode.y + CARD_H;

  const parentNodes = nodes.filter(n => n.role === 'parent');
  const childNodes = nodes.filter(n => n.role === 'child');

  const parentMidY = fTop - 32;
  const childMidY = fBot + DOB_STRIP_H + 18;

  const elems = [];

  // Parents → focus
  if (parentNodes.length === 2) {
    const lx = parentNodes[0].x + CARD_W / 2;
    const rx = parentNodes[1].x + CARD_W / 2;
    const py = parentNodes[0].y + CARD_H;
    const midX = (lx + rx) / 2;
    elems.push(<Line key="pl" x1={lx} y1={py} x2={lx} y2={parentMidY} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(<Line key="pr" x1={rx} y1={py} x2={rx} y2={parentMidY} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(<Line key="ph" x1={lx} y1={parentMidY} x2={rx} y2={parentMidY} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(<Line key="pv" x1={midX} y1={parentMidY} x2={fCx} y2={fTop - 1} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(
      <Path key="parrow"
        d={`M ${fCx - 5} ${fTop - 9} L ${fCx} ${fTop} L ${fCx + 5} ${fTop - 9}`}
        stroke="#bbb" strokeWidth={1.5} fill="none" />
    );
    // Heart
    const hcx = midX;
    const hcy = py + 16;
    const s = 9;
    elems.push(
      <Path key="heart" fill="#ff4d6d" opacity={0.9}
        d={`M ${hcx} ${hcy + s * 0.35}
            C ${hcx} ${hcy - s * 0.1}, ${hcx - s * 0.8} ${hcy - s * 0.6}, ${hcx - s * 0.8} ${hcy - s * 0.1}
            C ${hcx - s * 0.8} ${hcy - s * 0.7}, ${hcx - s * 0.2} ${hcy - s * 1.0}, ${hcx} ${hcy - s * 0.6}
            C ${hcx + s * 0.2} ${hcy - s * 1.0}, ${hcx + s * 0.8} ${hcy - s * 0.7}, ${hcx + s * 0.8} ${hcy - s * 0.1}
            C ${hcx + s * 0.8} ${hcy - s * 0.6}, ${hcx} ${hcy - s * 0.1}, ${hcx} ${hcy + s * 0.35} Z`} />
    );
  } else if (parentNodes.length === 1) {
    const px = parentNodes[0].x + CARD_W / 2;
    const py = parentNodes[0].y + CARD_H;
    elems.push(<Line key="pv1" x1={px} y1={py} x2={fCx} y2={fTop - 1} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(
      <Path key="parrow1"
        d={`M ${fCx - 5} ${fTop - 9} L ${fCx} ${fTop} L ${fCx + 5} ${fTop - 9}`}
        stroke="#bbb" strokeWidth={1.5} fill="none" />
    );
  }

  // Focus → children
  if (childNodes.length === 1) {
    const cx = childNodes[0].x + CARD_W / 2;
    const cy = childNodes[0].y;
    elems.push(<Line key="cv1" x1={fCx} y1={fBot + DOB_STRIP_H + 4} x2={cx} y2={cy - 1} stroke="#bbb" strokeWidth={1.5} />);
    elems.push(
      <Path key="carrow1"
        d={`M ${cx - 5} ${cy - 9} L ${cx} ${cy} L ${cx + 5} ${cy - 9}`}
        stroke="#bbb" strokeWidth={1.5} fill="none" />
    );
  } else if (childNodes.length > 1) {
    elems.push(<Line key="cfstub" x1={fCx} y1={fBot + DOB_STRIP_H + 4} x2={fCx} y2={childMidY} stroke="#bbb" strokeWidth={1.5} />);
    const llx = childNodes[0].x + CARD_W / 2;
    const rrx = childNodes[childNodes.length - 1].x + CARD_W / 2;
    elems.push(<Line key="ch" x1={llx} y1={childMidY} x2={rrx} y2={childMidY} stroke="#bbb" strokeWidth={1.5} />);
    childNodes.forEach((cn, i) => {
      const cx = cn.x + CARD_W / 2;
      const cy = cn.y;
      elems.push(<Line key={`cdrop${i}`} x1={cx} y1={childMidY} x2={cx} y2={cy - 1} stroke="#bbb" strokeWidth={1.5} />);
      elems.push(
        <Path key={`carrow${i}`}
          d={`M ${cx - 5} ${cy - 9} L ${cx} ${cy} L ${cx + 5} ${cy - 9}`}
          stroke="#bbb" strokeWidth={1.5} fill="none" />
      );
    });
  }

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {elems}
    </Svg>
  );
}

// ─── Connector dots ───────────────────────────────────────────────────────────

function ConnDots({ centerX, y }) {
  return (
    <View style={{ position: 'absolute', left: centerX - 18, top: y, flexDirection: 'row', gap: 5, zIndex: 15 }}>
      {['#a8d4f0', '#f0a8d4', '#a8d4f0'].map((c, i) => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
      ))}
    </View>
  );
}

// ─── Animated Node ────────────────────────────────────────────────────────────

function AnimatedNode({ nodeData, onPress }) {
  const person = DB[nodeData.id];
  if (!person) return null;

  const ax = useSharedValue(nodeData.x);
  const ay = useSharedValue(nodeData.y);
  const aScale = useSharedValue(nodeData.role === 'focus' ? 1.0 : 0.95);
  const aOpacity = useSharedValue(
    nodeData.role === 'spouse' ? Math.max(0.5, 1 - (nodeData.spouseIndex ?? 0) * 0.2) : 1
  );

  useEffect(() => {
    ax.value = withSpring(nodeData.x, SPRING);
    ay.value = withSpring(nodeData.y, SPRING);
    aScale.value = withSpring(nodeData.role === 'focus' ? 1.0 : 0.95, SPRING);
    aOpacity.value = withSpring(
      nodeData.role === 'spouse' ? Math.max(0.5, 1 - (nodeData.spouseIndex ?? 0) * 0.2) : 1,
      SPRING
    );
  }, [nodeData.x, nodeData.y, nodeData.role, nodeData.spouseIndex]);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: nodeData.zIndex,
    transform: [
      { translateX: ax.value },
      { translateY: ay.value },
      { scale: aScale.value },
    ],
    opacity: aOpacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <PersonCard person={person} role={nodeData.role} onPress={onPress} />
    </Animated.View>
  );
}

// ─── Person Card ──────────────────────────────────────────────────────────────

function PersonCard({ person, role, onPress }) {
  const isDeceased = !!person.isDeceased;
  const isFemale = person.gender === 'female';
  const isFocus = role === 'focus';

  const cardBg = isDeceased ? '#c4c4c4' : isFemale ? '#f9d8f6' : '#d6edf8';
  const borderColor = isDeceased ? '#aaa' : isFemale ? '#dda8d8' : '#8cc4e8';
  const btnBg = isDeceased ? '#888' : person.isFollowing ? '#e2e2e2' : '#ff9a3c';
  const btnTextColor = !isDeceased && person.isFollowing ? '#666' : '#fff';
  const btnLabel = isDeceased
    ? 'Deceased'
    : person.isFollowing
    ? 'Following'
    : `+ Follow | ${person.followers}`;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[cds.card, { backgroundColor: cardBg, borderColor }, isFocus && cds.cardFocus]}
    >
      <View style={cds.top}>
        <View>
          <Image source={{ uri: person.avatar }} style={cds.photo} resizeMode="cover" />
          <View style={cds.badge}><Text style={cds.badgeTxt}>{person.followers}</Text></View>
        </View>
        <View style={cds.topRight}>
          <Text style={cds.name} numberOfLines={2}>{person.name}</Text>
          <View style={[cds.btn, { backgroundColor: btnBg }]}>
            <Text style={[cds.btnTxt, { color: btnTextColor }]} numberOfLines={1}>{btnLabel}</Text>
          </View>
        </View>
      </View>
      <View style={[cds.divider, { backgroundColor: borderColor + '55' }]} />
      <View style={cds.bottom}>
        <Text style={cds.profession} numberOfLines={1}>{person.profession}</Text>
        <View style={cds.locRow}>
          <Text style={cds.loc} numberOfLines={1}>{person.location}</Text>
          <Text style={cds.flag}>{person.flag} {person.country}</Text>
        </View>
        <View style={cds.dobRow}>
          <Text style={cds.dobIcon}>🎂</Text>
          <Text style={cds.dob}>
            {isDeceased ? `${person.dob} - ${person.dod}` : person.dob}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cds = StyleSheet.create({
  card: {
    width: CARD_W, borderRadius: 14, borderWidth: 1.2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 7, elevation: 3, overflow: 'hidden',
  },
  cardFocus: { shadowOpacity: 0.16, shadowRadius: 12, elevation: 6 },
  top: { flexDirection: 'row', padding: 10, gap: 8 },
  photo: { width: 62, height: 74, borderRadius: 10, backgroundColor: '#ddd' },
  badge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: 'rgba(0,0,0,0.56)', borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '600' },
  topRight: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', lineHeight: 19 },
  btn: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 5, marginTop: 4 },
  btnTxt: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  divider: { height: 0.7, marginHorizontal: 10 },
  bottom: { padding: 10, paddingTop: 6, gap: 2 },
  profession: { fontSize: 12, color: '#555', fontWeight: '500' },
  locRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loc: { fontSize: 10.5, color: '#777', flex: 1 },
  flag: { fontSize: 10.5, color: '#777' },
  dobRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  dobIcon: { fontSize: 11 },
  dob: { fontSize: 10.5, color: '#888' },
});

// ─── DOB strips ───────────────────────────────────────────────────────────────

function DobStrips({ nodes }) {
  return (
    <>
      {nodes
        .filter(n => (n.role === 'focus' || n.role === 'child') && !DB[n.id]?.isDeceased)
        .map(n => {
          const p = DB[n.id];
          if (!p) return null;
          return (
            <View key={`dob-${n.id}`} style={{
              position: 'absolute',
              left: n.x, top: n.y + CARD_H + 4,
              width: CARD_W, zIndex: n.zIndex + 1,
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#d6edf8', borderRadius: 10,
              paddingHorizontal: 10, paddingVertical: 6, gap: 6,
            }}>
              <Text style={{ fontSize: 13 }}>🎂</Text>
              <Text style={{ fontSize: 12, color: '#445', fontWeight: '500' }} numberOfLines={1}>{p.dob}</Text>
            </View>
          );
        })}
    </>
  );
}

// ─── Side shortcut buttons ────────────────────────────────────────────────────

function SideButtons({ nodes, focusId, onNavigate }) {
  const focused = DB[focusId];
  if (!focused) return null;
  const focusNode = nodes.find(n => n.id === focusId);
  if (!focusNode) return null;

  const btnY = focusNode.y + 28;

  const leftItems = [
    focused.fatherId && { id: focused.fatherId, bg: '#d6edf8' },
    focused.motherId && { id: focused.motherId, bg: '#f9d8f6' },
  ].filter(Boolean);

  const rightItems = (focused.spouseIds ?? []).map(sid => ({
    id: sid, bg: DB[sid]?.gender === 'female' ? '#f9d8f6' : '#d6edf8',
  }));

  return (
    <>
      <View style={{ position: 'absolute', left: 8, top: btnY, zIndex: 20, gap: 8 }}>
        {leftItems.map(item => (
          <TouchableOpacity key={item.id}
            style={[sbs.btn, { backgroundColor: item.bg }]}
            onPress={() => onNavigate(item.id)}>
            <Text style={sbs.icon}>↩</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ position: 'absolute', right: 8, top: btnY, zIndex: 20, gap: 8 }}>
        {rightItems.map(item => (
          <TouchableOpacity key={item.id}
            style={[sbs.btn, { backgroundColor: item.bg }]}
            onPress={() => onNavigate(item.id)}>
            <Text style={sbs.icon}>↩</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const sbs = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  icon: { fontSize: 16, color: '#555' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HiveScreen({ navigation }) {
  const [focusedPersonId, setFocusedPersonId] = React.useState('sandhya');

  const nodes = useMemo(() => buildLayout(focusedPersonId), [focusedPersonId]);

  const handlePress = useCallback((nodeData) => {
    if (nodeData.role === 'focus') return;
    setFocusedPersonId(nodeData.id);
  }, []);

  const focusNode = nodes.find(n => n.id === focusedPersonId);
  const parentNodes = nodes.filter(n => n.role === 'parent');
  const childNodes = nodes.filter(n => n.role === 'child');
  const centerX = focusNode ? focusNode.x + CARD_W / 2 : SW / 2;

  const parentDotsY = parentNodes.length > 0 ? parentNodes[0].y + CARD_H + 4 : FOCUS_Y - 45;
  const childDotsY = focusNode ? focusNode.y + CARD_H + DOB_STRIP_H + 6 : FOCUS_Y + CARD_H + 40;

  return (
    <View style={hv.root}>

      {/* ── Header ── */}
      <View style={hv.header}>
        <TouchableOpacity style={hv.hBtn} onPress={() => navigation?.goBack()}>
          <Text style={{ fontSize: 26 }}>🏠</Text>
        </TouchableOpacity>
        <View style={hv.headerCenter}>
          <View style={hv.chainPill}>
            <View style={[hv.dot, { backgroundColor: '#a8d4f0' }]} />
            <Text style={hv.chainIcon}>⛓</Text>
          </View>
          <View style={[hv.chainPill, { marginLeft: 8 }]}>
            <View style={[hv.dot, { backgroundColor: '#f0a8d4' }]} />
            <Text style={hv.chainIcon}>⛓</Text>
          </View>
        </View>
        <TouchableOpacity style={hv.hBtn}>
          <Text style={{ fontSize: 24 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* ── Canvas — fills all remaining height, no scroll ── */}
      <View style={hv.canvas}>
        <Connectors nodes={nodes} focusId={focusedPersonId} />

        {parentNodes.length > 0 && <ConnDots centerX={centerX} y={parentDotsY} />}
        {childNodes.length > 0 && focusNode && <ConnDots centerX={centerX} y={childDotsY} />}

        <DobStrips nodes={nodes} />

        {[...nodes]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(n => (
            <AnimatedNode key={n.id} nodeData={n} onPress={() => handlePress(n)} />
          ))}

        <SideButtons nodes={nodes} focusId={focusedPersonId} onNavigate={setFocusedPersonId} />

        {/* Add Hiver */}
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 20, left: SW / 2 - 68, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 30 }}
          activeOpacity={0.8}
        >
          <View style={hv.addCircle}>
            <Text style={hv.addPlus}>＋</Text>
          </View>
          <Text style={hv.addTxt}>Add Hiver</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const hv = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#faf7f2' },

  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#faf7f2',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8ddd4',
  },
  hBtn: { padding: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  chainPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ebebeb', borderRadius: 14,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  chainIcon: { fontSize: 14, color: '#555' },

  // Canvas fills all space below header
  canvas: { flex: 1, overflow: 'hidden' },

  addCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center',
  },
  addPlus: { color: '#fff', fontSize: 22, lineHeight: 26 },
  addTxt: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
});