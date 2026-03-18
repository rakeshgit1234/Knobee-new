import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

type Gender = 'Male' | 'Female' | 'Other';

const SignupScreen = ({ navigation }: { navigation?: any }) => {
  const scrollRef = useRef<ScrollView>(null);
  const nameRef = useRef<TextInput>(null);
  const referralRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDob(selectedDate);
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, 100);
  };

  const genders: Gender[] = ['Male', 'Female', 'Other'];

  return (

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
               contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={100}
        scrollEnabled={false}
        >
          {/* Header Row: Logo + Back */}
          <View style={styles.headerRow}>
            <Image
              source={require('../../../assets/images/logos/logo1.png')}
              style={styles.logo}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Tell us</Text>
          <Text style={styles.subtitle}>About you</Text>

          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <TextInput
              ref={nameRef}
              style={styles.underlineInput}
              placeholder="Your full name"
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={setFullName}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <View style={styles.underline} />
          </View>

          {/* Gender */}
          <View style={styles.genderRow}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              {genders.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.dobRow}>
            <Text style={styles.fieldLabel}>Date of birth</Text>
            <TouchableOpacity
              style={styles.dobInputWrapper}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dobText, !dob && styles.dobPlaceholder]}>
                {dob ? formatDate(dob) : 'DD-MM-YYYY'}
              </Text>
              <Image source={require('../../../assets/images/login/Calendar.png')} style={{height: 25, width: 25}} />
            </TouchableOpacity>
            <View style={{ width: '100%' }} >
            <View style={styles.dobUnderline} />
            </View>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal transparent animationType="slide">
                <View style={styles.iosPickerOverlay}>
                  <View style={styles.iosPickerContainer}>
                    <TouchableOpacity
                      style={styles.iosPickerDone}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.iosPickerDoneText}>Done</Text>
                    </TouchableOpacity>
                    <DateTimePicker
                      value={dob || new Date(2000, 0, 1)}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )
          )}

          {/* Referral Code */}
          <View style={[styles.fieldContainer, { marginTop: 28 }]}>
            <TextInput
              ref={referralRef}
              style={styles.underlineInput}
              placeholder="Referral code (optional)"
              placeholderTextColor="#aaa"
              value={referralCode}
              onChangeText={setReferralCode}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoCapitalize="characters"
            />
            <View style={styles.underline} />
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation?.navigate('MainTabs')}>
            <Text style={styles.signupButtonText}>Sign up</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 25
  },
  logo: {
    height: 58,
    width: 58,
  },
  backButton: {
    backgroundColor: 'rgba(255, 218, 185, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  backText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Headings
  title: {
    fontSize: 55,
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: 'SofiaSansCondensed-Medium',
  },
  subtitle: {
    fontSize: 40,
    color: 'rgba(255, 167, 87, 1)',
    marginBottom: 36,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Underline fields
  fieldContainer: {
    marginBottom: 28,
  },
  underlineInput: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 0,
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  underline: {
    height: 1,
    backgroundColor: 'rgba(255, 167, 87, 1)',
    marginTop: 8
  },
  fieldLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Medium',
    // marginBottom: 12,
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    backgroundColor: '#fff',
    alignSelf:'center'
  },
  genderButtonActive: {
    backgroundColor: 'rgba(255, 167, 87, 1)',
    borderColor: 'rgba(255, 167, 87, 1)',
  },
  genderText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  genderTextActive: {
    color: '#ffffff',
    fontFamily: 'SofiaSansCondensed-Medium',
  },

  // Date of Birth
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  dobInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginLeft: 29,
  },
  dobText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  dobPlaceholder: {
    color: '#aaa',
  },
  calendarIcon: {
    fontSize: 20,
  },
  dobUnderline: {
    width: '70%',
    height: 1,
    backgroundColor: 'rgba(255, 167, 87, 1)',
    marginTop: 8,
    alignSelf: 'flex-end',
    alignItems:'flex-end',
    justifyContent:'flex-end'
    
  },

  // iOS Date Picker Modal
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosPickerDone: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iosPickerDoneText: {
    fontSize: 16,
    color: 'rgba(255, 167, 87, 1)',
    fontFamily: 'SofiaSansCondensed-Medium',
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  // Sign Up Button
  signupButton: {
    backgroundColor: 'rgba(255, 167, 87, 1)',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: 'rgba(255, 167, 87, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 35,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: 0.3,
    fontFamily: 'SofiaSansCondensed-Medium',
  },
});

export default SignupScreen;