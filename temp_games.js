// 🎮 COMPONENTES DE JUEGOS FUNCIONALES
import React, { useState, useEffect, useCallback } from 'react';

// 🧠 SUDOKU COMPONENT
export const SudokuGame = ({ level = 1, onComplete, onClose }) => {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState(0);

  // Initialize board based on level
  useEffect(() => {
    generateSudoku();
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [level]);

  const generateSudoku = () => {
    // Generate a simple 4x4 Sudoku based on level
    const fullBoard = [
      [1, 2, 3, 4],
      [3, 4, 1, 2], 
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];

    // Remove cells based on difficulty
    const cellsToRemove = level === 1 ? 6 : level === 2 ? 8 : 10;
    const newBoard = fullBoard.map(row => [...row]);
    
    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * 4);
      const col = Math.floor(Math.random() * 4);
      newBoard[row][col] = 0;
    }

    setBoard(newBoard);
    setSolution(fullBoard);
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] === 0) {
      setSelectedCell(`${row}-${col}`);
    }
  };

  const handleNumberClick = (num) => {
    if (selectedCell) {
      const [row, col] = selectedCell.split('-').map(Number);
      const newBoard = [...board];
      newBoard[row][col] = num;
      
      // Check if number is correct
      if (solution[row][col] !== num) {
        setErrors(prev => prev + 1);
        setTimeout(() => {
          newBoard[row][col] = 0;
          setBoard(newBoard);
        }, 500);
      } else {
        setBoard(newBoard);
        setSelectedCell(null);
        
        // Check if game is complete
        if (newBoard.every((row, r) => 
          row.every((cell, c) => cell === solution[r][c])
        )) {
          setIsComplete(true);
          const score = Math.max(1000 - (timeElapsed * 10) - (errors * 50), 100);
          const stars = timeElapsed < 60 && errors < 3 ? 3 : timeElapsed < 120 ? 2 : 1;
          setTimeout(() => onComplete(score, stars), 500);
        }
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🧠 KumIA Sudoku</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
      </div>
      
      <div className="flex justify-between mb-4 text-sm">
        <div>Nivel: {level === 1 ? 'Fácil' : level === 2 ? 'Medio' : 'Difícil'}</div>
        <div>Tiempo: {formatTime(timeElapsed)}</div>
        <div>Errores: {errors}</div>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-4 bg-gray-800 p-2 rounded">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`h-12 w-12 border-2 rounded font-bold text-lg transition-all ${
                selectedCell === `${r}-${c}` 
                  ? 'bg-blue-200 border-blue-500' 
                  : cell === 0 
                    ? 'bg-white border-gray-300 hover:bg-gray-50' 
                    : 'bg-gray-100 border-gray-400'
              } ${isComplete ? 'bg-green-100' : ''}`}
            >
              {cell || ''}
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="h-10 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
          >
            {num}
          </button>
        ))}
      </div>

      {isComplete && (
        <div className="mt-4 text-center text-green-600 font-bold">
          🎉 ¡Completado! ¡Excelente trabajo!
        </div>
      )}
    </div>
  );
};

// 🕹️ PAC-MAN COMPONENT
export const PacManGame = ({ level = 1, onComplete, onClose }) => {
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pacmanPos, setPacmanPos] = useState({ x: 1, y: 1 });
  const [dots, setDots] = useState([]);
  const [powerDots, setPowerDots] = useState([]);
  
  // Simple maze layout
  const maze = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ];

  useEffect(() => {
    initializeGame();
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    const gameTimer = setInterval(() => {
      if (gameState === 'playing') {
        updateGame();
      }
    }, 200);

    return () => {
      clearInterval(timer);
      clearInterval(gameTimer);
    };
  }, [level]);

  const initializeGame = () => {
    // Initialize dots based on level
    const newDots = [];
    const newPowerDots = [];
    
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === 0 && !(r === 1 && c === 1)) {
          newDots.push({ x: c, y: r });
        }
      }
    }
    
    // Add power dots based on level
    const powerDotCount = level === 1 ? 1 : level === 2 ? 2 : 3;
    for (let i = 0; i < powerDotCount; i++) {
      if (newDots.length > 0) {
        const randomIndex = Math.floor(Math.random() * newDots.length);
        newPowerDots.push(newDots[randomIndex]);
        newDots.splice(randomIndex, 1);
      }
    }
    
    setDots(newDots);
    setPowerDots(newPowerDots);
  };

  const updateGame = () => {
    // Check if all dots collected
    if (dots.length === 0 && powerDots.length === 0) {
      setGameState('completed');
      const finalScore = score + (lives * 100) + Math.max(300 - timeElapsed, 0);
      const stars = finalScore > 500 ? 3 : finalScore > 300 ? 2 : 1;
      setTimeout(() => onComplete(finalScore, stars), 500);
    }
  };

  const movePacman = (direction) => {
    if (gameState !== 'playing') return;
    
    let newX = pacmanPos.x;
    let newY = pacmanPos.y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // Check boundaries and walls
    if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length && maze[newY][newX] === 0) {
      setPacmanPos({ x: newX, y: newY });
      
      // Check for dot collection
      const dotIndex = dots.findIndex(dot => dot.x === newX && dot.y === newY);
      if (dotIndex !== -1) {
        setScore(prev => prev + 10);
        setDots(prev => prev.filter((_, i) => i !== dotIndex));
      }
      
      // Check for power dot collection
      const powerDotIndex = powerDots.findIndex(dot => dot.x === newX && dot.y === newY);
      if (powerDotIndex !== -1) {
        setScore(prev => prev + 50);
        setPowerDots(prev => prev.filter((_, i) => i !== powerDotIndex));
      }
    }
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowUp': movePacman('up'); break;
      case 'ArrowDown': movePacman('down'); break;
      case 'ArrowLeft': movePacman('left'); break;
      case 'ArrowRight': movePacman('right'); break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pacmanPos, gameState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">🕹️ Pac-KumIA</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
      </div>
      
      <div className="flex justify-between mb-4 text-sm">
        <div>Nivel: {level === 1 ? 'Novato' : level === 2 ? 'Pro' : 'Master'}</div>
        <div>Puntos: {score}</div>
        <div>Vidas: {lives}</div>
        <div>Tiempo: {formatTime(timeElapsed)}</div>
      </div>

      <div className="mb-4 p-4 bg-black rounded grid grid-cols-10 gap-1" style={{ aspectRatio: '2/1' }}>
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const isPacman = pacmanPos.x === c && pacmanPos.y === r;
            const isDot = dots.some(dot => dot.x === c && dot.y === r);
            const isPowerDot = powerDots.some(dot => dot.x === c && dot.y === r);
            
            return (
              <div
                key={`${r}-${c}`}
                className={`aspect-square rounded ${
                  cell === 1 
                    ? 'bg-blue-600' 
                    : isPacman 
                      ? 'bg-yellow-400 flex items-center justify-center text-xs' 
                      : isDot 
                        ? 'bg-black flex items-center justify-center' 
                        : isPowerDot
                          ? 'bg-black flex items-center justify-center'
                          : 'bg-black'
                }`}
              >
                {isPacman && '🎮'}
                {isDot && <div className="w-1 h-1 bg-white rounded-full"></div>}
                {isPowerDot && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
        <div></div>
        <button onClick={() => movePacman('up')} className="bg-blue-500 text-white p-2 rounded">↑</button>
        <div></div>
        <button onClick={() => movePacman('left')} className="bg-blue-500 text-white p-2 rounded">←</button>
        <div className="flex items-center justify-center text-xs">Usa<br/>flechas</div>
        <button onClick={() => movePacman('right')} className="bg-blue-500 text-white p-2 rounded">→</button>
        <div></div>
        <button onClick={() => movePacman('down')} className="bg-blue-500 text-white p-2 rounded">↓</button>
        <div></div>
      </div>

      {gameState === 'completed' && (
        <div className="mt-4 text-center text-green-600 font-bold">
          🎉 ¡Nivel completado! ¡Excelente!
        </div>
      )}
    </div>
  );
};

// 📝 CROSSWORD COMPONENT
export const CrosswordGame = ({ level = 1, onComplete, onClose }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Crossword data based on level
  const crosswordData = {
    1: {
      title: "Restaurante Básico",
      words: [
        { id: 1, clue: "Lugar donde se cocina", answer: "COCINA", position: { row: 0, col: 0, direction: 'horizontal' }},
        { id: 2, clue: "Persona que atiende", answer: "GARZON", position: { row: 2, col: 0, direction: 'horizontal' }},
        { id: 3, clue: "Lista de comidas", answer: "MENU", position: { row: 0, col: 0, direction: 'vertical' }}
      ]
    },
    2: {
      title: "Gastronomía Intermedio", 
      words: [
        { id: 1, clue: "Técnica de cocción lenta", answer: "BRASEAR", position: { row: 0, col: 0, direction: 'horizontal' }},
        { id: 2, clue: "Chef principal", answer: "JEFE", position: { row: 2, col: 2, direction: 'horizontal' }},
        { id: 3, clue: "Condimento básico", answer: "SAL", position: { row: 0, col: 2, direction: 'vertical' }}
      ]
    },
    3: {
      title: "Culinaria Avanzado",
      words: [
        { id: 1, clue: "Técnica francesa de cocción", answer: "CONFITAR", position: { row: 0, col: 0, direction: 'horizontal' }},
        { id: 2, clue: "Corte de verduras en dados", answer: "BRUNOISE", position: { row: 2, col: 0, direction: 'horizontal' }},
        { id: 3, clue: "Emulsión de yema y aceite", answer: "MAYONESA", position: { row: 4, col: 0, direction: 'horizontal' }}
      ]
    },
    4: {
      title: "Técnicas Profesionales",
      words: [
        { id: 1, clue: "Cocción al vacío", answer: "SOUSVIDE", position: { row: 0, col: 0, direction: 'horizontal' }},
        { id: 2, clue: "Gelificante natural", answer: "AGAR", position: { row: 2, col: 1, direction: 'horizontal' }},
        { id: 3, clue: "Fermentación controlada", answer: "KOJI", position: { row: 0, col: 2, direction: 'vertical' }}
      ]
    },
    5: {
      title: "Gastronomía Molecular",
      words: [
        { id: 1, clue: "Técnica de esferificación", answer: "ALGINATO", position: { row: 0, col: 0, direction: 'horizontal' }},
        { id: 2, clue: "Nitrógeno para texturas", answer: "LIQUIDO", position: { row: 2, col: 0, direction: 'horizontal' }},
        { id: 3, clue: "Gelificante termorreversible", answer: "GELATINA", position: { row: 4, col: 0, direction: 'horizontal' }}
      ]
    }
  };

  const currentCrossword = crosswordData[level] || crosswordData[1];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (wordId, value) => {
    setAnswers(prev => ({
      ...prev,
      [wordId]: value.toUpperCase()
    }));
    
    // Check if all words are completed correctly
    const allCorrect = currentCrossword.words.every(word => 
      answers[word.id] === word.answer || value.toUpperCase() === word.answer
    );
    
    if (allCorrect) {
      setIsComplete(true);
      const finalScore = Math.max(1000 - (timeElapsed * 5), 200) + (level * 100);
      const stars = timeElapsed < 180 ? 3 : timeElapsed < 300 ? 2 : 1;
      setScore(finalScore);
      setTimeout(() => onComplete(finalScore, stars), 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">📝 KumIA Crucigrama</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
      </div>
      
      <div className="flex justify-between mb-4 text-sm">
        <div>Nivel {level}: {currentCrossword.title}</div>
        <div>Tiempo: {formatTime(timeElapsed)}</div>
        {isComplete && <div className="text-green-600 font-bold">Puntos: {score}</div>}
      </div>

      <div className="grid gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold mb-3">Pistas:</h4>
          <div className="space-y-2">
            {currentCrossword.words.map((word, index) => (
              <div key={word.id} className="flex items-center space-x-2">
                <span className="font-medium text-blue-600">{index + 1}.</span>
                <span className="flex-1 text-sm">{word.clue}</span>
                <span className="text-xs text-gray-500">({word.answer.length} letras)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {currentCrossword.words.map((word, index) => (
            <div key={word.id} className="flex items-center space-x-2">
              <span className="font-bold text-blue-600 w-6">{index + 1}.</span>
              <input
                type="text"
                value={answers[word.id] || ''}
                onChange={(e) => handleAnswerChange(word.id, e.target.value)}
                className={`flex-1 px-3 py-2 border-2 rounded-lg uppercase font-mono tracking-wider ${
                  answers[word.id] === word.answer 
                    ? 'border-green-500 bg-green-50' 
                    : answers[word.id] && answers[word.id] !== word.answer.substring(0, answers[word.id].length)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                }`}
                placeholder={`${word.answer.length} letras`}
                maxLength={word.answer.length}
              />
              {answers[word.id] === word.answer && (
                <span className="text-green-600 font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isComplete && (
        <div className="mt-4 text-center text-green-600 font-bold text-lg">
          🎉 ¡Crucigrama completado! ¡Excelente conocimiento culinario!
        </div>
      )}
    </div>
  );
};