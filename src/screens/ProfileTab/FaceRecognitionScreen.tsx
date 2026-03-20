/**
 * FaceRecognitionScreen.tsx
 *
 * 5-step face recognition flow matching screenshots:
 *
 *  Step 1 — NOT_REGISTERED  : Face not saved illustration + "Proceed with scan"
 *  Step 2 — ADD_FACE        : Face mesh image + landmark table + "Add Face"
 *  Step 3 — SCANNING        : Camera view oval, progress 33% "Scanning Face"
 *  Step 4 — SEARCHING       : Camera view oval, progress 66% "Searching in database"
 *  Step 5 — BUILDING        : Camera view oval, progress 100% "Building relation graph"
 *  (auto-advances to result)
 *
 * Props: { onBack }
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Image, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Ellipse, Rect } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

type Step =
  | 'NOT_REGISTERED'
  | 'ADD_FACE'
  | 'SCANNING'
  | 'SEARCHING'
  | 'BUILDING'
  | 'DONE';

const ORANGE = '#F5A623';
const LIME   = '#C8F000';

// ─── Face landmark table data ─────────────────────────────────────────────────
const LANDMARKS = [
  { region: 'Jawline',        indices: '1 – 17',  desc: 'Outlines the face from the left temple to the right temple.' },
  { region: 'Right Eyebrow',  indices: '18 – 22', desc: 'Points starting from the outer corner to the inner corner.' },
  { region: 'Left Eyebrow',   indices: '23 – 27', desc: 'Points starting from the inner corner to the outer corner.' },
  { region: 'Nose Bridge',    indices: '28 – 31', desc: 'Vertical points running down the center of the nose.' },
  { region: 'Nose Tip',       indices: '32 – 36', desc: 'Points around the tip and nostrils of the nose.' },
  { region: 'Right Eye',      indices: '37 – 42', desc: 'Points forming a closed polygon around the right eye.' },
  { region: 'Left Eye',       indices: '43 – 48', desc: 'Points forming a closed polygon around the left eye.' },
];

// Progress step config
const STEP_PROGRESS: Record<string, number> = {
  SCANNING:  0.33,
  SEARCHING: 0.66,
  BUILDING:  1.00,
};
const STEP_LABEL: Record<string, string> = {
  SCANNING:  'Scanning Face',
  SEARCHING: 'Searching in database',
  BUILDING:  'Building relation graph',
};
const STEP_SEQUENCE: Step[] = ['SCANNING', 'SEARCHING', 'BUILDING', 'DONE'];

type Props = { onBack: () => void };

export default function FaceRecognitionScreen({ onBack }: Props) {
  const [step, setStep] = useState<Step>('NOT_REGISTERED');

  // Animated progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Auto-advance through scanning steps
  useEffect(() => {
    if (step === 'SCANNING' || step === 'SEARCHING' || step === 'BUILDING') {
      const target = STEP_PROGRESS[step] * SW;
      Animated.timing(progressAnim, {
        toValue: target,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      const idx = STEP_SEQUENCE.indexOf(step);
      const next = STEP_SEQUENCE[idx + 1];
      const timer = setTimeout(() => setStep(next), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ── Step 1: NOT REGISTERED ─────────────────────────────────────────────────
  if (step === 'NOT_REGISTERED') {
    return (
      <View style={s.screen}>
        <Header onBack={onBack} />
        <View style={s.notRegContent}>
          {/* Large scan silhouette illustration */}
          <View style={s.scanIllustWrap}>
            {/* Scan brackets (corners) */}
            <View style={[s.bracket, s.bracketTL]} />
            <View style={[s.bracket, s.bracketTR]} />
            <View style={[s.bracket, s.bracketBL]} />
            <View style={[s.bracket, s.bracketBR]} />
            {/* Person silhouette */}
            <View style={s.silhouetteWrap}>
              {/* Head circle */}
              <View style={s.silHead} />
              {/* Horizontal scan line */}
              <View style={s.silScanLine} />
              {/* Body */}
              <View style={s.silBody} />
            </View>
          </View>

          <Text style={s.notRegTitle}>Your face is not saved{'\n'}with us</Text>
          <Text style={s.notRegBody}>
            To use find relation feature with face recognition you need to register your face with us
          </Text>
          <Text style={s.notRegSub}>
            Don't worry your data is private and 100% safe with us and it will not take more than 30 seconds.
          </Text>
        </View>

        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.ctaBtn} onPress={() => setStep('ADD_FACE')} activeOpacity={0.85}>
            <Text style={s.ctaTxt}>Proceed with scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Step 2: ADD FACE ───────────────────────────────────────────────────────
  if (step === 'ADD_FACE') {
    return (
      <View style={s.screen}>
        <Header onBack={() => setStep('NOT_REGISTERED')} />

        {/* Full-bleed face mesh image */}
        <View style={s.meshImgWrap}>
          <Image
            source={require('../../../assets/images/profile/bg1.png')}
            style={s.meshImg}
            resizeMode="cover"
          />
          {/* Dark oval vignette overlay */}
          <View style={s.meshOverlay} />
        </View>

        {/* Progress tab */}
        <View style={s.progressTabRow}>
          <View style={[s.progressTab, s.progressTabActive]}>
            <Text style={s.progressTabTxt}>Face Scanning Process</Text>
          </View>
          <View style={s.progressTabInactive} />
        </View>

        {/* Landmark table */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={s.tableWrap}>
            {/* Header row */}
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableCell, s.tableHeader, { flex: 1 }]}>Region</Text>
              <Text style={[s.tableCell, s.tableHeader, { flex: 1 }]}>Landmark Indices</Text>
              <Text style={[s.tableCell, s.tableHeader, { flex: 1.4 }]}>Description</Text>
            </View>
            {/* Data rows */}
            {LANDMARKS.map((row, i) => (
              <View key={i} style={[s.tableRow, i % 2 === 1 && s.tableRowAlt]}>
                <Text style={[s.tableCell, { flex: 1 }]}>{row.region}</Text>
                <Text style={[s.tableCell, { flex: 1 }]}>{row.indices}</Text>
                <Text style={[s.tableCell, { flex: 1.4 }]}>{row.desc}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.ctaBtn} onPress={() => setStep('SCANNING')} activeOpacity={0.85}>
            <Text style={s.ctaTxt}>Add Face</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Steps 3–5: SCANNING / SEARCHING / BUILDING ────────────────────────────
  if (step === 'SCANNING' || step === 'SEARCHING' || step === 'BUILDING') {
    return (
      <View style={s.screen}>
        <Header onBack={() => setStep('ADD_FACE')} />

        {/* Camera view area */}
        <View style={s.cameraWrap}>
          {/* Blurred background — full camera bg */}
          <Image
            source={require('../../../assets/images/profile/girl.jpg')}
            style={s.cameraBg}
            resizeMode="cover"
          />

          {/* Blurred edges overlay (simulate camera blur outside oval) */}
          <View style={s.cameraBlurOverlay} />

          {/* Oval cutout — person face */}
         
        </View>

        {/* Progress bar + label */}
        <View style={s.progressBarWrap}>
          <Animated.View style={[s.progressBarFill, { width: progressAnim }]} />
          <Text style={s.progressBarLabel}>{STEP_LABEL[step]}</Text>
        </View>

        {/* Grey circle placeholder below */}
        <View style={s.greyCircleWrap}>
          <View style={s.greyCircle} />
        </View>
      </View>
    );
  }

  // ── Step 6: DONE ───────────────────────────────────────────────────────────
  return (
    <View style={s.screen}>
      <Header onBack={onBack} />
      <View style={s.doneWrap}>
        <View style={s.doneCircle}>
          <Text style={s.doneTick}>✓</Text>
        </View>
        <Text style={s.doneTitle}>Face Registered!</Text>
        <Text style={s.doneDesc}>
          Your face has been successfully registered. You can now use face recognition to find relations.
        </Text>
        <TouchableOpacity style={[s.ctaBtn, { marginTop: 32, width: SW - 40 }]} onPress={onBack} activeOpacity={0.85}>
          <Text style={s.ctaTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Shared Header ────────────────────────────────────────────────────────────
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.headerBack} hitSlop={10}>
        <Image
          source={require('../../../assets/images/chat/back.png')}
          style={s.headerBackIcon}
        />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Face Recognition</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const OVAL_W = SW * 0.7;
const OVAL_H = OVAL_W * 1.25;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff', zIndex: 10,
  },
  headerBack: { width: 40, alignItems: 'flex-start' },
  headerBackIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#1a1a1a' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-SemiBold' },

  // ── Step 1: NOT REGISTERED ─────────────────────────────────────────────────
  notRegContent: {
    flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'flex-start',
  },
  scanIllustWrap: {
    width: 220, height: 240, alignSelf: 'center',
    position: 'relative', alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  bracket: {
    position: 'absolute', width: 36, height: 36,
    borderColor: '#C8C8C8', borderWidth: 0,
  },
  bracketTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 6 },
  bracketTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 6 },
  bracketBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 6 },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 6 },
  silhouetteWrap: { alignItems: 'center' },
  silHead: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#D0D0D0', marginBottom: 0 },
  silScanLine: { width: 140, height: 5, backgroundColor: '#BBBBBB', marginVertical: 4 },
  silBody: {
    width: 140, height: 100, borderTopLeftRadius: 70, borderTopRightRadius: 70,
    backgroundColor: '#D0D0D0', marginTop: 4,
  },
  notRegTitle: {
    fontSize: 30, fontWeight: '800', color: '#1a1a1a', lineHeight: 36,
    marginBottom: 14, fontFamily: 'SofiaSansCondensed-Bold',
  },
  notRegBody: {
    fontSize: 16, color: '#1a1a1a', lineHeight: 23,
    marginBottom: 12, fontFamily: 'SofiaSansCondensed-Regular',
  },
  notRegSub: {
    fontSize: 14, color: '#999', lineHeight: 21,
    fontFamily: 'SofiaSansCondensed-Regular',
  },

  // ── Step 2: ADD FACE ───────────────────────────────────────────────────────
  meshImgWrap: { width: SW, height: SH * 0.47, position: 'relative', overflow: 'hidden' },
  meshImg: { width: '100%', height: '100%' },
  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 0,
  },
  progressTabRow: { flexDirection: 'row', height: 40 },
  progressTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressTabActive: { backgroundColor: LIME },
  progressTabInactive: { flex: 0.5, backgroundColor: '#E0E0E0' },
  progressTabTxt: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  tableWrap: { paddingHorizontal: 14, paddingVertical: 12 },
  tableHeaderRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tableHeader: { fontWeight: '700', fontSize: 13, color: '#1a1a1a' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tableCell: { fontSize: 13, color: '#444', lineHeight: 18, paddingRight: 6 },

  // ── Steps 3-5: SCANNING/SEARCHING/BUILDING ────────────────────────────────
  cameraWrap: {
    width: SW,
    height: SH * 0.62,
    position: 'relative', overflow: 'hidden',
    backgroundColor: '#888',
  },
  cameraBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cameraBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(160,160,160,0.45)',
  },
  ovalCutoutWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  ovalCutout: {
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    overflow: 'hidden',
    borderWidth: 0,
  },
  ovalImg: { width: OVAL_W, height: OVAL_H, resizeMode: 'cover' },

  // Progress bar row
  progressBarWrap: {
    width: SW, height: 42,
    backgroundColor: '#E0E0E0',
    position: 'relative', justifyContent: 'center',
  },
  progressBarFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: LIME,
  },
  progressBarLabel: {
    zIndex: 2, textAlign: 'center',
    fontSize: 15, fontWeight: '600', color: '#1a1a1a',
    fontFamily: 'SofiaSansCondensed-Medium',
  },

  // Grey circle placeholder
  greyCircleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  greyCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#D8D8D8' },

  // ── Done ───────────────────────────────────────────────────────────────────
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  doneCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#27AE60',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  doneTick: { fontSize: 52, color: '#fff', fontWeight: '900' },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  doneDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },

  // Shared CTA
  ctaWrap: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  ctaBtn: {
    backgroundColor: ORANGE, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3, fontFamily: 'SofiaSansCondensed-Bold' },
});