import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const VideoCallActiveScreen = ({ navigation, route }: { navigation?: any; route?: any }) => {
  const contact = route?.params?.contact ?? {
    name: 'MH Kaif',
    avatar: 'https://i.pravatar.cc/150?img=68',
  };

  // Always start at incoming
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

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

  // ── INCOMING VIDEO CALL ────────────────────────────────────────────────────
  if (callState === 'incoming') {
    return (
      <View style={inc.container}>
        {/* Blurred full-screen bg */}
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
          <Text style={inc.headerTitle}>Video Call</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Caller card */}
        <View style={inc.callerSection}>
          <Image source={{ uri: contact.avatar }} style={inc.callerAvatar} />
          <Text style={inc.callerName}>{contact.name}</Text>
          <Text style={inc.callerStatus}>Incoming Video Call…</Text>
        </View>

        {/* Accept / Decline */}
        <View style={inc.actions}>
          {/* Accept video */}
          <View style={inc.actionWrap}>
            <TouchableOpacity
              style={[inc.actionBtn, inc.acceptBtn]}
              onPress={() => setCallState('active')}
              activeOpacity={0.85}
            >
              <Image
                source={require('../../../assets/images/chat/Videocll.png')}
                style={inc.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={inc.actionLabel}>Accept</Text>
          </View>

          {/* Accept audio only */}
          <View style={inc.actionWrap}>
            <TouchableOpacity
              style={[inc.actionBtn, inc.audioBtn]}
              onPress={() => navigation?.replace('AudioCall', { contact })}
              activeOpacity={0.85}
            >
              <Image
                source={require('../../../assets/images/chat/Audiocll.png')}
                style={inc.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={inc.actionLabel}>Audio only</Text>
          </View>

          {/* Decline */}
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

  // ── ACTIVE VIDEO CALL ──────────────────────────────────────────────────────
  return (
    <View style={act.container}>
      {/* Full-screen remote video */}
      <Image
        source={{ uri: 'https://i.pravatar.cc/800?img=44' }}
        style={act.remoteVideo}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View style={act.overlay} />

      {/* Header */}
      <View style={act.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={act.headerBtn}>
          <Image
            source={require('../../../assets/images/chat/back.png')}
            style={act.headerIcon}
          />
        </TouchableOpacity>
        <Text style={act.timer}>{formatTime(seconds)}</Text>
        {/* Switch to audio */}
        <TouchableOpacity
          style={act.headerBtn}
          onPress={() => navigation?.replace('AudioCall', { contact })}
        >
          <Image
            source={require('../../../assets/images/chat/Audiocll.png')}
            style={[act.headerIcon, { tintColor: 'rgba(255,167,87,1)' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* PiP — local camera top right */}
      <View style={act.pip}>
        {cameraOff ? (
          <View style={act.pipOff}>
            <Text style={act.pipOffTxt}>📷</Text>
          </View>
        ) : (
          <Image
            source={{ uri: contact.avatar }}
            style={act.pipVideo}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Controls: speaker | end | mute | camera */}
      <View style={act.controls}>
        {/* Mute mic */}
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

        {/* Toggle camera */}
        <TouchableOpacity
          style={act.ctrlBtn}
          onPress={() => setCameraOff(p => !p)}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/chat/Videocll.png')}
            style={[act.ctrlIcon, cameraOff && act.ctrlIconOff]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: 'rgba(0,0,0,0.52)',
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
    width: width * 0.46,
    height: width * 0.46,
    borderRadius: 14,
    marginBottom: 18,
  },
  callerName: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-SemiBold',
    marginBottom: 8,
  },
  callerStatus: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'SofiaSansCondensed-Regular',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    paddingBottom: 58,
  },
  actionWrap: { alignItems: 'center', gap: 10 },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: { backgroundColor: '#4CAF50' },
  audioBtn: { backgroundColor: '#4CAF50' },
  declineBtn: { backgroundColor: '#e03131' },
  actionIcon: { width: 30, height: 30, tintColor: '#fff' },
  actionLabel: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-Regular',
    textAlign: 'center',
  },
});

// ─── Active call styles ───────────────────────────────────────────────────────
const act = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  // Header
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 10,
  },
  headerBtn: { padding: 4 },
  headerIcon: { width: 24, height: 24, tintColor: '#fff' },
  timer: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // PiP
  pip: {
    position: 'absolute',
    top: 72,
    right: 16,
    width: 112,
    height: 148,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pipVideo: { width: '100%', height: '100%' },
  pipOff: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipOffTxt: { fontSize: 28 },

  // Controls
  controls: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 44,
  },
  ctrlBtn: { padding: 8 },
  ctrlIcon: { width: 30, height: 30, tintColor: '#fff' },
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

export default VideoCallActiveScreen;