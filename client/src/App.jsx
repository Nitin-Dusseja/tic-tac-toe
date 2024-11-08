import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2'
import './App.css'
import Square from './components/Square'

const renderFrom = [
  [1,2,3],[4,5,6],[7,8,9]
];



function App() {

const [gameState,setGameState] = useState(renderFrom);
const [currentPlayer,setCurrentPlayer] = useState('circle');
const [fineshedState,setFineshedState] = useState(false);
const [fineshedArrayState,setFineshedArrayState] = useState([]);
const [playOnline,setPlayOnline] = useState(false);
const [socket,setSocket] = useState(null);
const [playerName,setPlayerName] = useState('');
const [opponent,setOpponent] = useState(null);
const [playingAs,setPlayingAs] = useState()

const checkWinner = () => {
  // row dynamic
  for (let row = 0; row < gameState.length; row++) {
    if(gameState[row][0] === gameState[row][1] && 
       gameState[row][1]===gameState[row][2]){
      setFineshedArrayState([row * 3 + 0 ,row * 3 + 1, row * 3 + 2]);
      return gameState[row][0];
    }
  }
// col dynaimc
  for (let col = 0; col < gameState.length; col++) {
    if (gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]) {
      setFineshedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
      return gameState[0][col];
    }

  }

  if(gameState[0][0] === gameState[1][1] && 
     gameState[1][1] === gameState[2][2]){
      setFineshedArrayState([0,1+3,2+6]);
    return gameState[0][0];
  }
  if(gameState[0][2] === gameState[1][1] && 
     gameState[1][1] === gameState[2][0]){
      setFineshedArrayState([2,1+3,6]);
    return gameState[0][2];
  }

  const isDrawGame = gameState.flat().every((e)=>{
    if(e === 'circle' || e === 'cross') return true;
  })

  if(isDrawGame) return 'draw';
  
  return null;
}

useEffect(()=>{
  const winner = checkWinner();
  if(winner){
    setFineshedState(winner);
  }
},[gameState]);


socket?.on('playerMoveFromServer',(data)=>{
  const id = data.state.id;
  setGameState((prevState)=>{
    let newState = [...prevState];
    const rowIndex = Math.floor(id/3);
    const colIndex = id % 3;
    newState[rowIndex][colIndex] = data.state.sign;
    return newState;
  })
  setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
})

// pupup enter you name with sweetAlert2
const takePlayerName = async () => {
  const result = await Swal.fire({
    title: "Enter your Name",
    input: "text",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    }
  });
  return result;
}

// click on playOnline button 
async function playOnlineClick(){
  const result = await takePlayerName();
  if(!result.isConfirmed){
    return;
  }

  const username = result.value;
  setPlayerName(username);

  const newSocket = io('http://localhost:3000', {
    autoConnect: true,
  });
  newSocket?.emit('request_to_play',{
    playerName:username
  });

  setSocket(newSocket);
}

socket?.on('connect',()=>{
  setPlayOnline(true);
});

socket?.on('opponentNotFound',()=>{
  setOpponent(false);
})

socket?.on('opponentFound',(data)=>{
  setOpponent(data.opponentName);
  setPlayingAs(data.playingAs)
})

  if(!playOnline){
    return <div className='main-div'>
      <button onClick={playOnlineClick} className='play-online-btn'>Play Online</button></div>
  }


  if(playOnline && !opponent){
    return <div className='main-div'>
      <h1>Waiting for Opponent</h1></div>
  }


  return (
    <>
      <div className='main-div'>
        <div className='center-div'>
          <div className='div-for-names move-detection'><h2 className={`player player-one ${currentPlayer === playingAs ? 'current-move-'+currentPlayer : '' }`}>{playerName}</h2><h2 className={`player player-two ${currentPlayer !== playingAs ? 'current-move-'+currentPlayer : ''}`}>{opponent}</h2></div>
          <div className='game-name'>
            <h1>Tic-Tac-Toe</h1>
            <small>{playingAs}</small>
            </div>
          <div className='squares'>
            {
              gameState.map((arr, rowIndex) =>
                arr.map((e, colIndex) => {
                  return <Square 
                  playingAs={playingAs}
                  gameState={gameState}
                  socket={socket}
                  fineshedArrayState={fineshedArrayState}
                  fineshedState={fineshedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex} 
                  key={rowIndex * 3 + colIndex}
                  currentElement={e}
                  />
                })
              )
            }
          </div>
          { fineshedState && fineshedState !== 'draw' &&
          <h3 className={'fineshed-state'}>{fineshedState} won the game</h3>
          }
          { fineshedState && fineshedState === 'draw' &&
            <h3 className={'fineshed-state'}>Game is draw</h3>
          }
          {!fineshedState && opponent &&
            <h3 className={'fineshed-state'}>you are playing againest {opponent}</h3>
          }
          </div>
      </div>
    </>
  )
}

export default App
