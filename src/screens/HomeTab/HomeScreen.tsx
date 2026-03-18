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

type Post = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  following: boolean;
  text: string;
  images: string[];
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
  {
    id: '1', user: 'Mh Kaif', avatar: 'https://i.pravatar.cc/150?img=68',
    time: '16 Feb 2024', following: false,
    text: 'Lost in the haze of the motel road, chasing dreams at every crossroad\n#motel #knobee #road',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    ],
    views: '999K', likes: 112, comments: 35, shares: 127, type: 'post',
  },
  {
    id: 'ad1', user: 'Samsung India', avatar: 'https://i.pravatar.cc/150?img=5',
    time: '', following: true,
    text: 'More done effortlessly, just like that. #Samsung',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80'],
    likes: 112, comments: 35, shares: 127, type: 'ad',
    adTitle: 'Galaxy AI✦ is here', adSubtitle: 'Now also available on\nGalaxy S23 Series',
    adBrand: 'Samsung India', adCta: 'Shop Now',
  },
  {
    id: '2', user: 'Mohan Vijay', avatar: 'https://i.pravatar.cc/150?img=70',
    time: '16 Feb 2024', following: true,
    text: `Beneath the stars, dreams take flight,\nWhispers of the moonlit night.\nMountains high and rivers wide,\nHearts entwined, a gentle tide.\nIn the forest, shadows dance,\nNature's song, a sweet romance.\nHand in hand, we find our place,\nIn the universe, a trace.`,
    images: [], likes: 112, comments: 35, shares: 127, type: 'post',
  },
];

// ─── Post Options Sheet ───────────────────────────────────────────────────────

const PostOptionsSheet = ({
  visible, onClose, onSave, onShare,
}: {
  visible: boolean; onClose: () => void; onSave: () => void; onShare: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 300, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 250);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={pos.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={pos.overlay} />
        </TouchableWithoutFeedback>
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
            <View style={pos.menuIconWrap}><Text style={pos.menuIconEmoji}>👤</Text></View>
            <Text style={pos.menuItemText}>About Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={pos.menuItem} onPress={() => handleAction(() => Alert.alert('Blocked', 'User has been blocked.'))} activeOpacity={0.75}>
            <View style={pos.menuIconWrap}><Text style={pos.menuIconEmoji}>🚫</Text></View>
            <Text style={pos.menuItemText}>Block User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[pos.menuItem, pos.menuItemRed, { marginBottom: 60 }]} onPress={() => handleAction(() => Alert.alert('Reported', 'Post has been reported.'))} activeOpacity={0.75}>
            <View style={pos.menuIconWrap}><Text style={pos.menuIconEmoji}>⚠️</Text></View>
            <Text style={[pos.menuItemText, pos.menuItemTextRed]}>Report Post</Text>
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
  menuItemRed: { backgroundColor: '#fff5f5', borderBottomWidth: 0 },
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
        <Text style={cs.commentText}>{reply.text}</Text>
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
  const slideAnim = useRef(new Animated.Value(height)).current;
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start();
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
          <Text style={cs.commentText}>{item.text}</Text>
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
        {/*
          ── Layout: full-screen column ──
          Row 1: Pressable backdrop (flex:1, fills all space above the sheet)
          Row 2: The sheet itself (at the bottom)
        */}
        <KeyboardAvoidingView
          style={cs.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Backdrop — fills all space above the sheet, tap closes */}
          <Pressable style={cs.backdrop} onPress={onClose} />

          {/* Sheet — sits at bottom, stops touch propagation to backdrop */}
          <Pressable style={cs.sheet} onPress={() => { /* consume touch, do nothing */ }}>
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
          </Pressable>
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
  // Full-screen column: backdrop on top, sheet at bottom
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  // Backdrop fills all space above the sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  // Sheet sits at bottom
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.78,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
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

// ─── Post Actions ─────────────────────────────────────────────────────────────

const PostActions = ({ likes, comments, shares, onComment, onShare }: {
  likes: number; comments: number; shares: number;
  onComment: () => void; onShare: () => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <View style={styles.postActions}>
      <View style={styles.postActionsLeft}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setLiked(p => !p)}>
          {!liked
            ? <Image source={require('../../../assets/images/home/like.png')} style={styles.actionImg} resizeMode="contain" />
            : <Image source={require('../../../assets/images/home/likefill.png')} style={styles.actionImg} resizeMode="contain" />
          }
          <Text style={styles.actionCount}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
          <Image source={require('../../../assets/images/home/comment.png')} style={styles.actionImg} resizeMode="contain" />
          <Text style={styles.actionCount}>{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Image source={require('../../../assets/images/home/share.png')} style={styles.actionImg} resizeMode="contain" />
          <Text style={styles.actionCount}>{shares}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setSaved(p => !p)}>
        {!saved
          ? <Image source={require('../../../assets/images/home/save.png')} style={styles.actionImg} resizeMode="contain" />
          : <Image source={require('../../../assets/images/home/savefill.png')} style={styles.actionImg} resizeMode="contain" />
        }
      </TouchableOpacity>
    </View>
  );
};

// ─── Ad Card ──────────────────────────────────────────────────────────────────

