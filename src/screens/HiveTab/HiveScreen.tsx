import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type PersonId = string;

type Person = {
  id: PersonId;
  name: string;
  avatar: string;
  profession: string;
  location: string;
  countryFlag: string;
  country: string;
  dob: string;
  dod?: string;
  followers: number | string;
  gender: 'male' | 'female';
  isDeceased?: boolean;
  isFollowing?: boolean;
  // Relations (ids)
  spouseId?: PersonId;
  fatherId?: PersonId;
  motherId?: PersonId;
  childrenIds?: PersonId[];
};

// ─── Family Database ──────────────────────────────────────────────────────────

const DB: Record<PersonId, Person> = {
  shubham: {
    id: 'shubham', name: 'Shubham Seth', avatar: 'https://i.pravatar.cc/150?img=70',
    profession: 'Doctor', location: 'Noida, Uttar Pradesh', countryFlag: '🇮🇳', country: 'IN',
    dob: 'Jan 15, 1960', dod: 'Feb 18, 2026', followers: 3, gender: 'male',
    isDeceased: true, spouseId: 'maya', childrenIds: ['sandhya'],
  },
  maya: {
    id: 'maya', name: 'Maya Seth', avatar: 'https://i.pravatar.cc/150?img=47',
    profession: 'Housewife', location: 'Noida, Uttar Pradesh', countryFlag: '🇮🇳', country: 'IN',
    dob: 'March 11, 1968', followers: 15, gender: 'female',
    spouseId: 'shubham', childrenIds: ['sandhya'],
  },
  sandhya: {
    id: 'sandhya', name: 'Sandhya Kohli', avatar: 'https://i.pravatar.cc/150?img=44',
    profession: 'Doctor', location: 'Noida, Uttar Pradesh', countryFlag: '🇮🇳', country: 'IN',
    dob: 'March 11, 1968', followers: 245, gender: 'female',
    fatherId: 'shubham', motherId: 'maya',
    spouseId: 'vikram',
    childrenIds: ['raghav', 'shruti'],
  },
  vikram: {
    id: 'vikram', name: 'Vikram Kohli', avatar: 'https://i.pravatar.cc/150?img=15',
    profession: 'Engineer', location: 'Noida, Uttar Pradesh', countryFlag: '🇮🇳', country: 'IN',
    dob: 'June 5, 1965', followers: 89, gender: 'male',
    spouseId: 'sandhya', childrenIds: ['raghav', 'shruti'],
  },
  raghav: {
    id: 'raghav', name: 'Raghav Kohli', avatar: 'https://i.pravatar.cc/150?img=12',
    profession: 'Student (BBA)', location: 'Bangalore', countryFlag: '🇮🇳', country: 'IN',
    dob: 'February 19, 1998', followers: 842, gender: 'male',
    isFollowing: true,
    fatherId: 'vikram', motherId: 'sandhya',
  },
  shruti: {
    id: 'shruti', name: 'Shruti Kohli', avatar: 'https://i.pravatar.cc/150?img=45',
    profession: 'Student (MBBS)', location: 'Ukraine', countryFlag: '🇺🇦', country: 'UA',
    dob: 'February 19, 1998', followers: '1K', gender: 'female',
    fatherId: 'vikram', motherId: 'sandhya',
  },
};

// ─── Card Component ───────────────────────────────────────────────────────────

type CardProps = {
  person: Person;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  width?: number;
  compact?: boolean;
};

