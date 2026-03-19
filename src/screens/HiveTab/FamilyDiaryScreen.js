/**
 * FamilyDiaryScreen.js
 * Heritage/diary feed page — opened when Path button is tapped on a family card.
 * Props: { family: 'seth' | 'kohli' | 'vikram' | ... , onBack, onAddDiary }
 */

import React, { useRef, useState } from 'react';
import {
  Dimensions, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── Per-family data ──────────────────────────────────────────────────────────
const FAMILY_DATA = {
  seth: {
    name: 'Seth Family',
    crest: '🏛️',
    about: 'The Seth family traces its roots to the royal courts of Allahabad. A lineage of judges, doctors and scholars spanning over 150 years of distinguished service to the nation.',
    likes: '144K',
    views: '1Cr',
    admins: [
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/75.jpg',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/60.jpg',
      'https://randomuser.me/api/portraits/women/60.jpg',
    ],
    entries: [
      {
        id: 1, year: '1877', title: 'Great Great Grand Father',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
          'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        ],
        story: 'simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley',
        likes: 112, sharedBy: 'Maya Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        sharedDate: 'Jan 12, 2026',
      },
      {
        id: 2, year: '1875', title: 'Great Great Grand Father',
        images: ['https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400'],
        story: 'simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley',
        likes: 112, sharedBy: 'Shubham Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
        sharedDate: 'Jan 12, 2026',
      },
      {
        id: 3, year: null, title: 'Great Great Grand Father',
        images: [],
        story: 'simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley',
        likes: 112, sharedBy: 'Shubham Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
        sharedDate: 'Jan 12, 2026',
      },
      {
        id: 4, year: '1875', title: 'Great Great Grand Father',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200',
          'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=200',
        ],
        story: null,
        likes: 112, sharedBy: 'Shubham Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
        sharedDate: 'Jan 12, 2026',
      },
    ],
    footer: 'simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley',
  },

  kohli: {
    name: 'Kohli Family',
    crest: '⚔️',
    about: 'The Kohli family hails from Delhi with a proud military and engineering heritage. Engineers, doctors and artists who have shaped modern India across three generations.',
    likes: '89K',
    views: '74L',
    admins: [
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/46.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
    ],
    entries: [
      {
        id: 1, year: '1920', title: 'The Delhi Patriarch',
        images: [
          'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200',
          'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=200',
        ],
        story: 'The Kohli patriarch settled in Old Delhi after serving as a commander in the princely state army. His discipline and resolve became the founding spirit of the family.',
        likes: 98, sharedBy: 'Sandhya Kohli',
        sharedPhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
        sharedDate: 'Feb 3, 2026',
      },
      {
        id: 2, year: '1955', title: 'First Engineer of the Family',
        images: ['https://images.unsplash.com/photo-1581094651181-35942459ef62?w=400'],
        story: 'Arjun\'s grandfather became the first engineer in the Kohli lineage, graduating from IIT Delhi in 1955 with distinction. His notebooks are still preserved.',
        likes: 201, sharedBy: 'Arjun Kohli',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/46.jpg',
        sharedDate: 'Mar 1, 2026',
      },
      {
        id: 3, year: '1980', title: 'Family Reunion — Connaught Place',
        images: [
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200',
          'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=200',
        ],
        story: 'Three generations gathered at Connaught Place for Diwali. The youngest — a three-year-old Raghav — refused to stop dancing all evening.',
        likes: 340, sharedBy: 'Raghav Kohli',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        sharedDate: 'Feb 14, 2026',
      },
    ],
    footer: 'The Kohli family legacy lives on through each member who carries forward the values of excellence, courage and compassion.',
  },

  maya: {
    name: 'Maya\'s Memories',
    crest: '🌸',
    about: 'A personal collection of Maya Seth\'s most treasured family moments, travels and milestones across 50 years of a life well-lived.',
    likes: '22K',
    views: '8L',
    admins: [
      'https://randomuser.me/api/portraits/women/44.jpg',
    ],
    entries: [
      {
        id: 1, year: '1990', title: 'Wedding Day in Noida',
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=400'],
        story: 'The most beautiful day of my life. Shubham waited at the mandap wearing the most nervous smile I had ever seen.',
        likes: 512, sharedBy: 'Maya Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        sharedDate: 'Jan 1, 2026',
      },
      {
        id: 2, year: '1998', title: 'Sandhya\'s First Steps',
        images: [
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200',
          'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200',
        ],
        story: 'She walked at just 9 months. The whole family gathered in the drawing room and Sandhya walked straight toward the camera.',
        likes: 287, sharedBy: 'Maya Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        sharedDate: 'Jan 18, 2026',
      },
      {
        id: 3, year: '2005', title: 'Trip to Shimla',
        images: [
          'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200',
        ],
        story: 'Our first family holiday after Shubham\'s promotion. The kids built a snowman that melted before we could photograph it properly.',
        likes: 189, sharedBy: 'Maya Seth',
        sharedPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        sharedDate: 'Feb 2, 2026',
      },
    ],
    footer: 'Every photo is a door back to the warmest moments of our lives.',
  },

  default: {
    name: 'Family Diary',
    crest: '📖',
    about: 'A cherished collection of family memories, stories and heritage moments preserved for future generations.',
    likes: '10K',
    views: '50L',
    admins: [
      'https://randomuser.me/api/portraits/men/75.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
    ],
    entries: [
      {
        id: 1, year: '1900', title: 'The Beginning',
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
        story: 'Every great family starts with a single story. This is ours.',
        likes: 50, sharedBy: 'Family Admin',
        sharedPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
        sharedDate: 'Jan 1, 2026',
      },
    ],
    footer: 'Our story continues with every new generation.',
  },
};

