import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList,
} from 'react-native';
import BloodBankFlow from './BloodBankScreens';
import FaceRecognitionScreen from './FaceRecognitionScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
type SavedPost = { id: string; imageUri: string };
type BlockedUser = { id: string; name: string; username: string; avatar: string };

const SAVED_POSTS: SavedPost[] = [
  { id: '1', imageUri: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400' },
  { id: '2', imageUri: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400' },
];

const BLOCKED_USERS: BlockedUser[] = [
  { id: '1', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=50' },
  { id: '2', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=50' },
  { id: '3', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=50' },
];

// ─── Blood request count (mock — replace with real data) ─────────────────────
const BLOOD_REQUEST_COUNT = 3;

type SettingsScreenProps = { navigation?: any };

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const [rating, setRating]               = useState(0);
  const [showBloodBank, setShowBloodBank] = useState(false);
  const [showFaceRec, setShowFaceRec]     = useState(false);
  const [sosHeld, setSosHeld]             = useState(false);

  const profileData = {
    name: 'Sristy Singh',
    greeting: 'Hello',
    username: '@iamsrishiiii',
    avatar: 'https://i.pravatar.cc/300?img=45',
    profileCompletion: 85,
  };

  // ── MenuItem variants ─────────────────────────────────────────────────────
  const MenuItem = ({
    icon, label, onPress, right,
  }: { icon: any; label: string; onPress?: () => void; right?: React.ReactNode }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.65}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      {right ?? (
        <Image source={require('../../../assets/images/chat/chevron-right.png')} style={styles.chevronIcon} />
      )}
    </TouchableOpacity>
  );

  // Section header with horizontal rule
  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  // ── Blood Bank screen ─────────────────────────────────────────────────────
  if (showBloodBank) {
    return (
      <BloodBankFlow
        onBack={() => setShowBloodBank(false)}
        onComplete={() => setShowBloodBank(false)}
      />
    );
  }

  // ── Face Recognition screen ───────────────────────────────────────────────
  if (showFaceRec) {
    return <FaceRecognitionScreen onBack={() => setShowFaceRec(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <Image source={{ uri: profileData.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <TouchableOpacity style={styles.editIconWrap}>
              <Image source={require('../../../assets/images/profile/edit.png')} style={styles.editIcon} />
            </TouchableOpacity>
            <Text style={styles.profileGreeting}>{profileData.greeting}</Text>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileUsername}>{profileData.username}</Text>
          </View>
        </View>

        {/* ── Progress Bar ── */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${profileData.profileCompletion}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Complete your profile ({profileData.profileCompletion}%)
          </Text>
        </View>

        {/* ── General ── */}
        <View style={styles.section}>
          <SectionHeader title="General" />
          <MenuItem icon={require('../../../assets/images/profile/user1.png')} label="My Profile"
            onPress={() => navigation?.navigate('Profile', { isMyProfile: true })} />
          <MenuItem icon={require('../../../assets/images/profile/heart.png')}      label="Choose Interest" />
          <MenuItem icon={require('../../../assets/images/profile/bell.png')}       label="Notifications" />
          <MenuItem icon={require('../../../assets/images/profile/gift.png')}       label="Invite & Earn" />
          <MenuItem icon={require('../../../assets/images/profile/translate.png')}  label="Translate Language" />
          <MenuItem icon={require('../../../assets/images/profile/block.png')}      label="Blocked User"
            onPress={() => navigation?.navigate('BlockList')} />
          <MenuItem icon={require('../../../assets/images/profile/lock.png')}       label="Privacy & Security" />
        </View>

        {/* ── Utility ── */}
        <View style={styles.section}>
          <SectionHeader title="Utility" />

          {/* SOS — hold button on right */}
          <MenuItem
            icon={require('../../../assets/images/profile/Siren.png')}
            label="SOS"
            right={
              <TouchableOpacity
                style={styles.sosBtn}
                onLongPress={() => setSosHeld(true)}
                onPressOut={() => setSosHeld(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.sosBtnTxt}>Hold for 3 seconds</Text>
              </TouchableOpacity>
            }
          />

          {/* Blood Requirement — count badge on right */}
          <MenuItem
            icon={require('../../../assets/images/profile/blood.png')}
            label="Blood Requirement • Self / Family"
            onPress={() => setShowBloodBank(true)}
            right={
              <View style={styles.bloodBadgeWrap}>
                {BLOOD_REQUEST_COUNT > 0 && (
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodBadgeTxt}>{BLOOD_REQUEST_COUNT}</Text>
                  </View>
                )}
                <Image
                  source={require('../../../assets/images/chat/chevron-right.png')}
                  style={styles.chevronIcon}
                />
              </View>
            }
          />

          <MenuItem icon={require('../../../assets/images/profile/send.png')}     label="Send Broadcast" />
          <MenuItem icon={require('../../../assets/images/profile/currency.png')} label="Family Saving Circle (FSC)" />
          <MenuItem icon={require('../../../assets/images/profile/male.png')}     label="My Family Diary" />
          <MenuItem icon={require('../../../assets/images/profile/scan1.png')}    label="Face Recognition"
            onPress={() => setShowFaceRec(true)} />

          {/* Saved Hive List — count text on right */}
          <MenuItem
            icon={require('../../../assets/images/profile/List.png')}
            label="Saved Hive List"
            right={
              <View style={styles.hiveCountWrap}>
                <Text style={styles.hiveCountTxt}>8 Lists • 132 Members</Text>
                <Image
                  source={require('../../../assets/images/chat/chevron-right.png')}
                  style={styles.chevronIcon}
                />
              </View>
            }
          />
        </View>

        {/* ── More Options ── */}
        <View style={styles.section}>
          <SectionHeader title="More Options" />
          <MenuItem icon={require('../../../assets/images/home/save.png')} label="Saved Post"
            onPress={() => navigation?.navigate('SavedPost')} />
        </View>

        {/* ── Chatter ── */}
        <View style={styles.section}>
          <SectionHeader title="Chatter" />
          <MenuItem icon={require('../../../assets/images/profile/star1.png')} label="Stared messages" />
        </View>

        {/* ── Knobee ── */}
        <View style={styles.section}>
          <SectionHeader title="Knobee" />
          <MenuItem icon={require('../../../assets/images/profile/info.png')}         label="About Knobee" />
          <MenuItem icon={require('../../../assets/images/profile/file.png')}         label="Privacy Policy" />
          <MenuItem icon={require('../../../assets/images/profile/hand-pointer.png')} label="Terms of Use" />
          <MenuItem icon={require('../../../assets/images/profile/logout.png')}       label="Logout" />
        </View>

        {/* ── Rating ── */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingText}>Rate us on Play Store</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Image
                  source={require('../../../assets/images/profile/star1.png')}
                  style={[styles.starIcon, { tintColor: star <= rating ? '#F5A623' : '#CCCCCC' }]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ─── Saved Post Screen ────────────────────────────────────────────────────────
export const SavedPostScreen = ({ navigation }: { navigation?: any }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation?.goBack()}>
        <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Saved Post</Text>
      <View style={{ width: 24 }} />
    </View>
    <FlatList
      data={SAVED_POSTS}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.savedPostRow}
      contentContainerStyle={styles.savedPostList}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.savedPostItem}>
          <Image source={{ uri: item.imageUri }} style={styles.savedPostImage} />
        </TouchableOpacity>
      )}
    />
  </View>
);

// ─── Block List Screen ────────────────────────────────────────────────────────
export const BlockListScreen = ({ navigation }: { navigation?: any }) => {
  const [blockedUsers, setBlockedUsers] = useState(BLOCKED_USERS);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Block List</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={blockedUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.blockListContainer}
        renderItem={({ item }) => (
          <View style={styles.blockedUserItem}>
            <Image source={{ uri: item.avatar }} style={styles.blockedUserAvatar} />
            <View style={styles.blockedUserInfo}>
              <Text style={styles.blockedUserName}>{item.name}</Text>
              <Text style={styles.blockedUserUsername}>{item.username}</Text>
            </View>
            <TouchableOpacity
              style={styles.unblockBtn}
              onPress={() => setBlockedUsers(prev => prev.filter(u => u.id !== item.id))}
            >
              <Text style={styles.unblockBtnText}>Unblock</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  headerTitle: { fontSize: 20, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  scrollView: { flex: 1 },

  // Profile Card
  profileCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 20, gap: 14,
  },
  profileAvatar: { width: 80, height: 80, borderRadius: 16 },
  profileInfo: { flex: 1, paddingTop: 2 },
  editIconWrap: { position: 'absolute', top: 0, right: 0 },
  editIcon: { width: 18, height: 18, tintColor: '#888' },
  profileGreeting: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#888', marginTop: 2 },
  profileName: { fontSize: 20, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a', marginTop: 1 },
  profileUsername: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa', marginTop: 1 },

  // Progress Bar
  progressSection: { paddingHorizontal: 16, marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#F5A623', borderRadius: 3 },
  progressText: { fontSize: 12, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 4, gap: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a' },
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0' },

  // Menu Item
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16, gap: 14,
  },
  menuIcon: { width: 22, height: 22, tintColor: '#1a1a1a', resizeMode: 'contain' },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  chevronIcon: { width: 14, height: 14, tintColor: '#bbb', resizeMode: 'contain' },

  // SOS button
  sosBtn: {
    backgroundColor: '#C0392B', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  sosBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // Blood badge
  bloodBadgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bloodBadge: {
    backgroundColor: '#C0392B', borderRadius: 10,
    minWidth: 20, height: 20, paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  bloodBadgeTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },

  // Hive count text
  hiveCountWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hiveCountTxt: { fontSize: 12, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },

  // Rating
  ratingSection: { alignItems: 'center', paddingVertical: 24 },
  ratingText: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#888', marginBottom: 14 },
  starsRow: { flexDirection: 'row', gap: 10 },
  starIcon: { width: 30, height: 30, resizeMode: 'contain' },

  // Saved Post
  savedPostList: { padding: 16 },
  savedPostRow: { gap: 16, marginBottom: 16 },
  savedPostItem: { flex: 1 },
  savedPostImage: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: '#f0f0f0' },

  // Block List
  blockListContainer: { padding: 16 },
  blockedUserItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  blockedUserAvatar: { width: 56, height: 56, borderRadius: 16 },
  blockedUserInfo: { flex: 1 },
  blockedUserName: { fontSize: 17, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  blockedUserUsername: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#999', marginTop: 2 },
  unblockBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#999' },
  unblockBtnText: { fontSize: 14, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#666' },
});

export default SettingsScreen;