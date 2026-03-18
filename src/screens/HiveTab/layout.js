import { Dimensions } from 'react-native';
import { getParents, getSpouses, getChildren } from './data';

const { width: SW, height: SH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS DIMENSIONS
// flex: 0.9  →  the container takes 90% of screen height
// ─────────────────────────────────────────────────────────────────────────────
export const CANVAS_H = SH * 0.9;   // actual rendered height of the canvas
export { SW };                       // full screen width (unchanged)

// ─────────────────────────────────────────────────────────────────────────────
// CARD DIMENSIONS  — slightly shorter to fit three rows in 0.9 * SH
// ─────────────────────────────────────────────────────────────────────────────
export const CARD_W = 148;
export const CARD_H = 178;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export const HEADER_H   = 54;        // header bar inside the canvas
export const ADD_HIVER_H = 62;       // space reserved at bottom for the button

// Usable vertical space between header bottom and Add-Hiver top
const USABLE_H = CANVAS_H - HEADER_H - ADD_HIVER_H;

// Three equal-height zones stacked in USABLE_H
// Give parents 30%, center 40%, children 30%  → feels natural
const ZONE_TOP_H = USABLE_H * 0.30;
const ZONE_MID_H = USABLE_H * 0.40;
// ZONE_BOT_H = USABLE_H * 0.30  (implicit)

// Y of the top edge of each card row
export const PARENTS_Y  = HEADER_H + (ZONE_TOP_H - CARD_H) / 2;
export const CENTER_Y   = HEADER_H + ZONE_TOP_H + (ZONE_MID_H - CARD_H) / 2;
export const CHILDREN_Y = HEADER_H + ZONE_TOP_H + ZONE_MID_H
                        + ((USABLE_H - ZONE_TOP_H - ZONE_MID_H) - CARD_H) / 2;

// Horizontal gap between sibling cards
export const H_GAP = 14;

// Spouse diagonal stack offset per index
export const SPOUSE_OFFSET_X = 14;
export const SPOUSE_OFFSET_Y = 14;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — centred X positions for a row of `count` cards
// ─────────────────────────────────────────────────────────────────────────────
export function rowXPositions(count, cardW = CARD_W, gap = H_GAP) {
  const totalW = count * cardW + (count - 1) * gap;
  const startX = (SW - totalW) / 2;
  return Array.from({ length: count }, (_, i) => startX + i * (cardW + gap));
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD LAYOUT
// Returns { [personId]: { x, y, w, h, role, zIndex, spouseIndex? } }
// ─────────────────────────────────────────────────────────────────────────────
export function buildLayout(focusedId) {
  const nodes = {};

  const parents  = getParents(focusedId);
  const spouses  = getSpouses(focusedId);
  const children = getChildren(focusedId);

  // ── CENTER ────────────────────────────────────────────────────────────────
  nodes[focusedId] = {
    x: SW / 2 - CARD_W / 2,
    y: CENTER_Y,
    w: CARD_W,
    h: CARD_H,
    role: 'center',
    zIndex: 30,
  };

  // ── SPOUSES  (stacked diagonally behind center) ───────────────────────────
  spouses.forEach((sid, i) => {
    nodes[sid] = {
      x: SW / 2 - CARD_W / 2 + (i + 1) * SPOUSE_OFFSET_X,
      y: CENTER_Y              + (i + 1) * SPOUSE_OFFSET_Y,
      w: CARD_W,
      h: CARD_H,
      role: 'spouse',
      zIndex: 30 - (i + 1),
      spouseIndex: i,
    };
  });

  // ── PARENTS ───────────────────────────────────────────────────────────────
  if (parents.length > 0) {
    const xs = rowXPositions(parents.length);
    parents.forEach((pid, i) => {
      nodes[pid] = {
        x: xs[i],
        y: PARENTS_Y,
        w: CARD_W,
        h: CARD_H,
        role: 'parent',
        zIndex: 5,
      };
    });
  }

  // ── CHILDREN ──────────────────────────────────────────────────────────────
  if (children.length > 0) {
    const xs = rowXPositions(children.length);
    children.forEach((cid, i) => {
      nodes[cid] = {
        x: xs[i],
        y: CHILDREN_Y,
        w: CARD_W,
        h: CARD_H,
        role: 'child',
        zIndex: 5,
      };
    });
  }

  return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTOR GEOMETRY
// Returns SVG segment descriptors for RelationshipConnector
// ─────────────────────────────────────────────────────────────────────────────
export function buildConnectors(layout, focusedId) {
  const segments = [];
  const focused  = layout[focusedId];
  if (!focused) return segments;

  const cxMid = focused.x + CARD_W / 2;
  const cTop  = focused.y;
  const cBot  = focused.y + CARD_H;

  // ── Parents → Center ──────────────────────────────────────────────────────
  const parentNodes = Object.values(layout).filter(n => n.role === 'parent');
  if (parentNodes.length > 0) {
    // Bar sits halfway between parent bottoms and center top
    const parentsBottom = PARENTS_Y + CARD_H;
    const barY = parentsBottom + (cTop - parentsBottom) * 0.45;

    parentNodes.forEach(pn => {
      const px = pn.x + CARD_W / 2;
      segments.push({ type: 'line', x1: px, y1: pn.y + CARD_H, x2: px, y2: barY });
      segments.push({ type: 'circleOpen', x: px, y: pn.y + CARD_H });
    });

    if (parentNodes.length === 1) {
      const px = parentNodes[0].x + CARD_W / 2;
      if (Math.abs(px - cxMid) > 2) {
        segments.push({ type: 'line', x1: px, y1: barY, x2: cxMid, y2: barY });
      }
      segments.push({ type: 'line', x1: cxMid, y1: barY, x2: cxMid, y2: cTop });
    } else {
      const leftX  = Math.min(...parentNodes.map(n => n.x + CARD_W / 2));
      const rightX = Math.max(...parentNodes.map(n => n.x + CARD_W / 2));
      const midX   = (leftX + rightX) / 2;

      segments.push({ type: 'line', x1: leftX, y1: barY, x2: rightX, y2: barY });
      segments.push({ type: 'dots', midX, y: barY });

      // Drop from bar midpoint to center top
      if (Math.abs(midX - cxMid) > 2) {
        segments.push({ type: 'line', x1: midX, y1: barY, x2: cxMid, y2: barY });
      }
      segments.push({ type: 'line', x1: cxMid, y1: barY, x2: cxMid, y2: cTop });
    }
    segments.push({ type: 'arrowDown', x: cxMid, y: cTop });
  }

  // ── Center → Children ─────────────────────────────────────────────────────
  const childNodes = Object.values(layout).filter(n => n.role === 'child');
  if (childNodes.length > 0) {
    const barY = cBot + (CHILDREN_Y - cBot) * 0.45;

    segments.push({ type: 'circleOpen', x: cxMid, y: cBot });
    segments.push({ type: 'line', x1: cxMid, y1: cBot, x2: cxMid, y2: barY });

    if (childNodes.length === 1) {
      const cx = childNodes[0].x + CARD_W / 2;
      if (Math.abs(cx - cxMid) > 2) {
        segments.push({ type: 'line', x1: cxMid, y1: barY, x2: cx, y2: barY });
      }
      segments.push({ type: 'line', x1: cx, y1: barY, x2: cx, y2: CHILDREN_Y });
      segments.push({ type: 'arrowDown', x: cx, y: CHILDREN_Y });
    } else {
      const leftX  = Math.min(...childNodes.map(n => n.x + CARD_W / 2));
      const rightX = Math.max(...childNodes.map(n => n.x + CARD_W / 2));
      const midX   = (leftX + rightX) / 2;

      if (Math.abs(midX - cxMid) > 2) {
        segments.push({ type: 'line', x1: cxMid, y1: barY, x2: midX, y2: barY });
      }
      segments.push({ type: 'line', x1: leftX, y1: barY, x2: rightX, y2: barY });
      segments.push({ type: 'dots', midX: (leftX + rightX) / 2, y: barY });

      childNodes.forEach(cn => {
        const cx = cn.x + CARD_W / 2;
        segments.push({ type: 'line', x1: cx, y1: barY, x2: cx, y2: CHILDREN_Y });
        segments.push({ type: 'arrowDown', x: cx, y: CHILDREN_Y });
      });
    }
  }

  return segments;
}
