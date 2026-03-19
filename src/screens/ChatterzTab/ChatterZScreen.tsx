import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type Chat = {
  id: string;
  name: string;
  avatar?: string;
  lastMsg: string;
  time?: string;
  unread?: number | string;
  isTodo?: boolean;
  isPending?: boolean;
};

const CHATS: Chat[] = [
  { id: 'todo', name: 'My Todo List', lastMsg: '', isTodo: true, unread: '99+' },
  { id: '1', name: 'MH Kaif', avatar: 'https://i.pravatar.cc/150?img=68', lastMsg: 'Pls take a look at the images.', time: '18:31', unread: '99+' },
  { id: '2', name: 'Pritee', avatar: 'https://i.pravatar.cc/150?img=45', lastMsg: 'Where are you?', time: '17:11', unread: '99+' },
  { id: '3', name: 'Monu Kashyap', avatar: 'https://i.pravatar.cc/150?img=13', lastMsg: "Okay i'll do it later", time: '14:01' },
  { id: '4', name: 'Sristy Singh', avatar: 'https://i.pravatar.cc/150?img=44', lastMsg: 'Okay text me when you reached', time: '13:18' },
  { id: '5', name: 'Siddartha Arora', avatar: 'https://i.pravatar.cc/150?img=15', lastMsg: 'Yes yes i got this', time: '12:11' },
  { id: '6', name: 'Saumya Mishra', avatar: 'https://i.pravatar.cc/150?img=47', lastMsg: 'Okay wait', time: '11:11', isPending: true },
];

const ChatterZScreen = ({ navigation }: { navigation?: any }) => {
  const [showMenu, setShowMenu] = useState(false);

  const renderItem = ({ item }: { item: Chat }) => {
    if (item.isTodo) {
      return (
        <TouchableOpacity style={styles.chatRow} activeOpacity={0.75} onPress={() => navigation?.navigate('TodoList')}>
          <View style={styles.todoIcon}>
            <Image source={require('../../../assets/images/chat/todo1.png')} style={{ width: 58, height: 58 }} />
          </View>
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{item.name}</Text>
          </View>
          {item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    const hasUnread = !!item.unread;

    return (
      <TouchableOpacity
        style={styles.chatRow}
        activeOpacity={0.75}
        onPress={() => navigation?.navigate('ChatScreen', { chat: item })}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          {/* Name — bolder when unread */}
          <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]}>
            {item.name}
          </Text>
          {/* Last message — bold + dark when unread */}
          <Text
            style={[styles.lastMsg, hasUnread && styles.lastMsgUnread]}
            numberOfLines={1}
          >
            {item.lastMsg}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          {item.time && (
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
              {item.time}
            </Text>
          )}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
          {item.isPending && (
            <View style={styles.pendingBadge}>
              <Image source={require('../../../assets/images/chat/notsend.png')} style={{ width: 18, height: 18 }} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../../assets/images/chat/chatterz.png')} style={styles.logoIcon} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Image source={require('../../../assets/images/chat/search.png')} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowMenu(p => !p)}>
            <Image source={require('../../../assets/images/chat/add.png')} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown menu */}
      {showMenu && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setShowMenu(false); navigation?.navigate('CreateGroup'); }}
          >
            <Image source={require('../../../assets/images/chat/group.png')} style={{ width: 18, height: 18 }} />
            <Text style={styles.dropdownLabel}>Create Group</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowMenu(false); navigation?.navigate('BulkInvite'); }}>
            <Image source={require('../../../assets/images/chat/invite.png')} style={{ width: 18, height: 18 }} />
            <Text style={styles.dropdownLabel}>Bulk Invite</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={CHATS}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#e8e8e8',
  },
  logoIcon: { width: 108, height: 32, marginRight: 8 },
  headerRight: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  headerBtn: { padding: 4 },

  // Dropdown
  dropdown: {
    position: 'absolute', top: 62, right: 16, zIndex: 100,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
    minWidth: 180,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  dropdownLabel: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  dropdownDivider: { height: 0.5, backgroundColor: '#f0f0f0', marginHorizontal: 14 },

  list: { flex: 1 },

  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5',
  },
  todoIcon: {
    width: 58, height: 58, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatar: { width: 58, height: 58, borderRadius: 10, marginRight: 14 },
  chatInfo: { flex: 1 },

  // Name — normal by default
  chatName: {
    fontSize: 17,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  // Override when unread
  chatNameUnread: {
    fontFamily: 'SofiaSansCondensed-SemiBold',
  },

  // Last message — grey + regular by default
  lastMsg: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#888',
  },
  // Override when unread — bold + dark
  lastMsgUnread: {
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#1a1a1a',
  },

  chatMeta: { alignItems: 'flex-end', gap: 6 },

  // Time — grey by default
  time: {
    fontSize: 12,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#aaa',
  },
  // Override when unread — darker
  timeUnread: {
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#1a3a4a',
  },

  unreadBadge: {
    backgroundColor: '#1a3a4a', borderRadius: 12, minWidth: 28,
    paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontFamily: 'SofiaSansCondensed-Medium' },
  pendingBadge: { alignItems: 'center' },
});

export default ChatterZScreen;