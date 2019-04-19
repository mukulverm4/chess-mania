import React from 'react';
import { StyleSheet, Text, View,Dimensions, TouchableOpacity } from 'react-native';
import Chess from 'chess.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ROWS = 8;



export default class App extends React.Component {
  constructor(){
    super();
    let chess = Chess.Chess;
    let chessMania = new chess();
    console.log(chessMania.ascii());
    console.log(chessMania.fen());
    console.log(chessMania.pgn());
    // while (!chessMania.game_over()) {
    //   var moves = chessMania.moves();
    //   var move = moves[Math.floor(Math.random() * moves.length)];
    //   chessMania.move(move);
    // }
    // console.log(chessMania.pgn());

    var {height, width} = Dimensions.get('window');
    this.state = {
      width:width,
    }
  }

  _renderBoard(){

    const rows = [];

    for (let i = 0; i < ROWS; i++){
      const cells = [];
      for (let j = 0; j < ROWS; j++){
        cells.push(
        <TouchableOpacity onPress={()=>this._onTouch(""+i+j)} key={""+i+j} style={styles.cell}>
          <Icon name='chess-pawn' size={32}/>
        </TouchableOpacity>)
      }
      rows.push(<View key={i} style={[styles.row]}>{cells}</View>)
    }
    
   //console.log(rows);
    return(
        rows
    )
  }

  _onTouch(key){
    console.log("##########=> ", key)
  }

  _getPiece(letter){
    if (letter.toUpperCase() ==='R')
      return 'chess-rook';
    else if(letter.toUpperCase() === 'B')
      return 'chess-bishop';
    else if(letter.toUpperCase() === 'N')
      return 'chess-knight';
    else if(letter.toUpperCase() === 'Q')
      return 'chess-queen';
    else if(letter.toUpperCase() === 'K')
      return 'chess-king';
    else throw new Error('Piece not found!');
  }


  render() {
    return (
      <View style={styles.container}>
      <View style={styles.chessBoard}>
  
              {this._renderBoard()}
              </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  row: {
    flexDirection:'row',
    flex:1,
  },
  cell:{
    flex:1,
    borderWidth:0.5,
    borderColor:'#000',
    justifyContent:'center',
    alignItems:'center',
  },
  darkCell:{
    flex:1,
    backgroundColor:'#000'
  },
  chessBoard:{
    aspectRatio:1
  }

});