const PersonCard = ({ person, isSelected, onPress, onLongPress, width: cardW = 170, compact }: CardProps) => {
  const cardBg = person.isDeceased ? '#c8c8c8' : person.gender === 'female' ? '#f7d0ef' : '#d0e8f7';
  const btnBg = person.isDeceased ? '#888' : person.isFollowing ? '#e0e0e0' : 'rgba(255,167,87,1)';
  const btnColor = person.isFollowing ? '#888' : '#fff';
  const btnLabel = person.isDeceased ? 'Deceased' : person.isFollowing ? 'Following' : `+ Follow | ${person.followers}`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.card, { width: cardW, backgroundColor: cardBg }, isSelected && styles.cardSelected]}
    >
      {isSelected && (
        <View style={styles.selTick}><Text style={styles.selTickText}>✓</Text></View>
      )}
      <View style={styles.cardTop}>
        <View>
          <Image source={{ uri: person.avatar }} style={[styles.cardAvatar, compact && { width: 52, height: 62 }]} />
          <View style={styles.follBadge}><Text style={styles.follBadgeText}>{person.followers}</Text></View>
        </View>
        <View style={styles.cardTopRight}>
          <Text style={[styles.cardName, compact && { fontSize: 12 }]} numberOfLines={2}>{person.name}</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: btnBg }]} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: btnColor }]} numberOfLines={1}>{btnLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardBottom}>
        <Text style={styles.cardProf} numberOfLines={1}>{person.profession}</Text>
        <View style={styles.cardLocRow}>
          <Text style={styles.cardLoc} numberOfLines={1}>{person.location}</Text>
          <Text style={styles.cardFlag}>{person.countryFlag} {person.country}</Text>
        </View>
        <View style={styles.cardDobRow}>
          <Text style={styles.dobIcon}>🎂</Text>
          <Text style={styles.cardDob}>{person.dob}</Text>
        </View>
        {person.dod && (
          <View style={styles.cardDobRow}>
            <Text style={styles.dobIcon}>🕊️</Text>
            <Text style={styles.cardDob}>{person.dod}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Small initial badge (when person has no avatar in relation) ──────────────

const InitialBadge = ({ person, onPress }: { person: Person; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.initBadge, { backgroundColor: person.gender === 'female' ? '#f7d0ef' : '#d0e8f7' }]}>
    <Text style={styles.initBadgeText}>{person.name.charAt(0)}</Text>
  </TouchableOpacity>
);

// ─── Context Menu ─────────────────────────────────────────────────────────────

const ContextMenu = ({ person, visible, onClose }: { person: Person | null; visible: boolean; onClose: () => void }) => {
  if (!person) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={cm.overlay}>
          <TouchableWithoutFeedback>
            <View style={cm.menu}>
              <View style={cm.header}>
                <Image source={{ uri: person.avatar }} style={cm.avatar} />
                <View>
                  <Text style={cm.name}>{person.name}</Text>
                  <Text style={cm.relation}>Family Member</Text>
                </View>
              </View>
              {[
                { icon: '➕', label: 'Add Hiver' },
                { icon: '👤', label: 'Profile' },
                { icon: '💬', label: 'Chattrz' },
                { icon: '📖', label: 'Diaries' },
                { icon: '🚫', label: 'Block' },
              ].map((item, i, arr) => (
                <TouchableOpacity key={i} style={[cm.item, i < arr.length - 1 && cm.itemBorder]} onPress={() => { onClose(); Alert.alert(item.label); }}>
                  <Text style={cm.icon}>{item.icon}</Text>
                  <Text style={[cm.label, item.label === 'Block' && cm.labelRed]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  menu: { backgroundColor: '#f0f0f0', borderRadius: 16, width: '100%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, backgroundColor: '#e4e4e4' },
  avatar: { width: 64, height: 64, borderRadius: 10 },
  name: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  relation: { fontSize: 13, fontFamily: 'SofiaSansCondensed-Regular', color: '#888', marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, gap: 14, backgroundColor: '#fff' },
  itemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  icon: { fontSize: 18, width: 26 },
  label: { fontSize: 16, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  labelRed: { color: '#e03131' },
});

// ─── Selection Bar ────────────────────────────────────────────────────────────

const SelectionBar = ({ selected, onClear, onNext }: { selected: Person[]; onClear: () => void; onNext: () => void }) => (
  <View style={sb.wrap}>
    <View style={sb.topRow}>
      <Text style={sb.count}>{selected.length} Selected</Text>
      <TouchableOpacity onPress={onClear}><Text style={sb.clear}>Clear</Text></TouchableOpacity>
      <TouchableOpacity style={sb.nextBtn} onPress={onNext}>
        <Text style={sb.nextTxt}>Next →</Text>
      </TouchableOpacity>
    </View>
    {selected.map(p => (
      <View key={p.id} style={sb.row}>
        <View style={sb.check}><Text style={sb.checkTxt}>✓</Text></View>
        <Image source={{ uri: p.avatar }} style={sb.avatar} />
        <Text style={sb.name}>{p.name}</Text>
      </View>
    ))}
  </View>
);

const sb = StyleSheet.create({
  wrap: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: '#ddd' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  count: { flex: 1, fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
  clear: { fontSize: 14, color: '#666', marginRight: 14, fontFamily: 'SofiaSansCondensed-Regular' },
  nextBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#fff' },
  nextTxt: { fontSize: 14, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  check: { width: 22, height: 22, borderRadius: 5, backgroundColor: 'rgba(255,167,87,1)', justifyContent: 'center', alignItems: 'center' },
  checkTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  avatar: { width: 44, height: 44, borderRadius: 8 },
  name: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
});

// ─── VLine helper ─────────────────────────────────────────────────────────────

const VLine = ({ h = 36 }: { h?: number }) => (
  <View style={{ width: 1, height: h, backgroundColor: '#999', alignSelf: 'center' }} />
);

const Arrow = () => <Text style={{ fontSize: 16, color: '#999', alignSelf: 'center', lineHeight: 20 }}>↓</Text>;

const ConnDots = () => (
  <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 4 }}>
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#a0c8e8' }} />
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#e8a0c8' }} />
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#a0c8e8' }} />
  </View>
);

// ─── HiveScreen ───────────────────────────────────────────────────────────────

const CARD_W = 168;
const SPOUSE_PEEK = 50; // how many px of spouse card peeks out

const HiveScreen = ({ navigation }: { navigation?: any }) => {
  const [focusId, setFocusId] = useState<PersonId>('sandhya');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<PersonId[]>([]);
  const [contextPerson, setContextPerson] = useState<Person | null>(null);
  const [showContext, setShowContext] = useState(false);

  const focused = DB[focusId] ?? DB['sandhya']; // fallback to root if id not found
  const father = focused?.fatherId && DB[focused.fatherId] ? DB[focused.fatherId] : null;
  const mother = focused?.motherId && DB[focused.motherId] ? DB[focused.motherId] : null;
  const spouse = focused?.spouseId && DB[focused.spouseId] ? DB[focused.spouseId] : null;
  const children = (focused?.childrenIds ?? []).map(id => DB[id]).filter((p): p is Person => !!p);

  // ── Navigate: tap another card to make them the focus ──
  const navigateTo = (id: PersonId) => {
    if (!DB[id]) return; // guard: don't navigate to unknown ids
    if (selectMode) { toggleSelect(id); return; }
    setFocusId(id);
  };

  const handleLongPress = (id: PersonId) => {
    if (!DB[id]) return;
    if (!selectMode) setSelectMode(true);
    toggleSelect(id);
  };

  const toggleSelect = (id: PersonId) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      if (next.length === 0) setSelectMode(false);
      return next;
    });
  };

  const clearSelect = () => { setSelectedIds([]); setSelectMode(false); };

  const openContext = (person: Person) => {
    if (!person) return;
    if (selectMode) { toggleSelect(person.id); return; }
    setContextPerson(person);
    setShowContext(true);
  };

  const selectedPeople = selectedIds.map(id => DB[id]).filter(Boolean);

  if (!focused) return null;

  // ── Determine if parents row should show ──
  const hasParents = !!(father || mother);
  const hasChildren = children.length > 0;

  return (
    <View style={hv.container}>
      {/* ── Header ── */}
      <View style={hv.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={hv.hBtn}>
          <Text style={hv.hIcon}>🏠</Text>
        </TouchableOpacity>
        <View style={hv.hRight}>
          <TouchableOpacity style={hv.hBtn}><Text style={hv.hIcon}>🔍</Text></TouchableOpacity>
          <TouchableOpacity style={hv.addBtn}>
            <Text style={hv.addTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Tree ── */}
      <ScrollView
        style={hv.scroll}
        contentContainerStyle={hv.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >

        {/* ═══ GENERATION 1: Parents ═══ */}
        {hasParents && (
          <>
            <View style={hv.parentsRow}>
              {father ? (
                <PersonCard
                  person={father}
                  isSelected={selectedIds.includes(father.id)}
                  onPress={() => navigateTo(father.id)}
                  onLongPress={() => handleLongPress(father.id)}
                  width={CARD_W}
                />
              ) : <View style={{ width: CARD_W }} />}

              {/* Heart connector */}
              <View style={hv.heartWrap}>
                <Text style={hv.heartTxt}>❤️</Text>
              </View>

              {mother ? (
                <PersonCard
                  person={mother}
                  isSelected={selectedIds.includes(mother.id)}
                  onPress={() => navigateTo(mother.id)}
                  onLongPress={() => handleLongPress(mother.id)}
                  width={CARD_W}
                />
              ) : <View style={{ width: CARD_W }} />}
            </View>

            {/* Connector: parents → focused */}
            <View style={hv.connBlock}>
              <ConnDots />
              {/* Horizontal arms meeting in middle */}
              <View style={hv.armRow}>
                <View style={hv.armLeft} />
                <View style={hv.armRight} />
              </View>
              <VLine h={28} />
              <Arrow />
            </View>
          </>
        )}

        {/* ═══ GENERATION 2: FOCUSED PERSON (center) + SPOUSE peeking behind ═══ */}
        <View style={hv.focusRow}>

          {/* Left side buttons (from original screenshots — relation shortcuts) */}
          <View style={hv.sideButtons}>
            {father && (
              <TouchableOpacity style={hv.sideBtn} onPress={() => navigateTo(father.id)}>
                <Text style={hv.sideBtnTxt}>{father.name.charAt(0)}</Text>
              </TouchableOpacity>
            )}
            {mother && (
              <TouchableOpacity style={[hv.sideBtn, { backgroundColor: '#f7d0ef', marginTop: 8 }]} onPress={() => navigateTo(mother.id)}>
                <Text style={hv.sideBtnTxt}>{mother.name.charAt(0)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Focused card + spouse card peeking behind/beside */}
          <View style={hv.focusWithSpouse}>
            {/* Spouse card — peeking from behind on the right */}
            {spouse && (
              <View style={hv.spousePeek}>
                <PersonCard
                  person={spouse}
                  isSelected={selectedIds.includes(spouse.id)}
                  onPress={() => navigateTo(spouse.id)}
                  onLongPress={() => handleLongPress(spouse.id)}
                  width={CARD_W}
                />
              </View>
            )}

            {/* Focused person card (on top) */}
            <View style={hv.focusCard}>
              <PersonCard
                person={focused}
                isSelected={selectedIds.includes(focused.id)}
                onPress={() => openContext(focused)}
                onLongPress={() => handleLongPress(focused.id)}
                width={CARD_W}
              />
              {/* Extra birthday row shown below focused card (as in screenshots) */}
              {focused.dob && (
                <View style={hv.extraDob}>
                  <Text style={hv.extraDobIcon}>🎂</Text>
                  <Text style={hv.extraDobTxt}>February 19, 1998</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right side buttons */}
          <View style={hv.sideButtons}>
            {spouse && (
              <TouchableOpacity style={[hv.sideBtn, { backgroundColor: spouse.gender === 'female' ? '#f7d0ef' : '#d0e8f7' }]} onPress={() => navigateTo(spouse.id)}>
                <Text style={hv.sideBtnTxt}>{spouse.name.charAt(0)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ═══ Connector: focused → children ═══ */}
        {hasChildren && (
          <View style={hv.connBlock}>
            <VLine h={28} />
            {/* T-split for multiple children */}
            {children.length > 1 ? (
              <>
                <ConnDots />
                <View style={hv.splitRow}>
                  <View style={hv.splitLeft} />
                  <View style={hv.splitRight} />
                </View>
                <View style={hv.twoArrows}>
                  {children.map(() => <Arrow key={Math.random()} />)}
                </View>
              </>
            ) : (
              <Arrow />
            )}
          </View>
        )}

        {/* ═══ GENERATION 3: Children ═══ */}
        {hasChildren && (
          <View style={hv.childrenRow}>
            {children.map((child, i) => (
              <React.Fragment key={child.id}>
                {i > 0 && <View style={{ width: 16 }} />}
                <View>
                  <PersonCard
                    person={child}
                    isSelected={selectedIds.includes(child.id)}
                    onPress={() => navigateTo(child.id)}
                    onLongPress={() => handleLongPress(child.id)}
                    width={CARD_W}
                  />
                  {/* Extra dob strip visible below child card */}
                  <View style={hv.childExtraDob}>
                    <Text style={hv.extraDobIcon}>🎂</Text>
                    <Text style={hv.extraDobTxt}>{child.dob}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Add Hiver */}
        <TouchableOpacity style={hv.addHiver} activeOpacity={0.8}>
          <View style={hv.addHiverCircle}>
            <Text style={hv.addHiverPlus}>+</Text>
          </View>
          <Text style={hv.addHiverTxt}>Add Hiver</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Selection Bar ── */}
      {selectMode && selectedPeople.length > 0 && (
        <SelectionBar
          selected={selectedPeople}
          onClear={clearSelect}
          onNext={() => Alert.alert('Next', `${selectedPeople.length} members selected`)}
        />
      )}

      {/* ── Context Menu ── */}
      <ContextMenu
        person={contextPerson}
        visible={showContext}
        onClose={() => setShowContext(false)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSelected: { borderWidth: 2.5, borderColor: 'rgba(255,167,87,1)' },
  selTick: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,167,87,1)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  selTickText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardTop: { flexDirection: 'row', padding: 10, gap: 8 },
  cardAvatar: { width: 60, height: 70, borderRadius: 8 },
  follBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1,
  },
  follBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'SofiaSansCondensed-Regular' },
  cardTopRight: { flex: 1, justifyContent: 'space-between' },
  cardName: { fontSize: 14, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a', lineHeight: 18 },
  actionBtn: { borderRadius: 14, paddingHorizontal: 7, paddingVertical: 4, marginTop: 4 },
  actionBtnText: { fontSize: 10, fontFamily: 'SofiaSansCondensed-Regular', textAlign: 'center' },
  cardDivider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 10 },
  cardBottom: { padding: 10 },
  cardProf: { fontSize: 12, fontFamily: 'SofiaSansCondensed-Regular', color: '#555', marginBottom: 2 },
  cardLocRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  cardLoc: { fontSize: 10, fontFamily: 'SofiaSansCondensed-Regular', color: '#777', flex: 1 },
  cardFlag: { fontSize: 10, fontFamily: 'SofiaSansCondensed-Regular', color: '#777' },
  cardDobRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dobIcon: { fontSize: 10 },
  cardDob: { fontSize: 10, fontFamily: 'SofiaSansCondensed-Regular', color: '#888' },
  initBadge: {
    width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  initBadgeText: { fontSize: 18, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },
});

const hv = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6f0' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#faf6f0', borderBottomWidth: 0.5, borderBottomColor: '#e8e0d8',
  },
  hBtn: { padding: 4 },
  hIcon: { fontSize: 22 },
  hRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center',
  },
  addTxt: { color: '#fff', fontSize: 22, lineHeight: 28, fontWeight: '400' },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 28, paddingBottom: 60, alignItems: 'center', paddingHorizontal: 12 },

  // Parents row
  parentsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  heartWrap: { justifyContent: 'center', paddingHorizontal: 6, paddingTop: 28 },
  heartTxt: { fontSize: 20 },

  // Connector
  connBlock: { alignItems: 'center', paddingVertical: 4, width: '100%' },
  armRow: { flexDirection: 'row', width: CARD_W * 2 + 32, justifyContent: 'center' },
  armLeft: { width: CARD_W / 2, height: 1, backgroundColor: '#999', marginTop: 0 },
  armRight: { width: CARD_W / 2, height: 1, backgroundColor: '#999' },
  splitRow: { flexDirection: 'row', width: CARD_W * 2 + 16, height: 30 },
  splitLeft: { flex: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#999', borderBottomLeftRadius: 4 },
  splitRight: { flex: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#999', borderBottomRightRadius: 4 },
  twoArrows: { flexDirection: 'row', width: CARD_W * 2 + 16, justifyContent: 'space-between', paddingHorizontal: CARD_W / 2 - 10 },

  // Focus row
  focusRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%' },

  sideButtons: { width: 44, paddingTop: 20, alignItems: 'center', gap: 8 },
  sideBtn: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#d0e8f7',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  sideBtnTxt: { fontSize: 16, fontFamily: 'SofiaSansCondensed-SemiBold', color: '#1a1a1a' },

  // Focused card + spouse peek
  focusWithSpouse: {
    position: 'relative',
    width: CARD_W + SPOUSE_PEEK + 8,
    alignItems: 'flex-start',
  },
  // Spouse card sits behind and to the right, slightly offset down
  spousePeek: {
    position: 'absolute',
    right: 0,
    top: 12,
    zIndex: 1,
    // clip so only right portion peeks out
    overflow: 'hidden',
    width: SPOUSE_PEEK + 8,
    borderRadius: 14,
    opacity: 0.92,
  },
  focusCard: {
    zIndex: 2,
    width: CARD_W,
  },

  // Extra dob strip below focused card (light blue strip in screenshots)
  extraDob: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#d6eeff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginTop: 6,
  },
  extraDobIcon: { fontSize: 12 },
  extraDobTxt: { fontSize: 12, fontFamily: 'SofiaSansCondensed-Regular', color: '#444' },

  // Children
  childrenRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  childExtraDob: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#d6eeff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6,
    width: CARD_W,
  },

  // Add Hiver
  addHiver: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40, marginBottom: 20 },
  addHiverCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  addHiverPlus: { color: '#fff', fontSize: 22, lineHeight: 28, fontWeight: '400' },
  addHiverTxt: { fontSize: 18, fontFamily: 'SofiaSansCondensed-Regular', color: '#1a1a1a' },
});

export default HiveScreen;