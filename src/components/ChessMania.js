import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button, Clipboard } from 'react-native';
import Chess from 'chess.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'firebase';
import { TextInput } from 'react-native-gesture-handler';

const ROWS = 8;
const ALPHABETS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const piecePoints = {
  'q': 9,
  'r': 5,
  'b': 3,
  'n': 3,
  'p': 1,
  'k': 0
}
const MAX_POINTS_VALUE = piecePoints.q + 2 * piecePoints.r + 2 * piecePoints.b + 2 * piecePoints.n + 8 * piecePoints.p + piecePoints.k;
const BOARD_KEYS = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];


  export default class ChessMania extends React.Component{
    constructor(props) {
        super(props);
        let chess = Chess.Chess;
        let chessMania = new chess();
        let currentGameFEN = chessMania.fen();
        this.state = {
          resetGameFEN: currentGameFEN,
          currentGameFEN: currentGameFEN,
          from: '',
          to: '',
          gameOver: false,
          turn: chessMania.turn(),
          cellColor: {},
          moveMade: false,
          startGame: this.props.playMode === 'offline' ? true : false,
          uid : '',
        }
      }
    
      componentWillMount() {
        this._colorizeBoard();
        firebase.auth().onAuthStateChanged((user)=>{
          if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
            this.setState({
              uid:uid
            })
          } else {
            // User is signed out.
            // ...
            console.log("not signed in")
          }
          // ...
        });
      }
    
      _getFenArray() {
    
        let fen = this.state.currentGameFEN;
        let fenArray = (fen.split(" ")[0]).split("/");
        let fenRowArray = [];
    
        for (let i = 0; i < fenArray.length; i++) {
          let tempArray = fenArray[i].split("");
          if (tempArray.length === ROWS)
            fenRowArray[fenArray.length - i -1] = tempArray;
          else {
            tempRow = []
            let tempRowIndex = 0;
            for (let j = 0; j < tempArray.length; j++) {
              if (!isNaN(tempArray[j])) {
                let count = 0;
                while (count < tempArray[j]) {
                  tempRow[tempRowIndex] = 'o';
                  tempRowIndex++;
                  count++;
                }
              }
              else {
                tempRow[tempRowIndex] = tempArray[j];
                tempRowIndex++;
              }
            }
            fenRowArray[fenArray.length - i - 1] = tempRow;
          }
        }
        return fenRowArray;
      }
    
       _setCellPoints(piece, cell) {
    
        if (typeof cell === 'undefined') {
          cell = {
            primaryColorWeight: 0,
            secondaryColorWeight: 0
          }
        }
        if (piece.color === 'b') {
          typeof cell.primaryColorWeight === 'undefined'
            ? cell.primaryColorWeight = piecePoints[piece.type]
            : cell.primaryColorWeight += piecePoints[piece.type];
        } else {
          typeof cell.secondaryColorWeight === 'undefined'
            ? cell.secondaryColorWeight = piecePoints[piece.type]
            : cell.secondaryColorWeight += piecePoints[piece.type];
        }
        return cell;
    
      }
    
      async _colorizeBoard() {
        let chess = Chess.Chess;
        let chessMania = new chess(this.state.currentGameFEN);
        let cellColor = {};
        for (let i = 0; i < BOARD_KEYS.length; i++) {
          let currentCell = BOARD_KEYS[i];
          let piece = chessMania.get(currentCell);
          //console.log("here 1",piece, currentCell)
          if (piece != null) {
            switch(piece.type){
              case 'r':{
                cellColor = this._colorizeRook(currentCell, cellColor, chessMania, piece);
                break;
              }
              case 'n':{
                let possibleMoves = this._getKnightMoves(piece, currentCell);
                for (let i = 0; i < possibleMoves.length; i++) {
                  cellColor[possibleMoves[i].substring(1, 3)] = this._setCellPoints(piece, cellColor[possibleMoves[i].substring(1, 3)]);
                }
              break;
              }
              case 'b':{
                cellColor = this._colorizeBishop(currentCell, cellColor, chessMania, piece);
                break;
              }
              case 'q':{
                cellColor = this._colorizeBishop(currentCell, cellColor, chessMania, piece);
                cellColor = this._colorizeRook(currentCell, cellColor, chessMania, piece);
                break;
              }
              case 'p':{
                cellColor = this._colorizePawn(currentCell, cellColor, piece);
              }
            }
          }
        }
    
        
        await this.setState({ cellColor: cellColor })
       //console.log('##### ', JSON.stringify(this.state.cellColor));
      }
    
      _colorizePawn(currentCell, cellColor, piece) {
        let row = currentCell[0];
        let column = currentCell[1];
        if (piece.color === 'w') {
          let up = Number(column) + 1;
          let left = ALPHABETS.indexOf(row) - 1;
          let right = ALPHABETS.indexOf(row) + 1;
          if (left > 0)
            cellColor[ALPHABETS[left] + up] = this._setCellPoints(piece, cellColor[ALPHABETS[left] + up]);
          if (right < 9)
            cellColor[ALPHABETS[right] + up] = this._setCellPoints(piece, cellColor[ALPHABETS[right] + up]);
    
        } else {
          let down = Number(column) - 1;
          let left = ALPHABETS.indexOf(row) - 1;
          let right = ALPHABETS.indexOf(row) + 1;
          if (left > 0)
            cellColor[ALPHABETS[left] + down] = this._setCellPoints(piece, cellColor[ALPHABETS[left] + down]);
          if (right < 9)
            cellColor[ALPHABETS[right] + down] = this._setCellPoints(piece, cellColor[ALPHABETS[right] + down]);
        }
    
        return cellColor;
      }
      _colorizeRook(currentCell, cellColor, chessMania, piece) {
        let row = currentCell[0];
        let column = currentCell[1];
        let up = Number(column) + 1;
        let down = Number(column) - 1;
        let left = ALPHABETS.indexOf(row) - 1;
        let right = ALPHABETS.indexOf(row) + 1;
        while (up < 9) {
          let newKey = row + up;
          //console.log(newKey)
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else up++;
        }
        while (down > 0) {
          let newKey = row + down;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else down--;
        }
        while (left > -1) {
          let newKey = ALPHABETS[left] + column;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else left--;
        }
        while (right < 8) {
          let newKey = ALPHABETS[right] + column;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else right++;
        }
        return cellColor;
      }
    
      _colorizeBishop(currentCell, cellColor, chessMania, piece) {
        let row = currentCell[0];
        let column = currentCell[1];
    
        let up = Number(column) + 1;
        let down = Number(column) - 1;
        let left = ALPHABETS.indexOf(row) - 1;
        let right = ALPHABETS.indexOf(row) + 1;
        while (up < 9 && right < 8) {
          let newKey = ALPHABETS[right] + up;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else {
            up++;
            right++;
          }
        }
        up = Number(column) + 1;
        right = ALPHABETS.indexOf(row) + 1;
        while (up < 9 && left > -1) {
          let newKey = ALPHABETS[left] + up;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else {
            up++;
            left--;
          }
        }
        left = ALPHABETS.indexOf(row) - 1;
        while (down > 0 && left > -1) {
          let newKey = ALPHABETS[left] + down;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else {
            down--;
            left--;
          }
          
        }
        down = Number(column) - 1;
        while (down > 0 && right < 8) {
          let newKey = ALPHABETS[right] + down;
          if (chessMania.get(newKey) != null &&
            chessMania.get(newKey).color === piece.color &&
            chessMania.get(newKey).type === 'k') break;
          cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
          if (chessMania.get(newKey) != null) break;
          else {
            down--;
            right++;
          }
        }
        return cellColor;
      }
    
      _getKnightMoves(piece, key) {
        let chess = Chess.Chess;
        let tempChess = new chess();
    
        tempChess.clear();
        tempChess.put(piece, key);
        if (piece.color === 'b') {
          tempChess = new chess(tempChess.fen().replace('w', 'b'));
        }
        return tempChess.moves({ square: key })
      }
    
      _getCellBackgroundColor(cellColor) {
        let style = {}
        let b = (255 - (50 * (Number(cellColor.primaryColorWeight) / (Number(cellColor.primaryColorWeight) + 1)) + Number(cellColor.primaryColorWeight) * 5));
        let r = (255 - (50 * (Number(cellColor.secondaryColorWeight) / (Number(cellColor.secondaryColorWeight) + 1)) + Number(cellColor.secondaryColorWeight) * 5));
        let g = b > r ? (r + 60) : (b + 60);
        style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        return style;
      }
    
      _renderBoard() {
    
        const rows = [];
    
        let fenRowArray = this._getFenArray();
        const keys = [];
    
        for (let i = 0; i < ROWS; i++) {
          const cells = [];
          //console.log(this.state.cellColor)
          for (let j = 0; j < ROWS; j++) {
            let key = ALPHABETS[j] + (ROWS - i);
            keys.push(key);
            let cellBackgroundColor = this.state.cellColor[ALPHABETS[j] + (ROWS - i)] 
              != null ? this._getCellBackgroundColor(this.state.cellColor[ALPHABETS[j] + (ROWS - i)]):null;
            //  console.log(cellBackgroundColor)
            cells.push(
              <TouchableOpacity
                onPress={() => this._onTouch(ALPHABETS[j] + (ROWS - i),cellBackgroundColor,this.state.cellColor[ALPHABETS[j] + (i + 1)])}
                key={ALPHABETS[j] + (ROWS - i)}
                style={[styles.cell,
                 cellBackgroundColor
                 ,this.state.from === ALPHABETS[j] + (ROWS - i) ||
                  this.state.to === ALPHABETS[j] + (ROWS - i) ?
                  {borderColor:'#10FF00'}: null]}>
                {fenRowArray[ROWS - 1 - i][j] === "o" || fenRowArray[ROWS - 1 - i][j] == "1"
                  ? null : <Icon name={this._getPiece(fenRowArray[ROWS - 1 - i][j])} size={32}
                    color={fenRowArray[ROWS - 1 - i][j] == (fenRowArray[ROWS - 1 - i][j]).toLowerCase()
                      ? "#000" : "#BCBCBC"} />}
              </TouchableOpacity>)
          }
          rows.push(<View key={i} style={[styles.row]}>{cells}</View>)
        }
    
    
        //console.log(keys);
        return (
          rows
        )
      }
    
      _onTouch(key, backgroundColor, weight) {
        //console.log(backgroundColor , weight);
    
        if (!this.state.gameOver && (this.props.playMode==='offline'||this.state.uid == this.state[this.state.turn])) {
          
          let chess = Chess.Chess;
          let chessMania = new chess(this.state.currentGameFEN);
          if (chessMania.get(key) != null && chessMania.get(key).color === chessMania.turn()) {
    
            this.setState({ from: key })
          }
          else {
            if (this.state.from != '' && ((chessMania.get(key) == null) || chessMania.get(key).color !== chessMania.turn())) {
              this.setState({ to: key })
            }
          }
          //console.log(key)
        }
      }
    
      _getPiece(letter) {
    
        if (letter.toUpperCase() === 'R')
          return 'chess-rook';
        else if (letter.toUpperCase() === 'B')
          return 'chess-bishop';
        else if (letter.toUpperCase() === 'N')
          return 'chess-knight';
        else if (letter.toUpperCase() === 'Q')
          return 'chess-queen';
        else if (letter.toUpperCase() === 'K')
          return 'chess-king';
        else if (letter.toUpperCase() === 'P')
          return 'chess-pawn';
        else return '';
      }
    
      async _makeMove() {
        if (this.state.from !== '' && this.state.to !== '') {
         // console.log(" made move => ", this.state.from, " to ", this.state.to);
          let chess = Chess.Chess;
          let chessMania = new chess(this.state.currentGameFEN);
          let thisMove = { from: this.state.from, to: this.state.to };
          // console.log(thisMove)
          let move = chessMania.move(thisMove);
         console.log("move => ", move)
    
          let currGame = chessMania.fen();
         // console.log(currGame);
          let gameOver = chessMania.game_over();
          await this.setState({
            from: '',
            to: '',
            currentGameFEN: currGame,
            gameOver: gameOver,
            turn: chessMania.turn(),
            cellColor: {}
          })
          this._colorizeBoard();
          
          if(this.props.playMode === 'online'){
            firestore = firebase.firestore(); 
            firestore.collection("games").doc(this.state.gameID).set({
              gameFEN:this.state.currentGameFEN,
              turn : this.state.turn,
            },{merge:true})
          }
        }
      }
    
      async _resetBoard() {
        await this.setState({
          currentGameFEN: this.state.resetGameFEN,
          cellColor: {},
          startGame:this.props.playMode === 'offline'?true:false
        });
        this._colorizeBoard();

      }

      async _generateGame(){
        let firestore = firebase.firestore();
        
        firestore.collection("games").add({
            gameFEN :this.state.currentGameFEN,
            turn : this.state.turn,
            w : this.state.uid,
            b : '',
        })
        .then((docRef)=> {
            console.log("Document written with ID: ", docRef.id);
            this.setState({gameID:docRef.id});
            let  gameRef =  firestore.collection("games").doc(docRef.id);
            gameRef.onSnapshot((doc) =>{
            if (doc.exists) {
                console.log("Document data:", doc.data());
                this.setState({
                  currentGameFEN:doc.data().gameFEN,
                  turn : doc.data().turn,
                  w : doc.data().w,
                  b : doc.data().b,
                })
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error)=>{
            console.log("Error getting document:", error);
        });
        })
        this.setState({startGame:true})
       
      }

      _joinGame(){
        firestore = firebase.firestore();
        console.log("game id=> ",this.state.gameID)
        gameRef =  firestore.collection("games").doc(this.state.gameID);
        gameRef.get().then((doc)=>{
          if (doc.exists) {
              if(doc.data().b === ''){
                gameRef.set({
                  b: this.state.uid
                  }, { merge: true });
              }
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
          }
      }).catch(function(error) {
          console.log("Error getting document here:", error);
      });
        
      
        gameRef.onSnapshot((doc) =>{
            if (doc.exists) {
                console.log("Document data:", doc.data());
                this.setState({
                  currentGameFEN:doc.data().gameFEN,
                  startGame:true,
                  turn : doc.data().turn,
                  w : doc.data().w,
                  b : doc.data().b,  
                })
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        });
      }

      _getConfirmButtonText(){
        if(this.state.gameOver) return "GAME OVER" 
        else if (this.props.playMode === 'offline' ||this.state.uid == this.state[this.state.turn]) 
          return "PLAYER " + this.state.turn + " CONFIRM MOVE"
        else return "WAITING..."
      }
      render() {
        return (
            <View style={styles.container}>
            { this.state.startGame ? 
                <View style={styles.container}>
                    <View style={styles.chessBoard}>
                        {this._renderBoard()}
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.button} onPress={() => this._makeMove()}>
                            <Text style={styles.textCenter}>{this._getConfirmButtonText()} </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => this._resetBoard()}>
                            <Text style={styles.textCenter}>RESET</Text>
                        </TouchableOpacity>
                        {this.props.playMode==='online'?<View>
                        <TouchableOpacity onPress={()=>{Clipboard.setString(this.state.gameID)}}>
                          <Text>Tap to copy Game ID : {this.state.gameID}</Text>
                        </TouchableOpacity>
                        <Text>{this.state.uid == this.state[this.state.turn]?"Your turn":"Waiting..."}</Text>
                        </View>:null}
                    </View>
          </View>:<View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={styles.button} onPress={() => this._generateGame()}>
                            <Text style={styles.textCenter}>Generate Game</Text>
                        </TouchableOpacity>
                        <TextInput placeholder="enter game id" style={styles.button} onChangeText={(text)=>{this.setState({gameID:text})}}></TextInput>
                        <TouchableOpacity style={styles.button} onPress={() => this._joinGame()}>
                            <Text style={styles.textCenter}>Join Game</Text>
                        </TouchableOpacity>
                    </View>
        }
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
    row: {
      flexDirection: 'row',
      flex: 1,
    },
    cell: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedCell: {
      backgroundColor: '#ebecee'
    },
    darkCell: {
      flex: 1,
      backgroundColor: '#000'
    },
    chessBoard: {
      width:'95%',
      aspectRatio: 1,
      alignSelf:'center'
    },
    button: {
      alignSelf: 'center',
      margin: 10,
      padding: 10,
      width: '25%',
      backgroundColor: '#ebecee',
      borderRadius: 5,
      textAlign: 'center'
    },
    textCenter: {
      textAlign: 'center'
    }
  
  });
  