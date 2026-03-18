/**
 * HiveFamilyTree.js — Single file, complete implementation
 *
 * Button placement (per screenshot):
 *
 *  PARENT ROW:
 *    Left parent  → ⇄ button(s) at BOTTOM-LEFT corner of card (below card, left-aligned)
 *    Right parent → ⇄ button(s) at BOTTOM-RIGHT corner of card (below card, right-aligned)
 *    Dots on connector bar sit ABOVE the bar (between parent card bottoms and bar)
 *
 *  CENTER:
 *    ⇄ button(s) on LEFT side, vertically centred (unchanged, correct)
 *
 *  CHILD ROW:
 *    Left child  → ⇄ button(s) at TOP-LEFT corner (above card, left-aligned)
 *    Right child → ⇄ button(s) at TOP-RIGHT corner (above card, right-aligned)
 *    Dots sit BELOW the bar (between bar and child card tops)
 *    Connector arrow tip touches child card top directly (zero gap)
 *
 * Gender rules:
 *   Male   → 1 blue ⇄
 *   Female → 1 pink ⇄  (+ 1 blue ⇄ if married), side by side horizontally
 *
 * Dependencies:
 *   npx expo install react-native-reanimated react-native-svg react-native-gesture-handler
 *   babel.config.js → plugins: ['react-native-reanimated/plugin']
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

// ─── Screen ──────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const CANVAS_H = SH * 0.9;

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#FDF6EE', pink: '#F8D6EA', pinkBd: '#E879A0',
  blue: '#D6EFF8', blueBd: '#5BB8D4', gray: '#E4E4E4', grayBd: '#AAAAAA',
  teal: '#5BB8D4', pinkBtn: '#E879A0', blueBtn: '#5BB8D4',
  connector: '#BBBBBB', dotBlue: '#5BB8D4', dotPink: '#E879A0',
  dotBlueDim: '#A8D8EC', dotPinkDim: '#F0AACE',
  text: '#1A1A1A', sub: '#555', white: '#FFF', black: '#111', decBg: '#B0B0B0',
};

// ─── Data ────────────────────────────────────────────────────────────────────
const PEOPLE = {
  shubham: { id:'shubham', name:'Shubham Seth', photo:'https://randomuser.me/api/portraits/men/75.jpg',
    gender:'male', birthDate:'Jan 15, 1960', deathDate:'Feb 18, 2026',
    profession:'Doctor', city:'Noida', flag:'🇮🇳', flagCode:'IN', followers:3, isMarried:true },
  maya: { id:'maya', name:'Maya Seth', photo:'https://randomuser.me/api/portraits/women/44.jpg',
    gender:'female', birthDate:'Mar 11, 1968', deathDate:null,
    profession:'Housewife', city:'Noida', flag:'🇮🇳', flagCode:'IN', followers:15, isMarried:true },
  sandhya: { id:'sandhya', name:'Sandhya Kohli', photo:'https://randomuser.me/api/portraits/women/68.jpg',
    gender:'female', birthDate:'Mar 11, 1968', marriageDate:'Feb 19, 1998', deathDate:null,
    profession:'Doctor', city:'Noida', flag:'🇮🇳', flagCode:'IN', followers:245, isMarried:true },
  arjun: { id:'arjun', name:'Arjun Kohli', photo:'https://randomuser.me/api/portraits/men/46.jpg',
    gender:'male', birthDate:'Apr 5, 1993', deathDate:null,
    profession:'Engineer', city:'Delhi', flag:'🇮🇳', flagCode:'IN', followers:312, isMarried:true },
  raghav: { id:'raghav', name:'Raghav Kohli', photo:'https://randomuser.me/api/portraits/men/32.jpg',
    gender:'male', birthDate:'Feb 19, 1998', deathDate:null,
    profession:'Student (BBA)', city:'Bangalore', flag:'🇮🇳', flagCode:'IN', followers:842, isMarried:false },
  shruti: { id:'shruti', name:'Shruti Kohli', photo:'https://randomuser.me/api/portraits/women/29.jpg',
    gender:'female', birthDate:'Feb 19, 1998', deathDate:null,
    profession:'Student (MBBS)', city:'Kyiv', flag:'🇺🇦', flagCode:'UA', followers:1000, isMarried:false },
  vikram: { id:'vikram', name:'Vikram Seth', photo:'https://randomuser.me/api/portraits/men/60.jpg',
    gender:'male', birthDate:'Dec 3, 1930', deathDate:'Jul 22, 2010',
    profession:'Retired Judge', city:'Allahabad', flag:'🇮🇳', flagCode:'IN', followers:5, isMarried:true },
  kamla: { id:'kamla', name:'Kamla Seth', photo:'https://randomuser.me/api/portraits/women/60.jpg',
    gender:'female', birthDate:'Mar 8, 1935', deathDate:'Nov 14, 2018',
    profession:'Teacher', city:'Allahabad', flag:'🇮🇳', flagCode:'IN', followers:2, isMarried:true },
};

const RELATIONSHIPS = [
  { type:'parent', sourceId:'vikram', targetId:'shubham' },
  { type:'parent', sourceId:'kamla',  targetId:'shubham' },
  { type:'spouse', sourceId:'shubham', targetId:'maya' },
  { type:'parent', sourceId:'shubham', targetId:'sandhya' },
  { type:'parent', sourceId:'maya',    targetId:'sandhya' },
  { type:'spouse', sourceId:'sandhya', targetId:'arjun' },
  { type:'parent', sourceId:'sandhya', targetId:'raghav' },
  { type:'parent', sourceId:'sandhya', targetId:'shruti' },
  { type:'parent', sourceId:'arjun',   targetId:'raghav' },
  { type:'parent', sourceId:'arjun',   targetId:'shruti' },
];

function getParents(id) {
  return [...new Set(RELATIONSHIPS.filter(r => r.type==='parent' && r.targetId===id).map(r=>r.sourceId))];
}
function getSpouses(id) {
  return [...new Set(RELATIONSHIPS
    .filter(r => r.type==='spouse' && (r.sourceId===id||r.targetId===id))
    .map(r => r.sourceId===id ? r.targetId : r.sourceId))];
}
function getChildren(id) {
  return [...new Set(RELATIONSHIPS.filter(r => r.type==='parent' && r.sourceId===id).map(r=>r.targetId))];
}

// ─── Layout constants ────────────────────────────────────────────────────────
const HEADER_H    = 54;
const CARD_W      = 164;
const CARD_H      = 162;
const H_GAP       = 40;   // wide gap so heart badge fits cleanly between cards

// ⇄ button dimensions
const BTN_W       = 34;
const BTN_H       = 32;
const BTN_H_GAP   = 5;   // horizontal gap between two side-by-side buttons
const BTN_V_GAP   = 6;   // vertical gap between card edge and buttons

// Center card: buttons on LEFT side, vertically stacked
const CTR_BTN_W   = 34;
const CTR_BTN_H   = 32;
const CTR_BTN_GAP = 6;   // gap between stacked buttons
const CTR_BTN_OFF = 44;  // left of card.x

const ADD_HIVER_H = 56;
const USABLE_H    = CANVAS_H - HEADER_H - ADD_HIVER_H;

// Zone heights (30% / 38% / 32%)
const ZONE_T = USABLE_H * 0.27;
const ZONE_M = USABLE_H * 0.38;
const ZONE_B = USABLE_H * 0.32;

// Parent cards: top of card, centred in zone T
const PARENTS_CARD_Y = HEADER_H + (ZONE_T - CARD_H) / 2;
// Parent buttons sit just below card bottom (bottom-left or bottom-right of card)
const PARENTS_BTN_Y  = PARENTS_CARD_Y + CARD_H + BTN_V_GAP;

// Center card: centred in zone M
const CENTER_CARD_Y  = HEADER_H + ZONE_T + (ZONE_M - CARD_H) / 2;

// Child cards: occupying zone B
// Buttons sit just ABOVE the card (top-left or top-right of card)
const CHILDREN_CARD_Y = HEADER_H + ZONE_T + ZONE_M + (ZONE_B - CARD_H) / 2;
const CHILDREN_BTN_Y  = CHILDREN_CARD_Y - BTN_H - BTN_V_GAP;

const SPOUSE_OFFSET_X = 14;
const SPOUSE_OFFSET_Y = 14;

function rowXs(count, cw = CARD_W, gap = H_GAP) {
  const total = count * cw + (count - 1) * gap;
  const start = (SW - total) / 2;
  return Array.from({ length: count }, (_, i) => start + i * (cw + gap));
}

function buildLayout(focusedId) {
  const nodes = {};
  const parents     = getParents(focusedId);
  const spouses     = getSpouses(focusedId);
  const allChildren = getChildren(focusedId);
  const children    = allChildren.slice(0, 2);

  nodes[focusedId] = {
    x: SW/2 - CARD_W/2, y: CENTER_CARD_Y,
    w: CARD_W, h: CARD_H, role: 'center', zIndex: 30,
  };

  spouses.forEach((sid, i) => {
    nodes[sid] = {
      x: SW/2 - CARD_W/2 + (i+1)*SPOUSE_OFFSET_X,
      y: CENTER_CARD_Y   + (i+1)*SPOUSE_OFFSET_Y,
      w: CARD_W, h: CARD_H, role: 'spouse', zIndex: 30-(i+1), spouseIndex: i,
    };
  });

  if (parents.length > 0) {
    const xs = rowXs(parents.length);
    parents.forEach((pid, i) => {
      nodes[pid] = { x: xs[i], y: PARENTS_CARD_Y, w: CARD_W, h: CARD_H, role: 'parent', zIndex: 5 };
    });
  }

  if (children.length > 0) {
    const xs = rowXs(children.length);
    children.forEach((cid, i) => {
      nodes[cid] = { x: xs[i], y: CHILDREN_CARD_Y, w: CARD_W, h: CARD_H, role: 'child', zIndex: 5 };
    });
  }

  return { nodes, allChildren, children };
}

// ─── Spring ───────────────────────────────────────────────────────────────────
const SPRING = { damping: 22, stiffness: 240, mass: 0.85 };

// ─── Animated wrapper ────────────────────────────────────────────────────────
function AnimatedNode({ x, y, zIndex, width, height, children }) {
  const tx = useSharedValue(x);
  const ty = useSharedValue(y);
  useEffect(() => {
    tx.value = withSpring(x, SPRING);
    ty.value = withSpring(y, SPRING);
  }, [x, y]);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));
  return (
    <Animated.View style={[{ position:'absolute', top:0, left:0, width, height, zIndex }, aStyle]}>
      {children}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY INDICATOR ⇄ BUTTONS
//
// Position logic per role × card position in row:
//
//  role='parent', isLeftCard  → buttons below card, LEFT-aligned  (bottom-left corner)
//  role='parent', isRightCard → buttons below card, RIGHT-aligned (bottom-right corner)
//  role='center'              → buttons LEFT of card, vertically stacked column
//  role='child',  isLeftCard  → buttons above card, LEFT-aligned  (top-left corner)
//  role='child',  isRightCard → buttons above card, RIGHT-aligned (top-right corner)
//
// Button composition:
//   Male              → [blue ⇄]
//   Female, unmarried → [pink ⇄]
//   Female, married   → [pink ⇄] [blue ⇄]  (side-by-side horizontally for parent/child rows)
//                       [pink ⇄]             (stacked vertically for center column)
//                       [blue ⇄]
// ─────────────────────────────────────────────────────────────────────────────
function FamilyIndicators({ person, cardX, cardY, role, isLeftCard }) {
  if (role === 'spouse') return null;

  const isMale     = person.gender === 'male';
  const isFemale   = person.gender === 'female';
  const isMarried  = person.isMarried;

  // Build button list: [{color}]
  const btns = [];
  if (isMale) {
    btns.push(C.blueBtn);
  } else {
    btns.push(C.pinkBtn);
    if (isMarried) btns.push(C.blueBtn);
  }

  // ── CENTER: vertical column on LEFT side ──────────────────────────────────
  if (role === 'center') {
    const totalH = btns.length * CTR_BTN_H + (btns.length - 1) * CTR_BTN_GAP;
    const startY = cardY + (CARD_H - totalH) / 2;
    const bx     = cardX - CTR_BTN_OFF;
    return (
      <>
        {btns.map((color, i) => (
          <View key={i} style={[styles.sideBtn, {
            left: bx,
            top:  startY + i * (CTR_BTN_H + CTR_BTN_GAP),
            width: CTR_BTN_W, height: CTR_BTN_H,
            backgroundColor: color,
          }]}>
            <Text style={styles.sideBtnIcon}>⇄</Text>
          </View>
        ))}
      </>
    );
  }

  // ── PARENT row: horizontal row of buttons ─────────────────────────────────
  // Below card; left card → left-aligned, right card → right-aligned
  if (role === 'parent') {
    const totalW = btns.length * BTN_W + (btns.length - 1) * BTN_H_GAP;
    const bx = isLeftCard
      ? cardX                          // left-aligned to card left edge
      : cardX + CARD_W - totalW;       // right-aligned to card right edge
    const by = PARENTS_BTN_Y;
    return (
      <>
        {btns.map((color, i) => (
          <View key={i} style={[styles.sideBtn, {
            left: bx + i * (BTN_W + BTN_H_GAP),
            top:  by,
            width: BTN_W, height: BTN_H,
            backgroundColor: color,
          }]}>
            <Text style={styles.sideBtnIcon}>⇄</Text>
          </View>
        ))}
      </>
    );
  }

  // ── CHILD row: horizontal row of buttons ──────────────────────────────────
  // Above card; left card → left-aligned, right card → right-aligned
  if (role === 'child') {
    const totalW = btns.length * BTN_W + (btns.length - 1) * BTN_H_GAP;
    const bx = isLeftCard
      ? cardX                          // left-aligned to card left edge
      : cardX + CARD_W - totalW;       // right-aligned to card right edge
    const by = CHILDREN_BTN_Y;
    return (
      <>
        {btns.map((color, i) => (
          <View key={i} style={[styles.sideBtn, {
            left: bx + i * (BTN_W + BTN_H_GAP),
            top:  by,
            width: BTN_W, height: BTN_H,
            backgroundColor: color,
          }]}>
            <Text style={styles.sideBtnIcon}>⇄</Text>
          </View>
        ))}
      </>
    );
  }

  return null;
}

// ─── Person Card ─────────────────────────────────────────────────────────────
function PersonCard({ person, isCenter, onPress, cardW, cardH }) {
  const [following, setFollowing] = useState(false);
  const isDeceased = !!person.deathDate;
  const isFemale   = person.gender === 'female';

  let bg = C.gray, bd = C.grayBd;
  if (!isDeceased) { bg = isFemale ? C.pink : C.blue; bd = isFemale ? C.pinkBd : C.blueBd; }

  const fc = person.followers >= 1000 ? `${Math.round(person.followers/1000)}K` : `${person.followers}`;

  return (
    <TouchableOpacity
      activeOpacity={isCenter ? 1 : 0.78}
      onPress={!isCenter ? onPress : undefined}
      style={{ width: cardW, height: cardH }}
    >
      <View style={[styles.card, { backgroundColor: bg, borderColor: bd, width: cardW, height: cardH },
        isCenter && styles.cardCenter]}>

        <View style={styles.cardTop}>
          <View style={styles.photoWrap}>
            <Image source={{ uri: person.photo }} style={styles.photo} />
            <View style={styles.followerBubble}>
              <Text style={styles.followerTxt}>{fc}</Text>
            </View>
          </View>
          <View style={styles.nameCol}>
            <Text style={styles.nameTxt} numberOfLines={2}>{person.name}</Text>
            {isDeceased ? (
              <View style={styles.decTag}><Text style={styles.decTagTxt}>Deceased</Text></View>
            ) : (
              <TouchableOpacity
                onPress={() => setFollowing(v => !v)}
                style={[styles.followBtn, { borderColor: C.teal }, following && { backgroundColor: C.teal }]}
              >
                <Text style={[styles.followTxt, { color: following ? C.white : C.teal }]}>
                  {following ? 'Following' : `+ Follow | ${fc}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: bd }]} />

        <View style={styles.cardBottom}>
          <View style={[styles.accentBar, { backgroundColor: bd }]} />
          <View style={styles.infoCol}>
            <Text style={styles.profTxt} numberOfLines={1}>{person.profession}</Text>
            <View style={styles.locRow}>
              <Text style={styles.locTxt} numberOfLines={1}>{person.city}</Text>
              <View style={styles.flagWrap}>
                <Text style={styles.flagEmoji}>{person.flag}</Text>
                <Text style={styles.flagCode}>{person.flagCode}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>🎂</Text>
              <Text style={styles.dateTxt} numberOfLines={1}>{person.birthDate}</Text>
            </View>
            {isDeceased && (
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>✝</Text>
                <Text style={styles.dateTxt} numberOfLines={1}>{person.deathDate}</Text>
              </View>
            )}
            {isCenter && person.marriageDate && (
              <View style={[styles.marriageBand, { backgroundColor: C.blue }]}>
                <Text style={styles.dateIcon}>🎂</Text>
                <Text style={styles.dateTxt}>{person.marriageDate}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG CONNECTORS
//
// Parent bar:
//   - Hollow circle at each parent card bottom
//   - Vertical drop to bar
//   - Horizontal bar
//   - Dots sit ABOVE bar (between card bottoms and bar) → dotY = barY - DOT_ABOVE
//   - Vertical from bar midpoint down to center top
//   - Arrow touches center card top
//
// Child bar:
//   - Hollow circle at center card bottom
//   - Vertical drop to bar
//   - Horizontal bar
//   - Dots sit BELOW bar (between bar and child card tops) → dotY = barY + DOT_BELOW
//   - Vertical drops from bar to each child card top
//   - Arrow tip touches child card top directly (y2 = CHILDREN_CARD_Y)
// ─────────────────────────────────────────────────────────────────────────────
const DOT_R      = 5;
const DOT_ABOVE  = 14;  // how many px above bar the dots are rendered (parent side)
const DOT_BELOW  = 14;  // how many px below bar the dots are rendered (child side)
const ARROW_S    = 6;

function RelationshipConnector({ nodes, focusedId, allChildren, visibleChildren }) {
  const focused = nodes[focusedId];
  if (!focused) return null;

  const cxMid = focused.x + CARD_W / 2;
  const cTop  = focused.y;
  const cBot  = focused.y + CARD_H;
  const els   = [];

  // ── Parents → Center ─────────────────────────────────────────────────────
  const parentNodes = Object.values(nodes).filter(n => n.role === 'parent');
  if (parentNodes.length > 0) {
    // Bar sits 55% of the way from parent bottoms to center top
    const parBot = PARENTS_CARD_Y + CARD_H;
    const barY   = parBot + (cTop - parBot) * 0.55;
    const dotY   = barY - DOT_ABOVE;  // dots ABOVE bar

    parentNodes.forEach((pn, i) => {
      const px = pn.x + CARD_W / 2;
      els.push(
        <Circle key={`pcirc${i}`} cx={px} cy={pn.y + CARD_H} r={5}
          fill={C.bg} stroke={C.connector} strokeWidth={1.8} />,
        <Line key={`pdrop${i}`}
          x1={px} y1={pn.y + CARD_H} x2={px} y2={barY}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
      );
    });

    if (parentNodes.length === 1) {
      const px = parentNodes[0].x + CARD_W / 2;
      if (Math.abs(px - cxMid) > 1)
        els.push(<Line key="phbar" x1={px} y1={barY} x2={cxMid} y2={barY}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    } else {
      const leftX  = Math.min(...parentNodes.map(n => n.x + CARD_W / 2));
      const rightX = Math.max(...parentNodes.map(n => n.x + CARD_W / 2));
      const midX   = (leftX + rightX) / 2;

      // Horizontal bar
      els.push(<Line key="pbar" x1={leftX} y1={barY} x2={rightX} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);

      // Dots ABOVE bar — blue · pink · blue
      els.push(
        <Circle key="pd1" cx={midX - 13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
        <Circle key="pd2" cx={midX}      cy={dotY} r={DOT_R} fill={C.dotPink} />,
        <Circle key="pd3" cx={midX + 13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
      );

      // Horizontal from bar midpoint to cxMid if offset
      if (Math.abs(midX - cxMid) > 1)
        els.push(<Line key="pbarmid" x1={midX} y1={barY} x2={cxMid} y2={barY}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    }

    // Vertical down + arrow touching center top
    els.push(
      <Line key="pdown" x1={cxMid} y1={barY} x2={cxMid} y2={cTop}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
      <Path key="parrow"
        d={`M${cxMid-ARROW_S},${cTop-ARROW_S*1.2} L${cxMid},${cTop} L${cxMid+ARROW_S},${cTop-ARROW_S*1.2}`}
        stroke={C.connector} strokeWidth={1.8} fill="none"
        strokeLinecap="round" strokeLinejoin="round" />,
    );
  }

  // ── Center → Children ────────────────────────────────────────────────────
  if (visibleChildren.length > 0) {
    // Bar sits 45% of the way from center bottom to child card top
    const barY  = cBot + (CHILDREN_CARD_Y - cBot) * 0.45;
    const dotY  = barY + DOT_BELOW;  // dots BELOW bar

    // Hollow circle at center bottom
    els.push(
      <Circle key="ccirc" cx={cxMid} cy={cBot} r={5}
        fill={C.bg} stroke={C.connector} strokeWidth={1.8} />,
      <Line key="cdrop" x1={cxMid} y1={cBot} x2={cxMid} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
    );

    const childXMids = visibleChildren.map(cid => {
      const cn = nodes[cid];
      return cn ? cn.x + CARD_W / 2 : cxMid;
    });
    const leftX   = Math.min(...childXMids);
    const rightX  = Math.max(...childXMids);
    const barMidX = (leftX + rightX) / 2;

    // Horizontal from cxMid to bar midpoint if needed
    if (Math.abs(barMidX - cxMid) > 1)
      els.push(<Line key="chmidbar" x1={cxMid} y1={barY} x2={barMidX} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);

    if (visibleChildren.length > 1)
      els.push(<Line key="chbar" x1={leftX} y1={barY} x2={rightX} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);

    // Child count dots BELOW bar
    const totalDots  = allChildren.length;
    const dotSpacing = 16;
    const dotsStartX = barMidX - ((totalDots - 1) * dotSpacing) / 2;

    allChildren.forEach((cid, idx) => {
      const child    = PEOPLE[cid];
      const isFocus  = cid === focusedId;
      const dotColor = child.gender === 'male' ? C.dotBlue : C.dotPink;
      const dimColor = child.gender === 'male' ? C.dotBlueDim : C.dotPinkDim;
      const dotX     = dotsStartX + idx * dotSpacing;

      if (isFocus) {
        // Bold: outer ring + filled inner
        els.push(
          <Circle key={`dotring${idx}`} cx={dotX} cy={dotY} r={7.5}
            fill={C.bg} stroke={dotColor} strokeWidth={2.2} />,
          <Circle key={`dotfill${idx}`} cx={dotX} cy={dotY} r={4.5} fill={dotColor} />,
        );
      } else {
        els.push(<Circle key={`dot${idx}`} cx={dotX} cy={dotY} r={DOT_R} fill={dimColor} />);
      }
    });

    // Vertical drops + arrows touching each child card top directly
    visibleChildren.forEach((cid, i) => {
      const cx = childXMids[i];
      els.push(
        <Line key={`chdrop${i}`} x1={cx} y1={barY} x2={cx} y2={CHILDREN_CARD_Y}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
        // Arrow tip = CHILDREN_CARD_Y (touches card top)
        <Path key={`charrow${i}`}
          d={`M${cx-ARROW_S},${CHILDREN_CARD_Y-ARROW_S*1.2} L${cx},${CHILDREN_CARD_Y} L${cx+ARROW_S},${CHILDREN_CARD_Y-ARROW_S*1.2}`}
          stroke={C.connector} strokeWidth={1.8} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />,
      );
    });
  }

  return (
    <Svg style={StyleSheet.absoluteFill} width={SW} height={CANVAS_H} pointerEvents="none">
      {els}
    </Svg>
  );
}

// ─── Heart badge ─────────────────────────────────────────────────────────────
function HeartBadge({ nodes }) {
  const pE = Object.entries(nodes).filter(([,n]) => n.role === 'parent');
  if (pE.length < 2) return null;
  const sorted = pE.sort((a,b) => a[1].x - b[1].x);
  const left   = sorted[0][1];
  const right  = sorted[sorted.length-1][1];
  const hx = (left.x + CARD_W + right.x) / 2 - 11;
  const hy = left.y + CARD_H / 2 - 12;
  return (
    <View style={[styles.heartBadge, { left: hx, top: hy }]}>
      <Text style={{ fontSize: 20 }}>❤️</Text>
    </View>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.homeBtn}>
        <View style={styles.houseWrap}>
          <View style={styles.roof} />
          <View style={styles.chimney} />
          <View style={styles.houseBody}><View style={styles.door} /></View>
        </View>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Text style={styles.hdrIcon}>⇄</Text>
          <View style={[styles.hdrDot, { backgroundColor: C.dotBlue }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Text style={styles.hdrIcon}>⇄</Text>
          <View style={[styles.hdrDot, { backgroundColor: C.dotPink }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Add Hiver ───────────────────────────────────────────────────────────────
function AddHiver() {
  return (
    <View style={styles.addHiverWrap}>
      <TouchableOpacity style={styles.addHiverBtn} activeOpacity={0.85}>
        <View style={styles.plusCircle}><Text style={styles.plusTxt}>+</Text></View>
        <Text style={styles.addHiverLabel}>Add Hiver</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HiveFamilyTree({ initialFocusId = 'sandhya' }) {
  const [focusedPersonId, setFocusedPersonId] = useState(initialFocusId);

  const { nodes, allChildren, children: visibleChildren } = useMemo(
    () => buildLayout(focusedPersonId), [focusedPersonId],
  );

  const handlePress = useCallback((id) => {
    if (id !== focusedPersonId) setFocusedPersonId(id);
  }, [focusedPersonId]);

  const renderOrder = useMemo(
    () => Object.entries(nodes).sort((a,b) => a[1].zIndex - b[1].zIndex), [nodes],
  );

  // Determine left/right position for parent and child rows
  const parentEntries = Object.entries(nodes).filter(([,n]) => n.role === 'parent').sort((a,b) => a[1].x - b[1].x);
  const childEntries  = Object.entries(nodes).filter(([,n]) => n.role === 'child').sort((a,b) => a[1].x - b[1].x);
  const leftParentId  = parentEntries[0]?.[0];
  const leftChildId   = childEntries[0]?.[0];

  return (
    <View style={styles.canvas}>
      <RelationshipConnector
        nodes={nodes} focusedId={focusedPersonId}
        allChildren={allChildren} visibleChildren={visibleChildren}
      />
      <HeartBadge nodes={nodes} />

      {renderOrder.map(([id, nd]) => (
        <AnimatedNode key={id} x={nd.x} y={nd.y} zIndex={nd.zIndex} width={nd.w} height={nd.h}>
          <PersonCard
            person={PEOPLE[id]} nodeData={nd}
            isCenter={id === focusedPersonId}
            onPress={() => handlePress(id)}
            cardW={nd.w} cardH={nd.h}
          />
        </AnimatedNode>
      ))}

      {/* ⇄ buttons — outside AnimatedNode to avoid clipping */}
      {renderOrder.map(([id, nd]) => {
        if (nd.role === 'spouse') return null;
        // isLeftCard: for parents, leftmost = left; for children, leftmost = left
        const isLeftCard =
          nd.role === 'parent' ? id === leftParentId :
          nd.role === 'child'  ? id === leftChildId  :
          true; // center has no left/right concept, handled separately
        return (
          <FamilyIndicators
            key={`fi_${id}`}
            person={PEOPLE[id]}
            cardX={nd.x} cardY={nd.y}
            role={nd.role}
            isLeftCard={isLeftCard}
          />
        );
      })}

      <Header />
      <AddHiver />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  canvas: { flex: 0.9, width: SW, backgroundColor: C.bg, overflow: 'hidden' },

  card: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 } },
  cardCenter: { elevation: 12, shadowOpacity: 0.2, shadowRadius: 13,
    shadowOffset: { width: 0, height: 5 } },

  cardTop: { flexDirection: 'row', height: 80 },
  photoWrap: { width: 88, height: '100%', position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  followerBubble: { position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 7,
    paddingHorizontal: 4, paddingVertical: 1 },
  followerTxt: { fontSize: 9.5, fontWeight: '800', color: C.text },
  nameCol: { flex: 1, paddingLeft: 8, paddingTop: 9, paddingRight: 6 },
  nameTxt: { fontSize: 13, fontWeight: '800', color: C.text, lineHeight: 16 },
  decTag: { marginTop: 6, backgroundColor: C.decBg, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  decTagTxt: { color: C.white, fontSize: 9.5, fontWeight: '700' },
  followBtn: { marginTop: 6, borderWidth: 1.5, borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  followTxt: { fontSize: 9.5, fontWeight: '700' },
  divider: { height: 1, opacity: 0.3 },
  cardBottom: { flex: 1, flexDirection: 'row' },
  accentBar: { width: 3, alignSelf: 'stretch', opacity: 0.6 },
  infoCol: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, gap: 3 },
  profTxt: { fontSize: 10.5, color: C.sub, fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locTxt: { fontSize: 10, color: '#666', flex: 1 },
  flagWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  flagEmoji: { fontSize: 12 },
  flagCode: { fontSize: 10, fontWeight: '700', color: '#666' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateIcon: { fontSize: 9 },
  dateTxt: { fontSize: 9.5, color: '#777', flex: 1 },
  marriageBand: { flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },

  sideBtn: { position: 'absolute', borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', zIndex: 35,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.13,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  sideBtnIcon: { color: C.white, fontSize: 15, fontWeight: '700' },

  heartBadge: { position: 'absolute', zIndex: 40,
    alignItems: 'center', justifyContent: 'center' },

  header: { position: 'absolute', top: 0, left: 0, width: SW, height: HEADER_H,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, backgroundColor: C.bg,
    zIndex: 200 },
  homeBtn: { padding: 3 },
  houseWrap: { alignItems: 'center', width: 26, height: 26 },
  roof: { width: 0, height: 0, borderLeftWidth: 13, borderRightWidth: 13,
    borderBottomWidth: 11, borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: C.black, marginBottom: -1 },
  chimney: { position: 'absolute', top: 0, right: 7, width: 4, height: 5,
    backgroundColor: C.black, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  houseBody: { width: 18, height: 13, backgroundColor: C.black, borderRadius: 1,
    alignItems: 'center', justifyContent: 'flex-end' },
  door: { width: 5, height: 7, backgroundColor: C.bg,
    borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hdrIconWrap: { position: 'relative', alignItems: 'center',
    justifyContent: 'center', width: 26, height: 26 },
  hdrIcon: { fontSize: 21, color: C.black, fontWeight: '700' },
  searchIcon: { fontSize: 18 },
  hdrDot: { position: 'absolute', bottom: -1, right: -2, width: 8, height: 8,
    borderRadius: 4, borderWidth: 1.5, borderColor: C.bg },

  addHiverWrap: { position: 'absolute', bottom: 14, left: 0, right: 0,
    alignItems: 'center', zIndex: 100 },
  addHiverBtn: { flexDirection: 'row', alignItems: 'center', 
    borderRadius: 30, paddingHorizontal: 26, paddingVertical: 11, gap: 11,},
   
  plusCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.black,
    alignItems: 'center', justifyContent: 'center' },
  plusTxt: { fontSize: 19, color: C.white, fontWeight: '800', lineHeight: 22, marginTop: -1 },
  addHiverLabel: { color: C.black, fontSize: 18,  letterSpacing: 0.2,fontFamily:'SofiaSansCondensed-Bold' },
});