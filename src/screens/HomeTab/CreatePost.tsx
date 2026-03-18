import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

type SelectedImage = {
  uri: string;
  fileName?: string;
  type?: string;
};

type TaggedUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  relation?: string;
};

const SUGGESTED_USERS: TaggedUser[] = [
  {
    id: '1',
    name: 'Saksham Singh',
    username: 'iamsakshammm',
    avatar: 'https://i.pravatar.cc/150?img=50',
    relation: 'Brother',
  },
  {
    id: '2',
    name: 'Saksham Singh',
    username: 'iamsakshammm2',
    avatar: 'https://i.pravatar.cc/150?img=51',
    relation: 'Following',
  },
];

type CreatePostScreenProps = {
  navigation?: any;
  route?: any;
};

// ─── Inline styled text (hashtags & mentions bold) ───────────────────────────
const renderStyledText = (text: string) => {
  const tokens = text.split(/(\s+)/);
  return (
    <Text style={styles.textPreview}>
      {tokens.map((token, i) => {
        if (/^[#@]\w+/.test(token)) {
          return (
            <Text key={i} style={styles.highlighted}>
              {token}
            </Text>
          );
        }
        return <Text key={i}>{token}</Text>;
      })}
    </Text>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CreatePostScreen = ({ navigation, route }: CreatePostScreenProps) => {
  const isHivePost = route?.params?.isHivePost ?? false;
  const screenTitle = isHivePost ? 'Add Hive' : 'Create Post';

  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const profileData = {
    name: 'Sristy Singh',
    username: '@iamsrishiiii',
    avatar: 'https://i.pravatar.cc/300?img=45',
  };

  // ── Android permission helper ─────────────────────────────────────────────
  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const result = await PermissionsAndroid.request(permission, {
        title: 'Photo Library Permission',
        message: 'App needs access to your photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  // ── Open gallery ──────────────────────────────────────────────────────────
  const handleAddMedia = async () => {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please allow photo access in Settings.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage ?? 'Could not open gallery');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const newImages: SelectedImage[] = result.assets.map(a => ({
          uri: a.uri ?? '',
          fileName: a.fileName,
          type: a.type,
        }));
        setSelectedImages(prev => {
          const merged = [...prev, ...newImages];
          setCurrentImageIndex(merged.length - 1);
          return merged;
        });
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Unable to open gallery. Check app permissions.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setCurrentImageIndex(Math.max(0, index - 1));
      return updated;
    });
  };

  const handleTagPeople = () => {
    navigation?.navigate('TagPeople', {
      imageUri: selectedImages[currentImageIndex]?.uri,
      onTagComplete: (_users: string[]) => {},
    });
  };

  const handlePost = () => {
    if (!postText.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some content or images to post.');
      return;
    }
    navigation?.goBack();
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.iconBack}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <TouchableOpacity style={styles.headerActionBtn} onPress={handlePost}>
          <Text style={styles.headerActionBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileUsername}>{profileData.username}</Text>
          </View>
        </View>

        {/* ── Text input with styled overlay ── */}
        <View style={styles.textBox}>
          {/* Real input (text hidden, replaced by overlay) */}
          <TextInput
            style={styles.hiddenInput}
            placeholder="Share your thoughts"
            // multiline
            value={postText}
            onChangeText={setPostText}
            textAlignVertical="top"
          />
          {/* Visible styled layer */}
          {/* <View style={styles.styledOverlay} pointerEvents="none">
            {postText.length === 0 ? (
              <Text style={styles.placeholder}>Share your thoughts</Text>
            ) : (
              renderStyledText(postText)
            )}
          </View> */}
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          {route?.params?.add===1 && <TouchableOpacity style={styles.actionBtn} onPress={handleAddMedia}>
          <Image
              source={require('../../../assets/images/home/image.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionBtnText}>Add Media</Text>
          </TouchableOpacity>}

          <TouchableOpacity style={styles.actionBtn} onPress={handleTagPeople}>
            <Image
              source={require('../../../assets/images/home/tag.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionBtnText}>Tag People</Text>
          </TouchableOpacity>
        </View>

        {/* ── Full-width swipeable images ── */}
        {selectedImages.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            onMomentumScrollEnd={e => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / (width - 32),
              );
              setCurrentImageIndex(idx);
            }}
          >
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageCard}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />

                {/* Trash — top left, orange circle */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Image
                    source={require('../../../assets/images/home/Trash.png')}
                    style={styles.deleteIcon}
                  />
                </TouchableOpacity>

                {/* Counter — top right, dark pill */}
                <View style={styles.counterPill}>
                  <Text style={styles.counterText}>
                    {index + 1}/{selectedImages.length}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Tag People Screen ────────────────────────────────────────────────────────
export const TagPeopleScreen = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const selectedImage: string | null = route?.params?.imageUri ?? null;

  const profileData = {
    name: 'Sristy Singh',
    username: '@iamsrishiiii',
    avatar: 'https://i.pravatar.cc/300?img=45',
  };

  const filteredUsers = SUGGESTED_USERS.filter(
    u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleUser = (id: string) =>
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  const handleDone = () => {
    route?.params?.onTagComplete?.(selectedUsers);
    navigation?.goBack();
  };

  const renderUserItem = ({ item }: { item: TaggedUser }) => {
    const isSelected = selectedUsers.includes(item.id);
    return (
      <TouchableOpacity style={styles.userItem} onPress={() => toggleUser(item.id)}>
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.relation && <Text style={styles.userRelation}>{item.relation}</Text>}
        </View>
        {isSelected && (
          <Image
            source={require('../../../assets/images/chat/check.png')}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.iconBack}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tag People</Text>
        <TouchableOpacity style={styles.headerActionBtn} onPress={handleDone}>
          <Text style={styles.headerActionBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileUsername}>{profileData.username}</Text>
          </View>
        </View>

        {/* ── Full-width image preview ── */}
        {selectedImage && (
          <View style={styles.tagImageWrap}>
            <Image source={{ uri: selectedImage }} style={styles.tagImage} />
          </View>
        )}

        {/* ── Search bar ── */}
        <View style={styles.searchBar}>
          <Image
            source={require('../../../assets/images/home/search.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Saksham Singh"
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── Users ── */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#1a1a1a',
  },
  headerActionBtn: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  headerActionBtnText: {
    fontSize: 15,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#555',
  },

  scrollView: { flex: 1 },

  // Profile
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 14,
  },
  avatar: { width: 60, height: 60, borderRadius: 16 },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: {
    fontSize: 18,
    fontFamily: 'SofiaSansCondensed-Bold',
    color: '#1a1a1a',
  },
  profileUsername: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#999',
    marginTop: 2,
  },

  // Text box — overlay trick for coloured hashtags inside TextInput
  textBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  hiddenInput: {
    // Covers the full box; text is transparent so overlay shows
    position: 'absolute',
    inset: 0,
    padding: 16,
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: 'transparent',
    minHeight: 160,
    zIndex: 2,
  },
  styledOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    minHeight: 160,
    zIndex: 1,
  },
  placeholder: {
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#aaa',
  },
  textPreview: {
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  highlighted: {
    fontFamily: 'SofiaSansCondensed-Bold',
    color: '#1a1a1a',
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  actionIcon: { width: 20, height: 20, tintColor: '#666' },
  actionBtnText: {
    fontSize: 15,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#666',
  },

  // Images — full width, paginated
  imageScroll: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  imageCard: {
    width: width - 32,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: width - 32,
    height: width - 32,
    borderRadius: 20,
  },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,120,40,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { width: 20, height: 20, tintColor: '#fff' },
  counterPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 13,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#fff',
  },

  // Tag People
  tagImageWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tagImage: {
    width: '100%',
    height: width - 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,220,195,0.35)',
    gap: 10,
  },
  searchIcon: { width: 20, height: 20, tintColor: 'rgba(255,140,50,1)' },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
  },

  // User list
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  userAvatar: { width: 58, height: 58, borderRadius: 16 },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 17,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#1a1a1a',
  },
  userRelation: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#999',
    marginTop: 2,
  },
  checkIcon: { width: 22, height: 22, tintColor: '#4CAF50' },
});

export default CreatePostScreen;