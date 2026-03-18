import React, { useState, useRef } from 'react';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  { id: '1', name: 'Saksham Singh',      username: 'iamsakshammm',  avatar: 'https://i.pravatar.cc/150?img=50', relation: 'Brother'   },
  { id: '2', name: 'Saksham Singh',      username: 'iamsakshammm2', avatar: 'https://i.pravatar.cc/150?img=51', relation: 'Following' },
  { id: '3', name: 'Saksham Singh hhhh', username: 'iamsakshammm',  avatar: 'https://i.pravatar.cc/150?img=50', relation: 'Brother'   },
  { id: '4', name: 'Saksham Singh hhu',  username: 'iamsakshammm2', avatar: 'https://i.pravatar.cc/150?img=51', relation: 'Following' },
];

type CreatePostScreenProps = {
  navigation?: any;
  route?: any;
};

// ─── Rich caption overlay ─────────────────────────────────────────────────────
// Renders @mentions in blue and #hashtags in orange on top of the hidden input.
const RichCaption = ({ text }: { text: string }) => {
  const tokens = text.split(/((?:^|\s)[@#]\w+)/g);
  return (
    <Text style={styles.overlayText}>
      {tokens.map((token, i) => {
        const trimmed = token.trimStart();
        const leading = token.slice(0, token.length - trimmed.length);
        if (trimmed.startsWith('@')) {
          return <Text key={i}>{leading}<Text style={styles.mentionText}>{trimmed}</Text></Text>;
        }
        if (trimmed.startsWith('#')) {
          return <Text key={i}>{leading}<Text style={styles.hashtagText}>{trimmed}</Text></Text>;
        }
        return <Text key={i}>{token}</Text>;
      })}
    </Text>
  );
};

// ─── Create Post Screen ───────────────────────────────────────────────────────
const CreatePostScreen = ({ navigation, route }: CreatePostScreenProps) => {
  const isHivePost  = route?.params?.isHivePost ?? false;
  const screenTitle = isHivePost ? 'Add Hive' : 'Create Post';

  const [postText, setPostText]                 = useState('');
  const [selectedImages, setSelectedImages]     = useState<SelectedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const profileData = {
    name: 'Sristy Singh',
    username: '@iamsrishiiii',
    avatar: 'https://i.pravatar.cc/300?img=45',
  };

  // ── Android permission ────────────────────────────────────────────────────
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
    } catch { return false; }
  };

  // ── Media picker ─────────────────────────────────────────────────────────
  const handleAddMedia = async () => {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please allow photo access in Settings.');
      return;
    }
    try {
      const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 10, quality: 0.8, includeBase64: false });
      if (result.didCancel) return;
      if (result.errorCode) { Alert.alert('Error', result.errorMessage ?? 'Could not open gallery'); return; }
      if (result.assets && result.assets.length > 0) {
        const newImages: SelectedImage[] = result.assets.map(a => ({ uri: a.uri ?? '', fileName: a.fileName, type: a.type }));
        setSelectedImages(prev => { const merged = [...prev, ...newImages]; setCurrentImageIndex(merged.length - 1); return merged; });
      }
    } catch { Alert.alert('Error', 'Unable to open gallery. Check app permissions.'); }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setCurrentImageIndex(Math.max(0, index - 1));
      return updated;
    });
  };

  // ── Tag people: inject @username into caption on Done ─────────────────────
  const handleTagPeople = () => {
    navigation?.navigate('TagPeople', {
      imageUri: selectedImages[currentImageIndex]?.uri,
      // ← This callback is what actually writes the mentions back
      onTagComplete: (userIds: string[]) => {
        if (userIds.length === 0) return;

        const mentions = userIds
          .map(id => SUGGESTED_USERS.find(u => u.id === id))
          .filter(Boolean)
          .map(u => `@${u!.username}`)
          .join(' ');

        setPostText(prev => {
          const sep = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + sep + mentions + ' ';
        });

        // Refocus input so cursor lands after the injected mentions
        setTimeout(() => inputRef.current?.focus(), 200);
      },
    });
  };

  const handlePost = () => {
    if (!postText.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some content or images to post.');
      return;
    }
    navigation?.goBack();
  };

  // Auto-open tag sheet when user types '@'
  const handleTextChange = (text: string) => {
    setPostText(text);
    if (text.trimEnd().endsWith('@')) handleTagPeople();
  };

  // Derive chips from text
  const taggedMentions = postText.match(/@\w+/g) ?? [];
  const taggedUsers = taggedMentions
    .map(m => SUGGESTED_USERS.find(u => `@${u.username}` === m))
    .filter(Boolean) as TaggedUser[];

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <TouchableOpacity style={styles.headerActionBtn} onPress={handlePost}>
          <Text style={styles.headerActionBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* KeyboardAwareScrollView keeps TextInput above keyboard */}
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={Platform.OS === 'ios' ? 24 : 80}
        extraHeight={120}
      >
        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileUsername}>{profileData.username}</Text>
          </View>
        </View>

        {/* ── Caption: invisible input + rich overlay ── */}
        <View style={styles.textBox}>
          {/* Overlay shows colors — pointerEvents none so input still gets taps */}
          <View style={styles.overlayLayer} pointerEvents="none">
            {postText.length === 0
              ? <Text style={styles.placeholder}>Share your thoughts…</Text>
              : <RichCaption text={postText} />
            }
          </View>
          {/* Real input — text color transparent so overlay shows through */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            placeholder=""
            multiline
            value={postText}
            onChangeText={handleTextChange}
            textAlignVertical="top"
          />
        </View>

        {/* ── Tagged user chips ── */}
        {taggedUsers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow} style={styles.chipsScroll}>
            <Text style={styles.chipsLabel}>Tagged: </Text>
            {taggedUsers.map(u => (
              <View key={u.id} style={styles.chip}>
                <Image source={{ uri: u.avatar }} style={styles.chipAvatar} />
                <Text style={styles.chipName}>{u.name.split(' ')[0]}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          {route?.params?.add === 1 && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleAddMedia}>
              <Image source={require('../../../assets/images/home/image.png')} style={styles.actionIcon} />
              <Text style={styles.actionBtnText}>Add Media</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={handleTagPeople}>
            <Image source={require('../../../assets/images/home/tag.png')} style={styles.actionIcon} />
            <Text style={styles.actionBtnText}>Tag People</Text>
          </TouchableOpacity>
        </View>

        {/* ── Image carousel ── */}
        {selectedImages.length > 0 && (
          <FlatList
            data={selectedImages}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width - 32}
            snapToAlignment="start"
            disableIntervalMomentum
            style={styles.imageScroll}
            getItemLayout={(_, index) => ({ length: width - 32, offset: (width - 32) * index, index })}
            onMomentumScrollEnd={e => setCurrentImageIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))}
            renderItem={({ item: image, index }) => (
              <View style={styles.imageCard}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveImage(index)}>
                  <Image source={require('../../../assets/images/home/Trash.png')} style={styles.deleteIcon} />
                </TouchableOpacity>
                <View style={styles.counterPill}>
                  <Text style={styles.counterText}>{index + 1}/{selectedImages.length}</Text>
                </View>
              </View>
            )}
          />
        )}

        {/* Dot indicators */}
        {selectedImages.length > 1 && (
          <View style={styles.dotsRow}>
            {selectedImages.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === currentImageIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>
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
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const selectedImage: string | null      = route?.params?.imageUri ?? null;
  const searchRef = useRef<TextInput>(null);

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
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ← KEY FIX: call the callback passed from CreatePostScreen, then go back
  const handleDone = () => {
    route?.params?.onTagComplete?.(selectedUsers);
    navigation?.goBack();
  };

  const renderUserItem = ({ item }: { item: TaggedUser }) => {
    const isSelected = selectedUsers.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUser(item.id)}
        activeOpacity={0.75}
      >
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          {item.relation && <Text style={styles.userRelation}>{item.relation}</Text>}
        </View>
        {/* Custom checkbox */}
        <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tag People</Text>
        <TouchableOpacity
          style={[styles.headerActionBtn, selectedUsers.length > 0 && styles.headerActionBtnActive]}
          onPress={handleDone}
        >
          <Text style={[styles.headerActionBtnText, selectedUsers.length > 0 && styles.headerActionBtnTextActive]}>
            Done{selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* KeyboardAwareScrollView so search bar scrolls above keyboard */}
      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={Platform.OS === 'ios' ? 24 : 80}
      >
        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileUsername}>{profileData.username}</Text>
          </View>
        </View>

        {/* ── Image preview ── */}
        {selectedImage && (
          <View style={styles.tagImageWrap}>
            <Image source={{ uri: selectedImage }} style={styles.tagImage} />
          </View>
        )}

        {/* ── Search bar ── */}
        <TouchableOpacity activeOpacity={1} style={styles.searchBar} onPress={() => searchRef.current?.focus()}>
          <Image source={require('../../../assets/images/home/search.png')} style={styles.searchIcon} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search by name or username"
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* ── Selected chips ── */}
        {selectedUsers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedPreviewRow} style={{ marginBottom: 8 }}>
            {selectedUsers.map(id => {
              const u = SUGGESTED_USERS.find(x => x.id === id);
              if (!u) return null;
              return (
                <TouchableOpacity key={id} style={styles.selectedChip} onPress={() => toggleUser(id)}>
                  <Image source={{ uri: u.avatar }} style={styles.selectedChipAvatar} />
                  <Text style={styles.selectedChipName}>{u.name.split(' ')[0]}</Text>
                  <Text style={styles.selectedChipRemove}>×</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── User list ── */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8', backgroundColor: '#fff',
  },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  headerTitle: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  headerActionBtn: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f0f0f0' },
  headerActionBtnActive: { backgroundColor: 'rgba(255,167,87,1)' },
  headerActionBtnText: { fontSize: 15, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#555' },
  headerActionBtnTextActive: { color: '#fff' },

  scrollView: { flex: 1 },

  profileSection: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 18, alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 10 },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 18, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a' },
  profileUsername: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#999', marginTop: 2 },

  // Caption box
  textBox: {
    marginHorizontal: 16, marginBottom: 10,
    minHeight: 160, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden',
  },
  // The rich-text overlay — sits behind the input, never captures touches
  overlayLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    padding: 14, minHeight: 160, zIndex: 1,
  },
  overlayText: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a', lineHeight: 24 },
  placeholder: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#bbb' },
  mentionText: { color: 'rgba(0,107,165,1)', fontFamily: 'SofiaSansCondensed-Bold' },
  hashtagText: { color: 'rgba(255,167,87,1)', fontFamily: 'SofiaSansCondensed-Bold' },
  // Real input — transparent text so overlay shows through; cursor still visible
  hiddenInput: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    padding: 14, fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular',
    minHeight: 160, zIndex: 2,
    // iOS: fully transparent   Android: near-transparent (keeps cursor visible)
    ...Platform.select({ ios: { color: 'transparent' }, android: { color: 'rgba(0,0,0,0.01)' } }),
  },

  // Tagged chips strip
  chipsScroll: { marginHorizontal: 16, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipsLabel: { fontSize: 13, color: '#999', fontFamily: 'SofiaSansCondensed-Regular' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,167,87,0.12)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,167,87,0.3)',
  },
  chipAvatar: { width: 22, height: 22, borderRadius: 11 },
  chipName: { fontSize: 13, color: 'rgba(255,130,40,1)', fontFamily: 'SofiaSansCondensed-SemiBold' },

  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#f5f5f5',
  },
  actionIcon: { width: 20, height: 20, tintColor: '#666' },
  actionBtnText: { fontSize: 15, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#666' },

  // Image carousel
  imageScroll: { marginHorizontal: 16, marginBottom: 8 },
  imageCard: { width: width - 32, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  selectedImage: { width: width - 32, height: width - 32, borderRadius: 20 },
  deleteBtn: {
    position: 'absolute', top: 12, left: 12,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,120,40,1)', justifyContent: 'center', alignItems: 'center',
  },
  deleteIcon: { width: 20, height: 20, tintColor: '#fff' },
  counterPill: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  counterText: { fontSize: 13, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#fff' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.18)' },
  dotActive: { width: 18, borderRadius: 3, backgroundColor: 'rgba(255,167,87,1)' },

  // Tag People
  tagImageWrap: { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  tagImage: { width: '100%', height: width - 32 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: 'rgba(255,220,195,0.35)', gap: 10,
  },
  searchIcon: { width: 20, height: 20, tintColor: 'rgba(255,140,50,1)' },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  searchClear: { fontSize: 16, color: '#aaa', paddingHorizontal: 4 },

  selectedPreviewRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  selectedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,167,87,0.15)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,167,87,0.4)',
  },
  selectedChipAvatar: { width: 24, height: 24, borderRadius: 12 },
  selectedChipName: { fontSize: 13, color: 'rgba(200,100,20,1)', fontFamily: 'SofiaSansCondensed-SemiBold' },
  selectedChipRemove: { fontSize: 16, color: 'rgba(200,100,20,1)' },

  userItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 14,
    borderRadius: 12, marginHorizontal: 8, marginVertical: 2,
  },
  userItemSelected: { backgroundColor: 'rgba(255,167,87,0.08)' },
  userAvatar: { width: 52, height: 52, borderRadius: 14 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  userUsername: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: 'rgba(0,107,165,0.8)', marginTop: 1 },
  userRelation: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa', marginTop: 1 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center',
  },
  checkCircleActive: { borderColor: 'rgba(255,167,87,1)', backgroundColor: 'rgba(255,167,87,1)' },
  checkMark: { color: '#fff', fontSize: 13, fontFamily: 'SofiaSansCondensed-Bold' },
  emptyText: { textAlign: 'center', color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular', fontSize: 15, marginTop: 32 },
});

export default CreatePostScreen;