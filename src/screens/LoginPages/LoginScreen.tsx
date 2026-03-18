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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation?: any }) => {
  const phoneRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [isChecked, setIsChecked] = useState(true);

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

  return (
  
      <TouchableWithoutFeedback style={{flex:1,backgroundColor:'red'}} onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView

    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
    enableOnAndroid
    extraScrollHeight={50}
    scrollEnabled={false}
  >
          {/* App Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.glassesContainer}>
              <Image source={require('../../../assets/images/logos/logo1.png')} style={{ height: 58, width: 58, marginTop: 40 }} />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>into the new era</Text>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/images/login/loginframe.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor="#b0b0b0"
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => setIsChecked(prev => !prev)}
              style={[styles.checkbox, isChecked ? styles.checkboxChecked : styles.checkboxUnchecked]}
              activeOpacity={0.7}
            >
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By Registering you agree to the{' '}
              <Text style={styles.link}>Terms of Use</Text>
              {' '}and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity onPress={()=>navigation.navigate('OTPScreen')} style={styles.otpButton}>
            <Text style={styles.otpButtonText}>Send OTP</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
  
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },

  // App Icon
  iconWrapper: {
    marginBottom: 28,
  },
  glassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 32,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  illustration: {
    width: width - 48,
    height: 220,
    borderRadius: 12,
  },

  // Phone Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 87, 1)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 12,
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 0,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 'auto' as any,
    paddingBottom: 40,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: 'rgba(255, 218, 115, 1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 167, 87, 1)',
  },
  checkboxUnchecked: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 167, 87, 1)',
  },
  checkmark: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  link: {
    color: 'rgba(255, 167, 87, 1)',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // OTP Button
  otpButton: {
    backgroundColor: 'rgba(255, 167, 87, 1)',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: 'rgba(255, 167, 87, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
marginBottom: 40
    // position:'absolute',
    // bottom: 0,
    // left: 24,
    // right: 24,
  },
  otpButtonText: {
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: 0.3,
    fontFamily: 'SofiaSansCondensed-Medium',
  },
});

export default LoginScreen;