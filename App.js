import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button } from 'react-native';
import ChessMania from './src/components/ChessMania';


export default class App extends React.Component {
  constructor() {
    super();
  }


  render() {
    return (
      <View style={styles.container}>
        <ChessMania/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  
});
