import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

type Props = { navigation?: any; route?: any };

const NearbySearchScreen = ({ navigation, route }: Props) => {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [institute, setInstitute] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    // Pass filters back or navigate to results
    navigation?.navigate('SearchResults', { name, occupation, institute, location });
  };

  const isAnyFilled = name || occupation || institute || location;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={styles.iconBack}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Search</Text>
        {/* Spacer to keep title centered */}
        <View style={styles.iconBack} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search by Name ── */}
        <View style={styles.fieldFull}>
          <TextInput
            style={styles.input}
            placeholder="Search by Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            autoCorrect={false}
          />
          <View style={styles.underline} />
        </View>

        {/* ── Occupation + Institute (side by side) ── */}
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <TextInput
              style={styles.input}
              placeholder="By occupation"
              placeholderTextColor="#aaa"
              value={occupation}
              onChangeText={setOccupation}
              autoCorrect={false}
            />
            <View style={styles.underline} />
          </View>

          <View style={styles.fieldHalf}>
            <TextInput
              style={styles.input}
              placeholder="By institute"
              placeholderTextColor="#aaa"
              value={institute}
              onChangeText={setInstitute}
              autoCorrect={false}
            />
            <View style={styles.underline} />
          </View>
        </View>

        {/* ── Search by Location ── */}
        <View style={styles.fieldFull}>
          <TextInput
            style={styles.input}
            placeholder="Search by Location"
            placeholderTextColor="#aaa"
            value={location}
            onChangeText={setLocation}
            autoCorrect={false}
          />
          <View style={styles.underline} />
        </View>
      </ScrollView>

      {/* ── Search Button (pinned to bottom) ── */}
      <View style={styles.bottomWrap}>
        <TouchableOpacity
          style={[styles.searchBtn, !isAnyFilled && styles.searchBtnMuted]}
          onPress={handleSearch}
          activeOpacity={0.85}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 32,
  },

  // Full-width field
  fieldFull: {
    width: '100%',
  },

  // Side-by-side row
  fieldRow: {
    flexDirection: 'row',
    gap: 24,
  },
  fieldHalf: {
    flex: 1,
  },

  // Input + underline
  input: {
    fontSize: 16,
    fontFamily: 'SofiaSansCondensed-Regular',
    color: '#1a1a1a',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  underline: {
    height: 1.5,
    backgroundColor: 'rgba(255,140,50,0.85)',
    marginTop: 8,
  },

  // Bottom search button
  bottomWrap: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  searchBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // Orange gradient simulated with solid — use LinearGradient for true gradient
    backgroundColor: '#F5A623',
    // Shadow
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  searchBtnMuted: {
    opacity: 0.75,
  },
  searchBtnText: {
    fontSize: 18,
    fontFamily: 'SofiaSansCondensed-Bold',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
});

export default NearbySearchScreen;
