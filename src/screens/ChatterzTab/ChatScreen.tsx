import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  senderAvatar?: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  isSystem?: boolean;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 's1', text: 'Today', sender: 'other', isSystem: true, time: '',
  },
  {
    id: '1', text: 'Hey I saw your role for acting', sender: 'other',
    senderName: 'Ravi Mittal', senderAvatar: 'https://i.pravatar.cc/150?img=68',
    time: '14:55',
  },
  {
    id: '2', text: 'Hey I saw your role for acting', sender: 'me',
    senderAvatar: 'https://i.pravatar.cc/150?img=45',
    time: '14:55', status: 'read',
  },
  {
    id: '3',
    text: 'Lorem Ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development.',
    sender: 'me',
    senderAvatar: 'https://i.pravatar.cc/150?img=45',
    time: '14:55', status: 'read',
  },
  {
    id: 's2', text: 'Rashmi Mittal added Rajeev Mittal', sender: 'other', isSystem: true, time: '',
  },
  {
    id: 's3', text: 'Last active 5 hrs ago', sender: 'other', isSystem: true, time: '',
  },
];

const AVATAR_SIZE = 36;

const ChatScreen = ({ navigation, route }: { navigation?: any; route?: any }) => {
  const chat = route?.params?.chat ?? {
    name: 'MH Kaif',
    avatar: 'https://i.pravatar.cc/150?img=68',
    isGroup: false,
    memberCount: null,
  };

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'me',
      senderAvatar: 'https://i.pravatar.cc/150?img=45',
      time: new Date().toLocaleTimeString('en', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      }),
      status: 'sent',
    };
    setMessages(p => [...p, msg]);
    setInput('');
    setShowAttach(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── Group info: is this the first/last in a consecutive run? ──────────────
  const getGroupInfo = (index: number) => {
    const msg = messages[index];
    if (msg.isSystem) return { isFirst: false, isLast: false };

    // find prev non-system
    let prevSender: string | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (!messages[i].isSystem) { prevSender = messages[i].sender; break; }
    }
    // find next non-system
    let nextSender: string | null = null;
    for (let i = index + 1; i < messages.length; i++) {
      if (!messages[i].isSystem) { nextSender = messages[i].sender; break; }
    }

    return {
      isFirst: prevSender !== msg.sender,
      isLast: nextSender !== msg.sender,
    };
  };

  const ATTACH_OPTIONS = [
    { label: 'Media',    icon: require('../../../assets/images/chat/media.png') },
    { label: 'Document', icon: require('../../../assets/images/chat/docs.png') },
    { label: 'Contact',  icon: require('../../../assets/images/chat/Contacts.png') },
    { label: 'Audio',    icon: require('../../../assets/images/chat/audio.png') },
    { label: 'Location', icon: require('../../../assets/images/chat/location.png') },
  ];

  const renderItem = ({ item, index }: { item: Message; index: number }) => {

    // ── System pill ──────────────────────────────────────────────────────────
    if (item.isSystem) {
      return (
        <View style={s.sysPill}>
          <View style={s.sysBubble}>
            <Text style={s.sysTxt}>{item.text}</Text>
          </View>
        </View>
      );
    }

    const isMe = item.sender === 'me';
    const { isFirst, isLast } = getGroupInfo(index);

    return (
      <View style={[
        s.row,
        isMe ? s.rowMe : s.rowOther,
        // tighter spacing between consecutive bubbles from same sender
        { marginBottom: isLast ? 5 : 4 },
      ]}>

        {/* ── Avatar slot (always reserves width) ── */}
        <View style={s.avatarSlot}>
          {/* Show avatar only on FIRST message of a group */}
          {isFirst ? (
            <Image
              source={{ uri: item.senderAvatar }}
              style={s.avatar}
            />
          ) : null
          /* no avatar = empty slot keeps alignment */}
        </View>

        {/* ── Bubble + time ── */}
        <View style={[s.bubbleWrap, isMe && s.bubbleWrapMe]}>
          <View style={[
            s.bubble,
            isMe ? s.bubbleMe : s.bubbleOther,
          ]}>
            <Text style={s.bubbleTxt}>{item.text}</Text>
          </View>

          {/* Time + tick only on LAST of group */}
          {isLast && (
            <View style={[s.timeRow, isMe ? s.timeRowMe : s.timeRowOther]}>
              {isMe && item.status === 'read' && (
                <Text style={s.readTick}>✓✓</Text>
              )}
              <Text style={s.timeTxt}>{item.time}</Text>
            </View>
          )}
        </View>

      </View>
    );
  };

  return (
    <View style={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={{ height: 24, width: 24 }}
          />
        </TouchableOpacity>
        <Image source={{ uri: chat.avatar }} style={s.headerAvatar} />
        <View style={s.headerInfo}>
          <Text style={s.headerName}>{chat.name}</Text>
          {chat.isGroup
            ? <Text style={s.headerSub}>Members {chat.memberCount}</Text>
            : <Text style={s.activeText}>Active</Text>
          }
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('TodoList')}
            style={s.hBtn}
          >
            <Image
              source={require('../../../assets/images/chat/todo3.png')}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation?.navigate('AudioCall', { contact: chat })}
            style={s.hBtn}
          >
            <Image
              source={require('../../../assets/images/chat/Audiocll.png')}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation?.navigate('VideoCallActive', { contact: chat })}
            style={s.hBtn}
          >
            <Image
              source={require('../../../assets/images/chat/Videocll.png')}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chat area with doodle background ── */}
      <ImageBackground
        source={require('../../../assets/images/chat/bg.png')}
        style={s.chatBg}
        resizeMode="cover"
        imageStyle={{ opacity: 0.12 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
        >
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatRef.current?.scrollToEnd({ animated: false })
            }
          />

          {/* ── Attach tray — shown instead of input when open ── */}
          {showAttach ? (
            <View style={s.attachSheetWrap}>
              {/* Orange bordered container */}
              <View style={s.attachSheet}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.attachScroll}
                >
                  {ATTACH_OPTIONS.map(opt => (
                    <TouchableOpacity key={opt.label} style={s.attachItem}>
                      <View style={s.attachIconBox}>
                        <Image source={opt.icon} style={s.attachIconImg} resizeMode="contain" />
                         <Text style={s.attachLabel}>{opt.label}</Text>
                      </View>
                     
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Close button — tapping outside or × hides tray and shows input */}
              <TouchableOpacity
                style={s.attachCloseRow}
                onPress={() => setShowAttach(false)}
              >
                <View style={s.attachCloseBar} />
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Input bar — shown when attach tray is closed ── */
            <View style={s.inputBar}>
              <TouchableOpacity
                style={s.plusBtn}
                onPress={() => setShowAttach(true)}
              >
                <Text style={s.plusTxt}>+</Text>
              </TouchableOpacity>
              <TextInput
                style={s.input}
                placeholder="Type here"
                placeholderTextColor="#bbb"
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity onPress={input.trim() ? sendMessage : undefined}>
                {input.trim() ? (
                  <Image
                    source={require('../../../assets/images/chat/send.png')}
                    style={s.micIcon}
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/chat/mic.png')}
                    style={s.micIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: 6, padding: 4 },
  headerAvatar: { width: 42, height: 42, borderRadius: 8, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a',
  },
  headerSub: {
    fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#aaa', marginTop: 1,
  },
  activeText: {
    fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#4CAF50', marginTop: 1,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  hBtn: { padding: 4 },

  // ── Chat bg ──────────────────────────────────────────────────────────────────
  chatBg: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8 },

  // ── System pill ─────────────────────────────────────────────────────────────
  sysPill: { alignItems: 'center', marginVertical: 5 },
  sysBubble: {
    backgroundColor:'transparent', borderWidth: 1, borderColor: 'rgba(170,170,170,0.75)s',

    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 2,
  },
  sysTxt: {
    fontSize: 12, fontFamily: 'SofiaSansCondensed-Regular', color: '#777',
  },

  // ── Message row ──────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',   // avatar aligns to bottom of bubble group
    paddingHorizontal: 4,
  },
  rowOther: {
    flexDirection: 'row',          // avatar LEFT
    justifyContent: 'flex-start',
  },
  rowMe: {
    flexDirection: 'row-reverse',  // avatar RIGHT
    justifyContent: 'flex-start',
  },

  // Avatar slot — fixed width always reserved so bubbles stay aligned
  avatarSlot: {
    width: AVATAR_SIZE + 8,        // 8px gap between avatar and bubble
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    paddingBottom: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2, // circular
  },

  // Bubble wrapper
  bubbleWrap: {
    maxWidth: width * 0.66,
    alignItems: 'flex-start',
  },
  bubbleWrapMe: {
    alignItems: 'flex-end',
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderColor: 'rgba(255,167,87,0.75)',
    borderTopLeftRadius: 5,   // slight sharp corner top-left
  },
  bubbleMe: {
    backgroundColor: '#fff',
    borderColor: 'rgba(255,167,87,0.75)',
    borderTopRightRadius: 5,  // slight sharp corner top-right
  },
  bubbleTxt: {
    fontSize: 15,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
    lineHeight: 20,
  },

  // Time row — outside bubble, below last of group
  timeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    marginTop: 3, paddingHorizontal: 2,
  },
  timeRowOther: { justifyContent: 'flex-start' },
  timeRowMe: { justifyContent: 'flex-end' },
  timeTxt: {
    fontSize: 11, color: '#aaa', fontFamily: 'SofiaSansCondensed-Regular',
  },
  readTick: { fontSize: 12, color: '#4CAF50' },

  // ── Attach sheet ─────────────────────────────────────────────────────────────
  attachSheetWrap: {
    backgroundColor: '#fff',
  },
  attachSheet: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 213, 103, 1)',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  attachScroll: {
    paddingHorizontal: 12,
    gap: 16,
    alignItems: 'center',
  },
  attachItem: { alignItems: 'center', width: 80 },
  attachIconBox: {
    width: 85,
    height: 85,
    borderRadius: 16,
    backgroundColor: '#9e9e9e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachIconImg: { width: 32, height: 32, tintColor: '#fff' },
  attachLabel: {
    fontSize: 13,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  attachCloseRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  attachCloseBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,167,87,1)',
    borderRadius: 28, marginHorizontal: 12, marginBottom: 12, marginTop: 4,
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: '#fff', gap: 8,
  },
  plusBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,167,87,1)',
    justifyContent: 'center', alignItems: 'center',
  },
  plusTxt: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 28 },
  input: {
    flex: 1, fontSize: 15, fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a', maxHeight: 80, paddingVertical: 2,
  },
  micIcon: { width: 25, height: 25 },
});

export default ChatScreen;