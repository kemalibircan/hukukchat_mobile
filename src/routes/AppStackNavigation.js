import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import Chat from '../screens/app/chat/Chat';
import 'react-native-gesture-handler';
import Welcome from '../screens/auth/Welcome';
import MenuScreen from '../screens/app/menu/Menu';
import Settings from '../screens/app/settings/Settings';
import Ictihat from '../screens/app/ictihat/Ictihat';
import Mevzuat from '../screens/app/mevzuat/Mevzuat';
import LegalTranslation from '../screens/app/tercume/LegalTranslation';
import DocumentAnalysis from '../screens/app/belgeincele/DocumentAnalysis';
import CalculationsScreen from '../screens/app/hesaplamalar/Calculations';
import FaqScreen from '../screens/app/sss/FaqScreen';
import Help from '../screens/app/help/Help';


const Stack = createStackNavigator();

function AppStackNavigation() {
  return (
    <Stack.Navigator initialRouteName="Menu">
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="Settings"
        component={Settings}
        options={{headerShown: false}}></Stack.Screen>
          <Stack.Screen
        name="Ictihat"
        component={Ictihat}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="Mevzuat"
        component={Mevzuat}
        options={{headerShown: false}}></Stack.Screen>
          <Stack.Screen
        name="LegalTranslation"
        component={LegalTranslation}
        options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen
        name="DocumentAnalysis"
        component={DocumentAnalysis}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="Calculations"
        component={CalculationsScreen}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="FAQ"
        component={FaqScreen}
        options={{headerShown: false}}></Stack.Screen>
         <Stack.Screen
        name="Help"
        component={Help}
        options={{headerShown: false}}></Stack.Screen>

    </Stack.Navigator>
    
  );
}

export default AppStackNavigation;
