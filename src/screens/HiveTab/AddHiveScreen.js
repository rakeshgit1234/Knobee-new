/**
 * AddHiveScreen.js
 *
 * "Add Hive" screen — add a new family member to the hive.
 * Matches screenshot:
 *  - Header: ← "Add Hive"
 *  - Profile card: initial avatar (pink bg), name, gender, DOB
 *  - Pink/blue tab underline (gender indicator)
 *  - Hexagon relation grid: Father, Mother, Brother, Sister, Husband, Son, Daughter
 *    (blue hex = male relations, pink hex = female relations; selected = bold border)
 *  - Add Mobile Number field with contacts icon
 *  - Kids Account toggle | Person is not Alive toggle (orange radio buttons)
 *  - Name input + photo upload box (right side)
 *  - Occupation dropdown
 *  - Date of Birth | Death Anniversary (side by side)
 *  - "Add Hiver & Send Invite" orange CTA button
 *
 * Props: { person, onBack }
 */

import React, { useState } from 'react';
import {
  Dimensions, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const RELATIONS = [
  { id: 'father',   label: 'Father',   color: 'blue',  row: 0 },
  { id: 'mother',   label: 'Mother',   color: 'pink',  row: 0 },
  { id: 'brother',  label: 'Brother',  color: 'blue',  row: 0 },
  { id: 'sister',   label: 'Sister',   color: 'pink',  row: 0 },
  { id: 'husband',  label: 'Husband',  color: 'blue',  row: 1 },
  { id: 'son',      label: 'Son',      color: 'blue',  row: 1 },
  { id: 'daughter', label: 'Daughter', color: 'pink',  row: 1 },
];

const BLUE_BG     = 'rgba(215, 240, 255, 1)';
const BLUE_BORDER = 'rgba(100, 180, 255, 1)';
const PINK_BG     = 'rgba(255, 233, 251, 1)';
const PINK_BORDER = 'rgba(210, 100, 200, 1)';

// ─── Hexagon component (SVG flat-top) ────────────────────────────────────────
// Flat-top hexagon: 6 points calculated for a W×H bounding box
// W = HEX_W, H = HEX_H  (width > height for flat-top)
const HEX_W = 88;
const HEX_H = 80;

function hexPoints(w, h) {
  const cx = w / 2, cy = h / 2;
  const rx = w / 2, ry = h / 2;
  // Flat-top: angles 0°,60°,120°,180°,240°,300° → but we want pointy-top like screenshot
  // Screenshot shows pointy-top hexagons (peak at top and bottom)
  // Pointy-top: angles 90°,30°,-30°,-90°,-150°,150° (or -90°,-30°,30°,90°,150°,-150°)
  const angles = [-90, -30, 30, 90, 150, 210];
  return angles
    .map(a => {
      const rad = (a * Math.PI) / 180;
      return `${(cx + rx * Math.cos(rad)).toFixed(2)},${(cy + ry * Math.sin(rad)).toFixed(2)}`;
    })
    .join(' ');
}

function Hexagon({ relation, isSelected, onPress }) {
  const isBlue  = relation.color === 'blue';
  const bgColor = isBlue ? BLUE_BG : PINK_BG;
  const bdColor = isBlue ? BLUE_BORDER : PINK_BORDER;
  const dimBd   = 'rgba(200,200,200,0.6)';
  const pts     = hexPoints(HEX_W, HEX_H);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={{ alignItems: 'center', justifyContent: 'center', width: HEX_W, height: HEX_H }}>
      {/* SVG hex shape */}
      <Svg width={HEX_W} height={HEX_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Polygon
          points={pts}
          fill={bgColor}
          stroke={isSelected ? bdColor : dimBd}
          strokeWidth={isSelected ? 2.5 : 1.2}
        />
      </Svg>
      {/* Content on top */}
      <Text style={{ fontSize: 22, color: isSelected ? bdColor : '#BBBBBB',
        fontWeight: '300', lineHeight: 24, marginBottom: 0 }}>+</Text>
      <Text style={{ fontSize: 12, color: isSelected ? '#1A1A1A' : '#888888',
        fontWeight: isSelected ? '600' : '400', textAlign: 'center', lineHeight: 16 }}>
        {relation.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Toggle radio button ──────────────────────────────────────────────────────
function RadioToggle({ label, value, onToggle, showInfo }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.radioRow} activeOpacity={0.7}>
      <View style={[styles.radioCircle, value && styles.radioCircleOn]} />
      <Text style={styles.radioLabel}>{label}</Text>
      {showInfo && (
        <View style={styles.infoCircle}>
          <Text style={styles.infoTxt}>i</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddHiveScreen({
  person = {
    name: 'Sandhya Kohli',
    gender: 'Female',
    dob: 'March 12, 1998',
    initial: 'S',
  },
navigation, onBack = () => navigation.goBack()
}) {
  const [selectedRelation, setSelectedRelation] = useState('brother');
  const [mobile, setMobile]       = useState('');
  const [kidsAccount, setKids]    = useState(false);
  const [notAlive, setNotAlive]   = useState(false);
  const [name, setName]           = useState('');
  const [occupation, setOccupation] = useState('');
  const [dob, setDob]             = useState('');
  const [deathAnniv, setDeathAnniv] = useState('');
  const [photoUri, setPhotoUri]   = useState(null);

  const row0 = RELATIONS.filter(r => r.row === 0);
  const row1 = RELATIONS.filter(r => r.row === 1);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Hive</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile card */}
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitial}>{person.initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{person.name}</Text>
            <Text style={styles.profileMeta}>Gender: {person.gender}</Text>
            <Text style={styles.profileMeta}>DOB: {person.dob}</Text>
          </View>
        </View>

        {/* Gender tab line */}
        <View style={styles.tabLine}>
          <View style={styles.tabLinePink} />
          <View style={styles.tabLineBlue} />
        </View>

        {/* Relation hexagons — row 0 */}
        <View style={styles.hexGrid}>
          {/* Row 0: Father Mother Brother Sister */}
          <View style={styles.hexRow}>
            {row0.map(rel => (
              <Hexagon
                key={rel.id}
                relation={rel}
                isSelected={selectedRelation === rel.id}
                onPress={() => setSelectedRelation(rel.id)}
              />
            ))}
          </View>

          {/* Row 1: Husband Son Daughter — offset right by half hex for honeycomb */}
          <View style={[styles.hexRow, { marginTop: -14, paddingLeft: HEX_W / 2 + 4 }]}>
            {row1.map(rel => (
              <Hexagon
                key={rel.id}
                relation={rel}
                isSelected={selectedRelation === rel.id}
                onPress={() => setSelectedRelation(rel.id)}
              />
            ))}
          </View>
        </View>

        {/* Form fields */}
        <View style={styles.form}>

          {/* Mobile number */}
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.fieldInput}
              placeholder="Add Mobile Number"
              placeholderTextColor="#AAAAAA"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
            
              <Image
                source={require('../../../assets/images/hive/contacts.png')}
                style={{ width: 24, height: 24, tintColor: '#888888' }}
              />
          
          </View>
          <View style={styles.fieldDivider} />

          {/* Toggles row */}
          <View style={styles.togglesRow}>
            <RadioToggle
              label="Kids Account"
              value={kidsAccount}
              onToggle={() => setKids(v => !v)}
            />
            <RadioToggle
              label="Person is not Alive"
              value={notAlive}
              onToggle={() => setNotAlive(v => !v)}
              showInfo
            />
          </View>

          {/* Name + Photo */}
          <View style={styles.namePhotoRow}>
            <View style={styles.nameCol}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Name"
                placeholderTextColor="#AAAAAA"
                value={name}
                onChangeText={setName}
              />
              <View style={styles.fieldDivider} />

              <View style={styles.occupationRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  placeholder="Occupation"
                  placeholderTextColor="#AAAAAA"
                  value={occupation}
                  onChangeText={setOccupation}
                />
                <Text style={styles.chevron}>⌄</Text>
              </View>
              <View style={styles.fieldDivider} />
            </View>

            {/* Photo upload */}
            <TouchableOpacity style={styles.photoBox} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <Image
                  source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                  style={styles.photoPreview}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Date of Birth + Death Anniversary */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Date of Birth"
                placeholderTextColor="#AAAAAA"
                value={dob}
                onChangeText={setDob}
              />
              <TouchableOpacity style={styles.calIcon}>
               <Image
                  source={require('../../../assets/images/login/Calendar.png')}
                  style={{ width: 23, height: 23, tintColor: '#888888' }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.dateDividerV} />
            <View style={styles.dateField}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Death Anniversary"
                placeholderTextColor="#AAAAAA"
                value={deathAnniv}
                onChangeText={setDeathAnniv}
              />
              <TouchableOpacity style={styles.calIcon}>
                <Image
                  source={require('../../../assets/images/login/Calendar.png')}
                  style={{ width: 23, height: 23, tintColor: '#888888' }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.fieldDivider} />

        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <Text style={styles.ctaTxt}>Add Hiver & Send Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const HEX_SIZE = (SW - 48 - 3 * 8) / 4; // 4 per row max, with gaps

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14,
    // borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', letterSpacing: 0.2,fontFamily:'SofiaSansCondensed-Bold' },

  scroll: { flex: 1 },

  // Profile
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, gap: 16,
  },
  avatarBox: {
    width: 90, height: 90, borderRadius: 10,
    backgroundColor: 'rgba(255, 193, 244, 0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 44, color: '#1A1A1A',fontFamily:'SofiaSansCondensed-Bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, color: '#1A1A1A', marginBottom: 4 ,fontFamily:'SofiaSansCondensed-Bold' },
  profileMeta: { fontSize: 16, color: '#666666', lineHeight: 20,fontFamily:'SofiaSansCondensed-Regular' },

  // Tab line
  tabLine: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24 },
  tabLinePink: { flex: 1, height: 2, backgroundColor: 'rgba(255, 150, 220, 1)', borderRadius: 1 },
  tabLineBlue: { flex: 1, height: 2, backgroundColor: 'rgba(177, 225, 255, 1)', borderRadius: 1 },

  // Hex grid
  hexGrid: { paddingHorizontal: 14, marginBottom: 24 },
  hexRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 8, marginBottom: 4, paddingLeft: 14 },

  hexTouchable: { alignItems: 'center' },
  hexOuter: {
    width: HEX_W,
    height: HEX_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexPlus: { fontSize: 20, fontWeight: '300', lineHeight: 24, marginBottom: 2 },
  hexLabel: { fontSize: 12, lineHeight: 16, textAlign: 'center',fontFamily:'SofiaSansCondensed-Regular' },

  // Form
  form: { paddingHorizontal: 20 },

  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
  },
  fieldInput: {
    flex: 1, fontSize: 16, color: '#1A1A1A', fontFamily:'SofiaSansCondensed-Regular' ,
    paddingVertical: 0,
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DDDDDD',
    marginBottom: 2,
  },
  contactsIcon: {
    width: 32, height: 32, borderWidth: 1, borderColor: '#CCCCCC',
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  contactsIconTxt: { fontSize: 16 },

  // Toggles
  togglesRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 24,
  },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#F5A623', opacity: 0.35,
  },
  radioCircleOn: { opacity: 1 },
  radioLabel: { fontSize: 16, color: '#1A1A1A', fontFamily:'SofiaSansCondensed-Regular' },
  infoCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: '#AAAAAA',
    alignItems: 'center', justifyContent: 'center', marginLeft: 2,
  },
  infoTxt: { fontSize: 11, color: '#888', fontWeight: '600' },

  // Name + Photo row
  namePhotoRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  nameCol: { flex: 1 },
  occupationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  chevron: { fontSize: 20, color: '#888', paddingLeft: 8 },

  photoBox: {
    width: 100, height: 110, borderRadius: 12,
    overflow: 'hidden', marginTop: 14,
    backgroundColor: '#F0F0F0',
  },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Date row
  dateRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 0,
  },
  dateField: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
  },
  dateDividerV: {
    width: StyleSheet.hairlineWidth, height: 24,
    backgroundColor: '#DDDDDD', marginHorizontal: 12,
  },
  calIcon: { padding: 2 },
  calIconTxt: { fontSize: 18 },

  // CTA
  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  ctaBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#F5A623',
    shadowOpacity: 0.35, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
});