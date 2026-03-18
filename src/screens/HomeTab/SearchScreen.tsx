import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'Name' | 'Tags' | 'Location' | 'Profession' | 'Education';

type UserResult = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tags: string[];
  location: string;
  profession: string;
  education: string;
  isFollowing: boolean;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ALL_USERS: UserResult[] = [
  {
    id: '1',
    name: 'Shubham Singh',
    username: 'iamshubhammmm',
    avatar: 'https://i.pravatar.cc/150?img=11',
    tags: ['#photography', '#travel'],
    location: 'Delhi, India',
    profession: 'Software Engineer',
    education: 'IIT Delhi',
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Shubham Verma',
    username: 'shubhamverma_',
    avatar: 'https://i.pravatar.cc/150?img=12',
    tags: ['#fitness', '#gym'],
    location: 'Mumbai, India',
    profession: 'Designer',
    education: 'NID Ahmedabad',
    isFollowing: false,
  },
  {
    id: '3',
    name: 'Shubham Raj',
    username: 'shubhamraj99',
    avatar: 'https://i.pravatar.cc/150?img=13',
    tags: ['#music', '#art'],
    location: 'Bangalore, India',
    profession: 'Product Manager',
    education: 'IIM Bangalore',
    isFollowing: false,
  },
  {
    id: '4',
    name: 'Sristy Singh',
    username: 'iamsristyyyy',
    avatar: 'https://i.pravatar.cc/300?img=45',
    tags: ['#fashion', '#lifestyle'],
    location: 'Delhi, India',
    profession: 'Content Creator',
    education: 'Delhi University',
    isFollowing: true,
  },
  {
    id: '5',
    name: 'Rakesh Kumar',
    username: 'rakeshkumar_',
    avatar: 'https://i.pravatar.cc/150?img=68',
    tags: ['#travel', '#food'],
    location: 'Pune, India',
    profession: 'Software Engineer',
    education: 'VIT Vellore',
    isFollowing: false,
  },
  {
    id: '6',
    name: 'Saumiya Patel',
    username: 'saumiya.p',
    avatar: 'https://i.pravatar.cc/150?img=44',
    tags: ['#yoga', '#wellness'],
    location: 'Ahmedabad, India',
    profession: 'Doctor',
    education: 'AIIMS Delhi',
    isFollowing: false,
  },
  {
    id: '7',
    name: 'Samrin Khan',
    username: 'samrinkhan__',
    avatar: 'https://i.pravatar.cc/150?img=42',
    tags: ['#art', '#painting'],
    location: 'Hyderabad, India',
    profession: 'Artist',
    education: 'Jamia Millia Islamia',
    isFollowing: true,
  },
  {
    id: '8',
    name: 'Priya Sharma',
    username: 'priyasharma01',
    avatar: 'https://i.pravatar.cc/150?img=47',
    tags: ['#photography', '#nature'],
    location: 'Jaipur, India',
    profession: 'Photographer',
    education: 'Symbiosis Pune',
    isFollowing: false,
  },
];

const TABS: TabKey[] = ['Name', 'Tags', 'Location', 'Profession', 'Education'];

// ─── Tab placeholders ─────────────────────────────────────────────────────────
const TAB_PLACEHOLDER: Record<TabKey, string> = {
  Name: 'Search by name…',
  Tags: 'Search by tag e.g. #travel…',
  Location: 'Search by city or country…',
  Profession: 'Search by profession…',
  Education: 'Search by college or university…',
};

// ─── Sub-label shown below name for each tab ─────────────────────────────────
const getSubLabel = (user: UserResult, tab: TabKey): string => {
  switch (tab) {
    case 'Name':       return user.username;
    case 'Tags':       return user.tags.join('  ');
    case 'Location':   return user.location;
    case 'Profession': return user.profession;
    case 'Education':  return user.education;
  }
};

