/**
 * BulkInviteScreen.js
 *
 * Bulk Invite / Broadcast screen with THREE tabs:
 *  - Tree View : expandable family tree with +/- checkboxes
 *  - List View : grouped flat list with Follow buttons
 *  - Saved List: saved broadcast lists with checkboxes, member counts,
 *                star favourite, swipe-delete, "Compose" header button
 *
 * Props: { onBack, navigation }
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Animated, Dimensions, Image, PanResponder, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── People data ──────────────────────────────────────────────────────────────
const PEOPLE = {
  raghav:   { id: 'raghav',   name: 'Raghav Mehra',   relation: 'You',               photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  rahul:    { id: 'rahul',    name: 'Rahul Mehra',    relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  sanjay:   { id: 'sanjay',   name: 'Sanjay Mehra',   relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
  rinki:    { id: 'rinki',    name: 'Rinki Mehra',    relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/55.jpg' },
  raghini:  { id: 'raghini',  name: 'Raghini Mehra',  relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  raghu:    { id: 'raghu',    name: 'Raghu Mehra',    relation: 'Brother',           photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
  pawan:    { id: 'pawan',    name: 'Pawan Mehra',    relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/70.jpg' },
  devi:     { id: 'devi',     name: 'Devi Mehra',     relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/70.jpg' },
  sanchita: { id: 'sanchita', name: 'Sanchita Mehra', relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/35.jpg' },
  rahul2:   { id: 'rahul2',   name: 'Rahul Mehra',    relation: 'Brother',           photo: 'https://randomuser.me/api/portraits/men/42.jpg' },
  ranchi:   { id: 'ranchi',   name: 'Ranchi Kashyap', relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/29.jpg' },
  sanjhana: { id: 'sanjhana', name: 'Sanjhana Singh', relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/22.jpg' },
  swati:    { id: 'swati',    name: 'Swati Mehra',    relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/28.jpg' },
  ranchi2:  { id: 'ranchi2',  name: 'Ranchi Kashyap', relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/30.jpg' },
  raghavs:  { id: 'raghavs',  name: 'Raghav Mehra',   relation: 'Son',               photo: 'https://randomuser.me/api/portraits/men/20.jpg' },
  raghini2: { id: 'raghini2', name: 'Raghini Mehra',  relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  shalini:  { id: 'shalini',  name: 'Shalini Mehra',  relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/50.jpg' },
  gouri:    { id: 'gouri',    name: 'Gouri Mishra',   relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
  rashi:    { id: 'rashi',    name: 'Rashi Mehra',    relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
  rajeev:   { id: 'rajeev',   name: 'Rajeev Mehra',   relation: 'Son',               photo: 'https://randomuser.me/api/portraits/men/25.jpg' },
  sanjayL:  { id: 'sanjayL',  name: 'Sanjay Khanna',  relation: "Raghini's Father",  photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
  jasmin:   { id: 'jasmin',   name: 'Jasmin Khanna',  relation: "Raghini's Mother",  photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  rahulL:   { id: 'rahulL',   name: 'Rahul Mehra',    relation: "Raghini's Husband", photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  jitesh:   { id: 'jitesh',   name: 'Jitesh Khanna',  relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/30.jpg' },
  rakesh:   { id: 'rakesh',   name: 'Rakesh Mehra',   relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
};

// ─── Tree structure ───────────────────────────────────────────────────────────
const INITIAL_TREE = [
  {
    id: 'rahul', checked: true, expanded: true,
    children: [
      { id: 'sanjay',   checked: true,  expanded: false, children: [] },
      { id: 'rinki',    checked: true,  expanded: false, children: [] },
      { id: 'raghini',  checked: true,  expanded: false, children: [] },
      {
        id: 'raghu', checked: true, expanded: true,
        children: [
          { id: 'pawan',    checked: false, expanded: false, children: [] },
          { id: 'devi',     checked: false, expanded: false, children: [] },
          { id: 'sanchita', checked: false, expanded: false, children: [] },
          { id: 'rahul2',   checked: false, expanded: false, children: [] },
          { id: 'ranchi',   checked: false, expanded: false, children: [] },
          { id: 'sanjhana', checked: true,  expanded: false, children: [] },
          { id: 'swati',    checked: false, expanded: false, children: [] },
        ],
      },
      { id: 'ranchi2',  checked: false, expanded: false, children: [] },
      { id: 'raghavs',  checked: false, expanded: false, children: [] },
    ],
  },
  { id: 'raghini2', checked: false, expanded: false, children: [] },
  { id: 'shalini',  checked: false, expanded: false, children: [] },
  { id: 'gouri',    checked: false, expanded: false, children: [] },
  { id: 'rashi',    checked: false, expanded: false, children: [] },
  { id: 'rajeev',   checked: false, expanded: false, children: [] },
];

// ─── List view groups ─────────────────────────────────────────────────────────
const LIST_GROUPS = [
  {
    id: 'group1',
    header: { id: 'raghini', name: 'Raghini Mehra', relation: 'Mother', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    members: [
      { id: 'sanjayL', name: 'Sanjay Khanna',  relation: "Raghini's Father",  photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
      { id: 'jasmin',  name: 'Jasmin Khanna',  relation: "Raghini's Mother",  photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 'rahulL',  name: 'Rahul Mehra',    relation: "Raghini's Husband", photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
      { id: 'jitesh',  name: 'Jitesh Khanna',  relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/30.jpg' },
      { id: 'rakesh',  name: 'Rakesh Mehra',   relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
    ],
  },
  {
    id: 'group2',
    header: null,
    members: [
      { id: 'rahulG2',  name: 'Rahul Mehra',   relation: 'Father',   photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
      { id: 'shaliniG', name: 'Shalini Mehra', relation: 'Wife',     photo: 'https://randomuser.me/api/portraits/women/50.jpg' },
      { id: 'gouriG',   name: 'Gouri Mishra',  relation: 'Sister',   photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
      { id: 'rashiG',   name: 'Rashi Mehra',   relation: 'Daughter', photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
    ],
  },
];

// ─── Saved lists data ─────────────────────────────────────────────────────────
const INITIAL_SAVED_LISTS = [
  { id: 'sl1', name: 'My Closed Family',           members: 54,  starred: true,  checked: false },
  { id: 'sl2', name: 'Kumaar Family',               members: 12,  starred: false, checked: true  },
  { id: 'sl3', name: 'Kapoor Family',               members: 26,  starred: false, checked: false },
  { id: 'sl4', name: 'Nidhi Kapoor Wedding Invitees', members: 154, starred: false, checked: false },
  { id: 'sl5', name: 'Akshat Birthday Party',       members: 25,  starred: false, checked: false },
  { id: 'sl6', name: 'Bangalore Relatives',         members: 18,  starred: false, checked: false },
  { id: 'sl7', name: 'My Family Doctors Group',     members: 7,   starred: false, checked: false },
  { id: 'sl8', name: 'Sweet Family',                members: 229, starred: false, checked: false },
  { id: 'sl9', name: 'All Cousins',                 members: 18,  starred: false, checked: false },
];

const TOTAL_MEMBERS = INITIAL_SAVED_LISTS.reduce((s, l) => s + l.members, 0);

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, size = 18 }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={{
      width: size, height: size, borderRadius: 5, borderWidth: 1.5,
      borderColor: checked ? '#F5A623' : '#D4C4A8',
      backgroundColor: checked ? '#F5A623' : 'rgba(245,166,35,0.08)',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {checked && <Text style={{ color: '#FFF', fontSize: size * 0.62, fontWeight: '800', lineHeight: size * 0.75 }}>✓</Text>}
    </TouchableOpacity>
  );
}

// ─── Tree node ────────────────────────────────────────────────────────────────
function TreeNode({ node, depth = 0, onToggleCheck, onToggleExpand }) {
  const person = PEOPLE[node.id];
  if (!person) return null;
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 22;

  return (
    <View>
      <View style={[styles.treeRow, { paddingLeft: 16 + indent }]}>
        <TouchableOpacity
          onPress={() => hasChildren && onToggleExpand(node.id)}
          style={styles.treeExpandBtn} activeOpacity={hasChildren ? 0.7 : 1}
        >
          <View style={[styles.expandIcon, !hasChildren && { backgroundColor: 'transparent', borderColor: '#DDD' }]}>
            <Text style={[styles.expandIconTxt, !hasChildren && { color: '#CCC' }]}>
              {hasChildren ? (node.expanded ? '−' : '+') : '+'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ marginRight: 10 }}>
          <Checkbox checked={node.checked} onToggle={() => onToggleCheck(node.id)} />
        </View>
        <Image source={{ uri: person.photo }} style={styles.treeAvatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.treeName}>
            {person.name}{node.id === 'raghav' ? ' (You)' : ` (${person.relation})`}
          </Text>
        </View>
      </View>
      {node.expanded && node.children?.length > 0 && (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 16 + indent + 11, alignItems: 'flex-end' }}>
            <View style={styles.treeVertLine} />
          </View>
          <View style={{ flex: 1 }}>
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1}
                onToggleCheck={onToggleCheck} onToggleExpand={onToggleExpand} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function ListRow({ member, checked, onToggle }) {
  const [following, setFollowing] = useState(false);
  return (
    <View style={styles.listRow}>
      <Checkbox checked={checked} onToggle={onToggle} />
      <Image source={{ uri: member.photo }} style={styles.listAvatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.listName}>{member.name}</Text>
        <Text style={styles.listRelation}>{member.relation}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setFollowing(v => !v)}
        style={[styles.followBtn, following && styles.followBtnActive]}
        activeOpacity={0.75}
      >
        <Text style={[styles.followBtnTxt, following && styles.followBtnTxtActive]}>
          {following ? 'Following' : '+ Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Swipeable saved list row ─────────────────────────────────────────────────
const DELETE_W = 64;

function SavedListRow({ item, onToggleCheck, onToggleStar, onDelete }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef    = useRef(false);
  const [open, setOpen] = useState(false);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => {
      const base = openRef.current ? -DELETE_W : 0;
      const dx   = Math.max(-DELETE_W, Math.min(0, gs.dx + base));
      translateX.setValue(dx);
    },
    onPanResponderRelease: (_, gs) => {
      const base = openRef.current ? -DELETE_W : 0;
      const total = gs.dx + base;
      if (total < -DELETE_W / 2) {
        Animated.spring(translateX, { toValue: -DELETE_W, useNativeDriver: true }).start();
        openRef.current = true;
        setOpen(true);
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        openRef.current = false;
        setOpen(false);
      }
    },
  })).current;

  const isHighlighted = item.checked || item.starred;

  return (
    <View style={{ overflow: 'hidden' }}>
      {/* Delete action behind */}
      <View style={styles.deleteAction}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
          <Image
            source={require('../../../assets/images/home/Trash.png')}
            style={{ width: 22, height: 22, tintColor: '#fff', resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      </View>

      {/* Row content */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.savedRow,
          isHighlighted && styles.savedRowHighlighted,
          { transform: [{ translateX }] },
        ]}
      >
        <Checkbox checked={item.checked} onToggle={() => onToggleCheck(item.id)} size={20} />

        {/* Star */}
        {item.starred ? (
          <TouchableOpacity onPress={() => onToggleStar(item.id)} style={styles.starBtn}>
            <Text style={styles.starFilled}>★</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}

        <Text style={[styles.savedListName, item.starred && styles.savedListNameBold]}>
          {item.name}
        </Text>

        <Text style={styles.savedMemberCount}>{item.members} Members</Text>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BulkInviteScreen({ onBack, navigation }) {
  const [activeTab, setActiveTab] = useState('tree');
  const [treeData, setTreeData]   = useState(INITIAL_TREE);
  const [listChecked, setListChecked] = useState(new Set(['raghini']));
  const [listName, setListName]   = useState('');
  const [savedLists, setSavedLists] = useState(INITIAL_SAVED_LISTS);

  const hasListSelection = listChecked.size > 0;
  const selectedSavedCount = savedLists.filter(l => l.checked).length;

  // ── Tree handlers ─────────────────────────────────────────────────────────
  const toggleCheck = useCallback((id) => {
    const upd = (nodes) => nodes.map(n => ({
      ...n,
      checked: n.id === id ? !n.checked : n.checked,
      children: n.children?.length ? upd(n.children) : n.children,
    }));
    setTreeData(prev => upd(prev));
  }, []);

  const toggleExpand = useCallback((id) => {
    const upd = (nodes) => nodes.map(n => ({
      ...n,
      expanded: n.id === id ? !n.expanded : n.expanded,
      children: n.children?.length ? upd(n.children) : n.children,
    }));
    setTreeData(prev => upd(prev));
  }, []);

  // ── List handlers ─────────────────────────────────────────────────────────
  const toggleListCheck = useCallback((id) => {
    setListChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ── Saved list handlers ───────────────────────────────────────────────────
  const toggleSavedCheck = useCallback((id) => {
    setSavedLists(prev => prev.map(l => l.id === id ? { ...l, checked: !l.checked } : l));
  }, []);

  const toggleSavedStar = useCallback((id) => {
    setSavedLists(prev => prev.map(l => l.id === id ? { ...l, starred: !l.starred } : l));
  }, []);

  const deleteSaved = useCallback((id) => {
    setSavedLists(prev => prev.filter(l => l.id !== id));
  }, []);

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { navigation?.goBack?.(); onBack?.(); }} style={styles.backBtn}>
          <Image source={require('../../../assets/images/chat/back.png')} style={{ width: 24, height: 24, tintColor: '#1A1A1A' }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Broadcast
        </Text>
        
          <TouchableOpacity style={styles.composeBtn} activeOpacity={0.85}>
            <Text style={styles.composeTxt}>Compose</Text>
            <Image
              source={require('../../../assets/images/profile/send.png')}
              style={{ width: 16, height: 16, tintColor: '#fff', resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        
      </View>

      {/* ── 3-Tab bar ── */}
      <View style={styles.tabBar}>
        {/* Tree View */}
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tree' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tree')} activeOpacity={0.8}
        >
          <Text style={[styles.tabTxt, activeTab === 'tree' && styles.tabTxtActive]}>Tree View</Text>
        </TouchableOpacity>

        {/* List View */}
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'list' && styles.tabBtnActive]}
          onPress={() => setActiveTab('list')} activeOpacity={0.8}
        >
          <Text style={[styles.tabTxt, activeTab === 'list' && styles.tabTxtActive]}>List View</Text>
        </TouchableOpacity>

        {/* Saved List */}
        <TouchableOpacity
          style={[styles.tabBtn, styles.tabBtnSaved, activeTab === 'saved' && styles.tabBtnSavedActive]}
          onPress={() => setActiveTab('saved')} activeOpacity={0.8}
        >
          <Text style={[styles.tabTxt, activeTab === 'saved' && styles.tabTxtActive]}>Saved List</Text>
          <Text style={[styles.tabSubTxt, activeTab === 'saved' && styles.tabSubTxtActive]}>
            {savedLists.length} Lists • {TOTAL_MEMBERS} Members
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tree View ── */}
      {activeTab === 'tree' && (
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}>
            <View style={styles.treeRootRow}>
              <Image source={{ uri: PEOPLE.raghav.photo }} style={styles.treeRootAvatar} />
              <Text style={styles.treeRootName}>Raghav Mehra (You)</Text>
            </View>
            {treeData.map(node => (
              <TreeNode key={node.id} node={node} depth={0}
                onToggleCheck={toggleCheck} onToggleExpand={toggleExpand} />
            ))}
          </ScrollView>
          <View style={styles.bottomBarTwo}>
            <TouchableOpacity style={styles.bottomBtnOutline}>
              <Text style={styles.bottomBtnOutlineTxt}>Save List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtnOutline}>
              <Text style={styles.bottomBtnOutlineTxt}>Broadcast</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── List View ── */}
      {activeTab === 'list' && (
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {LIST_GROUPS.map((group, gi) => (
              <View key={group.id}>
                {group.header && (
                  <ListRow
                    member={group.header}
                    checked={listChecked.has(group.header.id)}
                    onToggle={() => toggleListCheck(group.header.id)}
                  />
                )}
                {group.members.map(member => (
                  <ListRow key={member.id} member={member}
                    checked={listChecked.has(member.id)}
                    onToggle={() => toggleListCheck(member.id)} />
                ))}
                {gi < LIST_GROUPS.length - 1 && <View style={styles.groupDivider} />}
              </View>
            ))}
          </ScrollView>
          {hasListSelection ? (
            <View style={styles.bottomBarTwo}>
              <TouchableOpacity style={styles.bottomBtnOutline}>
                <Text style={styles.bottomBtnOutlineTxt}>Save List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomBtnOutline}>
                <Text style={styles.bottomBtnOutlineTxt}>Broadcast</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bottomBarOne}>
              <View style={styles.bottomCard}>
                <TextInput
                  style={styles.listNameInput} placeholder="Add List Name"
                  placeholderTextColor="#AAAAAA" value={listName} onChangeText={setListName}
                />
                <TouchableOpacity style={styles.saveListBtn}>
                  <Text style={styles.saveListTxt}>Save List</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      {/* ── Saved List View ── */}
      {activeTab === 'saved' && (
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
            {savedLists.map(item => (
              <SavedListRow
                key={item.id}
                item={item}
                onToggleCheck={toggleSavedCheck}
                onToggleStar={toggleSavedStar}
                onDelete={deleteSaved}
              />
            ))}
          </ScrollView>

          {/* Bottom bar when items selected */}
          {selectedSavedCount > 0 && (
            <View style={styles.bottomBarTwo}>
              <TouchableOpacity style={styles.bottomBtnOutline}>
                <Text style={styles.bottomBtnOutlineTxt}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bottomBtnOutline, styles.bottomBtnPrimary]}>
                <Text style={[styles.bottomBtnOutlineTxt, { color: '#fff' }]}>
                  Broadcast ({selectedSavedCount})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E8E8',
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  composeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2ECC40', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  composeTxt: { fontSize: 14, fontWeight: '700', color: '#fff', fontFamily: 'SofiaSansCondensed-SemiBold' },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 12, marginVertical: 8,
    backgroundColor: '#F2F2F2', borderRadius: 12, padding: 3, gap: 2,
  },
  tabBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  tabBtnSaved: { flex: 1.3 },
  tabBtnSavedActive: {
    backgroundColor: '#FFFFFF', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  tabTxt: { fontSize: 13, color: '#888', fontFamily: 'SofiaSansCondensed-SemiBold' },
  tabTxtActive: { color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  tabSubTxt: { fontSize: 10, color: '#AAA', fontFamily: 'SofiaSansCondensed-Regular', marginTop: 1 },
  tabSubTxtActive: { color: '#888' },

  scroll: { flex: 1 },

  // ── Tree view ──────────────────────────────────────────────────────────────
  treeRootRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 5, gap: 12,
  },
  treeRootAvatar: { width: 52, height: 52, borderRadius: 10, resizeMode: 'cover' },
  treeRootName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1A1A1A' },
  treeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingRight: 16 },
  treeExpandBtn: { marginRight: 8 },
  expandIcon: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    borderColor: '#AAAAAA', backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  expandIconTxt: { fontSize: 14, color: '#555', fontWeight: '700' },
  treeAvatar: { width: 40, height: 40, borderRadius: 8, resizeMode: 'cover' },
  treeName: { fontSize: 14, color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-Medium' },
  treeVertLine: { width: 1.5, flex: 1, minHeight: 20, backgroundColor: '#DDDDDD' },

  // ── List view ──────────────────────────────────────────────────────────────
  listRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7 },
  listAvatar: { width: 48, height: 48, borderRadius: 8, resizeMode: 'cover', marginLeft: 12 },
  listName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  listRelation: { fontSize: 13, color: '#888888', marginTop: 2 },
  followBtn: {
    borderWidth: 1.5, borderColor: 'rgba(0,107,165,0.5)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 4,
  },
  followBtnActive: { backgroundColor: 'rgba(0,107,165,0.5)', borderColor: 'rgba(0,107,165,0.5)' },
  followBtnTxt: { fontSize: 12, color: '#000', fontFamily: 'SofiaSansCondensed-Medium' },
  followBtnTxtActive: { color: '#FFF' },
  groupDivider: {
    height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0',
    marginHorizontal: 16, marginVertical: 8,
  },

  // ── Saved List view ────────────────────────────────────────────────────────
  savedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  savedRowHighlighted: { backgroundColor: '#FFF5E6' },
  starBtn: { padding: 2 },
  starFilled: { fontSize: 20, color: '#F5A623' },
  savedListName: { flex: 1, fontSize: 15, color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-Regular' },
  savedListNameBold: { fontFamily: 'SofiaSansCondensed-SemiBold', fontWeight: '600' },
  savedMemberCount: { fontSize: 13, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },

  // Swipe delete
  deleteAction: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: DELETE_W, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E74C3C',
  },
  deleteBtn: { alignItems: 'center', justifyContent: 'center', width: DELETE_W, height: '100%' },

  // ── Bottom bars ────────────────────────────────────────────────────────────
  bottomBarOne: {
    paddingHorizontal: 16, paddingBottom: 30, paddingTop: 12,
    backgroundColor: '#F5F5F5',
  },
  bottomCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEEEEE', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, gap: 10,
  },
  listNameInput: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 8 },
  saveListBtn: { backgroundColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveListTxt: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

  bottomBarTwo: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingBottom: 30, paddingTop: 16,
    backgroundColor: '#EEEEEE',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DDDDDD',
  },
  bottomBtnOutline: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#CCCCCC', backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomBtnPrimary: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  bottomBtnOutlineTxt: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
});