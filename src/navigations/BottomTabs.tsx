import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import HomeScreen from '../screens/HomeTab/HomeScreen';
import PeopleScreen from '../screens/PeopleTab/PeopleScreen';
import HiveScreen from '../screens/HiveTab/HiveScreen';
import ChatterZScreen from '../screens/ChatterzTab/ChatterZScreen';
import ProfileScreen from '../screens/ProfileTab/ProfileScreen';
import HiveFamilyGraph from '../screens/HiveTab/HiveScreen1';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Home', icon: require('../../assets/images/tabs/home_active.png') },
  { name: 'People', label: 'People', icon: require('../../assets/images/tabs/people_active.png') },
  { name: 'Hive', label: 'Hive', icon: require('../../assets/images/tabs/hive_active.png') },
  { name: 'ChatterZ', label: 'Chat', icon: require('../../assets/images/tabs/chatter_active.png') },
  { name: 'Profile', label: 'Me', icon: require('../../assets/images/tabs/profile.png') },
];


/* ---------------- TAB BUTTON ---------------- */

const TabButton = ({ tab, focused, onPress, isCenter }) => {

  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
    }).start();

    if (isCenter) {
      Animated.spring(translateY, {
        toValue: focused ? -18 : 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    }

  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.9}
    >

      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{ scale }, { translateY }],
        }}
      >

        {/* CENTER ACTIVE DIAMOND */}
        {isCenter && focused ? (

          <Animated.View style={{ transform: [{ rotate: '45deg' }] }}>

            <LinearGradient
              colors={['rgba(255, 167, 87, 1)', 'rgba(255, 240, 200, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.diamond}
            >

              <View style={{ transform: [{ rotate: '-45deg' }] }}>
                <Image
                  source={tab.icon}
                  style={{
                    width: 26,
                    height: 26,
                    tintColor: '#fff',
                  }}
                  resizeMode="contain"
                />
              </View>

            </LinearGradient>

          </Animated.View>

        ) : (

          <Image
            source={tab.icon}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#fff' : '#aaa',
            }}
            resizeMode="contain"
          />

        )}

        {/* Hide label when diamond active */}
        {!(isCenter && focused) && (
          <Text
            style={[
              styles.label,
              { color: focused ? '#fff' : '#aaa' }
            ]}
          >
            {tab.label}
          </Text>
        )}

      </Animated.View>

    </TouchableOpacity>
  );
};


/* ---------------- CUSTOM TAB BAR ---------------- */

const CustomTabBar = ({ state, navigation }) => {

  const insets = useSafeAreaInsets();
  const routes = state.routes;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>

      <View style={styles.bar}>

        {routes.map((route, index) => {

          const tab = TABS[index];
          const focused = state.index === index;

          const onPress = () => {
            if (!focused) navigation.navigate(route.name);
          };

          return (
            <TabButton
              key={route.key}
              tab={tab}
              focused={focused}
              onPress={onPress}
              isCenter={index === 2}
            />
          );

        })}

      </View>

    </View>
  );
};


/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
  },

  bar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(255,167,87,1)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
  },

  label: {
    fontSize: 11,
    marginTop: 4,
  },

  diamond: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 2,
    borderColor: '#fff',

    shadowColor: '#FF7A50',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },

});


/* ---------------- NAVIGATOR ---------------- */

const BottomTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="People" component={PeopleScreen} />
    <Tab.Screen name="Hive" component={HiveFamilyGraph} />
    <Tab.Screen name="ChatterZ" component={ChatterZScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabs;