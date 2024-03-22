import React,{ useState, useEffect } from 'react';
import {
  Text,
  View,
} from 'react-native';

import { FONTS } from "./assets/constants"

// module.exports = {
//   project: {
//     ios: {},
//     android: {},
//   },
//   assets: ['./assets/fonts'],
// };

// npx react-native-asset


export default function App(): React.JSX.Element {
 
  return (
    <View style={{...FONTS.container}}>
      <Text style={{...FONTS.font1}}>
        This is a text with Honk font
      </Text>
      <Text style={{...FONTS.font2}}>
        This is a text with Caveat font
      </Text>
    </View>
  );
}