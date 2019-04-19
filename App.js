import React from 'react';
import { StyleSheet, Text, View,Dimensions, TouchableOpacity ,Button} from 'react-native';
import Chess from 'chess.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ROWS = 8;
const ALPHABETS = ['a','b','c','d','e','f','g','h'];



export default class App extends React.Component {
  constructor(){
    super();
    let chess = Chess.Chess;
    let chessMania = new chess();
    let currentGameFEN = chessMania.fen();
    // while (!chessMania.game_over()) {
    //   var moves = chessMania.moves();
    //   var move = moves[Math.floor(Math.random() * moves.length)];
    //   chessMania.move(move);
    // }
    // console.log(chessMania.pgn());
    this.state = {
      currentGameFEN : currentGameFEN,
      from:'',
      to:'',
      currentGame:chessMania,
    }

  }

  _getFenArray(){

    let fen = this.state.currentGameFEN;
    console.log(fen)
    let fenArray = (fen.split(" ")[0]).split("/");
    let fenRowArray = [];

    for(let i = 0; i < fenArray.length; i++){
      //
      let tempArray = fenArray[i].split("");
      if(tempArray.length === ROWS)
        fenRowArray[i] = tempArray;
      else{
        tempRow = []
        let tempRowIndex = 0;
        for(let j = 0; j < tempArray.length; j++){
          console.log(Number(tempArray[j]));
          console.log("#########", tempArray[j])
          if(!isNaN(tempArray[j])){
            
              let count = 0;
              while(count  < tempArray[j]){
                tempRow[tempRowIndex] = 'o';
                tempRowIndex++;
                count++;
              }
            }
          else{
            console.log("######",tempRow)
            tempRow[tempRowIndex] = tempArray[j];
            tempRowIndex++;
          }
          }
          fenRowArray[i] = tempRow;
        }
      }
      
      return fenRowArray;
  }

  _renderBoard(){

    const rows = [];

    let fenRowArray = this._getFenArray();
    //console.log(fenRowArray)
    for (let i = 0; i < ROWS; i++){
      const cells = [];
      for (let j = 0; j < ROWS; j++){
        cells.push(
        <TouchableOpacity onPress={()=>this._onTouch(ALPHABETS[j]+(i+1))} key={ALPHABETS[i]+(j+1)} style={styles.cell}>
          {fenRowArray[i][j]==="o"||fenRowArray[i][j]=="1"?null:<Icon name={this._getPiece(fenRowArray[i][j])} size={32}
           color={fenRowArray[i][j] == (fenRowArray[i][j]).toLowerCase()  ? "#f00" : "#0f0" }/>}
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
    if(this.state.from === ''){
      this.setState({from:key})
    }
    else{
      this.setState({to:key})
    }
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
    else if(letter.toUpperCase() === 'P')
      return 'chess-pawn';
    else return '' ;
     //throw new Error('Piece not found!');console.log("##########=> ", key)
  }

  _makeMove(){
    if(this.state.from !== '' && this.state.to !== ''){
      console.log(" made move => ", this.state.from," to ", this.state.to);
      let chess = Chess.Chess;
      let chessMania = new chess(this.state.currentGameFEN);
      let thisMove = {from:this.state.from, to:this.state.to};
      console.log(thisMove)
      let move = chessMania.move(thisMove);
      console.log("move => ",move)
      let currGame = chessMania.fen();
      console.log(currGame);

      this.setState({
        from : '',
        to : '',
        currentGameFEN : currGame
      })

    }
  
  }


  render() {
    return (
      <View style={styles.container}>
      <View style={styles.chessBoard}>
          {this._renderBoard()}
              </View>
        <Button title="Make move" onPress={()=>this._makeMove()}></Button>
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
