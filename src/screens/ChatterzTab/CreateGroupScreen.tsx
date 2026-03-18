import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─── Gradient Button helper ───────────────────────────────────────────────────

const GradientButton = ({
  label,
  onPress,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
    <LinearGradient
      colors={['#FFD567', '#FF8837']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBtn}
    >
      <Text style={[styles.gradientBtnText, textStyle]}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Dummy contacts ───────────────────────────────────────────────────────────

const CONTACTS = [
  { id: '1', name: 'Saksham Singh', relation: 'Brother', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Saksham Singh', relation: 'Following', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', name: 'Raghini Mishra', relation: 'Friend', avatar: 'https://i.pravatar.cc/150?img=45' },
  { id: '4', name: 'Monica Verma', relation: 'Following', avatar: 'https://i.pravatar.cc/150?img=44' },
];

// ─── Add Members Screen ───────────────────────────────────────────────────────

export const AddMembersScreen = ({ navigation, route }: { navigation?: any; route?: any }) => {
  const [query, setQuery] = useState('Saksham Singh');
  const [selectedIds, setSelectedIds] = useState<string[]>(['1']);

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedContacts = CONTACTS.filter(c => selectedIds.includes(c.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Add Members</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Selected chips */}
      {selectedContacts.length > 0 && (
        <>
          <View style={styles.chipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {selectedContacts.map(c => (
                <View key={c.id} style={styles.chip}>
                  <Text style={styles.chipText}>{c.name}</Text>
                  <TouchableOpacity onPress={() => toggle(c.id)}>
                    <Text style={styles.chipClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.chipsDivider} />
        </>
      )}

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Image
          source={require('../../../assets/images/home/search.png')}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor="#ccc"
        />
      </View>

      {/* Contact list */}
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => toggle(item.id)}
              activeOpacity={0.75}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                {isSelected && (
                  <LinearGradient
                    colors={['rgba(255,213,103,0.75)', 'rgba(255,136,55,0.75)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.selectedOverlay}
                  >
                    <Text style={styles.selectedTick}>✓</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactRelation}>{item.relation}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Create Group button */}
      <View style={styles.footer}>
        <GradientButton
          label="Create Group"
          onPress={() => navigation?.navigate('ChatScreen', { isGroup: true })}
          style={styles.footerBtnWrap}
        />
      </View>
    </View>
  );
};

// ─── Create Group Screen ──────────────────────────────────────────────────────

export const CreateGroupScreen = ({ navigation }: { navigation?: any }) => {
  const [groupName, setGroupName] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Create group</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.createBody}>
        {/* Photo picker + group name */}
        <View style={styles.groupRow}>
          <TouchableOpacity  style={styles.groupPhotoBtn}>
            
              <Image
                source={require('../../../assets/images/home/plus.png')}
                style={styles.groupPhotoIcon}
                resizeMode="contain"
              />
            
          </TouchableOpacity>

          <View style={styles.groupNameWrap}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Name the Group"
              placeholderTextColor="#bbb"
              value={groupName}
              onChangeText={setGroupName}
            />
            <View style={styles.groupNameUnderline} />
          </View>
        </View>

        {/* Add Members button */}
        <View style={styles.footer}>
          <GradientButton
            label="Add Members"
            onPress={() => navigation?.navigate('AddMembers')}
            style={styles.footerBtnWrap}
          />
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8',
  },
  backBtn: { padding: 4 },
  backIcon: { width: 22, height: 22 },
  title: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  // Chips
  chipsWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  chips: { gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chipText: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  chipClose: { fontSize: 14, color: '#888' },
  chipsDivider: { height: 0.5, backgroundColor: '#e8e8e8', marginTop: 8 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fde8d8', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
  },
  searchIcon: { width: 20, height: 20, tintColor: 'rgba(255,167,87,1)' },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },

  // Contact list
  list: { flex: 1, paddingHorizontal: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  avatarWrap: { position: 'relative' },
  contactAvatar: { width: 58, height: 58, borderRadius: 10 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  selectedTick: { color: '#fff', fontSize: 24, fontWeight: '700' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 17, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  contactRelation: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#888', marginTop: 2 },

  // Footer
  footer: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, alignItems: 'flex-end' },
  footerBtnWrap: { borderRadius: 10, overflow: 'hidden' },

  // Gradient button
  gradientBtn: {
    paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  gradientBtnText: {
    fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a',
  },

  // Create Group body
  createBody: { flex: 1, paddingTop: 28 },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 16 },
  groupPhotoBtn: {
    width: 80, height: 80, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(219, 218, 213, 1)',backgroundColor:'rgba(242, 242, 242, 1)'
  },
  groupPhotoIcon: { width: 30, height: 30, tintColor: 'rgba(219, 218, 213, 1)' },
  groupNameWrap: { flex: 1 },
  groupNameInput: {
    fontSize: 18, fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a', paddingVertical: 6,
  },
  groupNameUnderline: { height: 1, backgroundColor: '#e0e0e0', marginTop: 4 },
});

export default CreateGroupScreen;