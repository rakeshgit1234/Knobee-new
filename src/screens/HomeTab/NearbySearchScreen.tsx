/**
 * NearbySearchScreen.tsx
 *
 * Two internal views:
 *  1. Filter form  — by Name, Occupation, Company, Education, Institution, Location
 *                    Each multi-value field has a + button to add tags, chips with × to remove
 *                    Orange "Search" CTA → navigates to results
 *
 *  2. Results list — "Nearby Search" header, person card with photo/name/profession/city + Follow
 *
 * Props: { navigation? }
 */

import React, { useState } from 'react';
import {
  FlatList, Image, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type NearbyUser = {
  id: string;
  name: string;
  profession: string;
  city: string;
  avatar: string;
  isFollowing: boolean;
};

// ─── Mock nearby results ──────────────────────────────────────────────────────
const NEARBY_USERS: NearbyUser[] = [
  { id: '1', name: 'Shubham Singh',  profession: 'Doctor',          city: 'Delhi',    avatar: 'https://i.pravatar.cc/150?img=11', isFollowing: false },
  { id: '2', name: 'Rakesh Khanna',  profession: 'Surgeon',         city: 'Gurugram', avatar: 'https://i.pravatar.cc/150?img=68', isFollowing: false },
  { id: '3', name: 'Priya Sharma',   profession: 'Photographer',    city: 'Delhi',    avatar: 'https://i.pravatar.cc/150?img=47', isFollowing: false },
  { id: '4', name: 'Amit Verma',     profession: 'Software Engineer',city: 'Gurugram',avatar: 'https://i.pravatar.cc/150?img=12', isFollowing: false },
  { id: '5', name: 'Saumiya Patel',  profession: 'Doctor',          city: 'Delhi',    avatar: 'https://i.pravatar.cc/150?img=44', isFollowing: false },
];

const ORANGE = '#F5A623';

// ─── Tag chip ─────────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipTxt}>{label}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={6} style={s.chipX}>
        <Text style={s.chipXTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Filter field row ─────────────────────────────────────────────────────────
function FilterField({
  label,
  value,
  onChange,
  onAdd,
  chips,
  onRemoveChip,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  chips: string[];
  onRemoveChip: (i: number) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TouchableOpacity onPress={onAdd} style={s.addBtn} hitSlop={8}>
          <Text style={s.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={s.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor="#CCC"
        onSubmitEditing={onAdd}
        returnKeyType="done"
      />
      <View style={s.fieldLine} />
      {chips.length > 0 && (
        <View style={s.chipsRow}>
          {chips.map((chip, i) => (
            <Chip key={i} label={chip} onRemove={() => onRemoveChip(i)} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={10} style={s.headerBack}>
        <Image
          source={require('../../../assets/images/chat/back.png')}
          style={s.headerBackIcon}
        />
      </TouchableOpacity>
      <Text style={s.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NearbySearchScreen({ navigation }: { navigation?: any }) {
  const [screen, setScreen] = useState<'filter' | 'results'>('filter');

  // Filter state
  const [nameVal,        setNameVal]        = useState('');
  const [occupationVal,  setOccupationVal]  = useState('');
  const [companyVal,     setCompanyVal]     = useState('');
  const [educationVal,   setEducationVal]   = useState('');
  const [institutionVal, setInstitutionVal] = useState('');
  const [locationVal,    setLocationVal]    = useState('');

  const [occupations,  setOccupations]  = useState<string[]>(['Doctor', 'Surgeon']);
  const [companies,    setCompanies]    = useState<string[]>([]);
  const [educations,   setEducations]   = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [locations,    setLocations]    = useState<string[]>(['Delhi', 'Gurugram']);

  // Results state
  const [users, setUsers] = useState<NearbyUser[]>(NEARBY_USERS);

  const addChip = (val: string, setter: React.Dispatch<React.SetStateAction<string[]>>, clearFn: () => void) => {
    const trimmed = val.trim();
    if (trimmed) { setter(prev => [...prev, trimmed]); clearFn(); }
  };
  const removeChip = (arr: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, i: number) => {
    setter(arr.filter((_, idx) => idx !== i));
  };

  const toggleFollow = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isFollowing: !u.isFollowing } : u));
  };

  // ── FILTER SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'filter') {
    return (
      <View style={s.screen}>
        <Header onBack={() => navigation?.goBack()} title="Nearby Search" />

        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        >
          {/* by Name — full width */}
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>by Name</Text>
            <TextInput
              style={s.fieldInput}
              value={nameVal}
              onChangeText={setNameVal}
              placeholderTextColor="#CCC"
            />
            <View style={s.fieldLine} />
          </View>

          {/* by Occupation + by Company — 2 columns */}
          <View style={s.twoCol}>
            <View style={s.halfWrap}>
              <FilterField
                label="by Occupation"
                value={occupationVal}
                onChange={setOccupationVal}
                onAdd={() => addChip(occupationVal, setOccupations, () => setOccupationVal(''))}
                chips={occupations}
                onRemoveChip={i => removeChip(occupations, setOccupations, i)}
              />
            </View>
            <View style={s.halfWrap}>
              <FilterField
                label="by Company"
                value={companyVal}
                onChange={setCompanyVal}
                onAdd={() => addChip(companyVal, setCompanies, () => setCompanyVal(''))}
                chips={companies}
                onRemoveChip={i => removeChip(companies, setCompanies, i)}
              />
            </View>
          </View>

          {/* by Education + by Institution — 2 columns */}
          <View style={s.twoCol}>
            <View style={s.halfWrap}>
              <FilterField
                label="by Education"
                value={educationVal}
                onChange={setEducationVal}
                onAdd={() => addChip(educationVal, setEducations, () => setEducationVal(''))}
                chips={educations}
                onRemoveChip={i => removeChip(educations, setEducations, i)}
              />
            </View>
            <View style={s.halfWrap}>
              <FilterField
                label="by Institution"
                value={institutionVal}
                onChange={setInstitutionVal}
                onAdd={() => addChip(institutionVal, setInstitutions, () => setInstitutionVal(''))}
                chips={institutions}
                onRemoveChip={i => removeChip(institutions, setInstitutions, i)}
              />
            </View>
          </View>

          {/* by Location — full width */}
          <FilterField
            label="by Location"
            value={locationVal}
            onChange={setLocationVal}
            onAdd={() => addChip(locationVal, setLocations, () => setLocationVal(''))}
            chips={locations}
            onRemoveChip={i => removeChip(locations, setLocations, i)}
          />
        </ScrollView>

        {/* Search CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => setScreen('results')}
            activeOpacity={0.85}
          >
            <Text style={s.ctaTxt}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── RESULTS SCREEN ─────────────────────────────────────────────────────────
  return (
    <View style={s.screen}>
      <Header onBack={() => setScreen('filter')} title="Nearby Search" />

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={s.resultRow}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={() => navigation?.navigate('Profile', { userId: item.id })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.avatar }} style={s.resultAvatar} />
            </TouchableOpacity>

            {/* Info */}
            <TouchableOpacity
              style={s.resultInfo}
              onPress={() => navigation?.navigate('Profile', { userId: item.id })}
              activeOpacity={0.7}
            >
              <Text style={s.resultName}>{item.name}</Text>
              <Text style={s.resultSub}>{item.profession}</Text>
              <Text style={s.resultCity}>{item.city}</Text>
            </TouchableOpacity>

            {/* Follow button */}
            <TouchableOpacity
              style={[s.followBtn, item.isFollowing && s.followBtnActive]}
              onPress={() => toggleFollow(item.id)}
              activeOpacity={0.8}
            >
              <Text style={[s.followTxt, item.isFollowing && s.followTxtActive]}>
                {item.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyTxt}>No nearby results found</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  headerBack: { width: 40, alignItems: 'flex-start' },
  headerBackIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#1a1a1a' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-SemiBold' },

  scroll: { flex: 1 },

  // ── Filter form ───────────────────────────────────────────────────────────
  twoCol: { flexDirection: 'row', gap: 20, marginBottom: 0 },
  halfWrap: { flex: 1 },

  fieldWrap: { marginBottom: 20 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -10 },
  fieldLabel: { fontSize: 15, color: '#AAAAAA', fontFamily: 'SofiaSansCondensed-Regular' },
  addBtn: { padding: 2 },
  addBtnTxt: { fontSize: 22, color: ORANGE, fontWeight: '300', lineHeight: 26 },
  fieldInput: { fontSize: 15, color: '#1a1a1a', paddingVertical: 0, height: 28 },
  fieldLine: { height: 1.5, backgroundColor: ORANGE, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFEFEF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, gap: 6,
  },
  chipTxt: { fontSize: 13, color: '#333', fontFamily: 'SofiaSansCondensed-Regular' },
  chipX: { padding: 1 },
  chipXTxt: { fontSize: 16, color: '#888', lineHeight: 18, fontWeight: '400' },

  // Search CTA
  ctaWrap: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  ctaBtn: {
    backgroundColor: ORANGE, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3, fontFamily: 'SofiaSansCondensed-Bold' },

  // ── Results ───────────────────────────────────────────────────────────────
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, gap: 14,
  },
  resultAvatar: { width: 68, height: 68, borderRadius: 14, resizeMode: 'cover', flexShrink: 0 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Bold' },
  resultSub: { fontSize: 14, color: '#888', marginTop: 2, fontFamily: 'SofiaSansCondensed-Regular' },
  resultCity: { fontSize: 14, color: '#888', marginTop: 1, fontFamily: 'SofiaSansCondensed-Regular' },

  followBtn: {
    paddingHorizontal: 20, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#5badee',
    backgroundColor: 'transparent', flexShrink: 0,
  },
  followBtnActive: { backgroundColor: '#5badee', borderColor: '#5badee' },
  followTxt: { fontSize: 14, color: '#5badee', fontFamily: 'SofiaSansCondensed-SemiBold' },
  followTxtActive: { color: '#fff' },

  emptyWrap: { paddingTop: 80, alignItems: 'center' },
  emptyTxt: { fontSize: 15, color: '#bbb', fontFamily: 'SofiaSansCondensed-Regular' },
});