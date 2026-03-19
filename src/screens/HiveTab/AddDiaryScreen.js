/**
 * AddDiaryScreen.js
 * Form screen to add a new diary/heritage entry.
 * Matches screenshot 2:
 *   - Header: ← "Add Diaries"  [Share]
 *   - User avatar + name + subtitle
 *   - Media thumbnails row (existing + Add Media button)
 *   - Title / Add Story / Enter Timeline / Tag Member inputs
 *   - Tagged member pills (photo + name + ✕)
 *
 * Props: { person, initialTagged, onBack, onShare }
 */

import React, { useState } from 'react';
import {
  Dimensions, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

const ALL_PEOPLE = [
  { id: 'shubham', name: 'Shubham Seth', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: 'maya',    name: 'Maya Seth',    photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'sandhya', name: 'Sandhya Kohli',photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'arjun',   name: 'Arjun Kohli',  photo: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { id: 'raghav',  name: 'Raghav Kohli', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'shruti',  name: 'Shruti Kohli', photo: 'https://randomuser.me/api/portraits/women/29.jpg' },
  { id: 'dev',     name: 'Dev Kohli',    photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: 'vikram',  name: 'Vikram Seth',  photo: 'https://randomuser.me/api/portraits/men/60.jpg' },
  { id: 'kamla',   name: 'Kamla Seth',   photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
  { id: 'rohan',   name: 'Rohan Seth',   photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { id: 'priya',   name: 'Priya Seth',   photo: 'https://randomuser.me/api/portraits/women/35.jpg' },
];

function TagPickerSheet({ tagged, onAdd, onClose }) {
  const untagged = ALL_PEOPLE.filter(p => !tagged.find(t => t.id === p.id));
  return (
    <View style={styles.pickerOverlay}>
      <TouchableOpacity style={styles.pickerDismiss} onPress={onClose} activeOpacity={1} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <Text style={styles.pickerTitle}>Tag a Member</Text>
        <ScrollView style={{ maxHeight: 320 }}>
          {untagged.map(person => (
            <TouchableOpacity key={person.id} style={styles.pickerRow}
              onPress={() => { onAdd(person); onClose(); }} activeOpacity={0.7}>
              <Image source={{ uri: person.photo }} style={styles.pickerAvatar} />
              <Text style={styles.pickerName}>{person.name}</Text>
            </TouchableOpacity>
          ))}
          {untagged.length === 0 && (
            <Text style={styles.pickerEmpty}>All members tagged!</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default function AddDiaryScreen({
  person = ALL_PEOPLE[1],
  initialTagged = [ALL_PEOPLE[0]],
  onBack,
  onShare,
}) {
  const [title, setTitle]       = useState('');
  const [story, setStory]       = useState('');
  const [timeline, setTimeline] = useState('');
  const [tagged, setTagged]     = useState(initialTagged);
  const [showPicker, setShowPicker] = useState(false);
  const [media] = useState([
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
  ]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Image source={require('../../../assets/images/chat/back.png')} style={{height: 24, width: 24}} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Diaries</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
          <Text style={styles.shareBtnTxt}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>

        {/* Author row */}
        <View style={styles.authorRow}>
          <Image source={{ uri: person.photo }} style={styles.authorPhoto} />
          <View style={styles.authorText}>
            <Text style={styles.authorName}>{person.name}</Text>
            <Text style={styles.authorSub}>You are sharing your family diaries</Text>
          </View>
        </View>

        {/* Media row */}
        <View style={styles.mediaRow}>
          {media.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.mediaThumb} />
          ))}
          <TouchableOpacity style={styles.addMediaBtn}>
            <Text style={styles.addMediaPlus}>+</Text>
            <Text style={styles.addMediaLabel}>Add Media</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <TextInput style={styles.fieldInput} placeholder="Title"
              placeholderTextColor="#BBBBBB" value={title} onChangeText={setTitle} />
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldWrap}>
            <TextInput style={[styles.fieldInput]}
              placeholder="Add Story" placeholderTextColor="#BBBBBB"
              value={story} onChangeText={setStory} multiline />
          </View>
          <View style={styles.divider} />

          <View style={styles.fieldWrap}>
            <TextInput style={styles.fieldInput} placeholder="Enter Timeline"
              placeholderTextColor="#BBBBBB" value={timeline} onChangeText={setTimeline}
              keyboardType="numeric" />
          </View>
          <View style={styles.divider} />

          <View style={[styles.fieldWrap, styles.tagRow]}>
            <Text style={styles.tagLabel}>Tag Member</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.tagPlusBtn}>
              <Text style={styles.tagPlusTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {tagged.length > 0 && (
            <View style={styles.taggedWrap}>
              {tagged.map(p => (
                <View key={p.id} style={styles.tagPill}>
                  <Image source={{ uri: p.photo }} style={styles.tagPillPhoto} />
                  <Text style={styles.tagPillName}>{p.name}</Text>
                  <TouchableOpacity onPress={() => setTagged(prev => prev.filter(x => x.id !== p.id))}>
                    <Text style={styles.tagPillX}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {showPicker && (
        <TagPickerSheet tagged={tagged} onAdd={p => setTagged(prev => [...prev, p])}
          onClose={() => setShowPicker(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14,
    backgroundColor: '#FFFFFF',

  },
  backBtn: { padding: 4, width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  shareBtn: {
    borderWidth: 1.5, borderColor: '#C8C8C8',
    borderRadius: 10, paddingHorizontal: 18, paddingVertical: 5,
  },
  shareBtnTxt: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },

  scroll: { flex: 1 },

  authorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 12,
  },
  authorPhoto: { width: 68, height: 68, borderRadius: 10, resizeMode: 'cover' },
  authorText: { flex: 1 },
  authorName: { fontSize: 20, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  authorSub: { fontSize: 14, color: '#888', marginTop: 2,fontFamily: 'SofiaSansCondensed-Regular' },

  mediaRow: {
    flexDirection: 'row', paddingHorizontal: 18,
    gap: 12, marginBottom: 8,
  },
  mediaThumb: { width: 130, height: 130, borderRadius: 12, resizeMode: 'cover' },
  addMediaBtn: {
    width: 130, height: 130,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#D8D8D8',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addMediaPlus: { fontSize: 30, color: '#CCCCCC', fontWeight: '300' },
  addMediaLabel: { fontSize: 13, color: '#AAAAAA', fontFamily: 'SofiaSansCondensed-Regular' },

  form: { paddingHorizontal: 18, marginTop: 8 },
  fieldWrap: { paddingVertical: 13, height: 54 },
  fieldInput: {
    fontSize: 16, color: '#1A1A1A',
    fontFamily: 'SofiaSansCondensed-Regular',
    paddingVertical: 0,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0' },
  tagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagLabel: { flex: 1, fontSize: 16, color: '#BBBBBB', fontFamily: 'SofiaSansCondensed-Regular' },

  tagPlusTxt: { fontSize: 26, color: '#888', fontWeight: '300' },

  taggedWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 14 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F5A623',
    borderRadius: 50, paddingLeft: 4, paddingRight: 14, paddingVertical: 0, gap: 8,
  },
  tagPillPhoto: { width: 33, height: 33, borderRadius: 19, resizeMode: 'cover' },
  tagPillName: { fontSize: 15, color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-Medium' },
  tagPillX: { fontSize: 14, color: '#F5A623', fontWeight: '600', marginLeft: 2 },

  pickerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', zIndex: 500,
  },
  pickerDismiss: { flex: 1 },
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingBottom: 32,
  },
  pickerHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#D8D8D8', alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  pickerTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0',
  },
  pickerAvatar: { width: 44, height: 44, borderRadius: 22 },
  pickerName: { fontSize: 16, color: '#1A1A1A' },
  pickerEmpty: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});