// ─── Filter logic per tab ─────────────────────────────────────────────────────
const filterUsers = (users: UserResult[], query: string, tab: TabKey): UserResult[] => {
  const q = query.toLowerCase().trim();
  if (!q) return users;
  switch (tab) {
    case 'Name':
      return users.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q),
      );
    case 'Tags':
      return users.filter(u =>
        u.tags.some(t => t.toLowerCase().includes(q.replace('#', ''))),
      );
    case 'Location':
      return users.filter(u => u.location.toLowerCase().includes(q));
    case 'Profession':
      return users.filter(u => u.profession.toLowerCase().includes(q));
    case 'Education':
      return users.filter(u => u.education.toLowerCase().includes(q));
  }
};

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow = ({
  user,
  tab,
  onToggleFollow,
}: {
  user: UserResult;
  tab: TabKey;
  onToggleFollow: (id: string) => void;
}) => (
  <View style={styles.row}>
    <Image source={{ uri: user.avatar }} style={styles.avatar} />
    <View style={styles.rowInfo}>
      <Text style={styles.rowName}>{user.name}</Text>
      <Text style={styles.rowSub} numberOfLines={1}>
        {getSubLabel(user, tab)}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.followBtn, user.isFollowing && styles.followBtnActive]}
      onPress={() => onToggleFollow(user.id)}
    >
      <Text
        style={[styles.followBtnText, user.isFollowing && styles.followBtnTextActive]}
      >
        {user.isFollowing ? 'Following' : 'Follow back'}
      </Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Props = { navigation?: any };

const SearchScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Name');
  const [query, setQuery] = useState('Shubham');
  const [users, setUsers] = useState<UserResult[]>(ALL_USERS);

  const results = useMemo(
    () => filterUsers(users, query, activeTab),
    [users, query, activeTab],
  );

  const handleToggleFollow = (id: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, isFollowing: !u.isFollowing } : u)),
    );
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setQuery('');
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
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('NearbySearch')} hitSlop={10}>
          <Image
            source={require('../../../assets/images/home/filter.png')}
            style={styles.iconFilter}
          />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={TAB_PLACEHOLDER[activeTab]}
          placeholderTextColor="#bbb"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Image
          source={require('../../../assets/images/home/search.png')}
          style={styles.searchIcon}
        />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Full-width bottom border */}
        <View style={styles.tabsBorder} />
      </View>

      {/* ── Results ── */}
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserRow user={item} tab={activeTab} onToggleFollow={handleToggleFollow} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
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
  iconFilter: { width: 24, height: 24, tintColor: '#1a1a1a' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 3,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,140,50,0.6)',
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
  },
  searchIcon: { width: 22, height: 22, tintColor: 'rgba(255,140,50,1)' },

  // Tabs
  tabsWrapper: { position: 'relative',width: '100%', },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 4,
    width: '100%', // Ensure content width accommodates all tabs
  },
  tabItem: {
    paddingHorizontal: 8,
    paddingBottom: 10,
    position: 'relative',
    alignItems: 'center',
    // backgroundColor:'blue',
    width:'19%'
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#999',
  },
  tabTextActive: {
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#1a1a1a',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#888',
  },
  tabsBorder: {
    height: 0.5,
    backgroundColor: '#e8e8e8',
    marginTop: -0.5,
  },

  // List
  listContent: { paddingTop: 4, paddingBottom: 24 },

  // User row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    flexShrink: 0,
  },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: 17,
    fontFamily: 'SofiaSansCondensed-Bold',
    color: '#1a1a1a',
  },
  rowSub: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#999',
    marginTop: 2,
  },

  // Follow button
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#5badee',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  followBtnActive: {
    backgroundColor: '#5badee',
    borderColor: '#5badee',
  },
  followBtnText: {
    fontSize: 14,
    fontFamily: 'SofiaSansCondensed-SemiBold',
    color: '#5badee',
  },
  followBtnTextActive: {
    color: '#fff',
  },

  // Empty
  emptyWrap: { paddingTop: 60, alignItems: 'center' },
  emptyText: {
    fontSize: 15,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#bbb',
  },
});

export default SearchScreen;