const AdCard = ({ post, onComment, onShare, onOptions }: {
  post: Post; onComment: () => void; onShare: () => void; onOptions: () => void;
}) => (
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
    <Text style={styles.postText}>{post.text}</Text>
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
    <PostActions likes={post.likes} comments={post.comments} shares={post.shares} onComment={onComment} onShare={onShare} />
  </View>
);

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({ post, onComment, onShare, onOptions }: {
  post: Post; onComment: () => void; onShare: () => void; onOptions: () => void;
}) => {
  const [following, setFollowing] = useState(post.following);
  const [currentImage, setCurrentImage] = useState(0);

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
      <Text style={styles.postText}>{post.text}</Text>
      {post.images.length > 0 && (
        <View style={styles.postImageWrapper}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {post.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.postImage} resizeMode="cover" />
            ))}
          </ScrollView>
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
        </View>
      )}
      <PostActions likes={post.likes} comments={post.comments} shares={post.shares} onComment={onComment} onShare={onShare} />
    </View>
  );
};

// ─── Story ────────────────────────────────────────────────────────────────────

// ─── 1. REPLACE the STORIES array at the top of HomeScreen.tsx ────────────────
//
// Remove the old STORIES array and import STORY_GROUPS from StoryViewScreen instead:
//
//   import StoryViewScreen, { STORY_GROUPS } from '../StoryView/StoryViewScreen';
//
// Then remove the old:
//   const STORIES = [ ... ]
//
// ─── 2. REPLACE StoryItem component entirely ──────────────────────────────────

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
        // Own story but no story yet → open gallery to add one
        navigation.navigate('StoryView', { groupIndex, mode: 'crop' });
      } else {
        // View this person's stories (only their slides, starting at slide 0)
        navigation.navigate('StoryView', { groupIndex, mode: 'view' });
      }
    }}
    style={styles.storyItem}
    activeOpacity={0.8}
  >
    <View style={styles.storyRing}>
      <Image source={{ uri: group.userAvatar }} style={styles.storyAvatar} />
      {group.isOwn && (
        // "+" → open gallery to add a new story slide
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

// ─── 3. REPLACE the FlatList in HomeScreen that renders stories ───────────────
//
//   <FlatList
//     data={STORY_GROUPS}
//     keyExtractor={g => g.userId}
//     renderItem={({ item, index }) => (
//       <StoryItem group={item} groupIndex={index} navigation={navigation} />
//     )}
//     horizontal showsHorizontalScrollIndicator={false}
//     contentContainerStyle={styles.storiesList}
//     style={styles.stories}
//   />
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

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [optionsPost, setOptionsPost] = useState<Post | null>(null);

  const handleShare = (post: Post) => {
    Share.share({ message: `${post.text}\n\nShared via KnoBee` });
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/logos/logo2.png')} style={{ width: 120, height: 30 }} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePost', { isHivePost: false })} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/plus.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('Search')} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/search.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('Notification')} style={styles.headerIconBtn}>
            <Image source={require('../../../assets/images/home/Bell.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

   <FlatList
    data={STORY_GROUPS}
    keyExtractor={g => g.userId}
    renderItem={({ item, index }) => (
      <StoryItem group={item} groupIndex={index} navigation={navigation} />
    )}
    horizontal showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.storiesList}
    style={styles.stories}
  />
        {/* <FlatList
          data={STORIES} keyExtractor={i => i.id}
          renderItem={({ item }) => <StoryItem item={item} navigation={navigation} />}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList} style={styles.stories}
        /> */}
        <View style={styles.mindBar}>
          <TouchableOpacity onPress={()=>navigation.navigate('CreatePost', { isHivePost: false, add:1 })} style={styles.mindInput} activeOpacity={0.7}>
            <Text style={styles.mindPlaceholder}>What's in your mind</Text>
            <Image source={require('../../../assets/images/home/Smiley.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {POSTS.map((post, i) => (
          <React.Fragment key={post.id}>
            {post.type === 'ad'
              ? <AdCard post={post} onComment={() => setCommentPostId(post.id)} onShare={() => handleShare(post)} onOptions={() => setOptionsPost(post)} />
              : <PostCard post={post} onComment={() => setCommentPostId(post.id)} onShare={() => handleShare(post)} onOptions={() => setOptionsPost(post)} />
            }
            {i === 0 && (
              <View style={styles.peopleSection}>
                <Text style={styles.peopleSectionTitle}>People you may know</Text>
                <FlatList
                  data={PEOPLE_YOU_MAY_KNOW} keyExtractor={p => p.id}
                  renderItem={({ item }) => <PeopleCard person={item} />}
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.peopleList}
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </ScrollView>

      <CommentSheet visible={commentPostId !== null} onClose={() => setCommentPostId(null)} />
      <PostOptionsSheet
        visible={optionsPost !== null}
        onClose={() => setOptionsPost(null)}
        onSave={() => Alert.alert('Saved', 'Post saved successfully.')}
        onShare={() => optionsPost && handleShare(optionsPost)}
      />
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
  postImageWrapper: { position: 'relative' },
  postImage: { width, height: 220 },
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