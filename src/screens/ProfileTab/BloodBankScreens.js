/**
 * BloodBankScreens.js
 *
 * Blood Bank flow — 3 screens navigated in sequence:
 *  1. SelectRequirementScreen  — pick blood component type
 *  2. PersonInNeedScreen       — pick family member who needs blood
 *  3. WhenAndWhereScreen       — blood group, units, location, timing
 *
 * Self-contained: internal navigation via useState('screen')
 * Props: { onBack }
 */

import React, { useState } from 'react';
import {
  Dimensions, Image, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── Palette ─────────────────────────────────────────────────────────────────
const ORANGE  = '#F5A623';
const ORANGE2 = '#F0962A';

// ─── Blood requirement data ───────────────────────────────────────────────────
const REQUIREMENTS = [
  {
    id: 'whole_blood',
    title: 'Whole Blood / PRBC',
    subtitle: 'Common Use Case: Surgeries, Trauma, Anemia.',
    bgColor: '#E8504A',
    textColor: '#FFFFFF',
    emoji: require('../../../assets/images/profile/bd1.png'),
    description:
      'Whole Blood contains red cells, white cells, platelets, and plasma, used primarily for massive blood loss. PRBC (Packed Red Blood Cells) are separated from plasma to treat Anemia or surgical blood loss without adding excess fluid.',
  },
  {
    id: 'platelets',
    title: 'Platelets SDP / RDP',
    subtitle: 'Common Use Case: Dengue, Cancer, Leukemia.',
    bgColor: '#F28B6E',
    textColor: '#FFFFFF',
    emoji: require('../../../assets/images/profile/bd2.png'),
    description:
      'RDP (Random Donor Platelets) are extracted from multiple whole blood units, requiring 4–6 donors for one dose. SDP (Single Donor Platelets) use apheresis to collect a full dose from one donor.',
  },
  {
    id: 'plasma',
    title: 'Plasma Fresh\nFrozen Plasma (FFP)',
    subtitle: 'Common Use Case: Burns, Liver Failure, Clotting.',
    bgColor: '#F5A623',
    textColor: '#FFFFFF',
    emoji: require('../../../assets/images/profile/bd3.png'),
    description:
      'Fresh Frozen Plasma (FFP) is the liquid portion of blood, frozen within hours of donation to preserve clotting factors. Usually its required for a patient who is suffering from massive bleeding, liver disease, or severe burns. It helps restore blood volume and clotting ability.',
  },
  {
    id: 'cryo',
    title: 'Specialized\nCryoprecipitate',
    subtitle: 'Common Use Case: Hemophilia, Clotting Issues.',
    bgColor: '#F5C842',
    textColor: '#1A1A1A',
    emoji: require('../../../assets/images/profile/bd4.png'),
    description:
      'Cryoprecipitate is a concentrated blood component prepared by thawing Fresh Frozen Plasma and collecting the insoluble precipitate. It is rich in essential clotting proteins like Fibrinogen and Factor VIII. It is primarily used to treat massive hemorrhages, hemophilia, or specialized bleeding disorders where rapid clotting is critical.',
  },
  {
    id: 'granulocytes',
    title: 'Rare Granulocytes (WBC)',
    subtitle: 'Common Use Case: Severe Immune Deficiency.',
    bgColor: '#B0C4DE',
    textColor: '#1A1A1A',
    emoji: require('../../../assets/images/profile/bd5.png'),
    description:
      'Granulocytes are a category of white blood cells (WBCs) containing enzymes that combat serious bacterial and fungal infections. They are the body\'s primary defense system. In medicine, granulocyte transfusions are a rare, emergency requirement for patients with severe immune deficiencies or life-threatening infections unresponsive to traditional antibiotics.',
  },
];

// RBC compatibility table
const RBC_COMPAT = [
  { recipient: 'A+',  canReceive: 'A+, A-, O+, O-' },
  { recipient: 'A-',  canReceive: 'A-, O-' },
  { recipient: 'B+',  canReceive: 'B+, B-, O+, O-' },
  { recipient: 'B-',  canReceive: 'B-, O-' },
  { recipient: 'AB+', canReceive: 'A+, A-, B+, B-, AB+, AB-, O+, O-' },
  { recipient: 'AB-', canReceive: 'AB-, A-, B-, O-' },
  { recipient: 'O+',  canReceive: 'O+, O-' },
  { recipient: 'O-',  canReceive: 'O- only' },
];

// ─── Family members ───────────────────────────────────────────────────────────
const FAMILY = [
  { id: 'me',       name: 'Rakesh Mehra',  relation: 'Me',       photo: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { id: 'mother',   name: 'Raghini Mehra', relation: 'Mother',   photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'father',   name: 'Rahul Mehra',   relation: 'Father',   photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  { id: 'wife',     name: 'Shalini Mehra', relation: 'Wife',     photo: 'https://randomuser.me/api/portraits/women/50.jpg' },
  { id: 'sister',   name: 'Gouri Mishra',  relation: 'Sister',   photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
  { id: 'daughter', name: 'Rashi Mehra',   relation: 'Daughter', photo: 'https://randomuser.me/api/portraits/women/25.jpg' },
  { id: 'son',      name: 'Rajeev Mehra',  relation: 'Son',      photo: 'https://randomuser.me/api/portraits/men/25.jpg' },
];

// ─── Blood groups ─────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const WHEN_OPTIONS  = ['ASAP', 'Date & Time'];

// ─── Shared components ────────────────────────────────────────────────────────
function Header({ title, onBack, rightLabel, onRight }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerBack} hitSlop={10}>
        <Image
          source={require('../../../assets/images/chat/back.png')}
          style={styles.headerBackIcon}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightLabel ? (
        <TouchableOpacity onPress={onRight} style={styles.headerRightBtn}>
          <Text style={styles.headerRightTxt}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 80 }} />
      )}
    </View>
  );
}


