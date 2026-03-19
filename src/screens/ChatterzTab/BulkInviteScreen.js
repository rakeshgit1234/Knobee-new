/**
 * BulkInviteScreen.js
 *
 * Bulk Invite screen with two tabs:
 *  - Tree View: expandable/collapsible family tree with +/- icons, indentation, checkboxes
 *  - List View: grouped flat list with checkboxes, chevrons, sections
 *    → No selection: bottom shows "Add List Name" input + "Save List"
 *    → Has selection: bottom shows "Save List" + "Add Message"
 *
 * Props: { onBack }
 */

import React, { useState, useCallback } from 'react';
import {
  Dimensions, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── People data ──────────────────────────────────────────────────────────────
const PEOPLE = {
  raghav:   { id: 'raghav',   name: 'Raghav Mehra',    relation: 'You',               photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  rahul:    { id: 'rahul',    name: 'Rahul Mehra',     relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  sanjay:   { id: 'sanjay',   name: 'Sanjay Mehra',    relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
  rinki:    { id: 'rinki',    name: 'Rinki Mehra',     relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/55.jpg' },
  raghini:  { id: 'raghini',  name: 'Raghini Mehra',   relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  raghu:    { id: 'raghu',    name: 'Raghu Mehra',     relation: 'Brother',           photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
  pawan:    { id: 'pawan',    name: 'Pawan Mehra',     relation: 'Father',            photo: 'https://randomuser.me/api/portraits/men/70.jpg' },
  devi:     { id: 'devi',     name: 'Devi Mehra',      relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/70.jpg' },
  sanchita: { id: 'sanchita', name: 'Sanchita Mehra',  relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/35.jpg' },
  rahul2:   { id: 'rahul2',   name: 'Rahul Mehra',     relation: 'Brother',           photo: 'https://randomuser.me/api/portraits/men/42.jpg' },
  ranchi:   { id: 'ranchi',   name: 'Ranchi Kashyap',  relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/29.jpg' },
  sanjhana: { id: 'sanjhana', name: 'Sanjhana Singh',  relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/22.jpg' },
  swati:    { id: 'swati',    name: 'Swati Mehra',     relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/28.jpg' },
  ranchi2:  { id: 'ranchi2',  name: 'Ranchi Kashyap',  relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/30.jpg' },
  raghavs:  { id: 'raghavs',  name: 'Raghav Mehra',    relation: 'Son',               photo: 'https://randomuser.me/api/portraits/men/20.jpg' },
  raghini2: { id: 'raghini2', name: 'Raghini Mehra',   relation: 'Mother',            photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  shalini:  { id: 'shalini',  name: 'Shalini Mehra',   relation: 'Wife',              photo: 'https://randomuser.me/api/portraits/women/50.jpg' },
  gouri:    { id: 'gouri',    name: 'Gouri Mishra',    relation: 'Sister',            photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
  rashi:    { id: 'rashi',    name: 'Rashi Mehra',     relation: 'Daughter',          photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
  rajeev:   { id: 'rajeev',   name: 'Rajeev Mehra',    relation: 'Son',               photo: 'https://randomuser.me/api/portraits/men/25.jpg' },
  // List view group 1 - Raghini's family
  sanjayL:  { id: 'sanjayL',  name: 'Sanjay Khanna',   relation: "Raghini's Father",  photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
  jasmin:   { id: 'jasmin',   name: 'Jasmin Khanna',   relation: "Raghini's Mother",  photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  rahulL:   { id: 'rahulL',   name: 'Rahul Mehra',     relation: "Raghini's Husband", photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  jitesh:   { id: 'jitesh',   name: 'Jitesh Khanna',   relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/30.jpg' },
  rakesh:   { id: 'rakesh',   name: 'Rakesh Mehra',    relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
};

// ─── Tree structure ───────────────────────────────────────────────────────────
const TREE = [
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
      { id: 'sanjayL', name: 'Sanjay Khanna',   relation: "Raghini's Father",  photo: 'https://randomuser.me/api/portraits/men/55.jpg' },
      { id: 'jasmin',  name: 'Jasmin Khanna',   relation: "Raghini's Mother",  photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 'rahulL',  name: 'Rahul Mehra',     relation: "Raghini's Husband", photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
      { id: 'jitesh',  name: 'Jitesh Khanna',   relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/30.jpg' },
      { id: 'rakesh',  name: 'Rakesh Mehra',    relation: "Raghini's Brother", photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
    ],
  },
  {
    id: 'group2',
    header: null,
    members: [
      { id: 'rahulG2',  name: 'Rahul Mehra',    relation: 'Father',   photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
      { id: 'shaliniG', name: 'Shalini Mehra',  relation: 'Wife',     photo: 'https://randomuser.me/api/portraits/women/50.jpg' },
      { id: 'gouriG',   name: 'Gouri Mishra',   relation: 'Sister',   photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
      { id: 'rashiG',   name: 'Rashi Mehra',    relation: 'Daughter', photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
    ],
  },
];

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onToggle, size = 18 }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}
      style={{
        width: size, height: size, borderRadius: 5,
        borderWidth: 1.5,
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
  const isRoot = depth === 0;

  return (
    <View>
      <View style={[styles.treeRow, { paddingLeft: 16 + indent }]}>
        {/* Expand/collapse icon */}
        <TouchableOpacity
          onPress={() => hasChildren && onToggleExpand(node.id, depth)}
          style={styles.treeExpandBtn}
          activeOpacity={hasChildren ? 0.7 : 1}
        >
          {hasChildren ? (
            <View style={styles.expandIcon}>
              <Text style={styles.expandIconTxt}>{node.expanded ? '−' : '+'}</Text>
            </View>
          ) : (
            <View style={[styles.expandIcon, { backgroundColor: 'transparent', borderColor: '#DDD' }]}>
              <Text style={[styles.expandIconTxt, { color: '#CCC' }]}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Checkbox */}
        <View style={{ marginRight: 10 }}>
          <Checkbox checked={node.checked} onToggle={() => onToggleCheck(node.id, depth)} />
        </View>

        {/* Avatar */}
        <Image source={{ uri: person.photo }} style={styles.treeAvatar} />

        {/* Name + relation */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.treeName}>
            {person.name}{isRoot ? '' : ''}
            {node.id === 'raghav' ? ' (You)' : ` (${person.relation})`}
          </Text>
        </View>
      </View>

      {/* Vertical indent line + children */}
      {node.expanded && node.children?.length > 0 && (
        <View style={{ flexDirection: 'row' }}>
          {/* Vertical line */}
          <View style={{ width: 16 + indent + 11, alignItems: 'flex-end', paddingRight: 0 }}>
            <View style={styles.treeVertLine} />
          </View>
          <View style={{ flex: 1 }}>
            {node.children.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                onToggleCheck={onToggleCheck}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────
function ListRow({ member, checked, onToggle, expanded, onExpandToggle, isHeader }) {
  const [following, setFollowing] = useState(false);

  return (
    <View style={styles.listRow}>
      <Checkbox checked={checked} onToggle={onToggle} />
      <Image source={{ uri: member.photo }} style={styles.listAvatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.listName}>{member.name}</Text>
        <Text style={styles.listRelation}>{member.relation}</Text>
      </View>
      {/* Follow / Following toggle button */}
      <TouchableOpacity
        onPress={() => setFollowing(v => !v)}
        style={[styles.followBtn, following && styles.followBtnActive]}
        activeOpacity={0.75}
      >
        <Text style={[styles.followBtnTxt, following && styles.followBtnTxtActive]}>
          {following ? 'Following' : '+ Follow'}
        </Text>
      </TouchableOpacity>
      {/* Chevron */}
      {/* {isHeader ? (
        <TouchableOpacity onPress={onExpandToggle} style={styles.chevronBtn}>
          <Text style={styles.chevronTxt}>{expanded ? '∧' : '∨'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.chevronBtn}>
          <Text style={styles.chevronTxt}>∨</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BulkInviteScreen({ onBack,navigation}) {
  const [activeTab, setActiveTab]           = useState('tree'); // 'tree' | 'list'
  const [treeData, setTreeData]             = useState(TREE);
  const [listChecked, setListChecked]       = useState(new Set(['raghini']));
  const [expandedGroups, setExpandedGroups] = useState(new Set(['group1']));
  const [listName, setListName]             = useState('');

  const hasListSelection = listChecked.size > 0;

  // ── Tree: toggle check ────────────────────────────────────────────────────
  const toggleCheck = useCallback((id) => {
    const updateNodes = (nodes) => nodes.map(n => {
      if (n.id === id) return { ...n, checked: !n.checked };
      if (n.children?.length) return { ...n, children: updateNodes(n.children) };
      return n;
    });
    setTreeData(prev => updateNodes(prev));
  }, []);

  // ── Tree: toggle expand ───────────────────────────────────────────────────
  const toggleExpand = useCallback((id) => {
    const updateNodes = (nodes) => nodes.map(n => {
      if (n.id === id) return { ...n, expanded: !n.expanded };
      if (n.children?.length) return { ...n, children: updateNodes(n.children) };
      return n;
    });
    setTreeData(prev => updateNodes(prev));
  }, []);

  // ── List: toggle check ────────────────────────────────────────────────────
  const toggleListCheck = useCallback((id) => {
    setListChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  }, []);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../../../assets/images/chat/back.png')} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Invite</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tree' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tree')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabTxt, activeTab === 'tree' && styles.tabTxtActive]}>Tree View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'list' && styles.tabBtnActive]}
          onPress={() => setActiveTab('list')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabTxt, activeTab === 'list' && styles.tabTxtActive]}>List View</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'tree' ? (
        // ── TREE VIEW ──────────────────────────────────────────────────────
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}>
            {/* Root user (you) */}
            <View style={styles.treeRootRow}>
              <Image source={{ uri: PEOPLE.raghav.photo }} style={styles.treeRootAvatar} />
              <Text style={styles.treeRootName}>Raghav Mehra (You)</Text>
            </View>

            {/* Tree nodes */}
            {treeData.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                onToggleCheck={toggleCheck}
                onToggleExpand={toggleExpand}
              />
            ))}
          </ScrollView>

          {/* Tree bottom bar — same layout as list view */}
          <View style={styles.bottomBarTwo}>
            <TouchableOpacity style={styles.bottomBtnOutline}>
              <Text style={styles.bottomBtnOutlineTxt}>Save List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtnOutline}>
              <Text style={styles.bottomBtnOutlineTxt}>Bulk Invite</Text>
            </TouchableOpacity>
          </View>
        </>

      ) : (
        // ── LIST VIEW ──────────────────────────────────────────────────────
        <>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>

            {LIST_GROUPS.map((group, gi) => (
              <View key={group.id}>
                {/* Group header row */}
                {group.header && (
                  <ListRow
                    member={group.header}
                    checked={listChecked.has(group.header.id)}
                    onToggle={() => toggleListCheck(group.header.id)}
                    expanded={expandedGroups.has(group.id)}
                    onExpandToggle={() => toggleGroup(group.id)}
                    isHeader={true}
                  />
                )}

                {/* Members */}
                {group.members.map(member => (
                  <ListRow
                    key={member.id}
                    member={member}
                    checked={listChecked.has(member.id)}
                    onToggle={() => toggleListCheck(member.id)}
                    expanded={false}
                    onExpandToggle={() => {}}
                    isHeader={false}
                  />
                ))}

                {/* Group divider */}
                {gi < LIST_GROUPS.length - 1 && <View style={styles.groupDivider} />}
              </View>
            ))}
          </ScrollView>

          {/* Bottom bar */}
          {hasListSelection ? (
            // Has selection → Save List + Add Message
            <View style={styles.bottomBarTwo}>
              <TouchableOpacity style={styles.bottomBtnOutline}>
                <Text style={styles.bottomBtnOutlineTxt}>Save List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomBtnOutline}>
                <Text style={styles.bottomBtnOutlineTxt}>Add Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // No selection → Add List Name + Save List
            <View style={styles.bottomBarOne}>
              <View style={styles.bottomCard}>
                <TextInput
                  style={styles.listNameInput}
                  placeholder="Add List Name"
                  placeholderTextColor="#AAAAAA"
                  value={listName}
                  onChangeText={setListName}
                />
                <TouchableOpacity style={styles.saveListBtn}>
                  <Text style={styles.saveListTxt}>Save List</Text>
                </TouchableOpacity>
              </View>
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

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14,
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 8,
    backgroundColor: '#F2F2F2', borderRadius: 12, padding: 3,
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
  tabTxt: { fontSize: 15, color: '#888', fontFamily: 'SofiaSansCondensed-SemiBold' },
  tabTxtActive: { color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },

  scroll: { flex: 1 },

  // ── Tree view ─────────────────────────────────────────────────────────────
  treeRootRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 5, gap: 12,
  },
  treeRootAvatar: { width: 52, height: 52, borderRadius: 10, resizeMode: 'cover' },
  treeRootName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1A1A1A' },

  treeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, paddingRight: 16,
  },
  treeExpandBtn: { marginRight: 8 },
  expandIcon: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#AAAAAA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  expandIconTxt: { fontSize: 14, color: '#555', fontWeight: '700' },
  treeAvatar: { width: 40, height: 40, borderRadius: 8, resizeMode: 'cover' },
  treeName: { fontSize: 14, color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-Medium' },
  treeVertLine: {
    width: 1.5, flex: 1, minHeight: 20,
    backgroundColor: '#DDDDDD',
  },

  // ── List view ─────────────────────────────────────────────────────────────
  listRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 7,
  },
  listAvatar: { width: 48, height: 48, borderRadius: 8, resizeMode: 'cover', marginLeft: 12 },
  listName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  listRelation: { fontSize: 13, color: '#888888', marginTop: 2 },
  chevronBtn: { padding: 8 },
  chevronTxt: { fontSize: 16, color: '#AAAAAA', fontWeight: '300' },
  followBtn: {
    borderWidth: 1.5, borderColor: 'rgba(0, 107, 165, 0.5)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    marginRight: 4,
  },
  followBtnActive: { backgroundColor: 'rgba(0, 107, 165, 0.5)', borderColor: 'rgba(0, 107, 165, 0.5)' },
  followBtnTxt: { fontSize: 12, color: '#000', fontFamily: 'SofiaSansCondensed-Medium' },
  followBtnTxtActive: { color: '#FFF' },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // Bottom bars
  bottomBarOne: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 30, paddingTop: 12,
    backgroundColor: '#F5F5F5',
  },
  bottomCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEEEEE', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, gap: 10,
  },
  listNameInput: {
    flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 8,
  },
  saveListBtn: {
    backgroundColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  saveListTxt: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

  bottomBarTwo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingBottom: 30, paddingTop: 16,
    backgroundColor: '#EEEEEE',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DDDDDD',
  },
  bottomBtnOutline: {
    flex: 1, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomBtnOutlineTxt: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
});