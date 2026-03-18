import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Animated,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');
import StoryViewScreen, { STORY_GROUPS } from './StoryViewScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: Comment[];
};

// mediaAspect controls rendered height:
//   landscape = 16:9  (~width * 9/16)
//   portrait  = 9:16  (~width * 16/9, capped)
//   square    = 1:1
//   wide      = 2.39:1 cinematic
type MediaAspect = 'landscape' | 'portrait' | 'square' | 'wide';

type Post = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  following: boolean;
  text: string;
  images: string[];          // photo carousel
  video?: string;            // video URI (react-native-video)
  videoThumbnail?: string;   // poster shown before playback
  mediaAspect?: MediaAspect; // controls container height
  views?: string;
  likes: number;
  comments: number;
  shares: number;
  type: 'post' | 'ad';
  adTitle?: string;
  adSubtitle?: string;
  adBrand?: string;
  adCta?: string;
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const STORIES = [
  { id: '0', name: 'My Story', image: 'https://i.pravatar.cc/150?img=47', isOwn: true },
  { id: '1', name: 'Saksham Singh', image: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Saksham Singh', image: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', name: 'Raghini Mishra', image: 'https://i.pravatar.cc/150?img=45' },
  { id: '4', name: 'Monica Verma', image: 'https://i.pravatar.cc/150?img=44' },
  { id: '5', name: 'Aarav Patel', image: 'https://i.pravatar.cc/150?img=15' },
];

const PEOPLE_YOU_MAY_KNOW = [
  { id: '1', name: 'Saniya Mehra', image: 'https://i.pravatar.cc/150?img=47', status: 'Add' },
  { id: '2', name: 'Rahul Sharma', image: 'https://i.pravatar.cc/150?img=13', status: 'Invite' },
  { id: '3', name: 'Garima Tya...', image: 'https://i.pravatar.cc/150?img=46', status: 'Add' },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1', user: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?img=47',
    text: 'This is absolutely stunning! 😍', time: '2h', likes: 14, liked: false,
    replies: [
      { id: 'r1', user: 'Mh Kaif', avatar: 'https://i.pravatar.cc/150?img=68', text: 'Thank you so much! 🙏', time: '1h', likes: 3, liked: false, replies: [] },
      { id: 'r2', user: 'Neha V', avatar: 'https://i.pravatar.cc/150?img=44', text: 'Totally agree! 🌟', time: '45m', likes: 1, liked: false, replies: [] },
    ],
  },
  { id: 'c2', user: 'Aarav Patel', avatar: 'https://i.pravatar.cc/150?img=15', text: 'The vibes are immaculate here 🔥🔥', time: '3h', likes: 22, liked: false, replies: [] },
  { id: 'c3', user: 'Neha Verma', avatar: 'https://i.pravatar.cc/150?img=44', text: 'Love the composition! What camera did you use?', time: '4h', likes: 8, liked: false, replies: [] },
  { id: 'c4', user: 'Rahul Singh', avatar: 'https://i.pravatar.cc/150?img=13', text: 'Road trip goals 🚗✨', time: '5h', likes: 31, liked: false, replies: [] },
  { id: 'c5', user: 'Kavya Nair', avatar: 'https://i.pravatar.cc/150?img=45', text: 'I want to visit this place someday!', time: '6h', likes: 5, liked: false, replies: [] },
];

