import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ─── Auth Screens ─────────────────────────────────────────────────────────────
import LoginScreen from '../screens/LoginPages/LoginScreen';
import OTPScreen from '../screens/LoginPages/OTPScreen';
import SignupScreen from '../screens/LoginPages/SignupScreen';

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
import BottomTabs from './BottomTabs';

// ─── Home ─────────────────────────────────────────────────────────────────────
import HomeScreen from '../screens/HomeTab/HomeScreen';

// ─── People ───────────────────────────────────────────────────────────────────
import PeopleScreen from '../screens/PeopleTab/PeopleScreen';

// ─── Hive ─────────────────────────────────────────────────────────────────────
import HiveScreen from '../screens/HiveTab/HiveScreen';

// ─── ChatterZ ─────────────────────────────────────────────────────────────────
import ChatterZScreen from '../screens/ChatterZTab/ChatterZScreen';
import ChatScreen from '../screens/ChatterzTab/ChatScreen';
import AudioCallScreen from '../screens/ChatterzTab/AudioCallScreen';
import VideoCallActiveScreen from '../screens/ChatterzTab/VideoCallActiveScreen';
import CreateGroupScreen, { AddMembersScreen } from '../screens/ChatterzTab/CreateGroupScreen';

// ─── Todo ─────────────────────────────────────────────────────────────────────
import TodoListScreen from '../screens/ChatterzTab/TodoListScreen';
import AddTodoScreen from '../screens/ChatterzTab/AddTodoScreen';
import SettingsScreen, { BlockListScreen, SavedPostScreen } from '../screens/ProfileTab/SettingsScreen';
import CreatePostScreen, { TagPeopleScreen } from '../screens/HomeTab/CreatePost';
import NotificationScreen from '../screens/HomeTab/NotificationScreen';
import SearchScreen from '../screens/HomeTab/SearchScreen';
import NearbySearchScreen from '../screens/HomeTab/NearbySearchScreen';
import StoryViewScreen from '../screens/HomeTab/StoryViewScreen';
import AddHiveScreen from '../screens/HiveTab/AddHiveScreen';
import BulkInviteScreen from '../screens/ChatterzTab/BulkInviteScreen';
import ProfileScreen from '../screens/ProfileTab/othersprofile';
import RelationFinderScreen from '../screens/ProfileTab/RelationFinderScreen';
import FamilyTreeScreen from '../screens/HomeTab/FamilyTreeScreen';



// ─── Stack param list (for type safety) ──────────────────────────────────────
export type RootStackParamList = {
  // Auth
  Login: undefined;
  OTPScreen: undefined;
  SignupScreen: undefined;

  // Main tabs
  MainTabs: undefined;

  // Home
  HomeScreen: undefined;
  CreatePost: undefined;

  // People
  PeopleScreen: undefined;

  // Hive
  HiveScreen: undefined;

  // ChatterZ
  ChatterZScreen: undefined;
  ChatScreen: { chat?: { id: string; name: string; avatar?: string; isGroup?: boolean; memberCount?: number; isActive?: boolean } };
  AudioCall: { contact?: { name: string; avatar: string }; isIncoming?: boolean };
  VideoCallActive: { contact?: { name: string; avatar: string } };
  CreateGroup: undefined;
  AddMembers: undefined;

  // Todo
  TodoList: { isShared?: boolean };
  AddTodo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            {/* ── Auth ── */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />

            {/* ── Main Tabs ── */}
            <Stack.Screen name="MainTabs" component={BottomTabs} />

          

        
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen
              name="AudioCall"
              component={AudioCallScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="VideoCallActive"
              component={VideoCallActiveScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="AddMembers" component={AddMembersScreen} />

            {/* ── Todo ── */}
            <Stack.Screen name="TodoList" component={TodoListScreen} />
            <Stack.Screen name="AddTodo" component={AddTodoScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="BlockList" component={BlockListScreen} />
            <Stack.Screen name="SavedPost" component={SavedPostScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
<Stack.Screen name="TagPeople" component={TagPeopleScreen} />
<Stack.Screen name="Notification" component={NotificationScreen} />
<Stack.Screen name="Search" component={SearchScreen} />
<Stack.Screen name="NearbySearch" component={NearbySearchScreen} />
<Stack.Screen name="StoryView" component={StoryViewScreen} />
<Stack.Screen name="AddHive" component={AddHiveScreen} />
<Stack.Screen name="BulkInvite" component={BulkInviteScreen} />
<Stack.Screen name="Profile" component={ProfileScreen} />
<Stack.Screen name="RelationFinder" component={RelationFinderScreen} />
<Stack.Screen name="FamilyTree" component={FamilyTreeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default AppNavigator;