// ─── 1. SELECT REQUIREMENT SCREEN ────────────────────────────────────────────
function SelectRequirementScreen({ onBack, onNext }) {
  const [showCompat, setShowCompat] = useState(false);

  return (
    <View style={styles.screen}>
      <Header
        title="Select Requirement"
        onBack={onBack}
        rightLabel="Requests"
        onRight={() => setShowCompat(true)}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {REQUIREMENTS.map(req => (
          <View key={req.id} style={{ marginBottom: 18 }}>
            {/* Colored banner card — tap to go to next screen */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onNext}
              style={[styles.reqCard, { backgroundColor: req.bgColor }]}
            >
              {/* Image illustration */}
              <View style={styles.reqEmojiWrap}>
                <Image source={req.emoji} style={{ height: 60, width: 60 }} />
              </View>
              <View style={styles.reqCardText}>
                <Text style={[styles.reqTitle, { color: req.textColor }]}>{req.title}</Text>
                <Text style={[styles.reqSubtitle, { color: req.textColor, opacity: 0.88 }]}>
                  {req.subtitle}
                </Text>
              </View>
              {/* Info ! badge — stops propagation so it doesn't also navigate */}
              <TouchableOpacity
                onPress={e => { e.stopPropagation(); setShowCompat(true); }}
                style={styles.reqInfoBtn}
                hitSlop={8}
              >
                <View style={styles.reqInfoCircle}>
                  <Text style={styles.reqInfoTxt}>!</Text>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Description text */}
            <Text style={styles.reqDesc}>{req.description}</Text>
          </View>
        ))}

        {/* Bottom donor note */}
        <View style={styles.donorNote}>
          <View style={styles.donorNoteHr} />
          <View style={styles.donorNoteRow}>
            <View style={styles.donorNoteIcon}>
              <Text>🟡</Text>
            </View>
            <Text style={styles.donorNoteLabel}>Any Blood doner</Text>
          </View>
          <Text style={styles.donorNoteDesc}>
            Whole Blood contains red cells, white cells, platelets, and plasma, used
            primarily for massive blood loss. PRBC (Packed Red Blood Cells)
          </Text>
        </View>
      </ScrollView>

      {/* RBC Compatibility popup — opened by Requests button OR ! icon */}
      <Modal visible={showCompat} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompat(false)}
        >
          <View style={styles.compatCard}>
            <Text style={styles.compatTitle}>🩸  RBC (Blood) Compatibility</Text>
            <View style={styles.compatTableHeader}>
              <Text style={[styles.compatCol, styles.compatColHead]}>Recipient</Text>
              <Text style={[styles.compatColRight, styles.compatColHead]}>Can receive from</Text>
            </View>
            <View style={styles.compatDivider} />
            {RBC_COMPAT.map((row, i) => (
              <View key={i} style={styles.compatRow}>
                <Text style={styles.compatCol}>{row.recipient}</Text>
                <Text style={styles.compatColRight}>{row.canReceive}</Text>
              </View>
            ))}
            <View style={styles.compatDivider} />
            <Text style={styles.compatFooter}>
              Whole Blood contains red cells, white cells, platelets, and plasma, used primarily for massive
              blood loss. PRBC (Packed Red Blood Cells)
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Generic 7-person relation list (reused at every level) ──────────────────
// Given a node id, returns 7 sub-people. We cycle through the FAMILY pool
// seeded by the id so each node always produces consistent children.
const RELATION_NAMES = ['Father','Mother','Wife','Husband','Brother','Sister','Son'];
const AVATAR_MALE   = [60,70,75,50,55,34,38,42,46,62];
const AVATAR_FEMALE = [44,50,60,70,55,35,29,25,20,38,62,68];
const NAMES_MALE    = ['Rahul Mehra','Suresh Sharma','Mohan Mehra','Sunil Mehra','Vikram Sharma','Rohit Kapoor','Amit Mishra','Rajeev Mehra','Rohan Mehra','Anil Kapoor'];
const NAMES_FEMALE  = ['Raghini Mehra','Shalini Mehra','Gouri Mishra','Kamla Sharma','Savita Mehra','Rekha Gupta','Priya Sharma','Neha Kapoor','Rashi Mehra','Tanya Mishra','Sunita Kapoor'];
const GENDER_BY_REL = { Father:'male', Mother:'female', Wife:'female', Husband:'male', Brother:'male', Sister:'female', Son:'male' };

