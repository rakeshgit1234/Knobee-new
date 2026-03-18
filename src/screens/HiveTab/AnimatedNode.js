import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SPRING_CFG = {
  damping: 22,
  stiffness: 240,
  mass: 0.85,
  overshootClamping: false,
};

export default function AnimatedNode({ x, y, zIndex, width, height, children }) {
  const tx = useSharedValue(x);
  const ty = useSharedValue(y);

  useEffect(() => {
    tx.value = withSpring(x, SPRING_CFG);
    ty.value = withSpring(y, SPRING_CFG);
  }, [x, y]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: 0, left: 0, width, height, zIndex },
        animStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}
