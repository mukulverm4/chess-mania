import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Button } from 'react-native';
import Chess from 'chess.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ROWS = 8;
const ALPHABETS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const color1Palette = ['#ff65b7', '#ff93ce', '#ffc4e2', '#ffe6f3'];
const color2Palette = ['#6afdff', '#97feff', '#c8feff', '#e7feff'];
const piecePoints = {
  'q': 8,
  'r': 5,
  'b': 3,
  'n': 3,
  'p': 1,
  'k': 0
}
const BOARD_KEYS = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];

export default class App extends React.Component {
  constructor() {
    super();
    let chess = Chess.Chess;
    let chessMania = new chess();
    let currentGameFEN = chessMania.fen();

    this.state = {
      currentGameFEN: currentGameFEN,
      from: '',
      to: '',
      gameOver: false,
      turn: chessMania.turn(),
      cellColor: {},
    }

  }

  _getFenArray() {

    let fen = this.state.currentGameFEN;
    let fenArray = (fen.split(" ")[0]).split("/");
    let fenRowArray = [];

    for (let i = 0; i < fenArray.length; i++) {
      let tempArray = fenArray[i].split("");
      if (tempArray.length === ROWS)
        fenRowArray[i] = tempArray;
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
        fenRowArray[i] = tempRow;
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
    // else {
    //   console.log('cell previous weigths', JSON.stringify(cell))
    // }
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

  _colorizeBoard() {
    let chess = Chess.Chess;
    let chessMania = new chess(this.state.currentGameFEN);
    let cellColor = this.state.cellColor;
    for (let i = 0; i < BOARD_KEYS.length; i++) {
      let currentCell = BOARD_KEYS[i];
      let piece = chessMania.get(currentCell);

      if (piece != null) {

        if (piece.type === 'r') {
          cellColor = this._colorizeRook(currentCell, cellColor, chessMania, piece);
        }

        if (piece.type === 'n') {
          let possibleMoves = this._getKnightMoves(piece, currentCell);
          for (let i = 0; i < possibleMoves.length; i++) {
            cellColor[possibleMoves[i].substring(1, 3)] = this._setCellPoints(piece, cellColor[possibleMoves[i]]);
          }
        }

        if (piece.type === 'b') {
          cellColor = this._colorizeBishop(currentCell, cellColor, chessMania, piece);
        }

        if (piece.type === 'q') {
          cellColor = this._colorizeBishop(currentCell, cellColor, chessMania, piece);
          cellColor = this._colorizeRook(currentCell, cellColor, chessMania, piece);

        }
        if (piece.type === 'p') {
          cellColor = this._colorizePawn(currentCell, cellColor, chessMania, piece, chess);
        }
      }
    }

    console.log('##### ', JSON.stringify(this.state.cellColor));

  }

  _colorizePawn(currentCell, cellColor, chessMania, piece, chess) {
    let possibleMoves = [];
   // console.log('piece coloe => ', piece.color)
    if (piece.color !== chessMania.turn()) {
      if (piece.color === 'w') {
        let tempChess = new chess(this.state.currentGameFEN.replace('b', 'w'));
        possibleMoves = tempChess.moves({ square: currentCell });
       // console.log('poss move => ', possibleMoves);
      } else {
        let tempChess = new chess(this.state.currentGameFEN.replace('w', 'b'));
        possibleMoves = tempChess.moves({ square: currentCell });
      }
    } else {
      possibleMoves = chessMania.moves({ square: currentCell })
    }
    for (let i = 0; i < possibleMoves.length; i++) {
      cellColor[possibleMoves[i]] = this._setCellPoints(piece, cellColor[possibleMoves[i]]);
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
    console.log(row, up);
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
    while (left > 0) {
      let newKey = ALPHABETS[left] + column;
      if (chessMania.get(newKey) != null &&
        chessMania.get(newKey).color === piece.color &&
        chessMania.get(newKey).type === 'k') break;
      cellColor[newKey] = this._setCellPoints(piece, cellColor[newKey]);
      if (chessMania.get(newKey) != null) break;
      else left--;
    }
    while (right < 9) {
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

    console.log(up, down, left, right)

    while (up < 9 && right < 9) {
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
    while (up < 9 && left > 0) {
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
    while (down > 0 && left > 0) {
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
    while (down > 0 && right < 9) {
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
    //console.log("turn => ", tempChess.turn());
    if (piece.color === 'b') {
      //console.log("fen =>", tempChess.fen().replace('w', 'b'));
      tempChess = new chess(tempChess.fen().replace('w', 'b'));
    }
    //console.log("turn => ", tempChess.turn());

    return tempChess.moves({ square: key })

  }

  _getCellBackgrounColor(cellColor) {
    let style = {}
    if (cellColor.primaryColorWeight > cellColor.secondaryColorWeight) {
      style.backgroundColor = '#ff509a';
    } else {
      style.backgroundColor = '#50f5ff';
    }
    return style;
  }

  _renderBoard() {

    const rows = [];

    let fenRowArray = this._getFenArray();
    const keys = [];
    this._colorizeBoard();


    for (let i = 0; i < ROWS; i++) {
      const cells = [];

      for (let j = 0; j < ROWS; j++) {
        key = ALPHABETS[j] + (i + 1);
        keys.push(key);
        cells.push(
          <TouchableOpacity
            onPress={() => this._onTouch(ALPHABETS[j] + (i + 1))}
            key={ALPHABETS[j] + (i + 1)}
            style={[this.state.from === ALPHABETS[j] + (i + 1) ||
              this.state.to === ALPHABETS[j] + (i + 1) ?
              styles.selectedCell : null, styles.cell,
            this.state.cellColor[ALPHABETS[j] + (i + 1)] != null ?
              this._getCellBackgrounColor(this.state.cellColor[ALPHABETS[j] + (i + 1)])
              : null]}>
            {fenRowArray[ROWS - 1 - i][j] === "o" || fenRowArray[ROWS - 1 - i][j] == "1" ? null : <Icon name={this._getPiece(fenRowArray[ROWS - 1 - i][j])} size={32}
              color={fenRowArray[ROWS - 1 - i][j] == (fenRowArray[ROWS - 1 - i][j]).toLowerCase() ? "#000" : "#BCBCBC"} />}
          </TouchableOpacity>)
      }
      rows.push(<View key={i} style={[styles.row]}>{cells}</View>)
    }


    //console.log(keys);
    return (
      rows
    )
  }

  _onTouch(key) {

    if (!this.state.gameOver) {
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

      console.log(key)
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
    //throw new Error('Piece not found!');console.log("##########=> ", key)
  }

  _makeMove() {
    if (this.state.from !== '' && this.state.to !== '') {
      console.log(" made move => ", this.state.from, " to ", this.state.to);
      let chess = Chess.Chess;
      let chessMania = new chess(this.state.currentGameFEN);
      let thisMove = { from: this.state.from, to: this.state.to };
      // console.log(thisMove)
      let move = chessMania.move(thisMove);
      console.log("move => ", move)

      let currGame = chessMania.fen();
      console.log(currGame);
      let gameOver = chessMania.game_over();
      this.setState({
        from: '',
        to: '',
        currentGameFEN: currGame,
        gameOver: gameOver,
        turn: chessMania.turn(),
        cellColor: {}
      })


    }

  }

  _resetBoard() {
    let chess = Chess.Chess;
    let chessMania = new chess();
    this.setState({
      currentGameFEN: chessMania.fen(),
      cellColor: {}
    })
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.chessBoard}>
          {this._renderBoard()}
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={styles.button} onPress={() => this._makeMove()}>
            <Text style={styles.textCenter}>{this.state.gameOver ? "GAME OVER" : "PLAYER " + this.state.turn + " CONFIRM MOVE"} </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this._resetBoard()}>
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
    aspectRatio: 1
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
