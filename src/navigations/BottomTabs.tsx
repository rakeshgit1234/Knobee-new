import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import HomeScreen from '../screens/HomeTab/HomeScreen';
import LoginScreen from '../screens/LoginPages/LoginScreen';
import PeopleScreen from '../screens/PeopleTab/PeopleScreen';
import HiveScreen from '../screens/HiveTab/HiveScreen';
import ChatterZScreen from '../screens/ChatterzTab/ChatterZScreen';
import ProfileScreen from '../screens/ProfileTab/ProfileScreen';

const Tab = createBottomTabNavigator();

const icons = {
  Home: {
    active: require('../../assets/images/tabs/home_active.png'),
    inactive: require('../../assets/images/tabs/home.png'),
    width: 30,
    height: 30,
  },
  People: {
    active: require('../../assets/images/tabs/people_active.png'),
    inactive: require('../../assets/images/tabs/people.png'),
    width: 30,
    height: 30,
  },
  Hive: {
    active: require('../../assets/images/tabs/hive_active.png'),
    inactive: require('../../assets/images/tabs/hive.png'),
    width: 35,
    height: 22,
  },
  ChatterZ: {
    active: require('../../assets/images/tabs/chatter_active.png'),
    inactive: require('../../assets/images/tabs/chatter.png'),
    width: 24,
    height: 24,
  },
  Profile: {
    active: require('../../assets/images/tabs/profile.png'),
    inactive: require('../../assets/images/tabs/profile.png'),
    width: 30,
    height: 30,
  },
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          backgroundColor: 'rgba(255, 167, 87, 1)',
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },

        tabBarActiveTintColor: 'rgba(255, 240, 200, 1)',
        tabBarInactiveTintColor: 'rgba(255, 240, 200, 0.5)',

        tabBarIcon: ({ focused }) => {
          const tab = icons[route.name];

          return (
            <Image
              source={focused ? tab.active : tab.inactive}
              style={{
                width: tab.width,
                height: tab.height,
                resizeMode: 'contain',
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Hive" component={HiveScreen} />
      <Tab.Screen name="ChatterZ" component={ChatterZScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;