/**
 * familyTree/index.js — barrel export
 *
 * Usage:
 *   import FamilyTreeCanvas from './familyTree';
 *
 *   // In your app root — wrap in GestureHandlerRootView:
 *   import { GestureHandlerRootView } from 'react-native-gesture-handler';
 *
 *   export default function App() {
 *     return (
 *       <GestureHandlerRootView style={{ flex: 1 }}>
 *         <FamilyTreeCanvas initialFocusId="sandhya" />
 *       </GestureHandlerRootView>
 *     );
 *   }
 *
 * Install:
 *   npx expo install react-native-reanimated react-native-svg react-native-gesture-handler
 *   # Add to babel.config.js → plugins: ['react-native-reanimated/plugin']
 */

export { default }                                    from './FamilyTreeCanvas';
export { default as PersonCard }                      from './PersonCard';
export { default as RelationshipConnector }           from './RelationshipConnector';
export { default as AnimatedNode }                    from './AnimatedNode';
export { default as FloatingActionButtons }           from './FloatingActionButtons';
export { default as HeartBadge }                      from './HeartBadge';
export { default as Header }                          from './Header';
export { default as AddHiver }                        from './AddHiver';
export { PEOPLE, RELATIONSHIPS, getParents, getSpouses, getChildren } from './data';
export { buildLayout, buildConnectors, CARD_W, CARD_H, SW, CANVAS_H } from './layout';
