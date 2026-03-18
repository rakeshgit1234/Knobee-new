import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,

  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

const OTPScreen = ({ navigation }: { navigation?: any }) => {
  const scrollRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState(30);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setOtp(['', '', '', '']);
      setTimer(30);
      inputRefs.current[0]?.focus();
    }
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
        <Text style={styles.title}>OTP</Text>
        <Text style={styles.subtitle}>Enter one time{'\n'}password</Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <FastImage
            source={require('../../../assets/images/login/otp.gif')}
            style={styles.illustration}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={val => handleOtpChange(val.slice(-1), index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              textAlign="center"
              selectionColor="rgba(255, 167, 87, 1)"
            />
          ))}
        </View>

        {/* Resend Timer */}
        <TouchableOpacity onPress={handleResend} disabled={timer > 0} activeOpacity={0.7}>
          <Text style={[styles.resendText, timer === 0 && styles.resendActive]}>
            {timer > 0 ? `Send again in ${timer}sec` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => navigation?.navigate('SignupScreen')}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
    paddingVertical: 5,
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
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
    marginBottom: 32,
    lineHeight: 36,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  illustration: {
    marginTop: -80,
    width: width - 80,
    height: 350,
  },

  // OTP Boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: -80,
    marginBottom: 18,
  },
  otpBox: {
    width: (width - 48 - 98) / 4,
    height: (width - 48 - 48) / 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 167, 87, 1)',
    borderRadius: 12,
    fontSize: 22,
    color: '#1a1a1a',
    backgroundColor: '#fff',
    fontFamily: 'SofiaSansCondensed-Medium',
  },
  otpBoxFilled: {
    borderColor: 'rgba(255, 167, 87, 1)',
    backgroundColor: 'rgba(255, 218, 115, 0.15)',
  },

  // Resend
  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  resendActive: {
    color: 'rgba(255, 167, 87, 1)',
    textDecorationLine: 'underline',
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  // Submit Button
  submitButton: {
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
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: 0.3,
    fontFamily: 'SofiaSansCondensed-Medium',
  },
});

export default OTPScreen;