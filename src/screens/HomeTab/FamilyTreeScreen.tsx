import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Animated, PanResponder, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORANGE       = 'rgba(255,167,87,1)';
const ORANGE_LIGHT = 'rgba(255,167,87,0.08)';
const ORANGE_BORDER= 'rgba(255,167,87,0.55)';

// ─── Data ─────────────────────────────────────────────────────────────────────

const INVITE_PERSON = {
  id: 'saniya',
  name: 'Saniya Mehra',
  avatar: 'https://i.pravatar.cc/150?img=47',
  label: 'Drag & Drop',
};

const INITIAL_TREE = [
  {
    id: 'rahul', name: 'Rahul Mehra', role: 'Father', avatar: 'https://i.pravatar.cc/150?img=68',
    children: [
      { id: 'sanjay',  name: 'Sanjay Mehra',  role: 'Father', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 'rinki',   name: 'Rinki Mehra',   role: 'Mother', avatar: 'https://i.pravatar.cc/150?img=44' },
      { id: 'raghini', name: 'Raghini Mehra', role: 'Wife',   avatar: 'https://i.pravatar.cc/150?img=45' },
      {
        id: 'raghu', name: 'Raghu Mehra', role: 'Brother', avatar: 'https://i.pravatar.cc/150?img=13',
        children: [
          { id: 'pawan',    name: 'Pawan Mehra',    role: 'Father',   avatar: 'https://i.pravatar.cc/150?img=60' },
          { id: 'devi',     name: 'Devi Mehra',     role: 'Mother',   avatar: 'https://i.pravatar.cc/150?img=47' },
          { id: 'sanchita', name: 'Sanchita Mehra', role: 'Wife',     avatar: 'https://i.pravatar.cc/150?img=46' },
          { id: 'rahul2',   name: 'Rahul Mehra',    role: 'Brother',  avatar: 'https://i.pravatar.cc/150?img=15' },
          { id: 'ranchi',   name: 'Ranchi Kashyap', role: 'Sister',   avatar: 'https://i.pravatar.cc/150?img=48' },
          { id: 'sanjhana', name: 'Sanjhana Singh', role: 'Daughter', avatar: 'https://i.pravatar.cc/150?img=49', children: [] },
          { id: 'swati',    name: 'Swati Mehra',    role: 'Daughter', avatar: 'https://i.pravatar.cc/150?img=50' },
        ],
      },
      { id: 'ranchi2', name: 'Ranchi Kashyap', role: 'Sister', avatar: 'https://i.pravatar.cc/150?img=48' },
      { id: 'raghav',  name: 'Raghav Mehra',   role: 'Son',    avatar: 'https://i.pravatar.cc/150?img=12', isYou: true },
    ],
  },
  { id: 'raghini2', name: 'Raghini Mehra', role: 'Mother',   avatar: 'https://i.pravatar.cc/150?img=45' },
  { id: 'shalini',  name: 'Shalini Mehra', role: 'Wife',     avatar: 'https://i.pravatar.cc/150?img=44' },
  { id: 'gouri',    name: 'Gouri Mishra',  role: 'Sister',   avatar: 'https://i.pravatar.cc/150?img=46' },
  { id: 'rashi',    name: 'Rashi Mehra',   role: 'Daughter', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'rajeev',   name: 'Rajeev Mehra',  role: 'Son',      avatar: 'https://i.pravatar.cc/150?img=70' },
];

const RELATIONS = ['Husband','Brother','Wife','Father','Mother','Sister','Son','Daughter'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findNode = (nodes, id) => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) { const f = findNode(n.children, id); if (f) return f; }
  }
  return null;
};

const addChildToNode = (nodes, parentId, child) =>
  nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...(n.children ?? []), child] };
    if (n.children) return { ...n, children: addChildToNode(n.children, parentId, child) };
    return n;
  });

const getAncestorIds = (nodes, targetId, path = []) => {
  for (const n of nodes) {
    if (n.id === targetId) return path;
    if (n.children) {
      const found = getAncestorIds(n.children, targetId, [...path, n.id]);
      if (found) return found;
    }
  }
  return null;
};

