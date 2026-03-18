import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { buildConnectors, SW, CANVAS_H } from './layout';

const LINE_COLOR = '#BBBBBB';
const LINE_W     = 1.8;
const DOT_BLUE   = '#5BB8D4';
const DOT_PINK   = '#E879A0';
const ARROW_S    = 6;
const CIRC_R     = 5;

export default function RelationshipConnector({ layout, focusedId }) {
  const segments = buildConnectors(layout, focusedId);

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={SW}
      height={CANVAS_H}
      pointerEvents="none"
    >
      {segments.map((seg, i) => {
        switch (seg.type) {

          case 'line':
            return (
              <Line key={i}
                x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                stroke={LINE_COLOR} strokeWidth={LINE_W} strokeLinecap="round"
              />
            );

          case 'dots':
            return (
              <React.Fragment key={i}>
                <Circle cx={seg.midX - 13} cy={seg.y} r={4.5} fill={DOT_BLUE} />
                <Circle cx={seg.midX}      cy={seg.y} r={4.5} fill={DOT_PINK} />
                <Circle cx={seg.midX + 13} cy={seg.y} r={4.5} fill={DOT_BLUE} />
              </React.Fragment>
            );

          case 'circleOpen':
            return (
              <Circle key={i}
                cx={seg.x} cy={seg.y} r={CIRC_R}
                fill="#FDF6EE" stroke={LINE_COLOR} strokeWidth={LINE_W}
              />
            );

          case 'arrowDown':
            return (
              <Path key={i}
                d={`M${seg.x - ARROW_S},${seg.y - ARROW_S} L${seg.x},${seg.y} L${seg.x + ARROW_S},${seg.y - ARROW_S}`}
                stroke={LINE_COLOR} strokeWidth={LINE_W}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            );

          default:
            return null;
        }
      })}
    </Svg>
  );
}
