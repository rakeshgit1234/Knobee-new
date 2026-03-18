import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

type ProfileTab = 'profile' | 'post' | 'gallery';

type Post = {
  id: string;
  author: { name: string; avatar: string };
  taggedUsers: number;
  date: string;
  content: string;
  hashtags: string[];
  image?: string;
};

type GalleryImage = {
  id: string;
  uri: string;
};

const POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'Saksham Singh', avatar: 'https://i.pravatar.cc/150?img=50' },
    taggedUsers: 5,
    date: '16 Feb 2024',
    content: 'Lost in the haze of the motel road, chasing dreams at every crossroad',
    hashtags: ['#motel', '#knobee', '#road'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
];

const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400' },
  { id: '6', uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
  { id: '7', uri: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400' },
  { id: '8', uri: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400' },
  { id: '9', uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
];

type ProfileScreenProps = {
  navigation?: any;
  route?: any;
};

const ProfileScreen = ({ navigation, route }: ProfileScreenProps) => {
  const isMyProfile = route?.params?.isMyProfile ?? true;
  const userId = route?.params?.userId ?? 'iamsrishiiii';

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHiverBadge, setShowHiverBadge] = useState(!isMyProfile);

  // Profile data
  const profileData = {
    username: userId,
    name: 'Sristy Singh',
    avatar: 'https://i.pravatar.cc/300?img=45',
    coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    stats: { posts: 147, closed: 142, hive: '36K' },
    occupation: 'Doctor',
    mobileNo: '+919874563210',
    gender: 'Female',
    birthDate: 'Jan 19, 2000',
    maritalStatus: 'Single',
    location: 'Delhi, India',
    bloodGroup: 'AB-',
    country: '🇮🇳 INDIA',
    activeSince: 'Jan 2022',
  };

  const renderProfileInfo = () => (
    <View style={styles.profileInfoSection}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Occupation</Text>
        <Text style={styles.infoValue}>{profileData.occupation}</Text>
      </View>
      {isMyProfile && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile No.</Text>
          <Text style={styles.infoValue}>{profileData.mobileNo}</Text>
        </View>
      )}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Gender</Text>
        <Text style={styles.infoValue}>{profileData.gender}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Birth Date</Text>
        <Text style={styles.infoValue}>{profileData.birthDate}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Marital Status</Text>
        <Text style={styles.infoValue}>{profileData.maritalStatus}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Location</Text>
        <Text style={styles.infoValue}>{profileData.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Blood group</Text>
        <Text style={styles.infoValue}>{profileData.bloodGroup}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Country</Text>
        <Text style={styles.infoValue}>{profileData.country}</Text>
      </View>

      {isMyProfile && (
        <TouchableOpacity style={styles.shareProfileBtn}>
          <Image source={require('../../../assets/images/profile/share.png')} style={styles.shareIcon} />
          <Text style={styles.shareProfileText}>Share My Profile</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.activeSinceText}>Active Since {profileData.activeSince}</Text>
    </View>
  );

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.author.avatar }} style={styles.postAuthorAvatar} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthorName}>
            {item.author.name} <Text style={styles.taggedText}>tagged You +{item.taggedUsers} others</Text>
          </Text>
          <Text style={styles.postDate}>{item.date}</Text>
        </View>
        <TouchableOpacity>
          <Image source={require('../../../assets/images/profile/three-dot-vertical.png')} style={styles.iconThreeDots} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.hashtagsRow}>
        {item.hashtags.map((tag, i) => (
          <Text key={i} style={styles.hashtag}>{tag}</Text>
        ))}
      </View>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
    </View>
  );

  const renderGalleryItem = ({ item }: { item: GalleryImage }) => (
    <TouchableOpacity style={styles.galleryItem}>
      <Image source={{ uri: item.uri }} style={styles.galleryImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {!isMyProfile && (
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{profileData.username}</Text>
        <TouchableOpacity onPress={() => {
          if (isMyProfile) {
            // Navigate to Settings
            navigation?.navigate('Settings');
          } else {
            // Block user action (you can also show a confirmation dialog here)
            Alert.alert(`You have blocked ${profileData.username}`);
          }
        }}>
          <Image 
            source={isMyProfile 
              ? require('../../../assets/images/profile/settings.png') 
              : require('../../../assets/images/profile/block.png')
            } 
            style={styles.iconSettings} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cover & Profile Section */}
        <View style={styles.coverSection}>
          <Image source={{ uri: profileData.coverImage }} style={styles.coverImage} />
          
          {/* Profile Avatar with Badge */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
            {showHiverBadge && (
              <View style={styles.hiverBadge}>
                <Text style={styles.hiverText}>HIVER</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.stats.posts}</Text>
              <Text style={styles.statLabel}>Post</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.stats.closed}</Text>
              <Text style={styles.statLabel}>Closed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.stats.hive}</Text>
              <Text style={styles.statLabel}>Hive</Text>
            </View>
          </View>
        </View>

        {/* Name & Bio */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.bio}>{profileData.bio}</Text>
        </View>

        {/* Action Buttons (only for other profiles) */}
        {!isMyProfile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.followBtn]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={styles.followBtnText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]}>
              <Text style={styles.shareBtnText}>Share Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.chatterBtn]}>
              <Text style={styles.chatterBtnText}>ChatterZ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('profile')}
          >
            <Image 
              source={require('../../../assets/images/profile/user.png')} 
              style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]} 
            />
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
              Profile
            </Text>
            {activeTab === 'profile' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('post')}
          >
            <Image 
              source={require('../../../assets/images/profile/feed.png')} 
              style={[styles.tabIcon, activeTab === 'post' && styles.tabIconActive]} 
            />
            <Text style={[styles.tabLabel, activeTab === 'post' && styles.tabLabelActive]}>
              Post
            </Text>
            {activeTab === 'post' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('gallery')}
          >
            <Image 
              source={require('../../../assets/images/profile/photo.png')} 
              style={[styles.tabIcon, activeTab === 'gallery' && styles.tabIconActive]} 
            />
            <Text style={[styles.tabLabel, activeTab === 'gallery' && styles.tabLabelActive]}>
              Gallery
            </Text>
            {activeTab === 'gallery' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'profile' && renderProfileInfo()}
          
          {activeTab === 'post' && (
            <FlatList
              data={POSTS}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}

          {activeTab === 'gallery' && (
            <FlatList
              data={GALLERY_IMAGES}
              renderItem={renderGalleryItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.galleryRow}
            />
          )}
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  iconSettings: { width: 24, height: 24, tintColor: '#1a1a1a' },

  scrollView: { flex: 1 },

  // Cover & Profile
  coverSection: { position: 'relative' },
  coverImage: { width: '100%', height: 160 },
  
  avatarContainer: { position: 'absolute', top: 120, left: 20 },
  avatar: { width: 87, height: 87, borderRadius: 10, borderWidth: 2, borderColor: '#fff' },
  hiverBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,140,50,1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hiverText: { 
    fontSize: 11, 
    fontFamily: 'SofiaSansCondensed-Bold', 
    color: '#fff',
    letterSpacing: 0.5,
  },

  statsContainer: {
    position: 'absolute',
    top: 120,
    right: -4,
    backgroundColor: 'rgba(255,222,200,0.95)',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 24,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a' },
  statLabel: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#666', marginTop: 2 },

  // Name & Bio
  nameSection: { paddingHorizontal: 25, paddingTop: 50, paddingBottom: 16 },
  name: { fontSize: 24, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a', marginBottom: 8 },
  bio: { fontSize: 15, fontFamily: 'SofiaSansCondensed-Regular', color: '#666', lineHeight: 22 },

  // Action Buttons
  actionButtons: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    gap: 12, 
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  followBtn: { 
    backgroundColor: 'rgba(0, 107, 165, 0.05)',
    borderColor: '#2196F3',
  },
  followBtnText: { 
    fontSize: 15, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#2196F3',
  },
  shareBtn: { 
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderColor: '#FF6B9D',
  },
  shareBtnText: { 
    fontSize: 15, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#FF6B9D',
  },
  chatterBtn: { 
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  chatterBtnText: { 
    fontSize: 15, 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: '#4CAF50',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabIcon: { width: 22, height: 22, tintColor: '#ccc', marginBottom: 4 },
  tabIconActive: { tintColor: 'rgba(255,140,50,1)' },
  tabLabel: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },
  tabLabelActive: { 
    fontFamily: 'SofiaSansCondensed-SemiBold', 
    color: 'rgba(255,140,50,1)',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,140,50,1)',
  },

  // Tab Content
  tabContent: { paddingBottom: 40 },

  // Profile Info
  profileInfoSection: { paddingHorizontal: 16, paddingTop: 20 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
    maxWidth:'40%',
  },
  infoLabel: { fontSize: 15, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },
  infoValue: { fontSize: 15, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a',alignSelf:'flex-start',maxWidth:'60%',justifyContent:'flex-start' },

  shareProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    borderRadius: 10,
    width: '40%',
    alignSelf: 'center',
  },
  shareIcon: { width: 18, height: 18, tintColor: '#1a1a1a' },
  shareProfileText: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  activeSinceText: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 0,
  },

  // Post Card
  postCard: { 
    // paddingHorizontal: 16, 
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 ,paddingHorizontal: 16},
  postAuthorAvatar: { width: 40, height: 40, borderRadius: 20 },
  postAuthorInfo: { flex: 1, marginLeft: 12 },
  postAuthorName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  taggedText: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#999' },
  postDate: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa', marginTop: 2 },
  iconThreeDots: { width: 20, height: 20, tintColor: '#666' },
  
  postContent: { 
    fontSize: 15, 
    fontFamily: 'SofiaSansCondensed-Regular', 
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 0,
     paddingHorizontal: 16
  },
  hashtagsRow: { flexDirection: 'row', gap: 2, marginBottom: 12, paddingHorizontal: 16 },
  hashtag: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#2196F3' },
  postImage: { width: '100%', height: 400, marginTop: 8 },

  // Gallery
  galleryRow: { gap: 2,marginBottom: 2 },
  galleryItem: { 
    width: (width - 4) / 3,
    height: (width - 4) / 3,
  },
  galleryImage: { width: '100%', height: '100%' },
});

export default ProfileScreen;
