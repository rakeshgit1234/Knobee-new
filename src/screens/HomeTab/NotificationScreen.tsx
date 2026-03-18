import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type NotificationType = 'like' | 'tag_photo' | 'tag_post' | 'comment' | 'follow';

type Notification = {
  id: string;
  type: NotificationType;
  actors: { name: string; avatar: string }[];
  message: string;
  time: string;
  postImage?: string;
  isRead: boolean;
  isFollowingBack?: boolean;
  // For "liked" notifications with multiple actors stacked
  extraActor?: { avatar: string };
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    actors: [
      { name: 'Pritee', avatar: 'https://i.pravatar.cc/150?img=47' },
    ],
    extraActor: { avatar: 'https://i.pravatar.cc/150?img=70' },
    message: 'Pritee, Monu and Samin liked your photo.',
    time: '40m',
    postImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80',
    isRead: false,
  },
  {
    id: '2',
    type: 'tag_photo',
    actors: [{ name: 'Saumiya', avatar: 'https://i.pravatar.cc/150?img=44' }],
    message: 'Saumiya tag you in a photo.',
    time: '3h',
    postImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80',
    isRead: false,
  },
  {
    id: '3',
    type: 'tag_post',
    actors: [{ name: 'Samrin', avatar: 'https://i.pravatar.cc/150?img=42' }],
    message: 'Samrin tag you in a post.',
    time: '3h',
    postImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80',
    isRead: true,
  },
  {
    id: '4',
    type: 'comment',
    actors: [{ name: 'Rakesh', avatar: 'https://i.pravatar.cc/150?img=68' }],
    message: 'Rakesh commented on your post.',
    time: '3h',
    postImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80',
    isRead: true,
  },
  {
    id: '5',
    type: 'follow',
    actors: [{ name: 'Rakesh', avatar: 'https://i.pravatar.cc/150?img=68' }],
    message: 'Rakesh starts following you',
    time: '3h',
    isRead: false,
    isFollowingBack: false,
  },
];

// ─── Helper: bold the actor name inside message ───────────────────────────────
const renderMessage = (notification: Notification) => {
  const { message, actors, time } = notification;
  const name = actors[0]?.name ?? '';
  const idx = message.indexOf(name);
  if (idx === -1) {
    return (
      <Text style={styles.messageText}>
        {message} <Text style={styles.timeInline}>{time}</Text>
      </Text>
    );
  }
  const before = message.slice(0, idx);
  const after = message.slice(idx + name.length);

  // Separate the trailing time from the message body
  // e.g. "Saumiya tag you in a photo. 3h" → split at ". 3h" or " 3h"
  // We keep time outside the bold span for grey colour
  const afterNoTime = after.replace(new RegExp(`\\s*\\.?\\s*${time}$`), '');
  const hasDot = after.includes('.');

  return (
    <Text style={styles.messageText}>
      {before}
      <Text style={styles.messageBold}>{name}</Text>
      {afterNoTime}
      {hasDot ? '.' : ''}{' '}
      <Text style={styles.timeInline}>{time}</Text>
    </Text>
  );
};

// ─── Notification Item ────────────────────────────────────────────────────────
const NotificationItem = ({
  item,
  onFollowBack,
}: {
  item: Notification;
  onFollowBack: (id: string) => void;
}) => {
  const isFollow = item.type === 'follow';
  const hasPost = !!item.postImage;

  return (
    <View style={[styles.item, item.isRead && styles.itemRead]}>
      {/* ── Avatar stack ── */}
      <View style={styles.avatarStack}>
        <Image
          source={{ uri: item.actors[0].avatar }}
          style={styles.mainAvatar}
        />
        {item.extraActor && (
          <Image
            source={{ uri: item.extraActor.avatar }}
            style={styles.stackedAvatar}
          />
        )}
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {renderMessage(item)}
        {/* For follow type, time is on its own line */}
        {isFollow && <Text style={styles.followTime}>{item.time}</Text>}
      </View>

      {/* ── Right side: post image OR follow back button ── */}
      {hasPost ? (
        <Image source={{ uri: item.postImage }} style={styles.postThumb} />
      ) : isFollow ? (
        <TouchableOpacity
          style={[
            styles.followBackBtn,
            item.isFollowingBack && styles.followBackBtnActive,
          ]}
          onPress={() => onFollowBack(item.id)}
        >
          <Text
            style={[
              styles.followBackText,
              item.isFollowingBack && styles.followBackTextActive,
            ]}
          >
            {item.isFollowingBack ? 'Following' : 'Follow back'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Props = { navigation?: any };

const NotificationScreen = ({ navigation }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

  const handleFollowBack = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isFollowingBack: !n.isFollowingBack } : n)),
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
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('Settings')} hitSlop={10}>
          <Image
            source={require('../../../assets/images/profile/settings.png')}
            style={styles.iconSettings}
          />
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onFollowBack={handleFollowBack} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  iconSettings: { width: 26, height: 26, tintColor: '#1a1a1a' },

  listContent: { paddingBottom: 24 },

  // Notification row
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: '#fff',
    gap: 12,
  },
  itemRead: {
    backgroundColor: '#f5f5f5',
  },

  // Avatar
  avatarStack: {
    width: 60,
    height: 60,
    position: 'relative',
    flexShrink: 0,
  },
  mainAvatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stackedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Message
  content: { flex: 1 },
  messageText: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  messageBold: {
    fontFamily: 'SofiaSansCondensed-Bold',
    color: '#1a1a1a',
  },
  timeInline: {
    fontSize: 13,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#aaa',
  },
  followTime: {
    fontSize: 13,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#aaa',
    marginTop: 3,
  },

  // Post thumbnail
  postThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    flexShrink: 0,
  },

  // Follow back button
  followBackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#5badee',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  followBackBtnActive: {
    backgroundColor: '#5badee',
    borderColor: '#5badee',
  },
  followBackText: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#5badee',
  },
  followBackTextActive: {
    color: '#fff',
  },
});

export default NotificationScreen;
