import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const AudioCallScreen = ({ navigation, route }: { navigation?: any; route?: any }) => {
  const contact = route?.params?.contact ?? {
    name: 'MH Kaif',
    avatar: 'https://i.pravatar.cc/150?img=68',
  };

  // Always start at incoming — user must accept to go active
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    if (callState !== 'active') return;
    const t = setInterval(() => setSeconds(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── INCOMING CALL SCREEN ───────────────────────────────────────────────────
  if (callState === 'incoming') {
    return (
      <View style={inc.container}>
        {/* Blurred background */}
        <Image
          source={{ uri: contact.avatar }}
          style={inc.bgImg}
          blurRadius={22}
        />
        <View style={inc.overlay} />

        {/* Header */}
        <View style={inc.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={inc.headerBtn}>
            <Image
              source={require('../../../assets/images/chat/back.png')}
              style={inc.headerIcon}
            />
          </TouchableOpacity>
          <Text style={inc.headerTitle}>Audio Call</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Caller info */}
        <View style={inc.callerSection}>
          <Image source={{ uri: contact.avatar }} style={inc.callerAvatar} />
          <Text style={inc.callerName}>{contact.name}</Text>
          <Text style={inc.callerStatus}>Incoming Audio Call…</Text>
        </View>

        {/* Action buttons */}
        <View style={inc.actions}>
          {/* Accept (green phone) */}
          <View style={inc.actionWrap}>
            <TouchableOpacity
              style={[inc.actionBtn, inc.acceptBtn]}
              onPress={() => setCallState('active')}
              activeOpacity={0.85}
            >
              <Image
                source={require('../../../assets/images/chat/Audiocll.png')}
                style={inc.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={inc.actionLabel}>Accept</Text>
          </View>

          {/* Decline (red end call) */}
          <View style={inc.actionWrap}>
            <TouchableOpacity
              style={[inc.actionBtn, inc.declineBtn]}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.85}
            >
              <Image
                source={require('../../../assets/images/chat/endcall.png')}
                style={inc.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={inc.actionLabel}>Decline</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── ACTIVE AUDIO CALL SCREEN ───────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../assets/images/chat/bg.png')}
      style={act.container}
      resizeMode="cover"
      imageStyle={{ opacity: 0.2}}
    >
      {/* Header */}
      <View style={act.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={act.headerBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={act.headerIcon}
          />
        </TouchableOpacity>
        <Text style={act.title}>Audio Call</Text>
        {/* Switch to video call */}
        <TouchableOpacity
          style={act.headerBtn}
          onPress={() => navigation?.replace('VideoCallActive', { contact })}
        >
          <Image
            source={require('../../../assets/images/chat/Videocll.png')}
            style={[act.headerIcon, { tintColor: 'rgba(255,167,87,1)' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Caller photo + name */}
      <View style={act.callerWrap}>
        <Image source={{ uri: contact.avatar }} style={act.callerAvatar} />
        <Text style={act.callerName}>{contact.name}</Text>
        <Text style={act.timer}>{formatTime(seconds)}</Text>
      </View>

      {/* Controls: speaker | end | mute */}
      <View style={act.controls}>
        {/* Speaker */}
        <TouchableOpacity
          style={act.ctrlBtn}
          onPress={() => setSpeaker(p => !p)}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/chat/speaker.png')}
            style={[act.ctrlIcon, !speaker && act.ctrlIconOff]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* End call */}
        <TouchableOpacity
          style={act.endBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../../assets/images/chat/endcall.png')}
            style={act.endBtnIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Mute */}
        <TouchableOpacity
          style={act.ctrlBtn}
          onPress={() => setMuted(p => !p)}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/chat/mic.png')}
            style={[act.ctrlIcon, muted && act.ctrlIconOff]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// ─── Incoming styles ──────────────────────────────────────────────────────────
const inc = StyleSheet.create({
  container: { flex: 1 },
  bgImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  headerBtn: { padding: 4 },
  headerIcon: { width: 24, height: 24, tintColor: '#fff' },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-SemiBold',
  },
  callerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  callerAvatar: {
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: 16,
    marginBottom: 20,
  },
  callerName: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-SemiBold',
    marginBottom: 8,
  },
  callerStatus: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    paddingBottom: 56,
  },
  actionWrap: { alignItems: 'center', gap: 10 },
  actionBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: { backgroundColor: '#4CAF50' },
  declineBtn: { backgroundColor: '#e03131' },
  actionIcon: { width: 32, height: 32, tintColor: '#fff' },
  actionLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
});

// ─── Active call styles ───────────────────────────────────────────────────────
const act = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerBtn: { padding: 4 },
  headerIcon: { width: 24, height: 24 },
  title: {
    fontSize: 17,
    color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-SemiBold',
  },
  callerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  callerAvatar: {
    width: width * 0.62,
    height: width * 0.62 * 1.25,
    borderRadius: 14,
    marginBottom: 16,
  },
  callerName: {
    fontSize: 26,
    color: '#1a2a3a',
    fontFamily: 'SofiaSansCondensed-SemiBold',
    marginBottom: 6,
  },
  timer: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 44,
    paddingBottom: 52,
  },
  ctrlBtn: { padding: 8 },
  ctrlIcon: { width: 30, height: 30, tintColor: '#444' },
  ctrlIconOff: { opacity: 0.35 },
  endBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#e03131',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endBtnIcon: { width: 30, height: 30, tintColor: '#fff' },
});

export default AudioCallScreen;