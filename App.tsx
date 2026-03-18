import React from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigations/AppNavigator';
import { ScreenStackHeaderRightView } from 'react-native-screens';
import {Container, Content, Header, Body, Title} from 'native-base';

function App() {

  return (
    <View style={{flex: 1}}>
    <StatusBar barStyle="dark-content"  /> 
    // style the bar. barStyle is text and icon color od status bar.
<AppNavigator />
 </View>
  );
}

export default App;