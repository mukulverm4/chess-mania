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
      gameOver : false,
      turn: chessMania.turn(),
    }

  }

  _getFenArray(){

    let fen = this.state.currentGameFEN;
    //console.log(fen)
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
         // console.log(Number(tempArray[j]));
         // console.log("#########", tempArray[j])
          if(!isNaN(tempArray[j])){
            
              let count = 0;
              while(count  < tempArray[j]){
                tempRow[tempRowIndex] = 'o';
                tempRowIndex++;
                count++;
              }
            }
          else{
            //console.log("######",tempRow)
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
        <TouchableOpacity 
          onPress={()=>this._onTouch(ALPHABETS[j]+(i+1))} 
          key={ALPHABETS[i]+(j+1)} 
          style={[this.state.from===ALPHABETS[j]+(i+1)||this.state.to===ALPHABETS[j]+(i+1)?styles.selectedCell:null,styles.cell]}>
          {fenRowArray[ROWS-1-i][j]==="o"||fenRowArray[ROWS-1-i][j]=="1"?null:<Icon name={this._getPiece(fenRowArray[ROWS-1-i][j])} size={32}
           color={fenRowArray[ROWS-1-i][j] == (fenRowArray[ROWS-1-i][j]).toLowerCase()  ? "#f00" : "#0f0" }/>}
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

    if(!this.state.gameOver){
    let chess = Chess.Chess;
    let chessMania = new chess(this.state.currentGameFEN);
    if(chessMania.get(key) != null && chessMania.get(key).color === chessMania.turn()){
      
      this.setState({ from : key })
    }
    else{
    if(this.state.from != '' && ((chessMania.get(key) == null) || chessMania.get(key).color !== chessMania.turn())) {
      this.setState({ to : key })
    }
  }

    console.log(key)
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
     // console.log(thisMove)
      let move = chessMania.move(thisMove);
      console.log("move => ",move)

      let currGame = chessMania.fen();
      console.log(currGame);
      let gameOver = chessMania.game_over();
      this.setState({
        from : '',
        to : '',
        currentGameFEN : currGame,
        gameOver: gameOver,
        turn: chessMania.turn(),
      })


    }
  
  }

  _resetBoard(){
    let chess = Chess.Chess;
    let chessMania = new chess();
    this.setState({
      currentGameFEN : chessMania.fen()
    })
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.chessBoard}>
          {this._renderBoard()}
        </View>
        <View style={{justifyContent:'center', alignItems:'center'}}>
          <TouchableOpacity style={styles.button} onPress={()=>this._makeMove()}>
            <Text style={styles.textCenter}>{this.state.gameOver?"GAME OVER":this.state.turn+" MAKE MOVE"} </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}  onPress={()=>this._resetBoard()}>
            <Text style={styles.textCenter}>RESET</Text>
          </TouchableOpacity>
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
  selectedCell:{
    backgroundColor:'#ebecee'
  },
  darkCell:{
    flex:1,
    backgroundColor:'#000'
  },
  chessBoard:{
    aspectRatio:1
  },
  button:{
    alignSelf: 'center',
    margin:10,
    padding:10,
    width: '25%',
    backgroundColor:'#ebecee',
    borderRadius: 5,
    textAlign:'center'
  },
  textCenter:{
    textAlign:'center'
  }

});