// ─── Diary Entry Card ────────────────────────────────────────────────────────
function DiaryEntry({ entry, isLast }) {
  const [liked, setLiked] = useState(false);
  const hasMultipleImages = entry.images.length > 1;
  const hasSingleWideImage = entry.images.length === 1;

  return (
    <View style={[styles.entryWrap, isLast && { borderBottomWidth: 0 }]}>
      {/* Title */}
      <Text style={styles.entryTitle}>{entry.title}</Text>

      {/* Images */}
      {hasSingleWideImage && (
        <Image source={{ uri: entry.images[0] }} style={styles.entryImageWide} />
      )}
      {hasMultipleImages && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }} contentContainerStyle={{ gap: 8 }}>
          {entry.images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.entryImageThumb} />
          ))}
        </ScrollView>
      )}

      {/* Story */}
      {!!entry.story && (
        <Text style={styles.entryStory}>{entry.story}</Text>
      )}

      {/* Footer: likes + share */}
      <View style={styles.entryFooter}>
        <TouchableOpacity onPress={() => setLiked(v => !v)} style={styles.likeWrap}>
          {liked ? (
            <Image source={require('../../../assets/images/home/likefill.png')} style={{height: 20, width: 20}} />
          ) : (
            <Image source={require('../../../assets/images/home/like.png')} style={{height: 20, width: 20}} />
          )}
          <Text style={styles.likeCount}>{liked ? entry.likes + 1 : entry.likes}</Text>
        </TouchableOpacity>
        <View style={styles.shareWrap}>
          <View style={styles.shareText}>
            <Text style={styles.shareBy}>Share by {entry.sharedBy}</Text>
            <Text style={styles.shareDate}>{entry.sharedDate}</Text>
          </View>
          <Image source={{ uri: entry.sharedPhoto }} style={styles.sharePhoto} />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function FamilyDiaryScreen({ family = 'seth', onBack, onAddDiary }) {
  const data = FAMILY_DATA[family] || FAMILY_DATA.default;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Image source={require('../../../assets/images/chat/back.png')} style={{height: 24, width: 24}} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.name.replace(' Family', '\'s Diary').replace('\'s Memories', '\'s Diary')}</Text>
        <TouchableOpacity style={styles.shareIconBtn}>
          <Image source={require('../../../assets/images/home/share.png')} style={{height: 23, width: 23}} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Crest + Settings row */}
        <View style={styles.crestRow}>
          <View style={styles.crestBox}>
            <View style={styles.crestInner}>
              <Text style={styles.crestEmoji}>{data.crest}</Text>
              <Text style={styles.crestName}>{data.name.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Image source={require('../../../assets/images/profile/settings.png')} style={{height: 24, width: 24}} />
          </TouchableOpacity>
        </View>

        {/* About section */}
        <View style={styles.aboutSection}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutTitle}>About {data.name}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statItem}><Image source={require('../../../assets/images/home/like.png')} style={{height: 16, width: 16, marginRight: 5}} /> {data.likes}</Text>
              <Text style={styles.statItem}><Image source={require('../../../assets/images/home/eye.png')} style={{height: 16, width: 16, marginRight: 5}} /> {data.views}</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>{data.about}</Text>
        </View>

        {/* Admins */}
        <View style={styles.adminRow}>
          <Text style={styles.adminLabel}>Admin</Text>
          <View style={styles.adminAvatars}>
            {data.admins.map((uri, i) => (
              <Image key={i} source={{ uri }}
                style={[styles.adminAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: data.admins.length - i }]} />
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {data.entries.map((entry, idx) => {
            const isLast    = idx === data.entries.length - 1;
            const isFirst   = idx === 0;
            const prevEntry = data.entries[idx - 1];
            const nextEntry = data.entries[idx + 1];
            const showYear  = entry.year && (!prevEntry || prevEntry.year !== entry.year);
            const sameYearAsNext = !isLast && entry.year && nextEntry?.year === entry.year;
            // No pill = this is a continuation entry within same year
            const noPill = !showYear;

            return (
              <View key={entry.id} style={styles.timelineRow}>
                {/* Year + dot + line column */}
                <View style={styles.yearCol}>
                  {showYear ? (
                    // ── Has year pill: pill → dot → line ──────────────────
                    <>
                      <View style={styles.yearPill}>
                        <Text style={styles.yearTxt}>{entry.year}</Text>
                      </View>
                      <View style={styles.entryDot} />
                      {!isLast && (
                        <View style={styles.lineWrap}>
                          <View style={styles.lineSegment} />
                          {sameYearAsNext && <View style={styles.midDot} />}
                          <View style={styles.lineSegment} />
                        </View>
                      )}
                    </>
                  ) : (
                    // ── No pill: line → dot → line, fully connected ───────
                    <>
                      {/* Top line segment connecting from previous entry */}
                      <View style={styles.lineSegmentTop} />
                      {/* Dot on the continuous line */}
                      <View style={styles.entryDot} />
                      {/* Bottom line continuing down */}
                      {!isLast && (
                        <View style={styles.lineWrap}>
                          <View style={styles.lineSegment} />
                          {sameYearAsNext && <View style={styles.midDot} />}
                          <View style={styles.lineSegment} />
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* Entry card */}
                <View style={styles.entryCard}>
                  <DiaryEntry entry={entry} isLast={isLast} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer text */}
        {!!data.footer && (
          <Text style={styles.footerText}>{data.footer}</Text>
        )}

        {/* Bottom CTA inside scroll */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.hostBtn} onPress={onAddDiary}>
            <Text style={styles.hostTxt}>
              {data.name} hosted in  <Image source={require('../../../assets/images/logos/logo2.png')} style={{height: 14, width: 55, resizeMode:'contain',marginTop:10,paddingVertical:5}} /> 
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAF8' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    backgroundColor: '#FAFAF8',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E4DE',
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  shareIconBtn: { padding: 4 },
  shareIcon: { fontSize: 20, color: '#1A1A1A' },

  scroll: { flex: 1 },

  // Crest
  crestRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, justifyContent: 'space-between' },
  crestBox: {
    width: 88, height: 88, borderRadius: 12,
    backgroundColor: '#F2EDE6',
    borderWidth: 1, borderColor: '#D8CFC4',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  crestInner: { alignItems: 'center' },
  crestEmoji: { fontSize: 28 },
  crestName: {
    fontSize: 9, fontWeight: '700', color: '#5C4A32',
    letterSpacing: 1.5, marginTop: 4, textAlign: 'center',
  },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 20, color: '#888' },

  // About
  aboutSection: { paddingHorizontal: 16, marginBottom: 8 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  aboutTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A', fontFamily: 'SofiaSansCondensed-SemiBold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statItem: { fontSize: 13, color: '#666' },
  aboutText: { fontSize: 14, color: '#555', lineHeight: 19,fontFamily: 'SofiaSansCondensed-Regular' },

  // Admins
  adminRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 10 },
  adminLabel: { fontSize: 14, color: '#888', fontFamily: 'SofiaSansCondensed-Medium' },
  adminAvatars: { flexDirection: 'row' },
  adminAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FAFAF8' },

  // Timeline
  timeline: { paddingLeft: 16 },
  timelineRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'stretch' },
  yearCol: { width: 52, alignItems: 'center', paddingRight: 10, paddingTop: 2, flexDirection: 'column' },
  yearPill: {
    backgroundColor: '#E8E4DE', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-end',
  },
  yearTxt: { fontSize: 11, color: '#555', fontWeight: '600' },
  // Dot below pill for every entry
  entryDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#AAAAAA',
    marginTop: 4,
  },
  // Line going down from dot to next entry
  lineWrap: { alignItems: 'center', flex: 1 },
  lineSegment: { width: 1.5, flex: 1, backgroundColor: '#D0CCC8' },
  // Top connector for no-pill entries (line coming in from above)
  lineSegmentTop: { width: 1.5, height: 16, backgroundColor: '#D0CCC8' },
  // Mid dot on line when multiple posts share same year
  midDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#CCCCCC',
    borderWidth: 1.5, borderColor: '#FAFAF8',
  },
  timelineLine: { width: 1, flex: 1, backgroundColor: '#D8D4CE', alignSelf: 'center', marginTop: 4, minHeight: 20 },
  entryCard: {
    flex: 1, marginRight: 16, marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },

  // Entry
  entryWrap: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFEFEF' },
  entryTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 10, fontFamily: 'SofiaSansCondensed-SemiBold' },
  entryImageWide: { width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover', marginBottom: 10 },
  entryImageThumb: { width: 110, height: 110, borderRadius: 10, resizeMode: 'cover' },
  entryStory: { fontSize: 14, color: '#555', lineHeight: 19, marginBottom: 12, fontFamily: 'SofiaSansCondensed-Regular' },
  entryFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  likeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeHeart: { fontSize: 20, color: '#999', fontFamily: 'SofiaSansCondensed-Regular' },
  likeCount: { fontSize: 13, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },
  shareWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shareText: { alignItems: 'flex-end' },
  shareBy: { fontSize: 12, color: '#888',fontFamily: 'SofiaSansCondensed-Medium' },
  shareDate: { fontSize: 12, color: '#AAA',fontFamily: 'SofiaSansCondensed-Regular' },
  sharePhoto: { width: 32, height: 32, borderRadius: 16 },

  // Footer
  footerText: { fontSize: 13, color: '#888', lineHeight: 19, paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },

  // Bottom bar
  bottomBar: {
    alignItems: 'flex-start', paddingBottom: 28, paddingTop: 10,marginLeft: 16,
    backgroundColor: '#FAFAF8',
  },
  hostBtn: {
    backgroundColor: '#F5A623', borderRadius: 25,
    paddingHorizontal: 28, paddingVertical: 14,
    elevation: 4, shadowColor: '#F5A623', shadowOpacity: 0.35,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  hostTxt: { fontSize: 18, color: '#000',fontFamily:'SofiaSansCondensed-SemiBold' },
  hostBrand: { fontWeight: '800', letterSpacing: 0.5 },
});