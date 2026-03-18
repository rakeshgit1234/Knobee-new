import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'Follower' | 'Following' | 'Invited' | 'Visitors';

type Person = {
  id: string;
  name: string;
  username?: string;
  avatar?: string;       // undefined = no photo (show initial avatar)
  // Follower tab
  followBack?: boolean;
  // Invited tab
  joined?: boolean;      // true = show "Joined" green text, false = show "Resend"
  // Following tab — always show Unfollow
  // Visitors tab — show Follow / Unfollow / Follow back
  visitorState?: 'follow' | 'unfollow' | 'followBack';
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const FOLLOWERS: Person[] = [
  { id: 'f1', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=11', followBack: true },
  { id: 'f2', name: 'Sak Singh', username: 'iamsaks', avatar: 'https://i.pravatar.cc/150?img=12', followBack: false },
  { id: 'f3', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=13', followBack: true },
];

const FOLLOWING: Person[] = [
  { id: 'fo1', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 'fo2', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'fo3', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=13' },
];

const INVITED: Person[] = [
  { id: 'i1', name: 'Saksham Singh', joined: false },   // no avatar → initial
  { id: 'i2', name: 'Saksham Singh', joined: false },   // no avatar → initial
  { id: 'i3', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=12', joined: true },
];

const VISITORS: Person[] = [
  { id: 'v1', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=11', visitorState: 'follow' },
  { id: 'v2', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=12', visitorState: 'unfollow' },
  { id: 'v3', name: 'Saksham Singh', username: 'iamsakshammm', avatar: 'https://i.pravatar.cc/150?img=13', visitorState: 'followBack' },
];

const TAB_DATA: Record<TabKey, Person[]> = {
  Follower: FOLLOWERS,
  Following: FOLLOWING,
  Invited: INVITED,
  Visitors: VISITORS,
};

const TABS: TabKey[] = ['Follower', 'Following', 'Invited', 'Visitors'];

// ─── Initial Avatar (grey square with letter) ─────────────────────────────────

const InitialAvatar = ({ name }: { name: string }) => (
  <View style={styles.initialAvatar}>
    <Text style={styles.initialAvatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

// ─── Follower Row ─────────────────────────────────────────────────────────────

const FollowerRow = ({ person }: { person: Person }) => {
  const [followed, setFollowed] = useState(false);
  return (
    <View style={styles.personRow}>
      <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.name}</Text>
        <Text style={styles.personUsername}>{person.username}</Text>
      </View>
      {person.followBack && !followed && (
        <TouchableOpacity style={styles.followBackBtn} onPress={() => setFollowed(true)} activeOpacity={0.8}>
          <Text style={styles.followBackText}>Follow back</Text>
        </TouchableOpacity>
      )}
      {person.followBack && followed && (
        <View style={styles.unfollowBtn}>
          <Text style={styles.unfollowText}>Unfollow</Text>
        </View>
      )}
    </View>
  );
};

// ─── Following Row ────────────────────────────────────────────────────────────

const FollowingRow = ({ person }: { person: Person }) => {
  const [unfollowed, setUnfollowed] = useState(false);
  return (
    <View style={styles.personRow}>
      <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.name}</Text>
        <Text style={styles.personUsername}>{person.username}</Text>
      </View>
      {!unfollowed ? (
        <TouchableOpacity style={styles.unfollowBtn} onPress={() => setUnfollowed(true)} activeOpacity={0.8}>
          <Text style={styles.unfollowText}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.followBtn} onPress={() => setUnfollowed(false)} activeOpacity={0.8}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Invited Row ──────────────────────────────────────────────────────────────

const InvitedRow = ({ person }: { person: Person }) => {
  const [resent, setResent] = useState(false);

  if (person.joined) {
    return (
      <View style={styles.personRow}>
        <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          {person.username ? <Text style={styles.personUsername}>{person.username}</Text> : null}
        </View>
        <Text style={styles.joinedText}>Joined</Text>
      </View>
    );
  }

  return (
    <View style={styles.personRow}>
      <InitialAvatar name={person.name} />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.name}</Text>
      </View>
      <TouchableOpacity
        style={[styles.resendBtn, resent && styles.resendBtnSent]}
        onPress={() => { if (!resent) setResent(true); }}
        activeOpacity={0.8}
      >
        <Image
          source={require('../../../assets/images/people/resend.png')}
          style={styles.resendIcon}
          resizeMode="contain"
        />
        <Text style={[styles.resendText, resent && styles.resendTextSent]}>
          {resent ? 'Sent' : 'Resend'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Visitor Row ──────────────────────────────────────────────────────────────

const VisitorRow = ({ person }: { person: Person }) => {
  const [state, setState] = useState<'follow' | 'unfollow' | 'followBack'>(person.visitorState ?? 'follow');

  const renderButton = () => {
    if (state === 'follow') {
      return (
        <TouchableOpacity style={styles.followBtn} onPress={() => setState('unfollow')} activeOpacity={0.8}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      );
    }
    if (state === 'unfollow') {
      return (
        <TouchableOpacity style={styles.unfollowBtn} onPress={() => setState('follow')} activeOpacity={0.8}>
          <Text style={styles.unfollowText}>Unfollow</Text>
        </TouchableOpacity>
      );
    }
    if (state === 'followBack') {
      return (
        <TouchableOpacity style={styles.followBackBtn} onPress={() => setState('unfollow')} activeOpacity={0.8}>
          <Text style={styles.followBackText}>Follow back</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.personRow}>
      <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.name}</Text>
        <Text style={styles.personUsername}>{person.username}</Text>
      </View>
      {renderButton()}
    </View>
  );
};

// ─── PeopleScreen ─────────────────────────────────────────────────────────────

const PeopleScreen = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Follower');
  const [searchQuery, setSearchQuery] = useState('');

  const data = TAB_DATA[activeTab];

  const filtered = searchQuery.trim()
    ? data.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.username ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  const renderRow = ({ item }: { item: Person }) => {
    if (activeTab === 'Follower') return <FollowerRow person={item} />;
    if (activeTab === 'Following') return <FollowingRow person={item} />;
    if (activeTab === 'Invited') return <InvitedRow person={item} />;
    return <VisitorRow person={item} />;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder=""
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image
            source={require('../../../assets/images/home/search.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 167, 87, 1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Regular',
    paddingVertical: 0,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: 'rgba(255, 167, 87, 1)',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    color: '#aaa',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  tabTextActive: {
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Medium',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 1,
  },

  divider: {
    height: 0.5,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // Person Row
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  personAvatar: {
    width: 62,
    height: 62,
    borderRadius: 10,
    marginRight: 14,
  },

  // Initial avatar (grey square with letter)
  initialAvatar: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: '#787878',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  initialAvatarText: {
    fontSize: 26,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-Medium',
    fontWeight: '600',
  },

  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 19,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-SemiBold',
    marginBottom: 2,
  },
  personUsername: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Follow button (blue outline, for Visitors "Follow" state)
  followBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 107, 165, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  followBtnText: {
    fontSize: 15,
    color: 'rgba(0, 107, 165, 0.8)',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Follow back button (blue outline)
  followBackBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 107, 165, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  followBackText: {
    fontSize: 15,
    color: 'rgba(0, 107, 165, 0.8)',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Unfollow button (grey outline)
  unfollowBtn: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  unfollowText: {
    fontSize: 15,
    color: '#888',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Resend button (grey outline with refresh icon)
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  resendBtnSent: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  resendIcon: {
    width: 16,
    height: 16,
    tintColor: '#888',
  },
  resendText: {
    fontSize: 15,
    color: '#888',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  resendTextSent: {
    color: '#bbb',
  },

  // Joined text (green, Invited tab)
  joinedText: {
    fontSize: 15,
    color: '#2ecc71',
    fontFamily: 'SofiaSansCondensed-Medium',
    fontWeight: '600',
  },

  // Empty
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#aaa',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
});

export default PeopleScreen;