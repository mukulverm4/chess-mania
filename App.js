import React from 'react';
import { StyleSheet, Text, View,Dimensions, TouchableOpacity ,Button} from 'react-native';
import Chess from 'chess.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ROWS = 8;
const ALPHABETS = ['a','b','c','d','e','f','g','h'];
const color1Palette = ['#ff65b7','#ff93ce','#ffc4e2','#ffe6f3'];
const color2Palette = ['#6afdff','#97feff','#c8feff','#e7feff'];
const piecePoints = {
  'q' : 8,
  'r' : 5,
  'b' : 3,
  'n' : 3,
  'p' : 1,
  'k' : 0
}
const BOARD_KEYS = ["a1","b1","c1","d1","e1","f1","g1","h1","a2","b2","c2","d2","e2","f2","g2","h2","a3","b3","c3","d3","e3","f3","g3","h3","a4","b4","c4","d4","e4","f4","g4","h4","a5","b5","c5","d5","e5","f5","g5","h5","a6","b6","c6","d6","e6","f6","g6","h6","a7","b7","c7","d7","e7","f7","g7","h7","a8","b8","c8","d8","e8","f8","g8","h8"];

export default class App extends React.Component {
  constructor(){
    super();
    let chess = Chess.Chess;
    let chessMania = new chess();
    let currentGameFEN = chessMania.fen();

    this.state = {
      currentGameFEN : currentGameFEN,
      from:'',
      to:'',
      gameOver : false,
      turn: chessMania.turn(),
      cellColor:{},
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

  _colorizeBoard(){
    let chess = Chess.Chess;
    let chessMania = new chess(this.state.currentGameFEN);
    let cellColor = this.state.cellColor;
    for(let i = 0; i<BOARD_KEYS.length; i++){
      let currentCell = BOARD_KEYS[i];
      let piece = chessMania.get(currentCell);
      
      if(piece != null){
        //console.log('### ', piece)
        // if(piece.type === 'p'){
        //   let possibleMoves = chessMania.moves({square : BOARD_KEYS[i]});
          
        //   for(let j =0;j<possibleMoves.length;j++){
        //     cellColor[possibleMoves[j]] =  color1Palette[color1Palette.length-1];
        //   }
          
        // }
        if(piece.type === 'r'){
          let row = currentCell[0];
          let column = currentCell[1];
          let up  = Number(column)+1;
          let down = column-1;
          let left = ALPHABETS.indexOf(row)-1;
          let right = ALPHABETS.indexOf(row)+1;
          console.log(row,up);
          while(up<9){
            let newKey = row+up;
            console.log(newKey)
            cellColor[newKey]=color1Palette[3];
            if(chessMania.get(newKey)!=null) break;
            else  up++;
          }
          while(down>0){
            let newKey = row+down;
            console.log(newKey);
            cellColor[newKey]=color1Palette[3];
            if(chessMania.get(newKey)!=null) break;
            else  down--;
          }
          while(left > 0){
            let newKey = ALPHABETS[left]+column;
            console.log(newKey)
            cellColor[newKey] = color1Palette[3];
            if(chessMania.get(newKey)!=null) break;
            else left--; 
          }
          while(right < 9){
            let newKey = ALPHABETS[right]+column;
            console.log(newKey)
            cellColor[newKey] = color1Palette[3];
            if(chessMania.get(newKey)!=null) break;
            else right++; 
          }

        }
      }
    }

    console.log('##### ', JSON.stringify(this.state.cellColor));

  }

  _renderBoard(){

    const rows = [];

    let fenRowArray = this._getFenArray();
    const keys = [];
    this._colorizeBoard();

    
    for (let i = 0; i < ROWS; i++){
      const cells = [];
      
      for (let j = 0; j < ROWS; j++){
        key =  ALPHABETS[j]+(i+1);
        keys.push(key);
        cells.push(
        <TouchableOpacity 
          onPress={()=>this._onTouch(ALPHABETS[j]+(i+1))} 
          key={ALPHABETS[j]+(i+1)} 
          style={[this.state.from === ALPHABETS[j]+(i+1)|| this.state.to === ALPHABETS[j]+(i+1) ? styles.selectedCell:null, styles.cell,
           this.state.cellColor[ALPHABETS[j]+(i+1)] != null ? {backgroundColor:this.state.cellColor[ALPHABETS[j]+(i+1)]}:null]}>
          {fenRowArray[ROWS-1-i][j]==="o"||fenRowArray[ROWS-1-i][j]=="1"?null:<Icon name={this._getPiece(fenRowArray[ROWS-1-i][j])} size={32}
           color={fenRowArray[ROWS-1-i][j] == (fenRowArray[ROWS-1-i][j]).toLowerCase()  ? "#f00" : "#0f0" }/>}
        </TouchableOpacity>)
      }
      rows.push(<View key={i} style={[styles.row]}>{cells}</View>)
    }
    
    
   //console.log(keys);
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