const POSTS: Post[] = [

  // ── 1. Landscape 16:9 photo carousel ──────────────────────────────────────
  {
    id: '1',
    user: 'Mh Kaif', avatar: 'https://i.pravatar.cc/150?img=68',
    time: '16 Feb 2024', following: false,
    text: 'Lost in the haze of the motel road, chasing dreams at every crossroad\n#motel #knobee #road',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    ],
    mediaAspect: 'landscape',
    views: '999K', likes: 112, comments: 35, shares: 127, type: 'post',
  },

  // ── AD ──────────────────────────────────────────────────────────────────
  {
    id: 'ad1', user: 'Samsung India', avatar: 'https://i.pravatar.cc/150?img=5',
    time: '', following: true,
    text: 'More done effortlessly, just like that. #Samsung',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80'],
    likes: 112, comments: 35, shares: 127, type: 'ad',
    adTitle: 'Galaxy AI✦ is here', adSubtitle: 'Now also available on\nGalaxy S23 Series',
    adBrand: 'Samsung India', adCta: 'Shop Now',
  },

  // ── 2. Text-only post ─────────────────────────────────────────────────────
  {
    id: '2',
    user: 'Mohan Vijay', avatar: 'https://i.pravatar.cc/150?img=70',
    time: '16 Feb 2024', following: true,
    text: 'Beneath the stars, dreams take flight,\nWhispers of the moonlit night.\nMountains high and rivers wide,\nHearts entwined, a gentle tide.\n\nIn the forest, shadows dance,\nNature\'s song, a sweet romance.\n#poetry #night #nature',
    images: [], likes: 89, comments: 22, shares: 14, type: 'post',
  },

  // ── 3. Portrait 9:16 video (Reel / Short style) ───────────────────────────
  {
    id: '3',
    user: 'Ananya Rao', avatar: 'https://i.pravatar.cc/150?img=47',
    time: '14 Mar 2024', following: false,
    text: 'Golden hour at Marine Drive never gets old 🌅\n#mumbai #goldenhour @marinedrive',
    images: [],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=500&q=80',
    mediaAspect: 'portrait',
    views: '2.4M', likes: 4821, comments: 312, shares: 890, type: 'post',
  },

  // ── 4. Square 1:1 single photo ───────────────────────────────────────────
  {
    id: '4',
    user: 'Priya Kapoor', avatar: 'https://i.pravatar.cc/150?img=45',
    time: '10 Mar 2024', following: true,
    text: 'Sunday brunch hits different ☕🥞\n#foodie #brunch #weekendvibes',
    images: ['https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80'],
    mediaAspect: 'square',
    likes: 540, comments: 48, shares: 19, type: 'post',
  },

  // ── 5. Landscape 16:9 video ───────────────────────────────────────────────
  {
    id: '5',
    user: 'Arjun Mehta', avatar: 'https://i.pravatar.cc/150?img=13',
    time: '8 Mar 2024', following: false,
    text: 'That drone shot I\'ve been working on for weeks 🚁\n#drone #aerial #cinematography #travel',
    images: [],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    mediaAspect: 'landscape',
    views: '87K', likes: 1923, comments: 141, shares: 203, type: 'post',
  },

  // ── 6. Wide cinematic 2.39:1 single photo ────────────────────────────────
  {
    id: '6',
    user: 'Kavya Nair', avatar: 'https://i.pravatar.cc/150?img=44',
    time: '5 Mar 2024', following: true,
    text: 'Shot on film. The Ladakh highway at 4AM is pure magic.\n#ladakh #filmphoto #roadtrip @knobee',
    images: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80'],
    mediaAspect: 'wide',
    likes: 2104, comments: 98, shares: 312, type: 'post',
  },

  // ── 7. Square multi-photo carousel (3 images) ────────────────────────────
  {
    id: '7',
    user: 'Siddharth Dev', avatar: 'https://i.pravatar.cc/150?img=15',
    time: '2 Mar 2024', following: false,
    text: 'Tokyo > anywhere 🗾\nPart 3 of my Japan series — Shibuya, Akihabara, Shinjuku\n#japan #tokyo #travel #street',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
      'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800&q=80',
    ],
    mediaAspect: 'square',
    views: '44K', likes: 3310, comments: 267, shares: 451, type: 'post',
  },

  // ── AD 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'ad2', user: 'Zomato', avatar: 'https://i.pravatar.cc/150?img=8',
    time: '', following: false,
    text: 'Your next craving is just a tap away. 🍕\n#Zomato #OrderNow',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'],
    mediaAspect: 'landscape',
    likes: 320, comments: 88, shares: 44, type: 'ad',
    adTitle: '50% off your first order', adSubtitle: 'Use code KNOBEE50 at checkout',
    adBrand: 'Zomato', adCta: 'Order Now',
  },

  // ── 8. Portrait 9:16 photo (story-style) ─────────────────────────────────
  {
    id: '8',
    user: 'Meera Joshi', avatar: 'https://i.pravatar.cc/150?img=46',
    time: '28 Feb 2024', following: true,
    text: 'Found this little café in Pondicherry and never left 🌿\n#pondicherry #cafe #slowliving',
    images: ['https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=500&q=80'],
    mediaAspect: 'portrait',
    likes: 1780, comments: 94, shares: 67, type: 'post',
  },

  // ── 9. Portrait 9:16 video (second reel) ─────────────────────────────────
  {
    id: '9',
    user: 'Rohan Das', avatar: 'https://i.pravatar.cc/150?img=12',
    time: '25 Feb 2024', following: false,
    text: 'POV: you finally visit Manali in winter ❄️🏔️\n#manali #snowtrip #travel #himalayas @rohandas',
    images: [],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
    mediaAspect: 'portrait',
    views: '1.1M', likes: 9240, comments: 703, shares: 1402, type: 'post',
  },

  // ── 10. Landscape multi-photo + wide mix ──────────────────────────────────
  {
    id: '10',
    user: 'Neha Verma', avatar: 'https://i.pravatar.cc/150?img=44',
    time: '22 Feb 2024', following: true,
    text: 'Coorg in one weekend. Rain, coffee, and zero WiFi. Best decision ever.\n#coorg #karnataka #offgrid #weekendtrip',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80',
    ],
    mediaAspect: 'landscape',
    views: '55K', likes: 2890, comments: 186, shares: 340, type: 'post',
  },

];

// ─── Save Toast ───────────────────────────────────────────────────────────────

type SaveToastProps = {
  visible: boolean;
  postImage?: string;
  onHide: () => void;
};