// ─── Bridge Modal ─────────────────────────────────────────────────────────────

const BridgeModal = ({ visible, toPerson, onClose, onBuild }) => {
  const [selected, setSelected] = useState([]);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0.92)).current;
  const opacityAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelected([]);
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim,    { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(opacityAnim,  { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scaleAnim,    { toValue: 0.92, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const toggle = (r) =>
    setSelected(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : prev.length < 5 ? [...prev, r] : prev
    );

  const handleBuild = () => {
    if (selected.length === 0) {
      Alert.alert('Select Relation', 'Please select at least one relation.');
      return;
    }
    onBuild(selected);
    setSelected([]);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={bm.container}>
        <Animated.View style={[bm.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[bm.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Title */}
          <View style={bm.titleRow}>
            <Text style={bm.title}>Create Bridge</Text>
            <View style={bm.counterPill}>
              <Text style={bm.counter}>{selected.length}/5</Text>
            </View>
          </View>

          {/* Persons */}
          <View style={bm.personsRow}>
            <View style={bm.personCol}>
              <Image source={{ uri: toPerson?.avatar }} style={bm.personAvatar} />
              <Text style={bm.personName} numberOfLines={2}>{toPerson?.name}</Text>
            </View>

            <View style={bm.relationsCenter}>
              {selected.length === 0 ? (
                <View style={bm.selectPlaceholder}>
                  <Text style={bm.selectPlaceholderText}>Select Relation</Text>
                  <Image source={require('../../../assets/images/chat/chevron-down.png')} style={{height:14,width:14,resizeMode:'contain'}}></Image>
                </View>
              ) : (
                <View style={bm.selectedList}>
                  {selected.map((r, i) => (
                    <View key={i} style={bm.selectedRow}>
                      <Text style={bm.selectedLabel}>{r}</Text>
                      <View style={bm.selectedIcons}>
                        <View style={bm.iconCheck}>
                          <Text style={bm.iconTxt}>✓</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggle(r)} style={bm.iconMinus}>
                          <Text style={bm.iconTxt}>−</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={bm.personCol}>
              <Image source={{ uri: INVITE_PERSON.avatar }} style={bm.personAvatar} />
              <Text style={bm.personName} numberOfLines={2}>{INVITE_PERSON.name}</Text>
            </View>
          </View>

          {/* Chips */}
          <View style={bm.chipsWrap}>
            {RELATIONS.map((r, i) => {
              const on = selected.includes(r);
              return (
                <TouchableOpacity
                  key={i}
                  style={[bm.chip, on && bm.chipActive]}
                  onPress={() => toggle(r)}
                  activeOpacity={0.75}
                >
                  <Text style={[bm.chipTxt, on && bm.chipTxtActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Build */}
          <TouchableOpacity
            style={[bm.buildBtn, selected.length > 0 && bm.buildBtnActive]}
            onPress={handleBuild}
            activeOpacity={0.85}
          >
            <Text style={[bm.buildBtnTxt, selected.length > 0 && bm.buildBtnTxtActive]}>
              Build Bridge
            </Text>
          </TouchableOpacity>

          <Text style={bm.disclaimer}>
            Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const bm = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 14,
  },
  titleRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title:       { fontSize: 16,  color: '#1a1a1a',fontFamily:'SofiaSansCondensed-SemiBold' },
  counterPill: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  counter:     { fontSize: 12, color: '#888' },
  personsRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 18, minHeight: 90 },
  personCol:   { alignItems: 'center', width: 68 },
  personAvatar:{ width: 52, height: 52, borderRadius: 26, marginBottom: 6, backgroundColor: '#eee' },
  personName:  { fontSize: 13, color: '#333', textAlign: 'center',fontFamily:'SofiaSansCondensed-Medium' },
  relationsCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  selectPlaceholder: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f5f5f5', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  selectPlaceholderText: { fontSize: 14, color: '#888',fontFamily:'SofiaSansCondensed-Medium' },
  selectArrow:   { fontSize: 14, color: '#aaa' },
  selectedList:  { width: '100%', gap: 6 },
  selectedRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedLabel: { fontSize: 13, color: '#1a1a1a',fontFamily:'SofiaSansCondensed-Medium' },
  selectedIcons: { flexDirection: 'row', gap: 4 },
  iconCheck: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#e8f5e9',
    justifyContent: 'center', alignItems: 'center',
  },
  iconMinus: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fdecea',
    justifyContent: 'center', alignItems: 'center',
  },
  iconTxt:   { fontSize: 13, color: '#444', lineHeight: 18 , fontFamily:'SofiaSansCondensed-Medium'},
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e8e8e8',
  },
  chipActive:    { backgroundColor: 'rgba(255,167,87,0.12)', borderColor: ORANGE },
  chipTxt:       { fontSize: 13, color: '#666',fontFamily:'SofiaSansCondensed-Medium' },
  chipTxtActive: { color: 'rgb(180,80,0)', fontWeight: '600' },
  buildBtn: {
    backgroundColor: '#ebebeb', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  buildBtnActive:    { backgroundColor: ORANGE },
  buildBtnTxt:       { fontSize: 15, color: '#aaa', fontFamily:'SofiaSansCondensed-SemiBold' },
  buildBtnTxtActive: { color: '#fff' },
  disclaimer: { fontSize: 11, color: '#bbb', lineHeight: 16, textAlign: 'center' },
});

// ─── Inline added-person card ─────────────────────────────────────────────────

const InlineCard = ({ depth }) => (
  <View style={[ic.card, { marginLeft: 12 + depth * 18 }]}>
    <Image source={{ uri: INVITE_PERSON.avatar }} style={ic.avatar} />
    <View style={ic.info}>
      <Text style={ic.name}>{INVITE_PERSON.name}</Text>
      <Text style={ic.lbl}>Drag & Drop</Text>
    </View>
    <View style={ic.handleGrid}>
      {Array.from({ length: 6 }).map((_, i) => <View key={i} style={ic.dot} />)}
    </View>
  </View>
);

const ic = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginRight: 12, marginVertical: 4,
    backgroundColor: '#fff', borderRadius: 12, padding: 10,
    borderWidth: 1.5, borderColor: '#e0e0e0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatar:     { width: 40, height: 40, borderRadius: 20 },
  info:       { flex: 1 },
  name:       { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  lbl:        { fontSize: 11, color: '#aaa', marginTop: 1 },
  handleGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 18, gap: 3 },
  dot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
});

// ─── Node Row ─────────────────────────────────────────────────────────────────

const NodeRow = ({ node, depth, isExpanded, onToggle, setRef, isDropTarget, isBridged, isAdded }) => {
  const hasChildren = (node.children?.length ?? 0) > 0;
  return (
    <View
      ref={ref => setRef(node.id, ref)}
      collapsable={false}
      style={[nr.row, { paddingLeft: 12 + depth * 18 }, isDropTarget && nr.rowTarget]}
    >
      <TouchableOpacity
        onPress={() => onToggle(node.id)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[nr.expandBox, hasChildren && isExpanded && nr.expandBoxOpen]}>
          <Text style={[nr.expandIcon, hasChildren && isExpanded && nr.expandIconOpen]}>
            {isExpanded ? '−' : '+'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* <View style={[nr.checkbox, isBridged && nr.checkboxOn]}>
        {isBridged && <Text style={nr.checkmark}>✓</Text>}
      </View> */}

      <View style={[nr.avatarWrap, isDropTarget && nr.avatarWrapTarget]}>
        {node.avatar ? (
          <Image source={{ uri: node.avatar }} style={nr.avatar} />
        ) : (
          <View style={[nr.avatar, nr.avatarUnknown]}>
            <Text style={nr.unknownTxt}>?</Text>
          </View>
        )}
        {isBridged && <View style={nr.bridgeDot} />}
      </View>

      <View style={nr.nameWrap}>
        <Text style={[nr.name, !node.avatar && nr.nameUnknown]} numberOfLines={1}>
          {node.avatar ? node.name : 'Undisclosed user'}
        </Text>
        <Text style={[nr.role, !node.avatar && nr.roleUnknown]}>
          ({node.role}){node.isYou ? ' [You]' : ''}
        </Text>
      </View>

      {isAdded && (
        <View style={nr.addedBadge}><Text style={nr.addedTxt}>Added</Text></View>
      )}
      {isDropTarget && (
        <View style={nr.dropPill}><Text style={nr.dropPillTxt}>Drop here</Text></View>
      )}
    </View>
  );
};

const nr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingRight: 12, gap: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5',
  },
  rowTarget: {
    backgroundColor: ORANGE_LIGHT, borderRadius: 10,
    borderWidth: 1.5, borderColor: ORANGE_BORDER,
    borderBottomColor: ORANGE_BORDER,
  },
  expandBox: {
    width: 18, height: 18, borderRadius: 4,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd',
    justifyContent: 'center', alignItems: 'center',
  },
  expandBoxOpen:  { backgroundColor: ORANGE, borderColor: ORANGE },
  expandIcon:     { fontSize: 12, color: '#aaa', fontWeight: '700', lineHeight: 14 },
  expandIconOpen: { color: '#fff' },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#ddd', backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxOn:  { backgroundColor: ORANGE, borderColor: ORANGE },
  checkmark:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  avatarWrap:       { position: 'relative' },
  avatarWrapTarget: { borderRadius: 20, borderWidth: 2.5, borderColor: ORANGE, padding: 1 },
  avatar:         { width: 34, height: 34, borderRadius: 17 },
  avatarUnknown:  { backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  unknownTxt:     { color: '#fff', fontSize: 16, fontFamily:'SofiaSansCondensed-Medium' },
  bridgeDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: ORANGE, borderWidth: 2, borderColor: '#fff',
  },
  nameWrap:    { flex: 1 },
  name:        { fontSize: 15, color: '#1a1a1a', fontFamily:'SofiaSansCondensed-SemiBold' },
  nameUnknown: { color: '#e74c3c' },
  role:        { fontSize: 14, color: '#999',fontFamily:'SofiaSansCondensed-Medium' },
  roleUnknown: { color: '#e74c3c' },
  addedBadge:  { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  addedTxt:    { fontSize: 10, color: '#388e3c', fontWeight: '600' },
  dropPill:    { backgroundColor: ORANGE, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  dropPillTxt: { fontSize: 10, color: '#fff', fontWeight: '600' },
});

// ─── Tree Renderer ────────────────────────────────────────────────────────────

const TreeRenderer = ({ nodes, depth = 0, expanded, onToggle, setRef, dropTargetId, bridgedIds, addedIds }) => (
  <>
    {nodes.map(node => (
      <React.Fragment key={node.id}>
        <NodeRow
          node={node} depth={depth}
          isExpanded={expanded.has(node.id)}
          onToggle={onToggle} setRef={setRef}
          isDropTarget={dropTargetId === node.id}
          isBridged={bridgedIds.has(node.id)}
          isAdded={addedIds.has(node.id)}
        />
        {expanded.has(node.id) && addedIds.has(node.id) && (
          <InlineCard depth={depth + 1} />
        )}
        {expanded.has(node.id) && node.children && node.children.length > 0 && (
          <TreeRenderer
            nodes={node.children} depth={depth + 1}
            expanded={expanded} onToggle={onToggle} setRef={setRef}
            dropTargetId={dropTargetId} bridgedIds={bridgedIds} addedIds={addedIds}
          />
        )}
      </React.Fragment>
    ))}
  </>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FamilyTreeScreen = ({ navigation }) => {
  const [tree, setTree]             = useState(INITIAL_TREE);
  const [expanded, setExpanded]     = useState(new Set(['rahul', 'raghu', 'sanjhana']));
  const [bridgedIds, setBridgedIds] = useState(new Set());
  const [addedIds, setAddedIds]     = useState(new Set());
  const [bridgeVisible, setBridgeVisible] = useState(false);
  const [bridgeTarget, setBridgeTarget]   = useState(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [dropTargetId, setDropTargetId]   = useState(null);
  const [droppedOnId, setDroppedOnId]     = useState(null);

  const ghostX     = useRef(new Animated.Value(0)).current;
  const ghostY     = useRef(new Animated.Value(0)).current;
  const ghostScale = useRef(new Animated.Value(1)).current;
  const ghostAlpha = useRef(new Animated.Value(0)).current;

  const nodeRefs  = useRef(new Map());
  const nodeRects = useRef(new Map());
  const treeRef   = useRef(tree);
  useEffect(() => { treeRef.current = tree; }, [tree]);

  const setRef = useCallback((id, ref) => {
    if (ref) nodeRefs.current.set(id, ref);
    else nodeRefs.current.delete(id);
  }, []);

  const measureAll = useCallback(() => {
    nodeRects.current.clear();
    nodeRefs.current.forEach((ref, id) => {
      ref.measure((_fx, _fy, w, h, px, py) => {
        nodeRects.current.set(id, { x: px, y: py, w, h });
      });
    });
  }, []);

  const hitTest = useCallback((sx, sy) => {
    let hit = null;
    nodeRects.current.forEach(({ x, y, w, h }, id) => {
      if (sx >= x && sx <= x + w && sy >= y && sy <= y + h) hit = id;
    });
    return hit;
  }, []);

  // Open bridge modal after drop (in effect so treeRef is current)
  useEffect(() => {
    if (!droppedOnId) return;
    const target = findNode(treeRef.current, droppedOnId);
    if (target) {
      setBridgeTarget(target);
      setBridgeVisible(true);
    }
    setDroppedOnId(null);
  }, [droppedOnId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: evt => {
        const { pageX, pageY } = evt.nativeEvent;
        ghostX.setValue(pageX - 28);
        ghostY.setValue(pageY - 28);
        measureAll();
        setIsDragging(true);
        Animated.parallel([
          Animated.timing(ghostAlpha, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.spring(ghostScale, { toValue: 1.12, useNativeDriver: true, tension: 200, friction: 7 }),
        ]).start();
      },
      onPanResponderMove: evt => {
        const { pageX, pageY } = evt.nativeEvent;
        ghostX.setValue(pageX - 28);
        ghostY.setValue(pageY - 28);
        setDropTargetId(hitTest(pageX, pageY));
      },
      onPanResponderRelease: evt => {
        const { pageX, pageY } = evt.nativeEvent;
        const hit = hitTest(pageX, pageY);
        setDropTargetId(null);
        Animated.parallel([
          Animated.timing(ghostAlpha, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.spring(ghostScale, { toValue: 1, useNativeDriver: true }),
        ]).start(() => setIsDragging(false));
        if (hit) setDroppedOnId(hit);
      },
      onPanResponderTerminate: () => {
        setDropTargetId(null);
        Animated.timing(ghostAlpha, { toValue: 0, duration: 150, useNativeDriver: true })
          .start(() => setIsDragging(false));
      },
    })
  ).current;

  const handleToggle = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setTimeout(measureAll, 350);
  }, [measureAll]);

  const handleBuild = useCallback((relations) => {
    if (!bridgeTarget) return;
    setBridgeVisible(false);

    const ts        = Date.now();
    let updatedTree = treeRef.current;
    let parentId    = bridgeTarget.id;
    const chainIds  = [];

    relations.forEach((rel, i) => {
      const isLast = i === relations.length - 1;
      const nd = isLast
        ? { id: `${INVITE_PERSON.id}_${ts}`, name: INVITE_PERSON.name, role: rel, avatar: INVITE_PERSON.avatar }
        : { id: `undisclosed_${i}_${ts}`, name: 'Undisclosed user', role: rel, avatar: '' };
      updatedTree = addChildToNode(updatedTree, parentId, nd);
      if (!isLast) chainIds.push(nd.id);
      parentId = nd.id;
    });

    // Auto-expand ancestors + bridgeTarget + intermediate chain nodes
    const ancestors = getAncestorIds(updatedTree, bridgeTarget.id) ?? [];
    const toExpand  = [...ancestors, bridgeTarget.id, ...chainIds];

    setTree(updatedTree);
    setExpanded(prev => new Set([...prev, ...toExpand]));
    setBridgedIds(prev => new Set([...prev, bridgeTarget.id]));
    setAddedIds(prev  => new Set([...prev, `${INVITE_PERSON.id}_${ts}`]));
    setBridgeTarget(null);
    setTimeout(measureAll, 300);
  }, [bridgeTarget, measureAll]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Image source={require('../../../assets/images/chat/back.png')}  style={{height:24,width:24}}></Image>
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}><Image source={require('../../../assets/images/home/search.png')} style={{height:24,width:24}}></Image></TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}><Image source={require('../../../assets/images/home/Bell.png')} style={{height:24,width:24}}></Image></TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* Drag card */}
        <View style={s.dragSection}>
          <View style={s.dragCard} {...panResponder.panHandlers}>
            <Image source={{ uri: INVITE_PERSON.avatar }} style={s.dragAvatar} />
            <View style={s.dragInfo}>
              <Text style={s.dragName}>{INVITE_PERSON.name}</Text>
              <Text style={s.dragLbl}>{INVITE_PERSON.label}</Text>
            </View>
            <View style={s.handleGrid}>
              {Array.from({ length: 6 }).map((_, i) => <View key={i} style={s.handleDot} />)}
            </View>
          </View>
          {!isDragging && (
            <Text style={s.hint}>{'↓ Drag onto someone in the family tree below'}</Text>
          )}
          {isDragging && dropTargetId && (
            <Text style={[s.hint, { color: 'rgb(180,80,0)' }]}>{'Release to connect!'}</Text>
          )}
          {isDragging && !dropTargetId && (
            <Text style={[s.hint, { color: '#aaa' }]}>{'Move over a person to connect…'}</Text>
          )}
        </View>

        {/* Tree */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDragging}
          onLayout={measureAll}
        >
          <TreeRenderer
            nodes={tree}
            expanded={expanded}
            onToggle={handleToggle}
            setRef={setRef}
            dropTargetId={dropTargetId}
            bridgedIds={bridgedIds}
            addedIds={addedIds}
          />
        </ScrollView>

        {/* Ghost */}
        {isDragging && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.ghost,
              {
                transform: [
                  { translateX: ghostX },
                  { translateY: ghostY },
                  { scale: ghostScale },
                ],
                opacity: ghostAlpha,
              },
            ]}
          >
            <Image source={{ uri: INVITE_PERSON.avatar }} style={s.ghostImg} />
          </Animated.View>
        )}
      </View>

      <BridgeModal
        visible={bridgeVisible}
        toPerson={bridgeTarget}
        onClose={() => setBridgeVisible(false)}
        onBuild={handleBuild}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', backgroundColor: '#fff',
  },
  logo:        { fontSize: 22, color: '#1a1a1a', fontWeight: '800' },
  logoBold:    { color: ORANGE },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn:   { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerIcon:  { fontSize: 20 },
  dragSection: {
    backgroundColor: '#fff', paddingHorizontal: 14,
    paddingTop: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#efefef', zIndex: 10,
  },
  dragCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(237, 237, 237, 1)', borderRadius: 12, padding: 10,
    borderWidth: 1.5, borderColor: '#e0e0e0',
    width:'60%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  dragAvatar: { width: 46, height: 46, borderRadius: 8 },
  dragInfo:   { flex: 1 },
  dragName:   { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  dragLbl:    { fontSize: 11, color: '#aaa', marginTop: 1 },
  handleGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 18, gap: 3 },
  handleDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
  hint:       { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 },
  scroll:        { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100, paddingTop: 4 },
  ghost: {
    position: 'absolute', top: 0, left: 0,
    width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
    borderWidth: 2.5, borderColor: ORANGE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 20, zIndex: 9999,
  },
  ghostImg: { width: 56, height: 56, borderRadius: 28 },
});

export default FamilyTreeScreen;