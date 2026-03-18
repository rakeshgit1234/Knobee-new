import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  StatusBar,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const BOTTOM_BAR_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const SHEET_FULL = height * 0.55;
const TOP_SAFE = Platform.OS === 'ios' ? 54 : 24;
const SWIPE_THRESHOLD = width * 0.3;
const SWIPE_VELOCITY = 400;

// ─── Types ────────────────────────────────────────────────────────────────────
type Viewer = { id: string; name: string; avatar: string; time: string; liked: boolean };
type StorySlide = { id: string; image: string; duration: number };

export type StoryGroup = {
  userId: string;
  userName: string;
  userAvatar: string;
  postedAt: string;
  isOwn: boolean;
  viewCount: number;
  likeCount: number;
  viewers: Viewer[];
  slides: StorySlide[];
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const STORY_GROUPS: StoryGroup[] = [
  {
    userId: 'own', userName: 'My Story', userAvatar: 'https://i.pravatar.cc/150?img=47',
    postedAt: 'Just now', isOwn: true, viewCount: 24, likeCount: 0,
    viewers: [
      { id: 'v1', name: 'Sameer Khan', avatar: 'https://i.pravatar.cc/150?img=15', time: '1 min', liked: true },
      { id: 'v2', name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?img=47', time: '3 min', liked: false },
      { id: 'v3', name: 'Rakesh Kumar', avatar: 'https://i.pravatar.cc/150?img=68', time: '5 min', liked: true },
    ],
    slides: [{ id: 's1', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=90', duration: 5000 }],
  },
  {
    userId: 'u1', userName: 'Saksham Singh', userAvatar: 'https://i.pravatar.cc/150?img=11',
    postedAt: '2 hours ago', isOwn: false, viewCount: 120, likeCount: 44, viewers: [],
    slides: [
      { id: 's1', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=90', duration: 5000 },
      { id: 's2', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', duration: 5000 },
    ],
  },
  {
    userId: 'u2', userName: 'Raghini Mishra', userAvatar: 'https://i.pravatar.cc/150?img=45',
    postedAt: '3 hours ago', isOwn: false, viewCount: 89, likeCount: 31, viewers: [],
    slides: [{ id: 's1', image: 'https://images.unsplash.com/photo-1461696114087-397271a7aedc?w=800&q=90', duration: 5000 }],
  },
  {
    userId: 'u3', userName: 'Monica Verma', userAvatar: 'https://i.pravatar.cc/150?img=44',
    postedAt: '4 hours ago', isOwn: false, viewCount: 56, likeCount: 18, viewers: [],
    slides: [
      { id: 's1', image: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&q=90', duration: 5000 },
      { id: 's2', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', duration: 5000 },
    ],
  },
  {
    userId: 'u4', userName: 'Aarav Patel', userAvatar: 'https://i.pravatar.cc/150?img=15',
    postedAt: '5 hours ago', isOwn: false, viewCount: 203, likeCount: 77, viewers: [],
    slides: [{ id: 's1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', duration: 5000 }],
  },
];

// ─── Progress Bars ────────────────────────────────────────────────────────────
const ProgressBars = React.memo(({
  total, current, progress,
}: {
  total: number; current: number; progress: Animated.Value;
}) => (
  <View style={pSt.wrap}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={pSt.track}>
        {i < current
          ? <View style={[pSt.fill, { width: '100%' }]} />
          : i === current
            ? <Animated.View style={[pSt.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            : null}
      </View>
    ))}
  </View>
));

const pSt = StyleSheet.create({
  wrap: { position: 'absolute', top: TOP_SAFE, left: 8, right: 8, flexDirection: 'row', gap: 4, zIndex: 20 },
  track: { flex: 1, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FF8C32', borderRadius: 2 },
});

// ─── Crop Screen ──────────────────────────────────────────────────────────────
const CropScreen = ({ imageUri, onPost, onBack }: { imageUri: string; onPost: () => void; onBack: () => void }) => (
  <View style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.cropHeader}>
      <TouchableOpacity onPress={onBack} hitSlop={10}>
        <Image source={require('../../../assets/images/chat/back.png')} style={styles.iconBack} />
      </TouchableOpacity>
      <Text style={styles.cropHeaderTitle}>Create Post</Text>
      <TouchableOpacity style={styles.addStoryBtn} onPress={onPost}>
        <Text style={styles.addStoryBtnText}>Add Story</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.cropImageWrap}>
      <Image source={{ uri: imageUri }} style={styles.cropImage} resizeMode="cover" />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.gridLineV, { left: '33.33%' }]} />
        <View style={[styles.gridLineV, { left: '66.66%' }]} />
        <View style={[styles.gridLineH, { top: '33.33%' }]} />
        <View style={[styles.gridLineH, { top: '66.66%' }]} />
      </View>
    </View>
  </View>
);

// ─── Person Panel ─────────────────────────────────────────────────────────────
// One full-screen story panel for a single person.
// isActive = true → timer runs. false → timer paused (neighbouring panel).

type PersonPanelProps = {
  group: StoryGroup;
  isActive: boolean;
  dragPaused: boolean;      // paused because user is swiping
  onNextPerson: () => void;
  onPrevPerson: () => void;
  onClose: () => void;
};

const PersonPanel = ({
  group, isActive, dragPaused, onNextPerson, onPrevPerson, onClose,
}: PersonPanelProps) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [holdPaused, setHoldPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const slide = group.slides[slideIndex];
  const isPaused = !isActive || dragPaused || holdPaused || sheetExpanded;

  // Reset slide when panel becomes active
  useEffect(() => {
    if (isActive) {
      setSlideIndex(0);
      setLiked(false);
      setSheetExpanded(false);
      sheetAnim.setValue(0);
    }
  }, [isActive, group.userId]);

  const advanceSlide = useCallback(() => {
    setSlideIndex(prev => {
      if (prev < group.slides.length - 1) return prev + 1;
      // All slides done → go to next person
      onNextPerson();
      return prev;
    });
  }, [group.slides.length, onNextPerson]);

  const retreatSlide = useCallback(() => {
    setSlideIndex(prev => {
      if (prev > 0) return prev - 1;
      onPrevPerson();
      return prev;
    });
  }, [onPrevPerson]);

  // Timer
  useEffect(() => {
    if (isPaused || !slide) {
      animRef.current?.stop();
      return;
    }
    progress.setValue(0);
    animRef.current?.stop();
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: slide.duration,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) advanceSlide();
    });
    return () => animRef.current?.stop();
  }, [slideIndex, isPaused]);

  const expandSheet = () => {
    setSheetExpanded(true);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: false, tension: 60, friction: 14 }).start();
  };

  const collapseSheet = () => {
    setSheetExpanded(false);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: false, tension: 60, friction: 14 }).start();
  };

  const imageHeightAnim = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height - BOTTOM_BAR_HEIGHT, height - SHEET_FULL],
  });

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_FULL, 0],
  });

  if (!slide) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {/* Story image */}
      <Animated.View style={{ height: imageHeightAnim, overflow: 'hidden' }}>
        <Image
          source={{ uri: slide.image }}
          style={{ width, height: height - BOTTOM_BAR_HEIGHT }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Progress bars */}
      <ProgressBars total={group.slides.length} current={slideIndex} progress={progress} />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={12}>
        <View style={styles.backBtnInner}>
          <Image source={require('../../../assets/images/chat/back.png')} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      {/* Tap zones (only when sheet is closed) */}
      {!sheetExpanded && (
        <View
          style={[StyleSheet.absoluteFill, { flexDirection: 'row', bottom: BOTTOM_BAR_HEIGHT, top: TOP_SAFE + 24 }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={{ flex: 1 }} activeOpacity={1}
            onPress={retreatSlide}
            onLongPress={() => setHoldPaused(true)}
            onPressOut={() => setHoldPaused(false)}
          />
          <TouchableOpacity
            style={{ flex: 1 }} activeOpacity={1}
            onPress={advanceSlide}
            onLongPress={() => setHoldPaused(true)}
            onPressOut={() => setHoldPaused(false)}
          />
        </View>
      )}

      {/* Bottom bar */}
      {!sheetExpanded && (
        <View style={styles.bottomBar}>
          <View style={styles.posterRow}>
            <Image source={{ uri: group.userAvatar }} style={styles.posterAvatar} />
            <View>
              <Text style={styles.posterName}>{group.userName}</Text>
              <Text style={styles.posterTime}>{group.postedAt}</Text>
            </View>
          </View>

          {group.isOwn ? (
            // Own story → eye + view count ONLY, never a heart
            <TouchableOpacity style={styles.statsRow} onPress={expandSheet}>
              <Image source={require('../../../assets/images/home/eye.png')} style={styles.eyeIcon} />
              <Text style={styles.statsCount}>{group.viewCount}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.statsRow} onPress={() => setLiked(l => !l)}>
              <Image
                source={liked
                  ? require('../../../assets/images/home/likefill.png')
                  : require('../../../assets/images/home/like.png')}
                style={[styles.heartIcon, liked && styles.heartLiked]}
              />
              <Text style={styles.statsCount}>{group.likeCount}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Who Viewed sheet */}
      {group.isOwn && (
        <Animated.View style={[styles.sheet, { height: SHEET_FULL, transform: [{ translateY: sheetTranslateY }] }]}>
          <TouchableOpacity style={styles.sheetHandleArea} onPress={collapseSheet} activeOpacity={1}>
            <View style={styles.sheetHandle} />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Who viewed your story</Text>
          <FlatList
            data={group.viewers}
            keyExtractor={(item, idx) => `${item.id}-${idx}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.viewerRow}>
                <View style={styles.viewerAvatarWrap}>
                  <Image source={{ uri: item.avatar }} style={styles.viewerAvatar} />
                  {item.liked && (
                    <View style={styles.heartBadge}>
                      <Text style={styles.heartBadgeText}>❤️</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.viewerName}>{item.name}</Text>
                <Text style={styles.viewerTime}>{item.time}</Text>
              </View>
            )}
          />
        </Animated.View>
      )}

      {/* Sheet backdrop */}
      {sheetExpanded && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { bottom: SHEET_FULL }]}
          activeOpacity={1}
          onPress={collapseSheet}
        />
      )}
    </View>
  );
};

// ─── Main Story View Screen ───────────────────────────────────────────────────
type Props = { navigation?: any; route?: any };

const StoryViewScreen = ({ navigation, route }: Props) => {
  const startGroupIndex: number = route?.params?.groupIndex ?? 0;
  const mode: 'crop' | 'view' = route?.params?.mode ?? 'view';

  // Crop state
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Which person is currently active
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const groupIndexRef = useRef(startGroupIndex); // stable ref for gesture handler

  // Swipe state
  // We render 3 panels side by side: [prev | current | next]
  // offsetX is the base translation (groupIndex * -width keeps current centred)
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  // Sync ref
  useEffect(() => { groupIndexRef.current = groupIndex; }, [groupIndex]);

  // ── Gallery ───────────────────────────────────────────────────────────────
  useEffect(() => { if (mode === 'crop') openGallery(); }, []);

  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const perm = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const r = await PermissionsAndroid.request(perm, {
        title: 'Photo Access', message: 'App needs access to your photos.',
        buttonPositive: 'Allow', buttonNegative: 'Deny',
      });
      return r === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  const openGallery = async () => {
    const ok = await requestAndroidPermission();
    if (!ok) { Alert.alert('Permission Denied', 'Allow photo access in Settings.'); navigation?.goBack(); return; }
    setGalleryLoading(true);
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.9 });
      if (result.didCancel || !result.assets?.length) { navigation?.goBack(); return; }
      if (result.errorCode) { Alert.alert('Error', result.errorMessage ?? 'Gallery error'); navigation?.goBack(); return; }
      setPickedImageUri(result.assets[0].uri ?? null);
    } catch { Alert.alert('Error', 'Unable to open gallery.'); navigation?.goBack(); }
    finally { setGalleryLoading(false); }
  };

  // ── Navigate between persons ──────────────────────────────────────────────
  const goToGroup = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= STORY_GROUPS.length) {
      if (nextIndex >= STORY_GROUPS.length) navigation?.goBack();
      return;
    }
    // Snap translateX to 0 immediately then update index
    translateX.setValue(0);
    setGroupIndex(nextIndex);
  }, [navigation]);

  const goNextPerson = useCallback(() => {
    const next = groupIndexRef.current + 1;
    if (next >= STORY_GROUPS.length) { navigation?.goBack(); return; }
    goToGroup(next);
  }, [goToGroup, navigation]);

  const goPrevPerson = useCallback(() => {
    const prev = groupIndexRef.current - 1;
    if (prev < 0) return;
    goToGroup(prev);
  }, [goToGroup]);

  // ── Pan responder (no gesture-handler dependency) ─────────────────────────
  const panHandlers = useRef(
    (() => {
      let startX = 0;
      return {
        onStartShouldSetResponder: () => false,
        onMoveShouldSetResponder: (_: any, g: any) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dy) < Math.abs(g.dx),
        onResponderGrant: (_: any, g: any) => {
          startX = g.x0;
          setIsDragging(true);
        },
        onResponderMove: (_: any, g: any) => {
          translateX.setValue(g.dx);
        },
        onResponderRelease: (_: any, g: any) => {
          setIsDragging(false);
          const dx = g.dx;
          const vx = g.vx;
          const cur = groupIndexRef.current;

          if ((dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY) && cur < STORY_GROUPS.length - 1) {
            // Swipe left → next person
            Animated.timing(translateX, { toValue: -width, duration: 200, useNativeDriver: true }).start(() => {
              translateX.setValue(0);
              setGroupIndex(cur + 1);
            });
          } else if ((dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY) && cur > 0) {
            // Swipe right → prev person
            Animated.timing(translateX, { toValue: width, duration: 200, useNativeDriver: true }).start(() => {
              translateX.setValue(0);
              setGroupIndex(cur - 1);
            });
          } else {
            // Snap back
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }).start();
          }
        },
        onResponderTerminate: () => {
          setIsDragging(false);
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }).start();
        },
      };
    })()
  ).current;

  // ── CROP MODE ─────────────────────────────────────────────────────────────
  if (mode === 'crop') {
    if (galleryLoading || !pickedImageUri) {
      return (
        <View style={[styles.container, styles.loadingWrap]}>
          <StatusBar barStyle="dark-content" />
          <ActivityIndicator size="large" color="#FF8C32" />
          <Text style={styles.loadingText}>Opening gallery…</Text>
        </View>
      );
    }
    return (
      <CropScreen
        imageUri={pickedImageUri}
        onBack={() => navigation?.goBack()}
        onPost={() => Alert.alert('Story Added!', 'Your story has been uploaded.', [
          { text: 'OK', onPress: () => navigation?.goBack() },
        ])}
      />
    );
  }

  // ── VIEW MODE ─────────────────────────────────────────────────────────────
  const prevGroup = groupIndex > 0 ? STORY_GROUPS[groupIndex - 1] : null;
  const currGroup = STORY_GROUPS[groupIndex];
  const nextGroup = groupIndex < STORY_GROUPS.length - 1 ? STORY_GROUPS[groupIndex + 1] : null;

  if (!currGroup) return null;

  return (
    <View style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" />

      {/*
        Render a row of up to 3 panels:
        [ prev (offset -width) | current (offset 0) | next (offset +width) ]
        translateX shifts all three together during drag.
        When drag commits we just update groupIndex and reset translateX to 0.
      */}
      <Animated.View
        style={[
          styles.panelsRow,
          { transform: [{ translateX }] },
        ]}
        pointerEvents="box-none"
      >
        {/* Previous person panel (rendered to the left) */}
        {prevGroup && (
          <View style={[styles.panel, { left: -width }]}>
            <PersonPanel
              key={`prev-${prevGroup.userId}`}
              group={prevGroup}
              isActive={false}
              dragPaused={isDragging}
              onNextPerson={goNextPerson}
              onPrevPerson={goPrevPerson}
              onClose={() => navigation?.goBack()}
            />
          </View>
        )}

        {/* Current person panel */}
        <View style={[styles.panel, { left: 0 }]}>
          <PersonPanel
            key={`curr-${currGroup.userId}`}
            group={currGroup}
            isActive={!isDragging}
            dragPaused={isDragging}
            onNextPerson={goNextPerson}
            onPrevPerson={goPrevPerson}
            onClose={() => navigation?.goBack()}
          />
        </View>

        {/* Next person panel (rendered to the right) */}
        {nextGroup && (
          <View style={[styles.panel, { left: width }]}>
            <PersonPanel
              key={`next-${nextGroup.userId}`}
              group={nextGroup}
              isActive={false}
              dragPaused={isDragging}
              onNextPerson={goNextPerson}
              onPrevPerson={goPrevPerson}
              onClose={() => navigation?.goBack()}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // The row that holds all three panels
  panelsRow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Each individual panel is absolutely positioned
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width,
  },

  loadingWrap: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },

  // Crop
  cropHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: TOP_SAFE, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8',
  },
  iconBack: { width: 24, height: 24, tintColor: '#1a1a1a' },
  cropHeaderTitle: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  addStoryBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f0f0f0' },
  addStoryBtnText: { fontSize: 14, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#555' },
  cropImageWrap: { flex: 1 },
  cropImage: { width: '100%', height: '100%' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.5)' },

  // Back button
  backBtn: { position: 'absolute', top: TOP_SAFE + 14, left: 14, zIndex: 30 },
  backBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { width: 18, height: 18, tintColor: '#fff' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: BOTTOM_BAR_HEIGHT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posterAvatar: { width: 54, height: 54, borderRadius: 14 },
  posterName: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a' },
  posterTime: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#999', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyeIcon: { width: 24, height: 24, tintColor: '#1a1a1a' },
  heartIcon: { width: 24, height: 24, tintColor: '#888' },
  heartLiked: { tintColor: '#e03131' },
  statsCount: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  // Who viewed sheet
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 16, zIndex: 30,
  },
  sheetHandleArea: { paddingVertical: 14, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' },
  sheetTitle: { fontSize: 17, fontFamily: 'SofiaSansCondensed-Bold', color: '#1a1a1a', marginBottom: 8 },
  viewerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  viewerAvatarWrap: { position: 'relative', width: 54, height: 54 },
  viewerAvatar: { width: 54, height: 54, borderRadius: 27 },
  heartBadge: {
    position: 'absolute', bottom: -4, right: -4, width: 22, height: 22,
    borderRadius: 11, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  heartBadgeText: { fontSize: 13 },
  viewerName: { flex: 1, fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  viewerTime: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa' },
});

export default StoryViewScreen;