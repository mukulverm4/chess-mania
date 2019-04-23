import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button } from 'react-native';
import ChessMania from './src/components/ChessMania';
import firebase from 'firebase';

export default class App extends React.Component {
  constructor() {
    super();


    var config = {
      apiKey: "AIzaSyDmuUvqvGvRtmTjijXAxOKH9kK6H3OHrPk",
      authDomain: "chess-menace.firebaseapp.com",
      databaseURL: "https://chess-menace.firebaseio.com",
      projectId: "chess-menace",
      storageBucket: "chess-menace.appspot.com",
      messagingSenderId: "31372489105"
    };
    firebase.initializeApp(config);
    
    this.state = {
      user : ''
    }

  }
  componentDidMount(){
    firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log("firebase error ", errorCode, errorMessage);
    });
    
    firebase.auth().onAuthStateChanged((user)=>{
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        this.setState({user:user})
        console.log(user);
        // ...
      } else {
        // User is signed out.
        // ...
        console.log("not signed in")
      }
      // ...
    });
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
