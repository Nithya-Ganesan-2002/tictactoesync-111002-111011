import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Theme and color variables, can be moved to CSS vars if desired
const COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#ff9800'
};
const PLAYER = { X: 'X', O: 'O' };

// PUBLIC_INTERFACE
function App() {
  // Theme toggle state
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Board and Game State
  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.X);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('');
  const [isDraw, setIsDraw] = useState(false);
  const [isRealtime, setIsRealtime] = useState(true); // Placeholder for backend WS/REST
  const ws = useRef(null);

  // For demo, simulate two-player session (could expand to WebSocket)
  // If integrating backend, replace move logic with server sync.
  function calculateWinner(squares) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (const [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (winner || board[idx] || isDraw) return;

    // Simulate real-time play (to replace with WS event)
    const newBoard = board.slice();
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      setStatus(`Player ${win} wins!`);
    } else if (newBoard.every(square => square !== null)) {
      setIsDraw(true);
      setStatus("It's a draw! 🤝");
    } else {
      // Automatic turn switching
      const next = currentPlayer === PLAYER.X ? PLAYER.O : PLAYER.X;
      setCurrentPlayer(next);
      setStatus(`Player ${next}'s turn`);
    }
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(emptyBoard);
    setCurrentPlayer(PLAYER.X);
    setWinner(null);
    setIsDraw(false);
    setStatus("Player X's turn");
  }

  // Update status text at beginning and after each move
  useEffect(() => {
    if (winner) setStatus(`Player ${winner} wins!`);
    else if (isDraw) setStatus("It's a draw! 🤝");
    else setStatus(`Player ${currentPlayer}'s turn`);
  }, [currentPlayer, winner, isDraw]);

  // Dummy effect for websocket simulation
  // To use actual WS, connect here and update board from backend, broadcasting moves
  useEffect(() => {
    // ws.current = new WebSocket('ws://backend-service');
    // ws.current.onmessage = (event) => { ... }
    return () => {
      // if (ws.current) ws.current.close();
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{position:'absolute',top:20,right:20,zIndex:10}}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <div className="tictactoe-container">
        <h1 className="title" style={{color:COLORS.primary, marginBottom:8}}>Tic Tac Toe</h1>
        <div className="status" style={{
            marginBottom:'1.5rem', 
            fontSize:'1.25rem',
            fontWeight:600,
            color:winner ? COLORS.accent : COLORS.secondary
        }}>
          {status}
        </div>
        <GameBoard 
          board={board}
          onCellClick={handleMove}
          winner={winner}
          currentPlayer={currentPlayer}
          disabled={Boolean(winner) || isDraw}
        />
        <div style={{
          marginTop:'1.75rem',
          display:'flex',
          justifyContent:'center',
          gap:'1.25rem',
          flexWrap:'wrap'
        }}>
          <button 
            className="tictactoe-btn"
            style={{
              background:COLORS.primary,
              color:'#fff',
              border:'none',
              borderRadius:8,
              fontWeight:600,
              fontSize:'1rem',
              padding:'0.75em 1.75em',
              boxShadow:'0 4px 18px -6px #1976d230',
              cursor:'pointer'
            }}
            onClick={handleReset}
          >
            Reset Game
          </button>
        </div>
        <div style={{marginTop:16, fontSize:'0.95rem', color: COLORS.secondary, opacity:0.87}}>Current player: <span style={{color: COLORS.accent, fontWeight:500}}>{currentPlayer}</span></div>
      </div>
      </header>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameBoard({ board, onCellClick, winner, currentPlayer, disabled }) {
  // Responsive board layout
  return (
    <div 
      className="tictactoe-board"
      style={{
        display:'grid',
        gridTemplateColumns:'repeat(3, 70px)',
        gridTemplateRows:'repeat(3, 70px)',
        gap:'8px',
        justifyContent:'center',
        alignItems:'center',
        margin:'0 auto',
        background: '#fff0', 
        borderRadius: '18px',
        boxShadow: '0 2px 18px -6px #42424224, 0px 1px 0px #e9ecef'
      }}>
      {board.map((cell, idx) => (
        <BoardCell 
          key={idx}
          value={cell}
          onClick={() => onCellClick(idx)}
          disabled={Boolean(cell) || disabled || winner}
          highlight={winner && cell === winner}
          isWinningCell={false} // To be extended
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function BoardCell({ value, onClick, disabled, highlight, isWinningCell }) {
  return (
    <button
      className="tictactoe-cell"
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell: ${value}` : `Empty cell`}
      style={{
        // Modern style: big, elevated, responsive
        width:'100%', height:'100%',
        aspectRatio:'1',
        fontSize:'2.3rem',
        fontWeight:700,
        color: value === PLAYER.X ? COLORS.primary : value === PLAYER.O ? COLORS.accent : COLORS.secondary,
        background:disabled && value ? '#f7fafd' : '#fff',
        border:`2.5px solid ${COLORS.secondary}22`,
        borderRadius:12,
        boxShadow: value ? '0 2px 8px -4px #42424233, 0 2px 1px #00000010' : '',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        cursor:disabled ? 'not-allowed' : 'pointer',
        transition:'all 0.17s cubic-bezier(.4,2,.6,.99)'
      }}
    >
      {value}
    </button>
  );
}

export default App;