function getSubRelations(nodeId, depth) {
  // deterministic seed from nodeId string
  const seed = nodeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return RELATION_NAMES.map((rel, i) => {
    const isMale  = GENDER_BY_REL[rel] === 'male';
    const pool    = isMale ? NAMES_MALE : NAMES_FEMALE;
    const avatars = isMale ? AVATAR_MALE : AVATAR_FEMALE;
    const idx     = (seed + i * 3 + depth) % pool.length;
    const aidx    = (seed + i * 7 + depth) % avatars.length;
    const gender  = isMale ? 'men' : 'women';
    return {
      id:       `${nodeId}_${rel.toLowerCase()}_${depth}`,
      name:     pool[idx],
      relation: rel,
      photo:    `https://randomuser.me/api/portraits/${gender}/${avatars[aidx]}.jpg`,
    };
  });
}

// ─── Recursive tree row ───────────────────────────────────────────────────────
// depth 0 = root level (FAMILY), max 5 levels (0–4)
const MAX_DEPTH = 4; // 0-indexed so 5 total levels

function TreeRow({ node, depth, selectedId, expandedIds, onSelect, onToggleExpand }) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const canExpand  = depth < MAX_DEPTH;
  // Avatar shrinks at deeper levels: 60 → 52 → 44 → 38 → 34
  const avatarSize = Math.max(34, 60 - depth * 8);
  const fontSize   = depth === 0 ? 17 : Math.max(13, 17 - depth * 1.5);

  return (
    <View>
      {/* Row */}
      <View style={[styles.personRow]}>
        {/* Radio checkbox — single select */}
        <TouchableOpacity
          onPress={() => onSelect(node.id)}
          style={[styles.personCheck, isSelected && styles.personCheckOn]}
          activeOpacity={0.7}
          hitSlop={6}
        >
          {isSelected && <Text style={styles.personCheckTick}>✓</Text>}
        </TouchableOpacity>

        {/* Avatar — shrinks with depth */}
        <Image
          source={{ uri: node.photo }}
          style={[styles.personAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize * 0.22 }]}
        />

        {/* Name + relation */}
        <View style={styles.personInfo}>
          <Text style={[styles.personName, { fontSize }]}>{node.name}</Text>
          <Text style={[styles.personRelation, { fontSize: Math.max(11, fontSize - 3) }]}>{node.relation}</Text>
        </View>

        {/* Chevron — expand/collapse */}
        {canExpand ? (
          <TouchableOpacity
            onPress={() => onToggleExpand(node.id)}
            style={styles.personChevron}
            hitSlop={8}
          >
            <Image
              source={isExpanded
                ? require('../../../assets/images/chat/chevron-up.png')
                : require('../../../assets/images/chat/chevron-down.png')}
              style={{ height: 14, width: 14, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      {/* Children with vertical indent line */}
      {isExpanded && canExpand && (
        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
          {/* Vertical orange line */}
          <View style={{ width: 16 + depth * 12 + 22, alignItems: 'flex-end' }}>
            <View style={styles.treeIndentLine} />
          </View>
          {/* Children */}
          <View style={{ flex: 1 }}>
            {getSubRelations(node.id, depth + 1).map(child => (
              <TreeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── 2. PERSON IN NEED SCREEN ────────────────────────────────────────────────
function PersonInNeedScreen({ onBack, onNext }) {
  const [selectedId, setSelectedId]   = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const handleSelect = (id) => setSelectedId(id);

  const handleToggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.screen}>
      <Header title="Person in need" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
      >
        {FAMILY.map(member => (
          <TreeRow
            key={member.id}
            node={member}
            depth={0}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={handleSelect}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </ScrollView>

      {/* Next button — enabled only when someone is selected */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, !selectedId && styles.ctaBtnDisabled]}
          onPress={() => selectedId && onNext()}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaTxt}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── 3. WHEN AND WHERE SCREEN ────────────────────────────────────────────────
function WhenAndWhereScreen({ onBack, onSubmit }) {
  const [bloodGroup, setBloodGroup]         = useState('AB-');
  const [showBGPicker, setShowBGPicker]     = useState(false);
  const [units, setUnits]                   = useState(1);
  const [where, setWhere]                   = useState('');
  const [when, setWhen]                     = useState('ASAP');
  const [showWhenPicker, setShowWhenPicker] = useState(false);

  const universalLabel = bloodGroup === 'O-'  ? 'Any universal doner'     :
                         bloodGroup === 'AB+' ? 'Any universal recipient'  : null;

  return (
    <View style={styles.screen}>
      <Header title="When and Where" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Blood Group row */}
        <View style={styles.wwRow}>
          <Text style={styles.wwLabel}>Blood Group</Text>
          <TouchableOpacity
            style={styles.wwDropdown}
            onPress={() => setShowBGPicker(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.wwDropdownTxt}>{bloodGroup}</Text>
            <Image
              source={require('../../../assets/images/chat/chevron-down.png')}
              style={{ height: 16, width: 16, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>

        {/* Blood group picker */}
        {showBGPicker && (
          <View style={styles.bgPickerWrap}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity
                key={bg}
                style={[styles.bgPickerItem, bloodGroup === bg && styles.bgPickerItemActive]}
                onPress={() => { setBloodGroup(bg); setShowBGPicker(false); }}
              >
                <Text style={[styles.bgPickerTxt, bloodGroup === bg && styles.bgPickerTxtActive]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Universal donor note */}
        {universalLabel && (
          <View style={styles.universalRow}>
            <Text style={styles.universalIcon}>🟡</Text>
            <Text style={styles.universalTxt}>{universalLabel}</Text>
          </View>
        )}

        {/* Unit stepper */}
        <View style={[styles.wwRow, { marginTop: 24 }]}>
          <Text style={styles.wwLabel}>Unit</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setUnits(u => Math.max(1, u - 1))}
            >
              <Text style={styles.stepperBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperVal}>{units}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setUnits(u => u + 1)}
            >
              <Text style={styles.stepperBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Where */}
        <View style={[styles.wwFieldWrap, { marginTop: 24 }]}>
          <TextInput
            style={styles.wwFieldInput}
            placeholder="Where"
            placeholderTextColor="#AAAAAA"
            value={where}
            onChangeText={setWhere}
          />
          <TouchableOpacity style={styles.wwFieldIcon}>
            <Image
              source={require('../../../assets/images/chat/gps.png')}
              style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: '#1A1A1A' }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.wwFieldLine} />

        {/* When */}
        <View style={[styles.wwFieldWrap, { marginTop: 28 }]}>
          <Text style={[styles.wwLabel, { color: '#AAAAAA', fontWeight: '400' }]}>When</Text>
          <TouchableOpacity
            style={styles.wwDropdown}
            onPress={() => setShowWhenPicker(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.wwDropdownTxt}>{when}</Text>
            <Image
              source={require('../../../assets/images/chat/chevron-down.png')}
              style={{ height: 16, width: 16, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.wwFieldLine} />

        {/* When picker dropdown */}
        {showWhenPicker && (
          <View style={styles.whenPickerWrap}>
            {WHEN_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.whenPickerItem}
                onPress={() => { setWhen(opt); setShowWhenPicker(false); }}
              >
                <Text style={styles.whenPickerTxt}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Submit button */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity style={styles.ctaBtn} onPress={onSubmit} activeOpacity={0.85}>
          <Text style={styles.ctaTxt}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function BloodBankFlow({ onBack, onComplete }) {
  const [screen, setScreen] = useState('select'); // 'select' | 'person' | 'when'

  return screen === 'select' ? (
    <SelectRequirementScreen
      onBack={onBack}
      onNext={() => setScreen('person')}
    />
  ) : screen === 'person' ? (
    <PersonInNeedScreen
      onBack={() => setScreen('select')}
      onNext={() => setScreen('when')}
    />
  ) : (
    <WhenAndWhereScreen
      onBack={() => setScreen('person')}
      onSubmit={onComplete}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  headerBack: { width: 40, alignItems: 'flex-start' },
  headerBackIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#1A1A1A' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  headerRightBtn: {
    borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  headerRightTxt: { fontSize: 14, color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-Medium' },

  // ── CTA ────────────────────────────────────────────────────────────────────
  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  ctaBtn: {
    backgroundColor: ORANGE,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  // ── Select Requirement ─────────────────────────────────────────────────────
  reqCard: {
    borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    overflow: 'hidden', minHeight: 88,
  },
  reqCardSelected: {
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
    transform: [{ scale: 1.01 }],
  },
  reqEmojiWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, flexShrink: 0,
  },
  reqEmoji: { fontSize: 30 },
  reqCardText: { flex: 1 },
  reqTitle: { fontSize: 20, fontWeight: '700', lineHeight: 24, fontFamily: 'SofiaSansCondensed-Bold' },
  reqSubtitle: { fontSize: 13, marginTop: 3, lineHeight: 18, fontFamily: 'SofiaSansCondensed-Regular' },
  reqInfoBtn: { position: 'absolute', top: 10, right: 10 },
  reqInfoCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
  },
  reqInfoTxt: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  reqDesc: {
    fontSize: 14, color: '#444', lineHeight: 21, marginTop: 10,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Donor note
  donorNote: { marginTop: 8, paddingBottom: 8 },
  donorNoteHr: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', marginBottom: 14 },
  donorNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  donorNoteIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  donorNoteLabel: { fontSize: 15, color: '#888', fontFamily: 'SofiaSansCondensed-Medium' },
  donorNoteDesc: { fontSize: 13, color: '#AAAAAA', lineHeight: 19 },

  // Compatibility modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 16,
  },
  compatCard: {
    backgroundColor: '#FFFFFF',
    borderTopStartRadius: 10, borderBottomEndRadius: 10, borderBottomStartRadius: 10,
    padding: 18,
    elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    width: '60%', alignSelf: 'flex-end',
  },
  compatTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  compatTableHeader: { flexDirection: 'row', marginBottom: 4 },
  compatColHead: { fontWeight: '700', color: '#1A1A1A' },
  compatDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', marginVertical: 6 },
  compatRow: { flexDirection: 'row', paddingVertical: 4 },
  compatCol: { width: 70, fontSize: 13, color: '#333' },
  compatColRight: { flex: 1, fontSize: 13, color: '#333' },
  compatFooter: { fontSize: 12, color: '#999', lineHeight: 17, marginTop: 8 },

  // ── Person in need ─────────────────────────────────────────────────────────
  personRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  personCheck: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#E0C8A0',
    backgroundColor: 'rgba(245,166,35,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  personCheckOn: { backgroundColor: ORANGE, borderColor: ORANGE },
  personCheckTick: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  personAvatar: { width: 60, height: 60, borderRadius: 12, resizeMode: 'cover', marginRight: 14 },
  personInfo: { flex: 1 },
  personName: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  personRelation: { fontSize: 14, color: '#888', marginTop: 2 },
  personChevron: { padding: 8 },
  personChevronTxt: { fontSize: 18, color: '#BBBBBB' },

  // Vertical indent line connecting parent to children
  treeIndentLine: {
    width: 2,
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(245,166,35,0.3)',
    borderRadius: 1,
  },

  // Disabled CTA
  ctaBtnDisabled: { backgroundColor: '#E0C8A0', opacity: 0.6 },

  // ── When and Where ─────────────────────────────────────────────────────────
  wwRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  wwLabel: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  wwDropdown: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: ORANGE,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 8,
    minWidth: 90,
  },
  wwDropdownTxt: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
  wwDropdownArrow: { fontSize: 18, color: '#888' },

  // Blood group picker
  bgPickerWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginTop: 12, marginBottom: 4,
  },
  bgPickerItem: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  bgPickerItemActive: { borderColor: ORANGE, backgroundColor: 'rgba(245,166,35,0.1)' },
  bgPickerTxt: { fontSize: 15, color: '#555' },
  bgPickerTxtActive: { color: ORANGE, fontWeight: '700' },

  // Universal donor
  universalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  universalIcon: { fontSize: 20 },
  universalTxt: { fontSize: 15, color: '#888', fontFamily: 'SofiaSansCondensed-Medium' },

  // Unit stepper
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: {
    width: 32, height: 32,
    borderWidth: 1.5, borderColor: '#CCCCCC', borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnTxt: { fontSize: 20, color: '#555', fontWeight: '500', lineHeight: 24 },
  stepperVal: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', minWidth: 28, textAlign: 'center' },

  // Where / When fields
  wwFieldWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wwFieldInput: { flex: 1, fontSize: 16, color: '#1A1A1A', paddingVertical: 4 },
  wwFieldIcon: { padding: 4 },
  wwLocationIcon: { fontSize: 20, color: '#888' },
  wwFieldLine: {
    height: 1.5, backgroundColor: ORANGE,
    marginTop: 6,
  },

  // When picker
  whenPickerWrap: {
    alignSelf: 'flex-end',
    borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, backgroundColor: '#FFFFFF',
    overflow: 'hidden', marginTop: 4,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
    minWidth: 140,
  },
  whenPickerItem: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
  },
  whenPickerTxt: { fontSize: 15, color: '#1A1A1A' },
});