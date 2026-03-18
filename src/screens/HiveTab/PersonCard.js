import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  male:     '#D6EFF8',
  maleBd:   '#5BB8D4',
  female:   '#F8D6EA',
  femaleBd: '#E879A0',
  deceased: '#E4E4E4',
  decBd:    '#AAAAAA',
  text:     '#1A1A1A',
  sub:      '#555',
  white:    '#FFFFFF',
  teal:     '#5BB8D4',
  decTag:   '#B0B0B0',
  gray:     '#CCCCCC',
};

function cardColors(person) {
  if (person.deathDate) return { bg: C.deceased, bd: C.decBd };
  if (person.gender === 'male') return { bg: C.male, bd: C.maleBd };
  return { bg: C.female, bd: C.femaleBd };
}

function fmtFollowers(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

export default function PersonCard({ person, isCenter, onPress, cardW, cardH }) {
  const [following, setFollowing] = useState(false);
  const { bg, bd } = cardColors(person);
  const fc = fmtFollowers(person.followers);

  return (
    <TouchableOpacity
      activeOpacity={isCenter ? 1 : 0.78}
      onPress={!isCenter ? onPress : undefined}
      style={{ width: cardW, height: cardH }}
    >
      <View style={[styles.card, { backgroundColor: bg, borderColor: bd, width: cardW, height: cardH },
        isCenter && styles.cardCenter]}>

        {/* ── TOP: photo + name col ── */}
        <View style={styles.topRow}>
          {/* Photo */}
          <View style={styles.photoWrap}>
            <Image source={{ uri: person.photo }} style={styles.photo} />
            <View style={styles.followerBubble}>
              <Text style={styles.followerTxt}>{fc}</Text>
            </View>
          </View>

          {/* Name + follow */}
          <View style={styles.nameCol}>
            <Text style={styles.nameTxt} numberOfLines={2}>{person.name}</Text>

            {person.deathDate ? (
              <View style={styles.decTag}>
                <Text style={styles.decTagTxt}>Deceased</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setFollowing(v => !v)}
                style={[
                  styles.followBtn,
                  { borderColor: C.teal },
                  following && { backgroundColor: C.teal },
                ]}
              >
                <Text style={[styles.followTxt, { color: following ? C.white : C.teal }]}>
                  {following ? 'Following' : `+ Follow | ${fc}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── DIVIDER ── */}
        <View style={[styles.divider, { backgroundColor: bd }]} />

        {/* ── BOTTOM: info ── */}
        <View style={styles.bottomRow}>
          <View style={[styles.accentBar, { backgroundColor: bd }]} />
          <View style={styles.infoCol}>
            <Text style={styles.profTxt} numberOfLines={1}>{person.profession}</Text>
            <View style={styles.locRow}>
              <Text style={styles.locTxt} numberOfLines={1}>{person.city}</Text>
              <View style={styles.flagWrap}>
                <Text style={styles.flagEmoji}>{person.flag}</Text>
                <Text style={styles.flagCode}>{person.flagCode}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>🎂</Text>
              <Text style={styles.dateTxt} numberOfLines={1}>{person.birthDate}</Text>
            </View>
            {person.deathDate && (
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>✝</Text>
                <Text style={styles.dateTxt} numberOfLines={1}>{person.deathDate}</Text>
              </View>
            )}
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.11,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  cardCenter: {
    elevation: 12,
    shadowOpacity: 0.2,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 5 },
  },

  // Top row: photo + name side by side
  topRow: { flexDirection: 'row', height: 92 },
  photoWrap: { width: 82, height: '100%', position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  followerBubble: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 7, paddingHorizontal: 4, paddingVertical: 1,
  },
  followerTxt: { fontSize: 9, fontWeight: '800', color: '#1A1A1A' },

  nameCol: { flex: 1, paddingLeft: 7, paddingTop: 9, paddingRight: 5 },
  nameTxt: { fontSize: 12.5, fontWeight: '800', color: '#1A1A1A', lineHeight: 15.5 },

  decTag: {
    marginTop: 6, backgroundColor: '#B0B0B0',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start',
  },
  decTagTxt: { color: '#fff', fontSize: 9.5, fontWeight: '700' },

  followBtn: {
    marginTop: 6, borderWidth: 1.5, borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start',
  },
  followTxt: { fontSize: 9, fontWeight: '700' },

  // Divider
  divider: { height: 1, opacity: 0.3 },

  // Bottom info
  bottomRow: { flex: 1, flexDirection: 'row' },
  accentBar: { width: 3, alignSelf: 'stretch', opacity: 0.65 },
  infoCol: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, gap: 3 },

  profTxt: { fontSize: 10, color: '#555', fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locTxt: { fontSize: 9.5, color: '#666', flex: 1 },
  flagWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  flagEmoji: { fontSize: 11 },
  flagCode: { fontSize: 9.5, fontWeight: '700', color: '#666' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateIcon: { fontSize: 9 },
  dateTxt: { fontSize: 9, color: '#777', flex: 1 },
});
