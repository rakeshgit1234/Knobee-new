/**
 * HiveFamilyTree.js — with toggle: OFF = family tree, ON = list view
 */

import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Dimensions, Image, PanResponder, ScrollView,
  StyleSheet, Text, TouchableOpacity,
  TouchableWithoutFeedback, View, Animated,
  Switch,
} from 'react-native';
import AnimatedRN, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import FamilyDiaryScreen from './FamilyDiaryScreen';
import AddDiaryScreen from './AddDiaryScreen';

const { width: SW, height: SH } = Dimensions.get('window');
const CANVAS_H = SH * 0.9;

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
  myParents.forEach(pid => { getChildren(pid).forEach(cid => { if (cid !== id) sibSet.add(cid); }); });
  return [...sibSet];
}
function getRelationLabel(personId, focusedId) {
  const focused = PEOPLE[focusedId];
  if (!focused) return '';
  const focusedName = focused.name.split(' ')[0];
  if (getParents(focusedId).includes(personId)) return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Father` : `${focusedName}'s Mother`;
  if (getChildren(focusedId).includes(personId)) return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Son` : `${focusedName}'s Daughter`;
  if (getSpouses(focusedId).includes(personId)) return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Husband` : `${focusedName}'s Wife`;
  if (getSiblings(focusedId).includes(personId)) return PEOPLE[personId].gender === 'male' ? `${focusedName}'s Brother` : `${focusedName}'s Sister`;
  return '';
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const HEADER_H = 54;
const CARD_W = 164; const CARD_H = 155;
const H_GAP = 40; const CHILDREN_PER_PAGE = 2;
const BTN_W = 34; const BTN_H = 32; const BTN_H_GAP = 5; const BTN_V_GAP = 6;
const CTR_BTN_W = 34; const CTR_BTN_H = 32; const CTR_BTN_GAP = 6; const CTR_BTN_OFF = 44;
const ADD_HIVER_H = 56;
const USABLE_H = CANVAS_H - HEADER_H - ADD_HIVER_H;
const ZONE_T = USABLE_H * 0.27; const ZONE_M = USABLE_H * 0.36; const ZONE_B = USABLE_H * 0.32;
const PARENTS_CARD_Y = HEADER_H + (ZONE_T - CARD_H) / 2;
const PARENTS_BTN_Y = PARENTS_CARD_Y + CARD_H + BTN_V_GAP;
const CENTER_CARD_Y = HEADER_H + ZONE_T + (ZONE_M - CARD_H) / 2;
const CHILDREN_CARD_Y = HEADER_H + ZONE_T + ZONE_M + (ZONE_B - CARD_H) / 2;
const CHILDREN_BTN_Y = CHILDREN_CARD_Y - BTN_H - BTN_V_GAP;
const SPOUSE_OFFSET_X = 14; const SPOUSE_OFFSET_Y = 14;
const SPRING = { damping: 22, stiffness: 240, mass: 0.85 };
const DOT_R = 5; const DOT_ABOVE = 14; const DOT_BELOW = 14; const ARROW_S = 6;

function rowXs(count, cw = CARD_W, gap = H_GAP) {
  const total = count * cw + (count - 1) * gap;
  const start = (SW - total) / 2;
  return Array.from({ length: count }, (_, i) => start + i * (cw + gap));
}

function buildLayout(focusedId, childPage = 0) {
  const nodes = {};
  const parents = getParents(focusedId);
  const spouses = getSpouses(focusedId);
  const allChildren = getChildren(focusedId);
  const pageStart = childPage * CHILDREN_PER_PAGE;
  const visibleChildren = allChildren.slice(pageStart, pageStart + CHILDREN_PER_PAGE);
  nodes[focusedId] = { x: SW/2 - CARD_W/2, y: CENTER_CARD_Y, w: CARD_W, h: CARD_H, role: 'center', zIndex: 30 };
  spouses.forEach((sid, i) => {
    nodes[sid] = { x: SW/2 - CARD_W/2 + (i+1)*SPOUSE_OFFSET_X, y: CENTER_CARD_Y + (i+1)*SPOUSE_OFFSET_Y, w: CARD_W, h: CARD_H, role: 'spouse', zIndex: 30-(i+1), spouseIndex: i };
  });
  if (parents.length > 0) {
    const xs = rowXs(parents.length);
    parents.forEach((pid, i) => { nodes[pid] = { x: xs[i], y: PARENTS_CARD_Y, w: CARD_W, h: CARD_H, role: 'parent', zIndex: 5 }; });
  }
  if (visibleChildren.length > 0) {
    const xs = rowXs(visibleChildren.length);
    visibleChildren.forEach((cid, i) => { nodes[cid] = { x: xs[i], y: CHILDREN_CARD_Y, w: CARD_W, h: CARD_H, role: 'child', zIndex: 5 }; });
  }
  const totalChildPages = Math.ceil(allChildren.length / CHILDREN_PER_PAGE);
  return { nodes, allChildren, visibleChildren, totalChildPages };
}

// ─── Animated Node ────────────────────────────────────────────────────────────
function AnimatedNode({ x, y, zIndex, width, height, children }) {
  const tx = useSharedValue(x);
  const ty = useSharedValue(y);
  useEffect(() => { tx.value = withSpring(x, SPRING); ty.value = withSpring(y, SPRING); }, [x, y]);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));
  return (
    <AnimatedRN.View style={[{ position:'absolute', top:0, left:0, width, height, zIndex }, aStyle]}>
      {children}
    </AnimatedRN.View>
  );
}

// ─── Context Popup ────────────────────────────────────────────────────────────
const POPUP_MENU = [
  { icon: require('../../../assets/images/chat/add.png'), label: 'Add Hiver' },
  { icon: require('../../../assets/images/profile/user1.png'), label: 'Profile' },
  { icon: require('../../../assets/images/tabs/chatter.png'), label: 'Chattrz' },
  { icon: require('../../../assets/images/chat/docs.png'), label: 'Seth Diaries' },
  { icon: require('../../../assets/images/profile/block.png'), label: 'Block' },
];
const POPUP_W = SW * 0.54;
const POPUP_PHOTO_H = 118; const POPUP_ITEM_H = 32; const POPUP_NAME_H = 52;
const POPUP_TOTAL_H = POPUP_PHOTO_H + POPUP_NAME_H + POPUP_MENU.length * POPUP_ITEM_H;

