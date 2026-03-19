/**
 * HiveFamilyTree.js — Single file, complete implementation
 *
 * New in this version:
 *  - Long press any card → context popup (photo, name, relation, menu items)
 *  - Sandhya now has 3 children: raghav, shruti, dev
 *  - Children row shows 2 at a time; left/right arrows swap to next/prev pair
 *  - Selected cards get orange border + orange checkmark on photo
 *  - Bottom bar shows "N Selected | Clear | Next →" when any card is selected
 *
 * Dependencies:
 *   npx expo install react-native-reanimated react-native-svg react-native-gesture-handler
 *   babel.config.js → plugins: ['react-native-reanimated/plugin']
 */

import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Dimensions, Image, PanResponder, ScrollView,
  StyleSheet, Text, TouchableOpacity,
  TouchableWithoutFeedback, View,
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
  bg: '#FDF6EE', pink: 'rgba(255, 233, 251, 1)', pinkBd: 'rgba(255, 193, 244, 1)',
  blue: 'rgba(215, 240, 255, 1)', blueBd: 'rgba(177, 225, 255, 1)', gray: '#E4E4E4', grayBd: 'rgba(212, 212, 212, 1)',
  teal: '#5BB8D4', pinkBtn: 'rgba(255, 193, 244, 1)', blueBtn: 'rgba(177, 225, 255, 1)',
  connector: '#BBBBBB', dotBlue: 'rgba(177, 225, 255, 1)', dotPink: 'rgba(255, 193, 244, 1)',
  dotBlueDim: 'rgba(168, 216, 236, 1)', dotPinkDim: 'rgba(240, 170, 206, 1)',
  text: '#1A1A1A', sub: '#555', white: '#FFF', black: '#111', decBg: '#B0B0B0',
  orange: '#F5A623', orangeLight: '#FFF3E0',
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
  // 3rd child of Sandhya
  dev: { id:'dev', name:'Dev Kohli', photo:'https://randomuser.me/api/portraits/men/22.jpg',
    gender:'male', birthDate:'Mar 5, 2002', deathDate:null,
    profession:'Student (Class 12)', city:'Noida', flag:'🇮🇳', flagCode:'IN', followers:56, isMarried:false },
  vikram: { id:'vikram', name:'Vikram Seth', photo:'https://randomuser.me/api/portraits/men/60.jpg',
    gender:'male', birthDate:'Dec 3, 1930', deathDate:'Jul 22, 2010',
    profession:'Retired Judge', city:'Allahabad', flag:'🇮🇳', flagCode:'IN', followers:5, isMarried:true },
  kamla: { id:'kamla', name:'Kamla Seth', photo:'https://randomuser.me/api/portraits/women/60.jpg',
    gender:'female', birthDate:'Mar 8, 1935', deathDate:'Nov 14, 2018',
    profession:'Teacher', city:'Allahabad', flag:'🇮🇳', flagCode:'IN', followers:2, isMarried:true },
  rohan: { id:'rohan', name:'Rohan Seth', photo:'https://randomuser.me/api/portraits/men/34.jpg',
    gender:'male', birthDate:'May 20, 1970', deathDate:null,
    profession:'Software Engineer', city:'Mumbai', flag:'🇮🇳', flagCode:'IN', followers:128, isMarried:true },
  priya: { id:'priya', name:'Priya Seth', photo:'https://randomuser.me/api/portraits/women/35.jpg',
    gender:'female', birthDate:'Aug 14, 1972', deathDate:null,
    profession:'Architect', city:'Pune', flag:'🇮🇳', flagCode:'IN', followers:74, isMarried:false },
};