const SaveToast = ({ visible, postImage, onHide }: SaveToastProps) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        toastStyles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      {postImage ? (
        <Image source={{ uri: postImage }} style={toastStyles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={toastStyles.thumbnailPlaceholder}>
          <Text style={{ fontSize: 18 }}>🔖</Text>
        </View>
      )}
      <View style={toastStyles.textWrap}>
        <Text style={toastStyles.title}>Post Saved</Text>
        <Text style={toastStyles.subtitle}>Added to your saved collection</Text>
      </View>
      <View style={toastStyles.checkCircle}>
        <Text style={toastStyles.checkMark}>✓</Text>
      </View>
    </Animated.View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,167,87,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

// ─── RichText ─────────────────────────────────────────────────────────────────

const RichText = ({
  text,
  style,
  onHashtagPress,
  onMentionPress,
}: {
  text: string;
  style?: any;
  onHashtagPress?: (tag: string) => void;
  onMentionPress?: (user: string) => void;
}) => {
  // Split on hashtags and mentions, keeping the delimiters
  const tokens = text.split(/([@#][\w\u00C0-\u024F]+)/g);

  return (
    <Text style={style}>
      {tokens.map((token, i) => {
        if (token.startsWith('#')) {
          return (
            <Text
              key={i}
              style={rtStyles.hashtag}
              onPress={() => onHashtagPress?.(token.slice(1))}
            >
              {token}
            </Text>
          );
        }
        if (token.startsWith('@')) {
          return (
            <Text
              key={i}
              style={rtStyles.mention}
              onPress={() => onMentionPress?.(token.slice(1))}
            >
              {token}
            </Text>
          );
        }
        return <Text key={i}>{token}</Text>;
      })}
    </Text>
  );
};

const rtStyles = StyleSheet.create({
  hashtag: {
    color: 'rgba(255,167,87,1)',
    fontFamily: 'SofiaSansCondensed-Medium',
  },
  mention: {
    color: 'rgba(0,107,165,1)',
    fontFamily: 'SofiaSansCondensed-Medium',
  },
});

// ─── Post Options Sheet ───────────────────────────────────────────────────────

const PostOptionsSheet = ({
  visible, onClose, onSave, onShare,
}: {
  visible: boolean; onClose: () => void; onSave: () => void; onShare: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 13 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 500, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 260);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={pos.modalContainer}>
        <Animated.View style={[pos.overlay, { opacity: backdropAnim }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>
        <Animated.View style={[pos.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={pos.handle} />
          <View style={pos.topRow}>
            <TouchableOpacity style={pos.topBtn} onPress={() => handleAction(onSave)} activeOpacity={0.75}>
              <Image source={require('../../../assets/images/home/save.png')} style={pos.topBtnIcon} resizeMode="contain" />
              <Text style={pos.topBtnText}>Save Post</Text>
            </TouchableOpacity>
            <View style={pos.topDivider} />
            <TouchableOpacity style={pos.topBtn} onPress={() => handleAction(onShare)} activeOpacity={0.75}>
              <Image source={require('../../../assets/images/home/share.png')} style={pos.topBtnIcon} resizeMode="contain" />
              <Text style={pos.topBtnText}>Share Post</Text>
            </TouchableOpacity>
          </View>
          <View style={pos.sectionGap} />
          <TouchableOpacity style={pos.menuItem} onPress={() => handleAction(() => Alert.alert('About Account', 'Account details coming soon.'))} activeOpacity={0.75}>
            <Image source={require('../../../assets/images/profile/user1.png')} style={pos.topBtnIcon} resizeMode="contain" />
            <Text style={pos.menuItemText}>About Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={pos.menuItem} onPress={() => handleAction(() => Alert.alert('Blocked', 'User has been blocked.'))} activeOpacity={0.75}>
            <Image source={require('../../../assets/images/profile/block.png')} style={pos.topBtnIcon} resizeMode="contain" />
            <Text style={pos.menuItemText}>Block User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[pos.menuItem, pos.menuItemRed, { marginBottom: 60 }]} onPress={() => handleAction(() => Alert.alert('Reported', 'Post has been reported.'))} activeOpacity={0.75}>
            <Image source={require('../../../assets/images/home/warning.png')} style={pos.topBtnIcon} resizeMode="contain" />
            <Text style={[pos.menuItemText]}>Report Post</Text>
          </TouchableOpacity>
          <View style={pos.bottomSpacer} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const pos = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#f2f2f2', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 6, paddingHorizontal: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 14 },
  topRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  topBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  topDivider: { width: 0.5, backgroundColor: '#e8e8e8', marginVertical: 12 },
  topBtnIcon: { width: 20, height: 20, tintColor: '#333' },
  topBtnText: { fontSize: 15, color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Regular' },
  sectionGap: { height: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 15, gap: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  menuItemRed: { backgroundColor: 'rgba(255, 222, 222, 1)', borderBottomWidth: 0 },
  menuIconWrap: { width: 28, alignItems: 'center' },
  menuIconEmoji: { fontSize: 20 },
  menuItemText: { fontSize: 16, color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Regular' },
  menuItemTextRed: { color: '#e03131' },
  bottomSpacer: { height: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#fff5f5' },
});

// ─── Context Menu Modal ───────────────────────────────────────────────────────

type ContextMenuProps = {
  visible: boolean; onClose: () => void;
  onReport: () => void; onBlock: () => void; onDelete: () => void;
};

const ContextMenu = ({ visible, onClose, onReport, onBlock, onDelete }: ContextMenuProps) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={cm.overlay}>
        <TouchableWithoutFeedback>
          <View style={cm.menu}>
            <Text style={cm.menuTitle}>Comment Options</Text>
            {[
              { icon: '🚩', label: 'Report comment', onPress: onReport },
              { icon: '🚫', label: 'Block user', onPress: onBlock },
              { icon: '🗑️', label: 'Delete comment', onPress: onDelete },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={[cm.menuItem, i < 2 && cm.menuItemBorder]} onPress={item.onPress}>
                <Text style={cm.menuIcon}>{item.icon}</Text>
                <Text style={cm.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={cm.cancelBtn} onPress={onClose}>
              <Text style={cm.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  menu: { backgroundColor: '#fff', borderRadius: 16, width: '100%', overflow: 'hidden' },
  menuTitle: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', fontFamily: 'SofiaSansCondensed-Regular' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 15, color: '#222', fontFamily: 'SofiaSansCondensed-Regular' },
  cancelBtn: { borderTopWidth: 6, borderTopColor: '#f5f5f5', paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#888', fontFamily: 'SofiaSansCondensed-Medium' },
});

// ─── Reply Row ────────────────────────────────────────────────────────────────

type ReplyRowProps = {
  reply: Comment; onLongPress: () => void; onLike: () => void; onReply: () => void;
};

const ReplyRow = ({ reply, onLongPress, onLike, onReply }: ReplyRowProps) => (
  <TouchableOpacity activeOpacity={0.85} onLongPress={onLongPress} delayLongPress={400} style={cs.replyRow}>
    <Image source={{ uri: reply.avatar }} style={cs.replyAvatar} />
    <View style={{ flex: 1 }}>
      <View style={cs.commentBubble}>
        <Text style={cs.commentUser}>{reply.user}</Text>
        <RichText
          text={reply.text}
          style={cs.commentText}
          onHashtagPress={tag => Alert.alert('Hashtag', `#${tag}`)}
          onMentionPress={user => Alert.alert('Mention', `@${user}`)}
        />
      </View>
      <View style={cs.commentMeta}>
        <Text style={cs.commentTime}>{reply.time}</Text>
        <TouchableOpacity onPress={onLike}>
          <Text style={[cs.commentMetaBtn, reply.liked && cs.commentMetaActive]}>
            {reply.liked ? '❤️' : '🤍'} {reply.likes > 0 ? reply.likes : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReply}>
          <Text style={cs.commentMetaBtn}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Comment Sheet ────────────────────────────────────────────────────────────

const CommentSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; parentId?: string; user: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [ctxVisible, setCtxVisible] = useState(false);
  const [ctxTarget, setCtxTarget] = useState<{ id: string; parentId?: string } | null>(null);
  const slideAnim = useRef(new Animated.Value(height * 0.78)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 13 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height * 0.78, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleLongPress = (commentId: string, parentId?: string) => {
    setCtxTarget({ id: commentId, parentId });
    setCtxVisible(true);
  };

  const handleCtxClose = () => { setCtxVisible(false); setCtxTarget(null); };
  const handleCtxReport = () => { handleCtxClose(); Alert.alert('Reported', 'This comment has been reported.'); };
  const handleCtxBlock = () => { handleCtxClose(); Alert.alert('Blocked', 'User has been blocked.'); };
  const handleCtxDelete = () => {
    handleCtxClose();
    if (!ctxTarget) return;
    if (ctxTarget.parentId) {
      setComments(prev => prev.map(c =>
        c.id === ctxTarget.parentId ? { ...c, replies: c.replies.filter(r => r.id !== ctxTarget.id) } : c
      ));
    } else {
      setComments(prev => prev.filter(c => c.id !== ctxTarget.id));
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const toggleReplyLike = (parentId: string, replyId: string) => {
    setComments(prev => prev.map(c =>
      c.id === parentId
        ? { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) }
        : c
    ));
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    const entry: Comment = {
      id: `c${Date.now()}`, user: 'You', avatar: 'https://i.pravatar.cc/150?img=47',
      text: newComment.trim(), time: 'now', likes: 0, liked: false, replies: [],
    };
    if (replyingTo) {
      const targetId = replyingTo.parentId ?? replyingTo.id;
      setComments(prev => prev.map(c =>
        c.id === targetId ? { ...c, replies: [...c.replies, entry] } : c
      ));
      setExpandedReplies(prev => new Set([...prev, targetId]));
    } else {
      setComments(prev => [entry, ...prev]);
    }
    setNewComment('');
    setReplyingTo(null);
  };

  const startReply = (id: string, user: string, parentId?: string) => {
    setReplyingTo({ id, user, parentId });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <TouchableOpacity activeOpacity={0.85} onLongPress={() => handleLongPress(item.id)} delayLongPress={400} style={cs.commentRow}>
      <Image source={{ uri: item.avatar }} style={cs.commentAvatar} />
      <View style={cs.commentBody}>
        <View style={cs.commentBubble}>
          <Text style={cs.commentUser}>{item.user}</Text>
          <RichText
            text={item.text}
            style={cs.commentText}
            onHashtagPress={tag => Alert.alert('Hashtag', `#${tag}`)}
            onMentionPress={user => Alert.alert('Mention', `@${user}`)}
          />
        </View>
        <View style={cs.commentMeta}>
          <Text style={cs.commentTime}>{item.time}</Text>
          <TouchableOpacity onPress={() => toggleCommentLike(item.id)}>
            <Text style={[cs.commentMetaBtn, item.liked && cs.commentMetaActive]}>
              {item.liked ? '❤️' : '🤍'} {item.likes > 0 ? item.likes : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => startReply(item.id, item.user)}>
            <Text style={[cs.commentMetaBtn, replyingTo?.id === item.id && !replyingTo?.parentId && cs.commentMetaActive]}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
        {item.replies.length > 0 && (
          <TouchableOpacity onPress={() => toggleReplies(item.id)} style={cs.viewRepliesBtn}>
            <View style={cs.viewRepliesLine} />
            <Text style={cs.viewReplies}>
              {expandedReplies.has(item.id)
                ? `▲ Hide ${item.replies.length} ${item.replies.length === 1 ? 'reply' : 'replies'}`
                : `▼ View ${item.replies.length} ${item.replies.length === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>
        )}
        {expandedReplies.has(item.id) && item.replies.map(reply => (
          <ReplyRow
            key={reply.id} reply={reply}
            onLongPress={() => handleLongPress(reply.id, item.id)}
            onLike={() => toggleReplyLike(item.id, reply.id)}
            onReply={() => startReply(reply.id, reply.user, item.id)}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
        <KeyboardAvoidingView
          style={cs.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Animated.View
            style={[cs.backdrop, { opacity: backdropAnim }]}
            pointerEvents={visible ? 'auto' : 'none'}
          >
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Animated.View>
          <Animated.View style={[cs.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={cs.handle} />
            <Text style={cs.sheetTitle}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={c => c.id}
              renderItem={renderComment}
              contentContainerStyle={cs.commentListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
            <View style={cs.inputWrapper}>
              {replyingTo && (
                <View style={cs.replyingBanner}>
                  <Text style={cs.replyingText}>
                    Replying to <Text style={cs.replyingUser}>{replyingTo.user}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Text style={cs.replyingCancel}>✕ Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={cs.inputRow}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?img=47' }} style={cs.inputAvatar} />
                <TextInput
                  ref={inputRef}
                  style={cs.commentInput}
                  placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : 'Add a comment...'}
                  placeholderTextColor="#aaa"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity onPress={submitComment} disabled={!newComment.trim()}>
                  <Text style={[cs.sendBtn, newComment.trim() ? cs.sendBtnActive : {}]}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <ContextMenu
        visible={ctxVisible}
        onClose={handleCtxClose}
        onReport={handleCtxReport}
        onBlock={handleCtxBlock}
        onDelete={handleCtxDelete}
      />
    </>
  );
};

const cs = StyleSheet.create({
  modalContainer: { flex: 1, flexDirection: 'column', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.78, paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetTitle: { fontSize: 16, textAlign: 'left', paddingVertical: 10, fontFamily: 'SofiaSansCondensed-Bold', marginLeft: 20, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  commentListContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  commentRow: { flexDirection: 'row', marginBottom: 14 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentBody: { flex: 1 },
  commentBubble: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 10 },
  commentUser: { fontSize: 13, color: '#1a1a1a', marginBottom: 2, fontFamily: 'SofiaSansCondensed-Bold' },
  commentText: { fontSize: 13, color: '#333', lineHeight: 18, fontFamily: 'SofiaSansCondensed-Regular' },
  commentMeta: { flexDirection: 'row', gap: 12, marginTop: 6, paddingHorizontal: 2, alignItems: 'center' },
  commentTime: { fontSize: 11, color: '#aaa' },
  commentMetaBtn: { fontSize: 12, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },
  commentMetaActive: { color: 'rgba(255,167,87,1)' },
  viewRepliesBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  viewRepliesLine: { width: 24, height: 1, backgroundColor: '#ccc' },
  viewReplies: { fontSize: 12, color: 'rgba(255,167,87,1)', fontFamily: 'SofiaSansCondensed-Regular' },
  replyRow: { flexDirection: 'row', marginTop: 10, paddingLeft: 12 },
  replyAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  inputWrapper: { borderTopWidth: 0.5, borderTopColor: '#f0f0f0', marginBottom: 8 },
  replyingBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff8f0', borderTopWidth: 0.5, borderTopColor: '#ffe0b2' },
  replyingText: { fontSize: 12, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },
  replyingUser: { color: 'rgba(255,167,87,1)', fontFamily: 'SofiaSansCondensed-Medium' },
  replyingCancel: { fontSize: 12, color: 'rgba(255,167,87,1)', fontFamily: 'SofiaSansCondensed-Medium' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, maxHeight: 80, fontFamily: 'SofiaSansCondensed-Regular' },
  sendBtn: { fontSize: 14, color: '#ccc', fontWeight: '700', fontFamily: 'SofiaSansCondensed-Medium' },
  sendBtnActive: { color: 'rgba(255,167,87,1)' },
});

// ─── Animated Like Button ─────────────────────────────────────────────────────

const AnimatedLikeButton = ({
  liked,
  likes,
  onPress,
}: {
  liked: boolean;
  likes: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Bounce animation: shrink then spring back bigger, then settle
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.7, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.35, useNativeDriver: true, tension: 200, friction: 5 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.actionBtn} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {!liked
          ? <Image source={require('../../../assets/images/home/like.png')} style={styles.actionImg} resizeMode="contain" />
          : <Image source={require('../../../assets/images/home/likefill.png')} style={[styles.actionImg, { tintColor: '#e8334a' }]} resizeMode="contain" />
        }
      </Animated.View>
      <Text style={styles.actionCount}>{likes}</Text>
    </TouchableOpacity>
  );
};

// ─── Post Actions ─────────────────────────────────────────────────────────────

const PostActions = ({
  liked,
  likeCount,
  comments,
  shares,
  onLike,
  onComment,
  onShare,
  onSave,
}: {
  liked: boolean;
  likeCount: number;
  comments: number;
  shares: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}) => {
  const [saved, setSaved] = useState(false);
  const saveScaleAnim = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (!saved) {
      Animated.sequence([
        Animated.timing(saveScaleAnim, { toValue: 0.7, duration: 80, useNativeDriver: true }),
        Animated.spring(saveScaleAnim, { toValue: 1.4, useNativeDriver: true, tension: 200, friction: 5 }),
        Animated.spring(saveScaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      ]).start();
    }
    setSaved(p => !p);
    onSave();
  };

  return (
    <View style={styles.postActions}>
      <View style={styles.postActionsLeft}>
        {/* liked/likeCount come from parent — no internal like state here */}
        <AnimatedLikeButton liked={liked} likes={likeCount} onPress={onLike} />
        <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
          <Image source={require('../../../assets/images/home/comment.png')} style={styles.actionImg} resizeMode="contain" />
          <Text style={styles.actionCount}>{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Image source={require('../../../assets/images/home/share.png')} style={styles.actionImg} resizeMode="contain" />
          <Text style={styles.actionCount}>{shares}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
          {!saved
            ? <Image source={require('../../../assets/images/home/save.png')} style={styles.actionImg} resizeMode="contain" />
            : <Image source={require('../../../assets/images/home/savefill.png')} style={[styles.actionImg, { tintColor: 'rgba(255,167,87,1)' }]} resizeMode="contain" />
          }
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ─── Ad Card ──────────────────────────────────────────────────────────────────

const AdCard = ({
  post,
  onComment,
  onShare,
  onOptions,
  onSave,
}: {
  post: Post;
  onComment: () => void;
  onShare: () => void;
  onOptions: () => void;
  onSave: () => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(p => {
      setLikeCount(c => p ? c - 1 : c + 1);
      return !p;
    });
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUsername}>{post.adBrand}</Text>
          <Text style={styles.sponsoredTag}>Sponsored</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={onOptions}>
          <Text style={styles.moreDots}>⋮</Text>
        </TouchableOpacity>
      </View>
      <RichText
        text={post.text}
        style={styles.postText}
        onHashtagPress={tag => Alert.alert('Hashtag', `#${tag}`)}
        onMentionPress={user => Alert.alert('Mention', `@${user}`)}
      />
      <View style={styles.adVisual}>
        <Image source={{ uri: post.images[0] }} style={styles.adBgImage} resizeMode="cover" />
        <View style={styles.adOverlay}>
          <Text style={styles.adTitle}>{post.adTitle}</Text>
          <Text style={styles.adSubtitle}>{post.adSubtitle}</Text>
        </View>
      </View>
      <View style={styles.adOfferRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.adOfferTitle}>Offer But 1 Get 1 Free</Text>
          <Text style={styles.adOfferSub}>Galaxy AI now available, buy today till stock ends.</Text>
        </View>
        <TouchableOpacity style={styles.adCtaBtn}>
          <Text style={styles.adCtaText}>{post.adCta}</Text>
        </TouchableOpacity>
      </View>
      <PostActions
        liked={liked}
        likeCount={likeCount}
        comments={post.comments}
        shares={post.shares}
        onLike={handleLike}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
      />
    </View>
  );
};

// ─── Media height helper ─────────────────────────────────────────────────────

const getMediaHeight = (aspect?: MediaAspect): number => {
  switch (aspect) {
    case 'portrait': return Math.min(width * (16 / 9), 520); // 9:16 capped
    case 'square':   return width;                            // 1:1
    case 'wide':     return width * (1 / 2.39);              // 2.39:1 cinematic
    case 'landscape':
    default:         return width * (9 / 16);                // 16:9
  }
};

// ─── Video Player ─────────────────────────────────────────────────────────────

const VideoPlayer = ({
  uri,
  thumbnail,
  aspect,
  isActive,
  onDoubleTap,
}: {
  uri: string;
  thumbnail?: string;
  aspect?: MediaAspect;
  isActive: boolean;
  onDoubleTap: () => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  // Auto-play when scrolled into view, pause when out of view
  React.useEffect(() => {
    setPlaying(isActive);
  }, [isActive]);
  const [progress, setProgress] = useState(0);        // 0-1
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<any>(null);
  const lastTap = useRef(0);
  const controlsAnim = useRef(new Animated.Value(1)).current;

  const mediaH = getMediaHeight(aspect);

  // Auto-hide controls after 3 s of playing
  const resetControlsTimer = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (playing) {
      controlsTimer.current = setTimeout(() => {
        Animated.timing(controlsAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(
          () => setShowControls(false)
        );
      }, 3000);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onDoubleTap();
    } else {
      // Single tap → toggle controls
      if (!showControls) {
        setShowControls(true);
        controlsAnim.setValue(1);
      } else {
        // Toggle play/pause
        setPlaying(p => !p);
      }
    }
    lastTap.current = now;
    resetControlsTimer();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleTap}
      style={[vpStyles.container, { height: mediaH }]}
    >
      <Video
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={aspect === 'portrait' ? 'cover' : 'cover'}
        poster={thumbnail}
        paused={!playing}
        muted={muted}
        repeat={true}
        onProgress={({ currentTime, seekableDuration }) => {
          setDuration(seekableDuration);
          setProgress(seekableDuration > 0 ? currentTime / seekableDuration : 0);
        }}
        onEnd={() => {
          setPlaying(false);
          setProgress(0);
          setShowControls(true);
          controlsAnim.setValue(1);
        }}
      />

      {/* Gradient overlay for controls readability */}
      {/* <View style={vpStyles.gradientTop} pointerEvents="none" />
      <View style={vpStyles.gradientBottom} pointerEvents="none" /> */}

   

    <View style={vpStyles.progressTrack}>
          <View style={[vpStyles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
    </TouchableOpacity>
  );
};

const vpStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  gradientTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60,
    backgroundColor: 'transparent',
    // simple fade from black
    // real gradient needs expo-linear-gradient; we approximate with opacity
  },
  gradientBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  centerBtn: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  playIcon: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 3,
    // backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    // marginBottom: 8,
    overflow: 'hidden',
    position:'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,167,87,1)',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  muteBtn: {
    padding: 2,
  },
  muteIcon: {
    fontSize: 16,
  },
});

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  activePostId,
  onComment,
  onShare,
  onOptions,
  onSave,
}: {
  post: Post;
  activePostId: string | null;
  onComment: () => void;
  onShare: () => void;
  onOptions: () => void;
  onSave: () => void;
}) => {
  const [following, setFollowing] = useState(post.following);
  const [currentImage, setCurrentImage] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(width);

  // ── Double-tap like state ──
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const heartScaleAnim = useRef(new Animated.Value(0)).current;
  const heartOpacityAnim = useRef(new Animated.Value(0)).current;

  const triggerDoubleTapHeart = () => {
    setDoubleTapHeart(true);
    if (!liked) {
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    // Reset before animating
    heartScaleAnim.setValue(0);
    heartOpacityAnim.setValue(1);
    Animated.sequence([
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }),
      Animated.delay(600),
      Animated.timing(heartOpacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setDoubleTapHeart(false));
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      triggerDoubleTapHeart();
    }
    lastTapRef.current = now;
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <View style={styles.postUserRow}>
            <Text style={styles.postUsername}>{post.user}</Text>
            {!following && (
              <TouchableOpacity style={styles.followBtn} onPress={() => setFollowing(true)}>
                <Text style={styles.followBtnText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={onOptions}>
          <Text style={styles.moreDots}>⋮</Text>
        </TouchableOpacity>
      </View>
      <RichText
        text={post.text}
        style={styles.postText}
        onHashtagPress={tag => Alert.alert('Hashtag', `#${tag}`)}
        onMentionPress={user => Alert.alert('Mention', `@${user}`)}
      />

      {/* ── VIDEO ── */}
      {post.video ? (
        <View>
          <VideoPlayer
            uri={post.video}
            thumbnail={post.videoThumbnail}
            aspect={post.mediaAspect}
            isActive={activePostId === post.id}
            onDoubleTap={triggerDoubleTapHeart}
          />
          {doubleTapHeart && (
            <View style={pcStyles.heartOverlay} pointerEvents="none">
              <Animated.Text style={[pcStyles.heartEmoji, { opacity: heartOpacityAnim, transform: [{ scale: heartScaleAnim }] }]}>
                ❤️
              </Animated.Text>
            </View>
          )}
          {post.views && (
            <View style={styles.postViewsBadge}>
              <Text style={styles.postViews}>👁 {post.views} Views</Text>
            </View>
          )}
        </View>
      ) : post.images.length > 0 ? (
        /* ── PHOTO CAROUSEL ── */
        <View
          style={[styles.postImageWrapper, { height: getMediaHeight(post.mediaAspect) }]}
          onLayout={e => setCarouselWidth(e.nativeEvent.layout.width)}
        >
          <FlatList
            data={post.images}
            keyExtractor={(_, idx) => String(idx)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            snapToInterval={carouselWidth}
            snapToAlignment="start"
            disableIntervalMomentum
            getItemLayout={(_, index) => ({
              length: carouselWidth,
              offset: carouselWidth * index,
              index,
            })}
            onMomentumScrollEnd={e =>
              setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / carouselWidth))
            }
            renderItem={({ item: img }) => (
              <Pressable onPress={handleImageTap} style={{ width: carouselWidth }}>
                <Image
                  source={{ uri: img }}
                  style={{ width: carouselWidth, height: getMediaHeight(post.mediaAspect) }}
                  resizeMode="cover"
                />
              </Pressable>
            )}
          />

          {/* Double-tap heart overlay */}
          {doubleTapHeart && (
            <View style={pcStyles.heartOverlay} pointerEvents="none">
              <Animated.Text style={[pcStyles.heartEmoji, { opacity: heartOpacityAnim, transform: [{ scale: heartScaleAnim }] }]}>
                ❤️
              </Animated.Text>
            </View>
          )}

          {post.views && (
            <View style={styles.postViewsBadge}>
              <Text style={styles.postViews}>👁 {post.views} Views</Text>
            </View>
          )}
          {post.images.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{currentImage + 1}/{post.images.length}</Text>
            </View>
          )}

          {/* Dot indicators */}
          {post.images.length > 1 && (
            <View style={pcStyles.dotsRow}>
              {post.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[pcStyles.dot, idx === currentImage && pcStyles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <PostActions
        liked={liked}
        likeCount={likeCount}
        comments={post.comments}
        shares={post.shares}
        onLike={() => {
          setLiked(p => {
            setLikeCount(c => p ? c - 1 : c + 1);
            return !p;
          });
        }}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
      />
    </View>
  );
};

const pcStyles = StyleSheet.create({
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heartEmoji: {
    fontSize: 90,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    zIndex: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
    borderRadius: 3,
  },
});

// ─── Story ────────────────────────────────────────────────────────────────────

const StoryItem = ({
  group,
  groupIndex,
  navigation,
}: {
  group: typeof STORY_GROUPS[0];
  groupIndex: number;
  navigation: any;
}) => (
  <TouchableOpacity
    onPress={() => {
      if (group.isOwn && group.slides.length === 0) {
        navigation.navigate('StoryView', { groupIndex, mode: 'crop' });
      } else {
        navigation.navigate('StoryView', { groupIndex, mode: 'view' });
      }
    }}
    style={styles.storyItem}
    activeOpacity={0.8}
  >
    <View style={styles.storyRing}>
      <Image source={{ uri: group.userAvatar }} style={styles.storyAvatar} />
      {group.isOwn && (
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            navigation.navigate('StoryView', { groupIndex, mode: 'crop' });
          }}
          style={styles.storyAddBtn}
        >
          <Text style={styles.storyAddText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.storyName} numberOfLines={1}>{group.userName}</Text>
  </TouchableOpacity>
);

// ─── People Card ──────────────────────────────────────────────────────────────

const PeopleCard = ({ person }: { person: typeof PEOPLE_YOU_MAY_KNOW[0] }) => {
  const [added, setAdded] = useState(false);
  return (
    <View style={styles.peopleCard}>
      <Image source={{ uri: person.image }} style={styles.peopleAvatar} />
      <Text style={styles.peopleName} numberOfLines={1}>{person.name}</Text>
      <TouchableOpacity
        style={[styles.peopleActionBtn, person.status === 'Invite' ? styles.inviteBtn : styles.addBtn, added && styles.addedBtn]}
        onPress={() => setAdded(true)}
      >
        <Text style={[styles.peopleActionText, added && styles.addedBtnText]}>
          {added ? 'Added' : person.status}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity><Text style={styles.ignoreText}>Ignore</Text></TouchableOpacity>
    </View>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────

// Build a flat list data structure that interleaves posts, ads, and the
// "people you may know" section after the first post.
type FeedItem =
  | { kind: 'post'; data: Post }
  | { kind: 'ad';   data: Post }
  | { kind: 'people' };

const buildFeedItems = (): FeedItem[] => {
  const items: FeedItem[] = [];
  POSTS.forEach((post, i) => {
    items.push({ kind: post.type === 'ad' ? 'ad' : 'post', data: post });
    if (i === 0) items.push({ kind: 'people' });
  });
  return items;
};

const FEED_ITEMS = buildFeedItems();

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [optionsPost, setOptionsPost]     = useState<Post | null>(null);
  const [activePostId, setActivePostId]   = useState<string | null>(null);
  const [saveToast, setSaveToast]         = useState<{ visible: boolean; image?: string }>({ visible: false });

  const handleShare = (post: Post) => Share.share({ message: `${post.text}\n\nShared via KnoBee` });
  const handleSave  = (post: Post) => setSaveToast({ visible: true, image: post.images[0] });
  const hideSaveToast = () => setSaveToast({ visible: false });

  // ── Viewability: mark a post "active" when ≥40% is on screen ──
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    // Find first viewable post that has a video
    const videoItem = viewableItems.find(
      (v: any) => v.item?.kind === 'post' && v.item?.data?.video
    );
    setActivePostId(videoItem ? videoItem.item.data.id : null);
  }).current;

  const renderItem = ({ item, index }: { item: FeedItem; index: number }) => {
    if (item.kind === 'people') {
      return (
        <View style={styles.peopleSection}>
          <Text style={styles.peopleSectionTitle}>People you may know</Text>
          <FlatList
            data={PEOPLE_YOU_MAY_KNOW}
            keyExtractor={p => p.id}
            renderItem={({ item: p }) => <PeopleCard person={p} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleList}
          />
        </View>
      );
    }
    if (item.kind === 'ad') {
      return (
        <AdCard
          post={item.data}
          onComment={() => setCommentPostId(item.data.id)}
          onShare={() => handleShare(item.data)}
          onOptions={() => setOptionsPost(item.data)}
          onSave={() => handleSave(item.data)}
        />
      );
    }
    return (
      <PostCard
        post={item.data}
        activePostId={activePostId}
        onComment={() => setCommentPostId(item.data.id)}
        onShare={() => handleShare(item.data)}
        onOptions={() => setOptionsPost(item.data)}
        onSave={() => handleSave(item.data)}
      />
    );
  };

  const ListHeader = () => (
    <>
      <FlatList
        data={STORY_GROUPS}
        keyExtractor={g => g.userId}
        renderItem={({ item, index }) => (
          <StoryItem group={item} groupIndex={index} navigation={navigation} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
        style={styles.stories}
      />
      <View style={styles.mindBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost', { isHivePost: false, add: 0 })}
          style={styles.mindInput}
          activeOpacity={0.7}
        >
          <Text style={styles.mindPlaceholder}>What's in your mind</Text>
          <Image source={require('../../../assets/images/home/Smiley.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../../assets/images/logos/logo2.png')} style={{ width: 120, height: 30 }} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePost', { isHivePost: false,add:1 })} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/plus.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/search.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/Bell.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed — single FlatList so onViewableItemsChanged works correctly */}
      <FlatList
        data={FEED_ITEMS}
        keyExtractor={(item, i) =>
          item.kind === 'people' ? 'people' : item.kind === 'ad' ? item.data.id : item.data.id
        }
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        style={styles.feed}
        // Viewability for auto-play
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        // Performance
        removeClippedSubviews
        windowSize={5}
        maxToRenderPerBatch={4}
        initialNumToRender={4}
      />

      <CommentSheet visible={commentPostId !== null} onClose={() => setCommentPostId(null)} />
      <PostOptionsSheet
        visible={optionsPost !== null}
        onClose={() => setOptionsPost(null)}
        onSave={() => { if (optionsPost) handleSave(optionsPost); }}
        onShare={() => optionsPost && handleShare(optionsPost)}
      />
      <SaveToast visible={saveToast.visible} postImage={saveToast.image} onHide={hideSaveToast} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', backgroundColor: '#fff', marginTop: 8 },
  headerIcons: { flexDirection: 'row', gap: 6 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  feed: { flex: 1, backgroundColor: '#f7f7f7' },
  stories: { backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  storiesList: { paddingHorizontal: 12, paddingVertical: 12, gap: 14 },
  storyItem: { alignItems: 'center', width: 60 },
  storyRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2.5, borderColor: 'rgba(255,167,87,1)', padding: 2, marginBottom: 5, position: 'relative' },
  storyAvatar: { width: '100%', height: '100%', borderRadius: 28 },
  storyAddBtn: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,167,87,1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  storyAddText: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  storyName: { fontSize: 11, color: '#444', textAlign: 'center', fontFamily: 'SofiaSansCondensed-Regular', width: 64 },
  mindBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10 },
  mindInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fafafa' },
  mindPlaceholder: { fontSize: 14, color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular' },
  postCard: { backgroundColor: '#fff', marginBottom: 8, paddingTop: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 10 },
  postAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  postUserInfo: { flex: 1 },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postUsername: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Medium' },
  followBtn: { paddingHorizontal: 14, paddingVertical: 2, borderRadius: 14, borderWidth: 1, marginTop: 5, borderColor: 'rgba(0,107,165,0.5)', backgroundColor: 'rgba(0,107,165,0.05)' },
  followBtnText: { fontSize: 12, color: 'rgba(0,107,165,0.5)', fontFamily: 'SofiaSansCondensed-Regular' },
  postTime: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'SofiaSansCondensed-Regular' },
  sponsoredTag: { fontSize: 11, color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular' },
  moreBtn: { padding: 8 },
  moreDots: { fontSize: 20, color: '#888' },
  postText: { fontSize: 14, color: '#222', lineHeight: 20, paddingHorizontal: 14, marginBottom: 10, fontFamily: 'SofiaSansCondensed-Regular' },
  postImageWrapper: { position: 'relative', overflow: 'hidden' },
  postImage: { width },
  postViewsBadge: { position: 'absolute', bottom: 16, left: 10 },
  postViews: { backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  photoCountBadge: { position: 'absolute', bottom: 16, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  photoCountText: { color: '#fff', fontSize: 11 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#f0f0f0', marginTop: 6 },
  postActionsLeft: { flexDirection: 'row', gap: 16 },
  actionBtn: { flexDirection: 'column', alignItems: 'center', gap: 4 },
  actionImg: { width: 24, height: 24 },
  actionCount: { fontSize: 13, color: '#555', fontFamily: 'SofiaSansCondensed-Regular' },
  adVisual: { height: 400, position: 'relative' },
  adBgImage: { width: '100%', height: '100%' },
  adOverlay: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  adTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', fontFamily: 'SofiaSansCondensed-Medium' },
  adSubtitle: { fontSize: 13, color: '#444', textAlign: 'center', fontFamily: 'SofiaSansCondensed-Regular' },
  adOfferRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(145,145,145,1)', borderTopWidth: 0.5, borderTopColor: '#ffe0b2' },
  adOfferTitle: { fontSize: 20, color: '#fff', fontFamily: 'SofiaSansCondensed-SemiBold' },
  adOfferSub: { fontSize: 14, color: '#fff', maxWidth: width * 0.55, fontFamily: 'SofiaSansCondensed-Regular' },
  adCtaBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  adCtaText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Medium' },
  peopleSection: { backgroundColor: '#fff', paddingVertical: 14, marginBottom: 8 },
  peopleSectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 14, marginBottom: 12, fontFamily: 'SofiaSansCondensed-Medium' },
  peopleList: { paddingHorizontal: 12, gap: 10 },
  peopleCard: { width: 110, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  peopleAvatar: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  peopleName: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 8, fontFamily: 'SofiaSansCondensed-Medium' },
  peopleActionBtn: { width: '100%', paddingVertical: 6, borderRadius: 16, alignItems: 'center', marginBottom: 6 },
  addBtn: { backgroundColor: 'rgba(255,167,87,1)' },
  inviteBtn: { backgroundColor: '#4CAF50' },
  addedBtn: { backgroundColor: '#e0e0e0' },
  peopleActionText: { fontSize: 12, color: '#fff', fontWeight: '600', fontFamily: 'SofiaSansCondensed-Medium' },
  addedBtnText: { color: '#888' },
  ignoreText: { fontSize: 12, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },
  bottomTab: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e8e8e8', paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 6, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabLabel: { fontSize: 10, color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular' },
  tabLabelActive: { color: 'rgba(255,167,87,1)', fontFamily: 'SofiaSansCondensed-Medium' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,167,87,1)', marginTop: 2 },
  createTabBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,167,87,1)', justifyContent: 'center', alignItems: 'center', marginTop: -16, shadowColor: 'rgba(255,167,87,1)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});

export default HomeScreen;