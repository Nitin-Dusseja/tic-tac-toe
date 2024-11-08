import React, { useState } from 'react'
import './Square.css'


const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);



function Square({
  gameState,
  playingAs,
  currentElement,
  socket,
  fineshedArrayState,
  id,
  setGameState,
  currentPlayer,
  setCurrentPlayer,
  fineshedState}) {

const [icon,setIcon] = useState(null);

const clickOnSquare = () => {
  if(playingAs !== currentPlayer){
    return;
  }
  if(fineshedState){
    return;
  }



  if(!icon){
    if(currentPlayer === 'circle'){
      setIcon(circleSvg);
    }else{
      setIcon(crossSvg);
    }

    const playerCurrentNow = currentPlayer;
    
    socket.emit('playerMoveFromClient',{
      state:{
        id,
        sign: playerCurrentNow
      }
    })
    setCurrentPlayer(currentPlayer==='circle' ? 'cross' : 'circle');

    setGameState(prevState =>{
      let newState = [...prevState];
      const rowIndex = Math.floor(id/3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = playerCurrentNow;
      return newState;
    })
  }
}

  return (
    <div onClick={clickOnSquare} className={`single-square ${fineshedState ? 'not-allowed' : ''}
    ${currentPlayer !== playingAs ? "not-allowed" : ""}
    ${fineshedArrayState.includes(id) ? fineshedState + '-won' : ''}`}>
      {currentElement === "circle" ? circleSvg : currentElement === "cross" ? crossSvg : icon}</div>
  )
}

export default Square