const RELATIONSHIPS = [
  { type:'parent', sourceId:'vikram', targetId:'shubham' },
  { type:'parent', sourceId:'kamla',  targetId:'shubham' },
  { type:'spouse', sourceId:'shubham', targetId:'maya' },
  { type:'parent', sourceId:'shubham', targetId:'sandhya' },
  { type:'parent', sourceId:'maya',    targetId:'sandhya' },
  { type:'parent', sourceId:'shubham', targetId:'rohan' },
  { type:'parent', sourceId:'maya',    targetId:'rohan' },
  { type:'parent', sourceId:'shubham', targetId:'priya' },
  { type:'parent', sourceId:'maya',    targetId:'priya' },
  { type:'spouse', sourceId:'sandhya', targetId:'arjun' },
  { type:'parent', sourceId:'sandhya', targetId:'raghav' },
  { type:'parent', sourceId:'sandhya', targetId:'shruti' },
  { type:'parent', sourceId:'sandhya', targetId:'dev' },
  { type:'parent', sourceId:'arjun',   targetId:'raghav' },
  { type:'parent', sourceId:'arjun',   targetId:'shruti' },
  { type:'parent', sourceId:'arjun',   targetId:'dev' },
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
function getSiblings(id) {
  const myParents = getParents(id);
  if (myParents.length === 0) return [];
  const sibSet = new Set();
  myParents.forEach(pid => {
    getChildren(pid).forEach(cid => { if (cid !== id) sibSet.add(cid); });
  });
  return [...sibSet];
}

// Derive relationship label for popup subtitle
function getRelationLabel(personId, focusedId) {
  const focused = PEOPLE[focusedId];
  if (!focused) return '';
  const focusedName = focused.name.split(' ')[0];
  if (getParents(focusedId).includes(personId)) {
    return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Father` : `${focusedName}'s Mother`;
  }
  if (getChildren(focusedId).includes(personId)) {
    return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Son` : `${focusedName}'s Daughter`;
  }
  if (getSpouses(focusedId).includes(personId)) {
    return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Husband` : `${focusedName}'s Wife`;
  }
  const sib = getSiblings(focusedId);
  if (sib.includes(personId)) {
    return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Brother` : `${focusedName}'s Sister`;
  }
  return '';
}

// ─── Layout constants ────────────────────────────────────────────────────────
const HEADER_H    = 54;
const CARD_W      = 164;
const CARD_H      = 155;
const H_GAP       = 40;
const CHILDREN_PER_PAGE = 2;   // show 2 children at a time

const BTN_W       = 34;
const BTN_H       = 32;
const BTN_H_GAP   = 5;
const BTN_V_GAP   = 6;

const CTR_BTN_W   = 34;
const CTR_BTN_H   = 32;
const CTR_BTN_GAP = 6;
const CTR_BTN_OFF = 44;

const ADD_HIVER_H = 56;
const USABLE_H    = CANVAS_H - HEADER_H - ADD_HIVER_H;

const ZONE_T = USABLE_H * 0.27;
const ZONE_M = USABLE_H * 0.36;
const ZONE_B = USABLE_H * 0.32;

const PARENTS_CARD_Y  = HEADER_H + (ZONE_T - CARD_H) / 2;
const PARENTS_BTN_Y   = PARENTS_CARD_Y + CARD_H + BTN_V_GAP;
const CENTER_CARD_Y   = HEADER_H + ZONE_T + (ZONE_M - CARD_H) / 2;
const CHILDREN_CARD_Y = HEADER_H + ZONE_T + ZONE_M + (ZONE_B - CARD_H) / 2;
const CHILDREN_BTN_Y  = CHILDREN_CARD_Y - BTN_H - BTN_V_GAP;

const SPOUSE_OFFSET_X = 14;
const SPOUSE_OFFSET_Y = 14;

function rowXs(count, cw = CARD_W, gap = H_GAP) {
  const total = count * cw + (count - 1) * gap;
  const start = (SW - total) / 2;
  return Array.from({ length: count }, (_, i) => start + i * (cw + gap));
}

// childPage: 0-based page index for child pagination
function buildLayout(focusedId, childPage = 0) {
  const nodes = {};
  const parents     = getParents(focusedId);
  const spouses     = getSpouses(focusedId);
  const allChildren = getChildren(focusedId);

  // Paginate children: show CHILDREN_PER_PAGE at a time
  const pageStart     = childPage * CHILDREN_PER_PAGE;
  const visibleChildren = allChildren.slice(pageStart, pageStart + CHILDREN_PER_PAGE);

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
  if (visibleChildren.length > 0) {
    const xs = rowXs(visibleChildren.length);
    visibleChildren.forEach((cid, i) => {
      nodes[cid] = { x: xs[i], y: CHILDREN_CARD_Y, w: CARD_W, h: CARD_H, role: 'child', zIndex: 5 };
    });
  }

  const totalChildPages = Math.ceil(allChildren.length / CHILDREN_PER_PAGE);
  return { nodes, allChildren, visibleChildren, totalChildPages };
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
// CONTEXT POPUP  (long press)
// Shows: large photo, name, relation label, then menu items
// ─────────────────────────────────────────────────────────────────────────────
const POPUP_MENU = [
  { icon: require('../../../assets/images/chat/add.png'), label: 'Add Hiver' },
  { icon: require('../../../assets/images/profile/user1.png'), label: 'Profile' },
  { icon: require('../../../assets/images/tabs/chatter.png'), label: 'Chattrz' },
  { icon: require('../../../assets/images/chat/docs.png'), label: 'Seth Diaries' },
  { icon: require('../../../assets/images/profile/block.png'), label: 'Block' },
];

// ── Popup layout constants ────────────────────────────────────────────────
const POPUP_W       = SW * 0.54;  // ~60% screen width (compact)
const POPUP_PHOTO_H = 118;        // photo height
const POPUP_ITEM_H  = 32;         // menu item row height
const POPUP_NAME_H  = 52;         // name+relation band
const POPUP_TOTAL_H = POPUP_PHOTO_H + POPUP_NAME_H + POPUP_MENU.length * POPUP_ITEM_H;

/**
 * CardPopup
 *
 * Anchoring (matches screenshot):
 *  - Popup LEFT edge = card's horizontal midpoint (overlapping right half of card)
 *  - If that causes right overflow → mirror: popup RIGHT edge = card's horizontal midpoint
 *  - Popup TOP = card top, clamped to stay inside canvas
 *
 * The teal ✓ checkbox in top-right corner ONLY toggles selection when tapped.
 * Long press itself does NOT auto-select.
 */
const ARROW_SIZE = 10; // half-size of the caret triangle

function CardPopup({ person, focusedId, cardX, cardY, isSelected, onToggleSelect, onClose }) {
  if (!person) return null;
  const relation = getRelationLabel(person.id, focusedId);

  // Determine which side to open on
  const cardMidX = cardX + CARD_W / 2;
  const openRight = cardMidX + POPUP_W <= SW - 4; // enough room to open right?
  let popupLeft = openRight ? cardMidX : cardMidX - POPUP_W;
  popupLeft = Math.max(4, Math.min(SW - POPUP_W - 4, popupLeft));

  // Popup top = card top, clamped
  const minTop = HEADER_H + 2;
  const maxTop = CANVAS_H - POPUP_TOTAL_H - 8;
  const popupTop = Math.max(minTop, Math.min(maxTop, cardY));

  // Arrow vertical position: align with card vertical center relative to popup top
  const cardCenterY = cardY + CARD_H / 2;
  const arrowTop = Math.max(16, Math.min(
    POPUP_TOTAL_H - 16 - ARROW_SIZE * 2,
    cardCenterY - popupTop - ARROW_SIZE,
  ));

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.popupOverlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          {/* Wrapper for popup + arrow together, positioned absolutely */}
          <View style={{ position: 'absolute', left: popupLeft, top: popupTop }}>

            {/* ── Caret arrow pointing back toward the card ── */}
            {openRight ? (
              // Arrow on LEFT side of popup, pointing LEFT ◀
              <View style={[styles.caretLeft, { top: arrowTop }]} />
            ) : (
              // Arrow on RIGHT side of popup, pointing RIGHT ▶
              <View style={[styles.caretRight, { top: arrowTop }]} />
            )}

            {/* ── Popup card ── */}
            <View style={[styles.popupCard, { width: POPUP_W, marginLeft: openRight ? ARROW_SIZE : 0, marginRight: openRight ? 0 : ARROW_SIZE }]}>

              {/* Photo */}
              <View style={[styles.popupPhotoWrap, { height: POPUP_PHOTO_H }]}>
                <Image source={{ uri: person.photo }} style={styles.popupPhoto} />
                <TouchableOpacity
                  style={[styles.popupCheck, isSelected && styles.popupCheckSelected]}
                  onPress={onToggleSelect}
                  activeOpacity={0.8}
                >
                  <Text style={styles.popupCheckTxt}>{isSelected ? '✓' : ''}</Text>
                </TouchableOpacity>
              </View>

              {/* Name + relation */}
              <View style={styles.popupNameWrap}>
                <Text style={styles.popupName} numberOfLines={1}>{person.name}</Text>
                {!!relation && <Text style={styles.popupRelation}>{relation}</Text>}
              </View>

              {/* Menu items */}
              {POPUP_MENU.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.popupMenuItem,
                    { height: POPUP_ITEM_H },
                    i === POPUP_MENU.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={onClose}
                  // activeOpacity={0.7}
                >
                  <Image source={item.icon} style={{ width: 20, height: 20, resizeMode: 'contain' }} tintColor={'black'} />
                  <Text style={styles.popupMenuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY INDICATOR ⇄ BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
function FamilyIndicators({ person, cardX, cardY, role, isLeftCard }) {
  if (role === 'spouse') return null;
  const isMale    = person.gender === 'male';
  const isMarried = person.isMarried;
  const btns = isMale ? [C.blueBtn] : (isMarried ? [C.pinkBtn, C.blueBtn] : [C.pinkBtn]);

  if (role === 'center') {
    const totalH = btns.length * CTR_BTN_H + (btns.length - 1) * CTR_BTN_GAP;
    const startY = cardY + (CARD_H - totalH) / 2;
    const bx     = cardX - CTR_BTN_OFF;
    return (
      <>
        {btns.map((color, i) => (
          <View key={i} style={[styles.sideBtn, {
            left: bx, top: startY + i*(CTR_BTN_H+CTR_BTN_GAP),
            width: CTR_BTN_W, height: CTR_BTN_H, backgroundColor: color,
          }]}>
            <Image source={require('../../../assets/images/hive/Path.png')} style={{height: 20, width: 20}} />
          </View>
        ))}
      </>
    );
  }

  const totalW = btns.length * BTN_W + (btns.length - 1) * BTN_H_GAP;
  const bx = isLeftCard ? cardX : cardX + CARD_W - totalW;
  const by = role === 'parent' ? PARENTS_BTN_Y : CHILDREN_BTN_Y;

  return (
    <>
      {btns.map((color, i) => (
        <View key={i} style={[styles.sideBtn, {
          left: bx + i*(BTN_W+BTN_H_GAP), top: by,
          width: BTN_W, height: BTN_H, backgroundColor: color,
        }]}>
          <Image source={require('../../../assets/images/hive/Path.png')} style={{height: 20, width: 20}} />
        </View>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSON CARD
// ─────────────────────────────────────────────────────────────────────────────
function PersonCard({ person, isCenter, isSelected, onPress, onLongPress, cardW, cardH }) {
  const [following, setFollowing] = useState(false);
  const isDeceased = !!person.deathDate;
  const isFemale   = person.gender === 'female';

  let bg = C.gray, bd = C.grayBd;
  if (!isDeceased) { bg = isFemale ? C.pink : C.blue; bd = isFemale ? C.pinkBd : C.blueBd; }
  if (isSelected) bd = C.orange;

  const fc = person.followers >= 1000 ? `${Math.round(person.followers/1000)}K` : `${person.followers}`;

  return (
    <TouchableOpacity
      activeOpacity={isCenter ? 1 : 0.78}
      onPress={!isCenter ? onPress : undefined}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={{ width: cardW, height: cardH }}
    >
      <View style={[
        styles.card,
        { backgroundColor: bg, borderColor: bd, width: cardW, height: cardH },
        isCenter && styles.cardCenter,
        isSelected && styles.cardSelected,
      ]}>
        <View style={styles.cardTop}>
          <View style={styles.photoWrap}>
            <Image source={{ uri: person.photo }} style={styles.photo} />
            {/* Follower count OR selected checkmark */}
            {isSelected ? (
              <View style={[styles.followerBubble, { backgroundColor: C.orange }]}>
                <Text style={[styles.followerTxt, { color: C.white }]}>✓</Text>
              </View>
            ) : (
              <View style={styles.followerBubble}>
                <Text style={styles.followerTxt}>{fc}</Text>
              </View>
            )}
          </View>
          <View style={styles.nameCol}>
            <Text style={styles.nameTxt} numberOfLines={2}>{person.name}</Text>
            {isDeceased ? (
              <View style={styles.decTag}><Text style={styles.decTagTxt}>Deceased</Text></View>
            ) : (
              <TouchableOpacity
                onPress={() => setFollowing(v => !v)}
                style={[styles.followBtn, { borderColor: 'rgba(0, 107, 165, 0.5)' }, following && { backgroundColor: 'rgba(0, 107, 165, 0.5)' }]}
              >
                <Text style={[styles.followTxt, { color: '#000'}]}>
                  {following ? 'Following' : `+ Follow | ${fc}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* <View style={[styles.divider, { backgroundColor: bd }]} /> */}

        <View style={styles.cardBottom}>
          <View style={[styles.accentBar, { backgroundColor: isSelected ? C.orange : bd }]} />
          <View style={styles.infoCol}>
            <Text style={styles.profTxt} numberOfLines={1}>{person.profession}</Text>
            <View style={styles.locRow}>
              <Text style={styles.locTxt} numberOfLines={1}>{person.city}</Text>
              <View style={styles.flagWrap}>
                <Text style={styles.flagEmoji}>{person.flag}</Text>
                <Text style={styles.flagCode}>{person.flagCode}</Text>
              </View>
            </View>
            
\
            {/* {isCenter && person.marriageDate && (
              <View style={[styles.marriageBand, { backgroundColor: C.blue }]}>
                <Text style={styles.dateIcon}>🎂</Text>
                <Text style={styles.dateTxt}>{person.marriageDate}</Text>
              </View>
            )} */}
          </View>
          <View style={[styles.dateRow,{backgroundColor: isSelected ? C.orange : bd}]}>
              {!person.deathDate && (
                <Image source={require('../../../assets/images/hive/Cake.png')} style={{height: 16, width: 16}} />
              )}
              <Text style={styles.dateTxt} numberOfLines={1}> {person.deathDate
    ? `${person.birthDate} - ${person.deathDate}`
    : person.birthDate}</Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG CONNECTORS
// ─────────────────────────────────────────────────────────────────────────────
const DOT_R     = 5;
const DOT_ABOVE = 14;
const DOT_BELOW = 14;
const ARROW_S   = 6;

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
    const parBot = PARENTS_CARD_Y + CARD_H;
    const barY   = parBot + (cTop - parBot) * 0.55;
    const dotY   = barY - DOT_ABOVE;

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
      const leftX = Math.min(...parentNodes.map(n => n.x + CARD_W / 2));
      const rightX = Math.max(...parentNodes.map(n => n.x + CARD_W / 2));
      const midX   = (leftX + rightX) / 2;
      els.push(
        <Line key="pbar" x1={leftX} y1={barY} x2={rightX} y2={barY}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
        <Circle key="pd1" cx={midX-13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
        <Circle key="pd2" cx={midX}    cy={dotY} r={DOT_R} fill={C.dotPink} />,
        <Circle key="pd3" cx={midX+13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
      );
      if (Math.abs(midX - cxMid) > 1)
        els.push(<Line key="pbarmid" x1={midX} y1={barY} x2={cxMid} y2={barY}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    }
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
    const barY  = cBot + (CHILDREN_CARD_Y - cBot) * 0.45;
    const dotY  = barY + DOT_BELOW;

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

    if (Math.abs(barMidX - cxMid) > 1)
      els.push(<Line key="chmidbar" x1={cxMid} y1={barY} x2={barMidX} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    if (visibleChildren.length > 1)
      els.push(<Line key="chbar" x1={leftX} y1={barY} x2={rightX} y2={barY}
        stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);

    // Child count dots BELOW bar — all allChildren, focused = bold ring
    const dotSpacing = 16;
    const dotsStartX = barMidX - ((allChildren.length - 1) * dotSpacing) / 2;
    allChildren.forEach((cid, idx) => {
      const child    = PEOPLE[cid];
      const isFocus  = cid === focusedId;
      const dotColor = child.gender === 'male' ? C.dotBlue : C.dotPink;
      const dimColor = child.gender === 'male' ? C.dotBlueDim : C.dotPinkDim;
      const dotX     = dotsStartX + idx * dotSpacing;
      if (isFocus) {
        els.push(
          <Circle key={`dotring${idx}`} cx={dotX} cy={dotY} r={7.5}
            fill={C.bg} stroke={dotColor} strokeWidth={2.2} />,
          <Circle key={`dotfill${idx}`} cx={dotX} cy={dotY} r={4.5} fill={dotColor} />,
        );
      } else {
        els.push(<Circle key={`dot${idx}`} cx={dotX} cy={dotY} r={DOT_R} fill={dimColor} />);
      }
    });

    visibleChildren.forEach((cid, i) => {
      const cx = childXMids[i];
      els.push(
        <Line key={`chdrop${i}`} x1={cx} y1={barY} x2={cx} y2={CHILDREN_CARD_Y}
          stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
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

// ─── Sibling nav arrows ───────────────────────────────────────────────────────
function SiblingNavArrows({ focusedPersonId, onNavigate }) {
  const siblings    = useMemo(() => getSiblings(focusedPersonId), [focusedPersonId]);
  const orderedList = useMemo(() => {
    const myParents = getParents(focusedPersonId);
    if (myParents.length === 0) return [];
    return getChildren(myParents[0]);
  }, [focusedPersonId]);

  if (siblings.length === 0) return null;

  const focusedIdx  = orderedList.indexOf(focusedPersonId);
  const prevSibling = focusedIdx > 0 ? orderedList[focusedIdx - 1] : null;
  const nextSibling = focusedIdx >= 0 && focusedIdx < orderedList.length - 1 ? orderedList[focusedIdx + 1] : null;
  const arrowY      = CANVAS_H / 2 - 22;

  return (
    <>
      {prevSibling && (
        <TouchableOpacity
          style={[styles.sibArrow, styles.sibArrowLeft, { top: arrowY }]}
          onPress={() => onNavigate(prevSibling)} activeOpacity={0.7}
        >
          <Text style={styles.sibArrowTxt}>‹</Text>
        </TouchableOpacity>
      )}
      {nextSibling && (
        <TouchableOpacity
          style={[styles.sibArrow, styles.sibArrowRight, { top: arrowY }]}
          onPress={() => onNavigate(nextSibling)} activeOpacity={0.7}
        >
          <Text style={styles.sibArrowTxt}>›</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.homeBtn}>
        <Image source={require('../../../assets/images/hive/home.png')} style={{height: 24, width: 24}} />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Image source={require('../../../assets/images/hive/male.png')} style={{height: 24, width: 24}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Image source={require('../../../assets/images/hive/female.png')} style={{height: 24, width: 24}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.hdrIconWrap}>
          <Image source={require('../../../assets/images/home/search.png')} style={{height: 24, width: 24}} />
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

// ─── Selection bar ────────────────────────────────────────────────────────────
function SelectionBar({ count, onClear, onNext }) {
  if (count === 0) return null;
  return (
    <View style={styles.selBar}>
      <Text style={styles.selCount}>{count} Selected</Text>
      <TouchableOpacity onPress={onClear} style={styles.selClearBtn}>
        <Text style={styles.selClearTxt}>Clear</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={onNext} style={styles.selNextBtn}>
        <Text style={styles.selNextTxt}>Next  →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HiveFamilyTree({ initialFocusId = 'sandhya' }) {
  const [focusedPersonId, setFocusedPersonId] = useState(initialFocusId);
  const [childPage, setChildPage]             = useState(0);
  const [popupData, setPopupData]             = useState(null); // { person, cardX, cardY }
  const [selectedIds, setSelectedIds]         = useState(new Set());

  // Reset child page when focus changes
  useEffect(() => { setChildPage(0); }, [focusedPersonId]);

  const { nodes, allChildren, visibleChildren, totalChildPages } = useMemo(
    () => buildLayout(focusedPersonId, childPage),
    [focusedPersonId, childPage],
  );

  const handlePress = useCallback((id) => {
    if (id !== focusedPersonId) setFocusedPersonId(id);
  }, [focusedPersonId]);

  const handleLongPress = useCallback((id) => {
    const nd = nodes[id];
    if (!nd) return;
    // Popup opens near card — overlapping from card's horizontal midpoint
    // Always opens to the right half of card extending rightward,
    // unless that would overflow screen, then mirror to left
    setPopupData({ person: PEOPLE[id], cardX: nd.x, cardY: nd.y });
  }, [nodes]);

  // Called from popup checkbox only
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const renderOrder = useMemo(
    () => Object.entries(nodes).sort((a,b) => a[1].zIndex - b[1].zIndex), [nodes],
  );

  const parentEntries = Object.entries(nodes).filter(([,n]) => n.role==='parent').sort((a,b) => a[1].x-b[1].x);
  const childEntries  = Object.entries(nodes).filter(([,n]) => n.role==='child').sort((a,b) => a[1].x-b[1].x);
  const leftParentId  = parentEntries[0]?.[0];
  const leftChildId   = childEntries[0]?.[0];

  // ── Swipe gesture for child row pagination ──────────────────────────────
  // A horizontal swipe anywhere in the children zone (CHILDREN_BTN_Y to canvas bottom)
  // slides to next or previous child page. No arrows shown — pure gesture.
  const swipeStartX = useRef(0);
  const childSwipePan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (e) => {
      // Only capture touches in the children zone
      const y = e.nativeEvent.pageY;
      return y >= CHILDREN_BTN_Y - 20;
    },
    onMoveShouldSetPanResponder: (e, gs) =>
      Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderGrant: (e) => {
      swipeStartX.current = e.nativeEvent.pageX;
    },
    onPanResponderRelease: (e, gs) => {
      const SWIPE_THRESHOLD = 40;
      if (gs.dx < -SWIPE_THRESHOLD) {
        // Swipe left → next page
        setChildPage(p => Math.min(totalChildPages - 1, p + 1));
      } else if (gs.dx > SWIPE_THRESHOLD) {
        // Swipe right → prev page
        setChildPage(p => Math.max(0, p - 1));
      }
    },
  }), [totalChildPages]);

  return (
    <View style={styles.canvas} {...childSwipePan.panHandlers}>
      <RelationshipConnector
        nodes={nodes} focusedId={focusedPersonId}
        allChildren={allChildren} visibleChildren={visibleChildren}
      />
      <HeartBadge nodes={nodes} />

      {renderOrder.map(([id, nd]) => (
        <AnimatedNode key={id} x={nd.x} y={nd.y} zIndex={nd.zIndex} width={nd.w} height={nd.h}>
          <PersonCard
            person={PEOPLE[id]}
            isCenter={id === focusedPersonId}
            isSelected={selectedIds.has(id)}
            onPress={() => handlePress(id)}
            onLongPress={() => handleLongPress(id)}
            cardW={nd.w} cardH={nd.h}
          />
        </AnimatedNode>
      ))}

      {/* ⇄ family buttons */}
      {renderOrder.map(([id, nd]) => {
        if (nd.role === 'spouse') return null;
        const isLeftCard =
          nd.role === 'parent' ? id === leftParentId :
          nd.role === 'child'  ? id === leftChildId  : true;
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
      <SiblingNavArrows focusedPersonId={focusedPersonId} onNavigate={handlePress} />

      {/* Selection bar replaces AddHiver when items selected */}
      {selectedIds.size > 0 ? (
        <SelectionBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onNext={() => {}}
        />
      ) : (
        <AddHiver />
      )}

      {/* Long-press popup */}
      {popupData && (
        <CardPopup
          person={popupData.person}
          focusedId={focusedPersonId}
          cardX={popupData.cardX}
          cardY={popupData.cardY}
          isSelected={selectedIds.has(popupData.person.id)}
          onToggleSelect={() => handleToggleSelect(popupData.person.id)}
          onClose={() => setPopupData(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  canvas: { flex: 0.9, width: SW, backgroundColor: C.bg, overflow: 'hidden' },

  // Cards
  card: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 } },
  cardCenter: { elevation: 12, shadowOpacity: 0.2, shadowRadius: 13,
    shadowOffset: { width: 0, height: 5 } },
  cardSelected: { borderWidth: 2.5 },

  cardTop: { flexDirection: 'row', height: 72 },
  photoWrap: { width: 88, height: '100%', position: 'relative' },
  photo: { width: 72, height: '100%', resizeMode: 'cover' },
  followerBubble: { position: 'absolute', bottom: 0, right: 15,
    backgroundColor: 'rgba(255,255,255,0.92)', borderTopLeftRadius: 6, 
    paddingHorizontal: 4, paddingVertical: 1 },
  followerTxt: { fontSize:12,  color: C.text,fontFamily:'SofiaSansCondensed-Medium' },
  nameCol: { flex: 1, paddingLeft: -3, paddingTop: 9, paddingRight: 6,marginLeft:-6 },
  nameTxt: { fontSize: 18,  color: C.text, fontFamily:'SofiaSansCondensed-Medium'  },
  decTag: { marginTop: 6, backgroundColor:'rgba(166, 166, 166, 1)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  decTagTxt: { color: C.black, fontSize: 12, fontFamily:'SofiaSansCondensed-Medium' },
  followBtn: { marginTop: 6, borderWidth: 1.5, borderRadius: 7,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  followTxt: { fontSize: 12, fontFamily:'SofiaSansCondensed-Medium' },
  divider: { height: 1, opacity: 0.3 },
  cardBottom: { flex: 1, flexDirection: 'row' },
  accentBar: { width: 2, alignSelf: 'stretch', opacity: 0.6,marginLeft: 4,height:40,marginTop: 6 },
  infoCol: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, gap: 3 },
  profTxt: { fontSize: 14, color: C.sub, fontFamily:'SofiaSansCondensed-Medium' },
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locTxt: { fontSize: 14, color: '#666', flex: 1,fontFamily:'SofiaSansCondensed-Medium' },
  flagWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  flagEmoji: { fontSize: 14, fontFamily:'SofiaSansCondensed-Medium' },
  flagCode: { fontSize: 14,  color: '#666', fontFamily:'SofiaSansCondensed-Medium' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3,position:'absolute',bottom:0,paddingHorizontal:8,paddingBottom:6,width:'100%',paddingTop:4 },
  dateIcon: { fontSize: 14, fontFamily:'SofiaSansCondensed-Medium' },
  dateTxt: { fontSize: 14, color: '#777', flex: 1,fontFamily:'SofiaSansCondensed-Medium' },
  marriageBand: { flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },

  // ⇄ buttons
  sideBtn: { position: 'absolute', borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', zIndex: 35,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.13,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  sideBtnIcon: { color: C.white, fontSize: 15, fontWeight: '700' },

  // Heart
  heartBadge: { position: 'absolute', zIndex: 40,
    alignItems: 'center', justifyContent: 'center' },

  // Child page arrows
  childPageBtn: {
    position: 'absolute', width: 32, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.88)', alignItems: 'center',
    justifyContent: 'center', zIndex: 90, elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  childPageTxt: { fontSize: 22, color: C.black, fontWeight: '300', lineHeight: 28 },

  // Header
  header: { position: 'absolute', top: 0, left: 0, width: SW, height: HEADER_H,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, backgroundColor: C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8DDD0', zIndex: 200 },
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

  // Add Hiver
  addHiverWrap: { position: 'absolute', bottom: 20, left: 0, right: 0,
    alignItems: 'center', zIndex: 100 },
  addHiverBtn: { flexDirection: 'row', alignItems: 'center' },
  plusCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.black,
    alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  plusTxt: { fontSize: 19, color: C.white, fontWeight: '800', lineHeight: 22, marginTop: -1 },
  addHiverLabel: { color: C.black, fontSize: 17, letterSpacing: 0.2, fontFamily: 'SofiaSansCondensed-Bold' },

  // Sibling nav arrows
  sibArrow: { position: 'absolute', width: 36, height: 56, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.88)', alignItems: 'center',
    justifyContent: 'center', zIndex: 90, elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  sibArrowLeft:  { left: 6 },
  sibArrowRight: { right: 6 },
  sibArrowTxt: { fontSize: 32, color: C.black, fontWeight: '300', lineHeight: 38, marginTop: -2 },

  // ── Context popup ────────────────────────────────────────────────────────
  popupOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
    zIndex: 500,
  },
  popupCard: {
    borderRadius: 10,
    backgroundColor: 'rgba(226, 226, 226, 1)', overflow: 'hidden',
    elevation: 18, shadowColor: '#000', shadowOpacity: 0.22,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  // Caret left: triangle pointing LEFT ◀ (sits on left edge of popup)
  caretLeft: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#F2F2F2',
    zIndex: 1,
  },
  // Caret right: triangle pointing RIGHT ▶ (sits on right edge of popup)
  caretRight: {
    position: 'absolute',
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#F2F2F2',
    zIndex: 1,
  },
  popupPhotoWrap: { width: '100%', position: 'relative' },
  popupPhoto: { width: '40%', height: '90%', resizeMode: 'cover',marginLeft:10,marginTop:15, borderRadius: 4,zIndex:9999 },
  // Checkbox circle — empty = unselected (white border), filled teal = selected
  popupCheck: {
    position: 'absolute', top: 15, right: 10,
    width: 20, height: 20, borderRadius: 4,
    backgroundColor: C.white,
    borderWidth: 2, borderColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  popupCheckSelected: {
    backgroundColor: C.teal, borderColor: C.teal,
  },
  popupCheckTxt: { color: C.white, fontSize: 14, fontWeight: '900', lineHeight: 17 },
  popupNameWrap: {
    backgroundColor: 'rgba(205, 205, 205, 1)',
    paddingHorizontal: 14, paddingVertical: 5,
  },
  popupName:     { fontSize: 16,  color: C.text,fontFamily:'SofiaSansCondensed-SemiBold' },
  popupRelation: { fontSize: 14, color: C.sub, marginTop: 1, fontFamily:'SofiaSansCondensed-Regular' },
  popupDivider:  { height: StyleSheet.hairlineWidth, backgroundColor: '#D0D0D0' },
  popupMenuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 5, paddingVertical: 0,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E4E4',
    backgroundColor: 'rgba(226, 226, 226, 1)',
  },
  popupMenuIcon:  { fontSize: 16, width: 28, textAlign: 'center', color: C.sub },
  popupMenuLabel: { fontSize: 14, color: C.text, marginLeft: 3, fontFamily:'SofiaSansCondensed-Medium' },

  // ── Selection bar ─────────────────────────────────────────────────────────
  selBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 54, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 1)', paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0D8CE',
    zIndex: 100,
  },
  selCount:   { fontSize: 20,  color: 'rgba(84, 84, 84, 1)', fontFamily:'SofiaSansCondensed-Medium' },
  selClearBtn: { marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4 },
  selClearTxt: { fontSize: 18, color: 'rgba(84, 84, 84, 1)', fontFamily:'SofiaSansCondensed-Medium' },
  selNextBtn: {
    backgroundColor: 'rgba(217, 217, 217, 1)', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.21)',
    borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8,
  },
  selNextTxt: { fontSize: 14, fontWeight: '600', color: 'rgba(84, 84, 84, 1)' },
});