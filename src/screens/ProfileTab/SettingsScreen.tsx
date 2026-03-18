import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList,
} from 'react-native';

// Types
type SavedPost = {
  id: string;
  imageUri: string;
};

type BlockedUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

const SAVED_POSTS: SavedPost[] = [
  { id: '1', imageUri: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400' },
  { id: '2', imageUri: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400' },
];

const BLOCKED_USERS: BlockedUser[] = [
  {
    id: '1',
    name: 'Saksham Singh',
    username: 'iamsakshammm',
    avatar: 'https://i.pravatar.cc/150?img=50',
  },
  {
    id: '2',
    name: 'Saksham Singh',
    username: 'iamsakshammm',
    avatar: 'https://i.pravatar.cc/150?img=50',
  },
  {
    id: '3',
    name: 'Saksham Singh',
    username: 'iamsakshammm',
    avatar: 'https://i.pravatar.cc/150?img=50',
  },
];

type SettingsScreenProps = {
  navigation?: any;
};

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const [rating, setRating] = useState(0);

  const profileData = {
    name: 'Sristy Singh',
    greeting: 'Hello',
    username: '@iamsrishiiii',
    avatar: 'https://i.pravatar.cc/300?img=45',
    profileCompletion: 85,
  };

  const MenuItem = ({ 
    icon, 
    label, 
    onPress 
  }: { 
    icon: any; 
    label: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Image source={require('../../../assets/images/chat/chevron-right.png')} style={styles.chevronIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: profileData.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <View>
                <TouchableOpacity>
                <Image source={require('../../../assets/images/profile/edit.png')} style={styles.editIcon} />
              </TouchableOpacity>
                <Text style={styles.profileGreeting}>{profileData.greeting}</Text>
                <Text style={styles.profileName}>{profileData.name}</Text>
                <Text style={styles.profileUsername}>{profileData.username}</Text>
              </View>
              
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${profileData.profileCompletion}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Complete your profile ({profileData.profileCompletion}%)
          </Text>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <MenuItem 
            icon={require('../../../assets/images/profile/user1.png')} 
            label="My Profile"
            onPress={() => navigation?.navigate('Profile', { isMyProfile: true })}
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/heart.png')} 
            label="Choose Interest"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/bell.png')} 
            label="Notifications"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/gift.png')} 
            label="Invite & Earn"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/translate.png')} 
            label="Translate Language"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/block.png')} 
            label="Blocked User"
            onPress={() => navigation?.navigate('BlockList')}
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/lock.png')} 
            label="Privacy & Security"
          />
        </View>

        {/* More Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>
          <MenuItem 
            icon={require('../../../assets/images/home/save.png')} 
            label="Saved Post"
            onPress={() => navigation?.navigate('SavedPost')}
          />
        </View>

        {/* Chatter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chatter</Text>
          <MenuItem 
            icon={require('../../../assets/images/profile/star1.png')} 
            label="Stared messages"
          />
        </View>

        {/* Knobee Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Knobee</Text>
          <MenuItem 
            icon={require('../../../assets/images/profile/info.png')} 
            label="About Knobee"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/file.png')} 
            label="Privacy Policy"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/hand-pointer.png')} 
            label="Terms of Use"
          />
          <MenuItem 
            icon={require('../../../assets/images/profile/logout.png')} 
            label="Logout"
          />
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingText}>Rate us on Play Store</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Image 
                  source={
                    star <= rating 
                      ? require('../../../assets/images/profile/star1.png') 
                      : require('../../../assets/images/profile/star1.png')
                  } 
                  style={styles.starIcon} 
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

// Saved Post Screen
export const SavedPostScreen = ({ navigation }: { navigation?: any }) => {
  const renderSavedPost = ({ item }: { item: SavedPost }) => (
    <TouchableOpacity style={styles.savedPostItem}>
      <Image source={{ uri: item.imageUri }} style={styles.savedPostImage} />
    </TouchableOpacity>
  );

  return (
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
        renderItem={renderSavedPost}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.savedPostRow}
        contentContainerStyle={styles.savedPostList}
      />
    </View>
  );
};

// Block List Screen
export const BlockListScreen = ({ navigation }: { navigation?: any }) => {
  const [blockedUsers, setBlockedUsers] = useState(BLOCKED_USERS);

  const handleUnblock = (userId: string) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.blockedUserItem}>
      <Image source={{ uri: item.avatar }} style={styles.blockedUserAvatar} />
      <View style={styles.blockedUserInfo}>
        <Text style={styles.blockedUserName}>{item.name}</Text>
        <Text style={styles.blockedUserUsername}>{item.username}</Text>
      </View>
      <TouchableOpacity 
        style={styles.unblockBtn}
        onPress={() => handleUnblock(item.id)}
      >
        <Text style={styles.unblockBtnText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

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
        renderItem={renderBlockedUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.blockListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  headerTitle: { 
    fontSize: 20, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#1a1a1a',
  },

  scrollView: { flex: 1 },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  profileAvatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 20,
  },
  profileInfo: { flex: 1 },
  profileHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop:6
  },
  profileGreeting: { 
    fontSize: 14, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#666',
  },
  profileName: { 
    fontSize: 20, 
    fontFamily: 'SofiaSansCondensed-Bold', 
    color: '#1a1a1a',
    marginTop: 2,
  },
  profileUsername: { 
    fontSize: 14, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#999',
    marginTop: 2,
  },
  editIcon: { width: 20, height: 20, tintColor: '#666' },

  // Progress Bar
  progressSection: { paddingHorizontal: 16, marginBottom: 24 },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,140,50,1)',
    borderRadius: 4,
  },
  progressText: { 
    fontSize: 13, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#666',
  },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 16, 
    fontFamily: 'SofiaSansCondensed-Bold', 
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:8,
    paddingHorizontal: 16,
    gap: 16,
  },
  menuIcon: { width: 22, height: 22, tintColor: '#1a1a1a' },
  menuLabel: { 
    flex: 1, 
    fontSize: 16, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#1a1a1a',
  },
  chevronIcon: { width: 16, height: 16, tintColor: '#999' },

  // Rating
  ratingSection: { 
    alignItems: 'center', 
    paddingVertical: 30,
  },
  ratingText: { 
    fontSize: 15, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#666',
    marginBottom: 16,
  },
  starsRow: { flexDirection: 'row', gap: 8 },
  starIcon: { width: 32, height: 32 },

  // Saved Post Screen
  savedPostList: { padding: 16 },
  savedPostRow: { gap: 16, marginBottom: 16 },
  savedPostItem: { flex: 1 },
  savedPostImage: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },

  // Block List Screen
  blockListContainer: { padding: 16 },
  blockedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  blockedUserAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 16,
  },
  blockedUserInfo: { flex: 1 },
  blockedUserName: { 
    fontSize: 17, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#1a1a1a',
  },
  blockedUserUsername: { 
    fontSize: 14, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#999',
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#999',
  },
  unblockBtnText: { 
    fontSize: 14, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#666',
  },
});

export default SettingsScreen;