function CardPopup({ person, focusedId, cardX, cardY, isSelected, onToggleSelect, onClose }) {
  if (!person) return null;
  const relation = getRelationLabel(person.id, focusedId);
  const cardMidX = cardX + CARD_W / 2;
  const openRight = cardMidX + POPUP_W <= SW - 4;
  let popupLeft = openRight ? cardMidX : cardMidX - POPUP_W;
  popupLeft = Math.max(4, Math.min(SW - POPUP_W - 4, popupLeft));
  const minTop = HEADER_H + 2; const maxTop = CANVAS_H - POPUP_TOTAL_H - 8;
  const popupTop = Math.max(minTop, Math.min(maxTop, cardY));
  const cardCenterY = cardY + CARD_H / 2;
  const arrowTop = Math.max(16, Math.min(POPUP_TOTAL_H - 16 - 20, cardCenterY - popupTop - 10));
  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={ts.popupOverlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={{ position: 'absolute', left: popupLeft, top: popupTop }}>
            {openRight
              ? <View style={[ts.caretLeft, { top: arrowTop }]} />
              : <View style={[ts.caretRight, { top: arrowTop }]} />}
            <View style={[ts.popupCard, { width: POPUP_W, marginLeft: openRight ? 10 : 0, marginRight: openRight ? 0 : 10 }]}>
              <View style={[ts.popupPhotoWrap, { height: POPUP_PHOTO_H }]}>
                <Image source={{ uri: person.photo }} style={ts.popupPhoto} />
                <TouchableOpacity style={[ts.popupCheck, isSelected && ts.popupCheckSelected]} onPress={onToggleSelect} activeOpacity={0.8}>
                  <Text style={ts.popupCheckTxt}>{isSelected ? '✓' : ''}</Text>
                </TouchableOpacity>
              </View>
              <View style={ts.popupNameWrap}>
                <Text style={ts.popupName} numberOfLines={1}>{person.name}</Text>
                {!!relation && <Text style={ts.popupRelation}>{relation}</Text>}
              </View>
              {POPUP_MENU.map((item, i) => (
                <TouchableOpacity key={i} style={[ts.popupMenuItem, { height: POPUP_ITEM_H }, i === POPUP_MENU.length-1 && { borderBottomWidth: 0 }]} onPress={onClose}>
                  <Image source={item.icon} style={{ width: 20, height: 20, resizeMode: 'contain' }} tintColor="black" />
                  <Text style={ts.popupMenuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Family Indicators ────────────────────────────────────────────────────────
function FamilyIndicators({ person, cardX, cardY, role, isLeftCard, onOpenDiary }) {
  if (role === 'spouse') return null;
  const isMale = person.gender === 'male';
  const isMarried = person.isMarried;
  const btns = isMale
    ? [{ color: C.blueBtn, familyType: 'married' }]
    : isMarried
      ? [{ color: C.pinkBtn, familyType: 'birth' }, { color: C.blueBtn, familyType: 'married' }]
      : [{ color: C.pinkBtn, familyType: 'birth' }];
  if (role === 'center') {
    const totalH = btns.length * CTR_BTN_H + (btns.length - 1) * CTR_BTN_GAP;
    const startY = cardY + (CARD_H - totalH) / 2;
    const bx = cardX - CTR_BTN_OFF;
    return (
      <>
        {btns.map(({ color, familyType }, i) => (
          <TouchableOpacity key={i} style={[ts.sideBtn, { left: bx, top: startY + i*(CTR_BTN_H+CTR_BTN_GAP), width: CTR_BTN_W, height: CTR_BTN_H, backgroundColor: color, zIndex: 200 }]} onPress={() => onOpenDiary(person.id, familyType)} activeOpacity={0.75}>
            <Image source={require('../../../assets/images/hive/Path.png')} style={{height:20, width:20}} />
          </TouchableOpacity>
        ))}
      </>
    );
  }
  const totalW = btns.length * BTN_W + (btns.length - 1) * BTN_H_GAP;
  const bx = isLeftCard ? cardX : cardX + CARD_W - totalW;
  const by = role === 'parent' ? PARENTS_BTN_Y : CHILDREN_BTN_Y;
  return (
    <>
      {btns.map(({ color, familyType }, i) => (
        <TouchableOpacity key={i} style={[ts.sideBtn, { left: bx + i*(BTN_W+BTN_H_GAP), top: by, width: BTN_W, height: BTN_H, backgroundColor: color, zIndex: 200 }]} onPress={() => onOpenDiary(person.id, familyType)} activeOpacity={0.75}>
          <Image source={require('../../../assets/images/hive/Path.png')} style={{height:20, width:20}} />
        </TouchableOpacity>
      ))}
    </>
  );
}

// ─── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({ person, isCenter, isSelected, onPress, onLongPress, cardW, cardH }) {
  const [following, setFollowing] = useState(false);
  const isDeceased = !!person.deathDate;
  const isFemale = person.gender === 'female';
  let bg = C.gray, bd = C.grayBd;
  if (!isDeceased) { bg = isFemale ? C.pink : C.blue; bd = isFemale ? C.pinkBd : C.blueBd; }
  if (isSelected) bd = C.orange;
  const fc = person.followers >= 1000 ? `${Math.round(person.followers/1000)}K` : `${person.followers}`;
  return (
    <TouchableOpacity activeOpacity={isCenter ? 1 : 0.78} onPress={!isCenter ? onPress : undefined} onLongPress={onLongPress} delayLongPress={400} style={{ width: cardW, height: cardH }}>
      <View style={[ts.card, { backgroundColor: bg, borderColor: bd, width: cardW, height: cardH }, isCenter && ts.cardCenter, isSelected && ts.cardSelected]}>
        <View style={ts.cardTop}>
          <View style={ts.photoWrap}>
            <Image source={{ uri: person.photo }} style={ts.photo} />
            {isSelected
              ? <View style={[ts.followerBubble, { backgroundColor: C.orange }]}><Text style={[ts.followerTxt, { color: C.white }]}>✓</Text></View>
              : <View style={ts.followerBubble}><Text style={ts.followerTxt}>{fc}</Text></View>
            }
          </View>
          <View style={ts.nameCol}>
            <Text style={ts.nameTxt} numberOfLines={2}>{person.name}</Text>
            {isDeceased
              ? <View style={ts.decTag}><Text style={ts.decTagTxt}>Deceased</Text></View>
              : <TouchableOpacity onPress={() => setFollowing(v => !v)} style={[ts.followBtn, { borderColor: 'rgba(0,107,165,0.5)' }, following && { backgroundColor: 'rgba(0,107,165,0.5)' }]}>
                  <Text style={[ts.followTxt, { color: '#000' }]}>{following ? 'Following' : `+ Follow | ${fc}`}</Text>
                </TouchableOpacity>
            }
          </View>
        </View>
        <View style={ts.cardBottom}>
          <View style={[ts.accentBar, { backgroundColor: isSelected ? C.orange : bd }]} />
          <View style={ts.infoCol}>
            <Text style={ts.profTxt} numberOfLines={1}>{person.profession}</Text>
            <View style={ts.locRow}>
              <Text style={ts.locTxt} numberOfLines={1}>{person.city}</Text>
              <View style={ts.flagWrap}><Text style={ts.flagEmoji}>{person.flag}</Text><Text style={ts.flagCode}>{person.flagCode}</Text></View>
            </View>
          </View>
          <View style={[ts.dateRow, { backgroundColor: isSelected ? C.orange : bd }]}>
            {!person.deathDate && <Image source={require('../../../assets/images/hive/Cake.png')} style={{height:16,width:16}} />}
            <Text style={ts.dateTxt} numberOfLines={1}> {person.deathDate ? `${person.birthDate} - ${person.deathDate}` : person.birthDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── SVG Connectors ───────────────────────────────────────────────────────────
function RelationshipConnector({ nodes, focusedId, allChildren, visibleChildren }) {
  const focused = nodes[focusedId];
  if (!focused) return null;
  const cxMid = focused.x + CARD_W / 2;
  const cTop = focused.y; const cBot = focused.y + CARD_H;
  const els = [];
  const parentNodes = Object.values(nodes).filter(n => n.role === 'parent');
  if (parentNodes.length > 0) {
    const parBot = PARENTS_CARD_Y + CARD_H;
    const barY = parBot + (cTop - parBot) * 0.55;
    const dotY = barY - DOT_ABOVE;
    parentNodes.forEach((pn, i) => {
      const px = pn.x + CARD_W / 2;
      els.push(
        <Circle key={`pcirc${i}`} cx={px} cy={pn.y + CARD_H} r={5} fill={C.bg} stroke={C.connector} strokeWidth={1.8} />,
        <Line key={`pdrop${i}`} x1={px} y1={pn.y + CARD_H} x2={px} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
      );
    });
    if (parentNodes.length === 1) {
      const px = parentNodes[0].x + CARD_W / 2;
      if (Math.abs(px - cxMid) > 1) els.push(<Line key="phbar" x1={px} y1={barY} x2={cxMid} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    } else {
      const leftX = Math.min(...parentNodes.map(n => n.x + CARD_W / 2));
      const rightX = Math.max(...parentNodes.map(n => n.x + CARD_W / 2));
      const midX = (leftX + rightX) / 2;
      els.push(
        <Line key="pbar" x1={leftX} y1={barY} x2={rightX} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
        <Circle key="pd1" cx={midX-13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
        <Circle key="pd2" cx={midX} cy={dotY} r={DOT_R} fill={C.dotPink} />,
        <Circle key="pd3" cx={midX+13} cy={dotY} r={DOT_R} fill={C.dotBlue} />,
      );
      if (Math.abs(midX - cxMid) > 1) els.push(<Line key="pbarmid" x1={midX} y1={barY} x2={cxMid} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    }
    els.push(
      <Line key="pdown" x1={cxMid} y1={barY} x2={cxMid} y2={cTop} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
      <Path key="parrow" d={`M${cxMid-ARROW_S},${cTop-ARROW_S*1.2} L${cxMid},${cTop} L${cxMid+ARROW_S},${cTop-ARROW_S*1.2}`} stroke={C.connector} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    );
  }
  if (visibleChildren.length > 0) {
    const barY = cBot + (CHILDREN_CARD_Y - cBot) * 0.45;
    const dotY = barY + DOT_BELOW;
    els.push(
      <Circle key="ccirc" cx={cxMid} cy={cBot} r={5} fill={C.bg} stroke={C.connector} strokeWidth={1.8} />,
      <Line key="cdrop" x1={cxMid} y1={cBot} x2={cxMid} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
    );
    const childXMids = visibleChildren.map(cid => { const cn = nodes[cid]; return cn ? cn.x + CARD_W / 2 : cxMid; });
    const leftX = Math.min(...childXMids); const rightX = Math.max(...childXMids);
    const barMidX = (leftX + rightX) / 2;
    if (Math.abs(barMidX - cxMid) > 1) els.push(<Line key="chmidbar" x1={cxMid} y1={barY} x2={barMidX} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    if (visibleChildren.length > 1) els.push(<Line key="chbar" x1={leftX} y1={barY} x2={rightX} y2={barY} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />);
    const dotSpacing = 16;
    const dotsStartX = barMidX - ((allChildren.length - 1) * dotSpacing) / 2;
    allChildren.forEach((cid, idx) => {
      const child = PEOPLE[cid]; const dotColor = child.gender === 'male' ? C.dotBlue : C.dotPink;
      const dimColor = child.gender === 'male' ? C.dotBlueDim : C.dotPinkDim;
      const dotX = dotsStartX + idx * dotSpacing;
      if (cid === focusedId) {
        els.push(<Circle key={`dotring${idx}`} cx={dotX} cy={dotY} r={7.5} fill={C.bg} stroke={dotColor} strokeWidth={2.2} />, <Circle key={`dotfill${idx}`} cx={dotX} cy={dotY} r={4.5} fill={dotColor} />);
      } else { els.push(<Circle key={`dot${idx}`} cx={dotX} cy={dotY} r={DOT_R} fill={dimColor} />); }
    });
    visibleChildren.forEach((cid, i) => {
      const cx = childXMids[i];
      els.push(
        <Line key={`chdrop${i}`} x1={cx} y1={barY} x2={cx} y2={CHILDREN_CARD_Y} stroke={C.connector} strokeWidth={1.8} strokeLinecap="round" />,
        <Path key={`charrow${i}`} d={`M${cx-ARROW_S},${CHILDREN_CARD_Y-ARROW_S*1.2} L${cx},${CHILDREN_CARD_Y} L${cx+ARROW_S},${CHILDREN_CARD_Y-ARROW_S*1.2}`} stroke={C.connector} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      );
    });
  }
  return <Svg style={StyleSheet.absoluteFill} width={SW} height={CANVAS_H} pointerEvents="none">{els}</Svg>;
}

function HeartBadge({ nodes }) {
  const pE = Object.entries(nodes).filter(([,n]) => n.role === 'parent');
  if (pE.length < 2) return null;
  const sorted = pE.sort((a,b) => a[1].x - b[1].x);
  const left = sorted[0][1]; const right = sorted[sorted.length-1][1];
  const hx = (left.x + CARD_W + right.x) / 2 - 11;
  const hy = left.y + CARD_H / 2 - 12;
  return <View style={[ts.heartBadge, { left: hx, top: hy }]}><Text style={{ fontSize: 20 }}>❤️</Text></View>;
}

function SiblingNavArrows({ focusedPersonId, onNavigate }) {
  const siblings = useMemo(() => getSiblings(focusedPersonId), [focusedPersonId]);
  const orderedList = useMemo(() => { const myParents = getParents(focusedPersonId); if (myParents.length === 0) return []; return getChildren(myParents[0]); }, [focusedPersonId]);
  if (siblings.length === 0) return null;
  const focusedIdx = orderedList.indexOf(focusedPersonId);
  const prevSibling = focusedIdx > 0 ? orderedList[focusedIdx - 1] : null;
  const nextSibling = focusedIdx >= 0 && focusedIdx < orderedList.length - 1 ? orderedList[focusedIdx + 1] : null;
  const arrowY = CANVAS_H / 2 - 22;
  return (
    <>
      {prevSibling && <TouchableOpacity style={[ts.sibArrow, ts.sibArrowLeft, { top: arrowY }]} onPress={() => onNavigate(prevSibling)} activeOpacity={0.7}><Text style={ts.sibArrowTxt}>‹</Text></TouchableOpacity>}
      {nextSibling && <TouchableOpacity style={[ts.sibArrow, ts.sibArrowRight, { top: arrowY }]} onPress={() => onNavigate(nextSibling)} activeOpacity={0.7}><Text style={ts.sibArrowTxt}>›</Text></TouchableOpacity>}
    </>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function HiveToggle({ isListView, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85} style={ts.toggleWrap}>
      <View style={[ts.toggleTrack, isListView && ts.toggleTrackOn]}>
        <View style={[ts.toggleThumb, isListView && ts.toggleThumbOn]}>
          <Image
            source={require('../../../assets/images/profile/arw.png')}
            style={{ width: 16, height: 16, tintColor: isListView ? C.orange : '#888' }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Unified Header (tree + list share this) ──────────────────────────────────
function HiveHeader({ isListView, onToggle, selectedCount, onDropdown, showActions, onOpenDiary, focusedPersonId }) {
  return (
    <View style={ts.header}>
      <HiveToggle isListView={isListView} onToggle={onToggle} />

      {isListView ? (
        // List mode: "N selected ↑/↓" in center
        <TouchableOpacity onPress={onDropdown} style={ts.selectedPill}>
          <Text style={ts.selectedPillTxt}>{selectedCount} selected </Text>
          {showActions?<Image source={require('../../../assets/images/chat/chevron-down.png')} style={{height:16,width:16,resizeMode:'contain'}}></Image>:<Image source={require('../../../assets/images/chat/chevron-up.png')} style={{height:16,width:16,resizeMode:'contain'}}></Image>}
        </TouchableOpacity>
      ) : (
        // Tree mode: diary icons
        <View style={ts.headerRight}>
          <TouchableOpacity style={ts.hdrIconWrap} onPress={() => onOpenDiary(focusedPersonId, 'married')}>
            <Image source={require('../../../assets/images/hive/male.png')} style={{height:24, width:24}} />
          </TouchableOpacity>
          <TouchableOpacity style={ts.hdrIconWrap} onPress={() => onOpenDiary(focusedPersonId, 'birth')}>
            <Image source={require('../../../assets/images/hive/female.png')} style={{height:24, width:24}} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={ts.hdrIconWrap}>
        <Image source={require('../../../assets/images/home/search.png')} style={{height:24, width:24}} />
      </TouchableOpacity>
    </View>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
const ACTION_MENU_ITEMS = [
  { icon: require('../../../assets/images/hive/group.png'), label: 'Create Chatterz Group' },
  { icon: require('../../../assets/images/hive/send.png'), label: 'Send Broadcast' },
  { icon: require('../../../assets/images/hive/Path.png'), label: 'Create Family Diary' },
  { icon: require('../../../assets/images/profile/block.png'), label: 'Block Hive Member' },
  { icon: require('../../../assets/images/hive/add.png'), label: 'Follow Hive Member' },
  { icon: require('../../../assets/images/profile/currency.png'), label: 'Start Family Saving Circle (FSC)', hasInfo: true },
  { icon: require('../../../assets/images/profile/fund.png'), label: 'Fund Raising', hasInfo: true },
];

// Build flat list tree from PEOPLE + RELATIONSHIPS
function buildListTree() {
  const allIds = Object.keys(PEOPLE);
  const roots = allIds.filter(id => getParents(id).length === 0);

  function buildNode(id, depth = 0) {
    const children = getChildren(id);
    const spouses  = getSpouses(id);
    const role     = depth === 0 ? 'You' : '';
    return { id, depth, role, children: children.map(cid => buildNode(cid, depth + 1)), spouses };
  }
  return roots.map(r => buildNode(r));
}

function flattenTree(nodes, expanded) {
  const result = [];
  function walk(node) {
    result.push(node);
    if (expanded.has(node.id) && node.children.length > 0) {
      node.children.forEach(walk);
    }
  }
  nodes.forEach(walk);
  return result;
}

function getListRelation(id) {
  const YOU = 'sandhya';
  if (id === YOU) return 'You';
  return getRelationLabel(id, YOU) || '';
}

function ListNodeRow({ node, isExpanded, isSelected, onToggleExpand, onToggleSelect }) {
  const person = PEOPLE[node.id];
  if (!person) return null;
  const hasChildren = node.children.length > 0;
  const relation = getListRelation(node.id);
  const checkBg = isSelected ? C.orange : '#e8d5b7';

  return (
    <View style={[lv.row, { paddingLeft: 12 + node.depth * 20 }]}>
      {/* Expand/collapse box */}
      <TouchableOpacity onPress={() => hasChildren && onToggleExpand(node.id)} style={lv.expandBox} activeOpacity={0.7}>
        <View style={[lv.expandInner, isExpanded && hasChildren && { backgroundColor: C.orange, borderColor: C.orange }]}>
          <Text style={[lv.expandTxt, isExpanded && hasChildren && { color: '#fff' }]}>
            {hasChildren ? (isExpanded ? '−' : '+') : ' '}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Checkbox */}
      <TouchableOpacity onPress={() => onToggleSelect(node.id)} style={lv.checkboxWrap} activeOpacity={0.7}>
        <View style={[lv.checkbox, { backgroundColor: checkBg, borderColor: isSelected ? C.orange : '#d4b896' }]}>
          {isSelected && <Text style={lv.checkTick}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Avatar */}
      <Image source={{ uri: person.photo }} style={lv.avatar} />

      {/* Name + relation */}
      <Text style={lv.nameText} numberOfLines={1}>
        {person.name}
        {relation ? <Text style={lv.relationText}>{` (${relation})`}</Text> : null}
      </Text>
    </View>
  );
}

function HiveListView({ selectedIds, onToggleSelect, showActions }) {
  const [expanded, setExpanded] = useState(new Set(['shubham', 'maya', 'sandhya']));
  const listTree = useMemo(() => buildListTree(), []);
  const flatRows = useMemo(() => flattenTree(listTree, expanded), [listTree, expanded]);

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ScrollView style={lv.scroll} contentContainerStyle={lv.content} showsVerticalScrollIndicator={false}>
      {showActions && (
        <View style={lv.actionMenu}>
          {ACTION_MENU_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              {/* Divider line between index 4 and 5 (before FSC) */}
              {i === 5 && <View style={lv.actionDivider} />}
              <TouchableOpacity
                style={[
                  lv.actionRow,
                  i < ACTION_MENU_ITEMS.length - 1 && i !== 4 && lv.actionRowBorder,
                ]}
                activeOpacity={0.7}
              >
                <Image source={item.icon} style={lv.actionIcon} />
                <Text style={lv.actionLabel}>{item.label}</Text>
                {item.hasInfo && (
                  <View style={lv.infoCircle}><Text style={lv.infoTxt}>i</Text></View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
          <View style={lv.nextRow}>
            <TouchableOpacity style={lv.nextBtn} activeOpacity={0.8}>
              <Text style={lv.nextTxt}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {flatRows.map(node => (
        <ListNodeRow
          key={node.id}
          node={node}
          isExpanded={expanded.has(node.id)}
          isSelected={selectedIds.has(node.id)}
          onToggleExpand={toggleExpand}
          onToggleSelect={onToggleSelect}
        />
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ─── Add Hiver ────────────────────────────────────────────────────────────────
function AddHiver({ navigation }) {
  return (
    <View style={ts.addHiverWrap}>
      <TouchableOpacity onPress={() => navigation?.navigate('AddHive')} style={ts.addHiverBtn} activeOpacity={0.85}>
        <View style={ts.plusCircle}><Text style={ts.plusTxt}>+</Text></View>
        <Text style={ts.addHiverLabel}>Add Hiver</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Selection bar ────────────────────────────────────────────────────────────
const TREE_ACTION_MENU = [
  { icon: require('../../../assets/images/hive/group.png'), label: 'Create Chatterz Group' },
  { icon: require('../../../assets/images/hive/send.png'), label: 'Send Broadcast' },
  { icon: require('../../../assets/images/hive/Path.png'), label: 'Create Family Diary' },
  { icon: require('../../../assets/images/profile/block.png'), label: 'Block Hive Member' },
  { icon: require('../../../assets/images/hive/add.png'), label: 'Follow Hive Member' },
];

function SelectionBar({ count, selectedIds, onClear, onRemove }) {
  if (count === 0) return null;
  const [stage, setStage] = useState(0);
  useEffect(() => { if (count === 0) setStage(0); }, [count]);
  const selectedPeople = [...selectedIds].map(id => PEOPLE[id]).filter(Boolean);

  if (stage === 0) return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => setStage(1)} style={ts.selBar}>
      <Text style={ts.selCount}>{count} Selected</Text>
      <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); onClear(); }} style={ts.selClearBtn}><Text style={ts.selClearTxt}>Clear</Text></TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); setStage(2); }} style={ts.selNextBtn}><Text style={ts.selNextTxt}>Next  →</Text></TouchableOpacity>
    </TouchableOpacity>
  );

  if (stage === 1) return (
    <View style={ts.sheetOverlay}>
      <TouchableOpacity style={ts.sheetDismiss} activeOpacity={1} onPress={() => setStage(0)} />
      <View style={ts.sheet}>
        <View style={[ts.selBar, { position:'relative' }]}>
          <Text style={ts.selCount}>{count} Selected</Text>
          <TouchableOpacity onPress={() => { onClear(); setStage(0); }} style={ts.selClearBtn}><Text style={ts.selClearTxt}>Clear</Text></TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setStage(2)} style={ts.selNextBtn}><Text style={ts.selNextTxt}>Next  →</Text></TouchableOpacity>
        </View>
        {selectedPeople.map(person => (
          <View key={person.id} style={ts.sheetPersonRow}>
            <TouchableOpacity onPress={() => onRemove(person.id)} style={ts.sheetCheckWrap}>
              <View style={ts.sheetCheck}><Text style={ts.sheetCheckTick}>✓</Text></View>
            </TouchableOpacity>
            <Image source={{ uri: person.photo }} style={ts.sheetPersonPhoto} />
            <Text style={ts.sheetPersonName}>{person.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={ts.sheetOverlay}>
      <TouchableOpacity style={ts.sheetDismiss} activeOpacity={1} onPress={() => setStage(0)} />
      <View style={ts.sheet}>
        <View style={[ts.selBar, { position:'relative' }]}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setStage(1)} style={ts.selNextBtn}><Text style={ts.selNextTxt}>Next  →</Text></TouchableOpacity>
        </View>
        {TREE_ACTION_MENU.map((item, i) => (
          <TouchableOpacity key={i} style={ts.sheetActionRow} activeOpacity={0.7}>
            <Image source={item.icon} style={{height:24,width:24,resizeMode:'contain',marginRight:10,tintColor:'#000'}} />
            <Text style={ts.sheetActionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Family key mapping ───────────────────────────────────────────────────────
const PERSON_FAMILY = {
  shubham: { birth: 'seth', married: 'seth' }, maya: { birth: 'maya', married: 'seth' },
  sandhya: { birth: 'seth', married: 'kohli' }, arjun: { birth: 'kohli', married: 'kohli' },
  raghav: { birth: 'kohli', married: 'kohli' }, shruti: { birth: 'kohli', married: 'kohli' },
  dev: { birth: 'kohli', married: 'kohli' }, vikram: { birth: 'seth', married: 'seth' },
  kamla: { birth: 'maya', married: 'seth' }, rohan: { birth: 'seth', married: 'seth' },
  priya: { birth: 'seth', married: 'seth' },
};
function getFamilyKey(personId, familyType = 'birth') {
  const entry = PERSON_FAMILY[personId];
  if (!entry) return 'default';
  return entry[familyType] || 'default';
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HiveFamilyTree({ initialFocusId = 'sandhya', navigation }) {
  const [isListView, setIsListView]           = useState(false);
  const [focusedPersonId, setFocusedPersonId] = useState(initialFocusId);
  const [childPage, setChildPage]             = useState(0);
  const [popupData, setPopupData]             = useState(null);
  const [selectedIds, setSelectedIds]         = useState(new Set());
  const [screen, setScreen]                   = useState(null);
  const [diaryFamily, setDiaryFamily]         = useState('seth');
  const [diaryPerson, setDiaryPerson]         = useState(null);
  const [showActionsInList, setShowActionsInList] = useState(false);

  useEffect(() => { setChildPage(0); }, [focusedPersonId]);

  const { nodes, allChildren, visibleChildren, totalChildPages } = useMemo(
    () => buildLayout(focusedPersonId, childPage), [focusedPersonId, childPage],
  );

  const handleOpenDiary = useCallback((personId, familyType = 'birth') => {
    setDiaryFamily(getFamilyKey(personId, familyType));
    setDiaryPerson(PEOPLE[personId]);
    setScreen('diary');
  }, []);

  const handlePress = useCallback((id) => { if (id !== focusedPersonId) setFocusedPersonId(id); }, [focusedPersonId]);
  const handleLongPress = useCallback((id) => { const nd = nodes[id]; if (!nd) return; setPopupData({ person: PEOPLE[id], cardX: nd.x, cardY: nd.y }); }, [nodes]);
  const handleToggleSelect = useCallback((id) => { setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }, []);

  const renderOrder = useMemo(() => Object.entries(nodes).sort((a,b) => a[1].zIndex - b[1].zIndex), [nodes]);
  const parentEntries = Object.entries(nodes).filter(([,n]) => n.role==='parent').sort((a,b) => a[1].x-b[1].x);
  const childEntries  = Object.entries(nodes).filter(([,n]) => n.role==='child').sort((a,b) => a[1].x-b[1].x);
  const leftParentId  = parentEntries[0]?.[0];
  const leftChildId   = childEntries[0]?.[0];

  const swipeStartX = useRef(0);
  const childSwipePan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (e) => e.nativeEvent.pageY >= CHILDREN_BTN_Y - 20,
    onMoveShouldSetPanResponder: (e, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderGrant: (e) => { swipeStartX.current = e.nativeEvent.pageX; },
    onPanResponderRelease: (e, gs) => {
      if (gs.dx < -40) setChildPage(p => Math.min(totalChildPages - 1, p + 1));
      else if (gs.dx > 40) setChildPage(p => Math.max(0, p - 1));
    },
  }), [totalChildPages]);

  if (screen === 'diary') return <FamilyDiaryScreen family={diaryFamily} onBack={() => setScreen(null)} onAddDiary={() => setScreen('addDiary')} />;
  if (screen === 'addDiary') return <AddDiaryScreen person={diaryPerson || PEOPLE['maya']} initialTagged={diaryPerson ? [diaryPerson] : [PEOPLE['shubham']]} onBack={() => setScreen('diary')} onShare={() => setScreen('diary')} />;

  return (
    <View style={ts.root}>
      <HiveHeader
        isListView={isListView}
        onToggle={() => setIsListView(v => !v)}
        selectedCount={selectedIds.size}
        onDropdown={() => setShowActionsInList(v => !v)}
        showActions={showActionsInList}
        onOpenDiary={handleOpenDiary}
        focusedPersonId={focusedPersonId}
      />

      {isListView ? (
        <HiveListView
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          showActions={showActionsInList}
        />
      ) : (
        <View style={ts.canvas} {...childSwipePan.panHandlers}>
          <RelationshipConnector nodes={nodes} focusedId={focusedPersonId} allChildren={allChildren} visibleChildren={visibleChildren} />
          <HeartBadge nodes={nodes} />
          {renderOrder.map(([id, nd]) => (
            <AnimatedNode key={id} x={nd.x} y={nd.y} zIndex={nd.zIndex} width={nd.w} height={nd.h}>
              <PersonCard person={PEOPLE[id]} isCenter={id === focusedPersonId} isSelected={selectedIds.has(id)} onPress={() => handlePress(id)} onLongPress={() => handleLongPress(id)} cardW={nd.w} cardH={nd.h} />
            </AnimatedNode>
          ))}
          {renderOrder.map(([id, nd]) => {
            if (nd.role === 'spouse') return null;
            const isLeftCard = nd.role === 'parent' ? id === leftParentId : nd.role === 'child' ? id === leftChildId : true;
            return <FamilyIndicators key={`fi_${id}`} person={PEOPLE[id]} cardX={nd.x} cardY={nd.y} role={nd.role} isLeftCard={isLeftCard} onOpenDiary={handleOpenDiary} />;
          })}
          <SiblingNavArrows focusedPersonId={focusedPersonId} onNavigate={handlePress} />
          {selectedIds.size > 0
            ? <SelectionBar count={selectedIds.size} selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} onRemove={id => setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; })} />
            : <AddHiver navigation={navigation} />
          }
          {popupData && (
            <CardPopup person={popupData.person} focusedId={focusedPersonId} cardX={popupData.cardX} cardY={popupData.cardY} isSelected={selectedIds.has(popupData.person.id)} onToggleSelect={() => handleToggleSelect(popupData.person.id)} onClose={() => setPopupData(null)} />
          )}
        </View>
      )}
    </View>
  );
}

// ─── List View Styles ─────────────────────────────────────────────────────────
const lv = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#FDF6EE' },
  content: { paddingTop: 4, paddingBottom: 20 },
  actionMenu: { backgroundColor: '#FDF6EE', paddingBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8DDD0', marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 14 },
  actionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE0D8' },
  actionIcon: { width: 26, height: 26, resizeMode: 'contain', tintColor: '#333' },
  actionLabel: { flex: 1, fontSize: 16, color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Medium' },
  infoCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#aaa', alignItems: 'center', justifyContent: 'center' },
  infoTxt: { fontSize: 12, color: '#aaa', fontWeight: '700' },
  nextRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 },
  nextBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6 },
  nextTxt: { fontSize: 14, color: '#555', fontFamily: 'SofiaSansCondensed-Medium' },
  actionDivider: {
    height: 1,
    backgroundColor: '#D4C4B0',
    marginHorizontal: 0,
    marginVertical: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingRight: 12, gap: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#f0ebe4',
  },
  expandBox: { width: 22, alignItems: 'center', justifyContent: 'center' },
  expandInner: {
    width: 18, height: 18, borderRadius: 4,
    backgroundColor: '#f0ebe4', borderWidth: 1, borderColor: '#d4b896',
    alignItems: 'center', justifyContent: 'center',
  },
  expandTxt: { fontSize: 13, color: '#888', fontWeight: '700', lineHeight: 16 },
  checkboxWrap: { width: 24, alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkTick: { color: '#fff', fontSize: 11, fontWeight: '900' },
  avatar: { width: 36, height: 36, borderRadius: 18, flexShrink: 0 },
  nameText: { flex: 1, fontSize: 14, color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Medium' },
  relationText: { fontSize: 14, color: '#888', fontFamily: 'SofiaSansCondensed-Regular' },
});

// ─── Tree + Root Styles ───────────────────────────────────────────────────────
const ts = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  canvas: { flex: 0.9, width: SW, overflow: 'hidden' },
  header: {
    position: 'absolute', top: 0, left: 0, width: SW, height: HEADER_H,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8DDD0',
    zIndex: 200, backgroundColor: C.bg,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center' },
  hdrIconWrap: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  toggleWrap: { flexDirection: 'row', alignItems: 'center' },
  toggleTrack: {
    width: 52, height: 28, borderRadius: 14,
    backgroundColor: '#E0D8CE', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleTrackOn: { backgroundColor: '#ffe0b0' },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 3,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end', backgroundColor: '#fff' },
  selectedPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  selectedPillTxt: { fontSize: 15, color: '#1a1a1a', fontFamily: 'SofiaSansCondensed-Medium' },
  selectedPillArrow: { fontSize: 15, color: '#1a1a1a' },
  card: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 7, shadowOffset: { width: 0, height: 3 } },
  cardCenter: { elevation: 12, shadowOpacity: 0.2, shadowRadius: 13, shadowOffset: { width: 0, height: 5 } },
  cardSelected: { borderWidth: 2.5 },
  cardTop: { flexDirection: 'row', height: 72 },
  photoWrap: { width: 88, height: '100%', position: 'relative' },
  photo: { width: 72, height: '100%', resizeMode: 'cover' },
  followerBubble: { position: 'absolute', bottom: 0, right: 15, backgroundColor: 'rgba(255,255,255,0.92)', borderTopLeftRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  followerTxt: { fontSize: 12, color: C.text, fontFamily: 'SofiaSansCondensed-Medium' },
  nameCol: { flex: 1, paddingTop: 9, paddingRight: 6, marginLeft: -6 },
  nameTxt: { fontSize: 18, color: C.text, fontFamily: 'SofiaSansCondensed-Medium' },
  decTag: { marginTop: 6, backgroundColor: 'rgba(166,166,166,1)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  decTagTxt: { color: C.black, fontSize: 12, fontFamily: 'SofiaSansCondensed-Medium' },
  followBtn: { marginTop: 6, borderWidth: 1.5, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  followTxt: { fontSize: 12, fontFamily: 'SofiaSansCondensed-Medium' },
  cardBottom: { flex: 1, flexDirection: 'row' },
  accentBar: { width: 2, alignSelf: 'stretch', opacity: 0.6, marginLeft: 4, height: 40, marginTop: 6 },
  infoCol: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, gap: 3 },
  profTxt: { fontSize: 14, color: C.sub, fontFamily: 'SofiaSansCondensed-Medium' },
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locTxt: { fontSize: 14, color: '#666', flex: 1, fontFamily: 'SofiaSansCondensed-Medium' },
  flagWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  flagEmoji: { fontSize: 14 }, flagCode: { fontSize: 14, color: '#666', fontFamily: 'SofiaSansCondensed-Medium' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3, position: 'absolute', bottom: 0, paddingHorizontal: 8, paddingBottom: 6, width: '100%', paddingTop: 4 },
  dateTxt: { fontSize: 14, color: '#777', flex: 1, fontFamily: 'SofiaSansCondensed-Medium' },
  sideBtn: { position: 'absolute', borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 200, elevation: 10, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  heartBadge: { position: 'absolute', zIndex: 40, alignItems: 'center', justifyContent: 'center' },
  sibArrow: { position: 'absolute', width: 36, height: 56, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 90, elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  sibArrowLeft: { left: 6 }, sibArrowRight: { right: 6 },
  sibArrowTxt: { fontSize: 32, color: C.black, fontWeight: '300', lineHeight: 38, marginTop: -2 },
  popupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)', zIndex: 500 },
  popupCard: { borderRadius: 10, backgroundColor: 'rgba(226,226,226,1)', overflow: 'hidden', elevation: 18, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  caretLeft: { position: 'absolute', left: 0, width: 0, height: 0, borderTopWidth: 10, borderBottomWidth: 10, borderRightWidth: 10, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: '#F2F2F2', zIndex: 1 },
  caretRight: { position: 'absolute', right: 0, width: 0, height: 0, borderTopWidth: 10, borderBottomWidth: 10, borderLeftWidth: 10, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#F2F2F2', zIndex: 1 },
  popupPhotoWrap: { width: '100%', position: 'relative' },
  popupPhoto: { width: '40%', height: '90%', resizeMode: 'cover', marginLeft: 10, marginTop: 15, borderRadius: 4, zIndex: 9999 },
  popupCheck: { position: 'absolute', top: 15, right: 10, width: 20, height: 20, borderRadius: 4, backgroundColor: C.white, borderWidth: 2, borderColor: C.teal, alignItems: 'center', justifyContent: 'center' },
  popupCheckSelected: { backgroundColor: C.teal, borderColor: C.teal },
  popupCheckTxt: { color: C.white, fontSize: 14, fontWeight: '900', lineHeight: 17 },
  popupNameWrap: { backgroundColor: 'rgba(205,205,205,1)', paddingHorizontal: 14, paddingVertical: 5 },
  popupName: { fontSize: 16, color: C.text, fontFamily: 'SofiaSansCondensed-SemiBold' },
  popupRelation: { fontSize: 14, color: C.sub, marginTop: 1, fontFamily: 'SofiaSansCondensed-Regular' },
  popupMenuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E4E4', backgroundColor: 'rgba(226,226,226,1)' },
  popupMenuLabel: { fontSize: 14, color: C.text, marginLeft: 3, fontFamily: 'SofiaSansCondensed-Medium' },
  selBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 54, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(217,217,217,1)', paddingHorizontal: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0D8CE', zIndex: 100 },
  selCount: { fontSize: 20, color: 'rgba(84,84,84,1)', fontFamily: 'SofiaSansCondensed-Medium' },
  selClearBtn: { marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4 },
  selClearTxt: { fontSize: 18, color: 'rgba(84,84,84,1)', fontFamily: 'SofiaSansCondensed-Medium' },
  selNextBtn: { backgroundColor: 'rgba(217,217,217,1)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.21)', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  selNextTxt: { fontSize: 14, fontWeight: '600', color: 'rgba(84,84,84,1)' },
  sheetOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'flex-end', zIndex: 100 },
  sheetDismiss: { flex: 1 },
  sheet: { backgroundColor: 'rgba(230,230,230,1)', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } },
  sheetPersonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 5, backgroundColor: 'rgba(230,230,230,1)' },
  sheetCheckWrap: { marginRight: 12 },
  sheetCheck: { width: 26, height: 26, borderRadius: 6, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  sheetCheckTick: { color: C.white, fontSize: 15, fontWeight: '900' },
  sheetPersonPhoto: { width: 52, height: 52, borderRadius: 8, marginRight: 14, resizeMode: 'cover' },
  sheetPersonName: { fontSize: 20, color: C.text, fontFamily: 'SofiaSansCondensed-Medium', flex: 1 },
  sheetActionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(230,230,230,1)' },
  sheetActionLabel: { fontSize: 20, color: C.text, fontFamily: 'SofiaSansCondensed-Medium' },
  addHiverWrap: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  addHiverBtn: { flexDirection: 'row', alignItems: 'center' },
  plusCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  plusTxt: { fontSize: 19, color: C.white, fontWeight: '800', lineHeight: 22, marginTop: -1 },
  addHiverLabel: { color: C.black, fontSize: 17, letterSpacing: 0.2, fontFamily: 'SofiaSansCondensed-Bold' },
});