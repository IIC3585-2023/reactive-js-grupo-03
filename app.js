import { layout, width, createBoard } from "./setup.js"
import { movePacman, pacDotEaten, powerPelletEaten, checkForGameOver, checkForWin, moveGhost, keyMap } from "./actions.js"

// of, scan, interval, fromEvent, pipe

function pacmanGame() {
  const p1Movements = [65, 87, 68, 83];
  let player1 = {
    player: 1,
    currentIndex: 489,
  }
  let player2 = {
    player: 2,
    currentIndex: 490,
  }
  let currentPlayer = player1;
  let score = 0;
  let squares = [];
  let ghosts = [
    {
      className: 'blinky',
      startIndex: 345,
      speed: 250,
      currentIndex: 345,
      isScared: false,
      timerId: NaN,
    },
    {
      className: 'pinky',
      startIndex: 376,
      speed: 400,
      currentIndex: 376,
      isScared: false,
      timerId: NaN,
    },
    {
      className: 'inky',
      startIndex: 351,
      speed: 300,
      currentIndex: 351,
      isScared: false,
      timerId: NaN,
    },
    {
      className: 'clyde',
      startIndex: 382,
      speed: 500,
      currentIndex: 382,
      isScared: false,
      timerId: NaN,
    },
  ];

  const scoreDisplay = document.getElementById('score');
  const grid = document.querySelector('.grid');

  createBoard(layout, grid, squares);

  squares[player1.currentIndex].classList.add('pac-man-p1');
  squares[player2.currentIndex].classList.add('pac-man-p2');

  const keyUpSubject = new rxjs.Subject();
  const squaresSubject = new rxjs.Subject();
  const currentPlayerSubject = new rxjs.BehaviorSubject(player1);
  const scoreSubject = new rxjs.BehaviorSubject(score);

  const keyUp = rxjs.fromEvent(document, 'keyup').pipe(
    rxjs.filter((e) => e?.keyCode in keyMap),
    rxjs.takeUntil(keyUpSubject)
  ).subscribe((e) => {
    currentPlayerSubject.next(p1Movements.includes(e.keyCode) ? player1 : player2);
    movePacman(e, squares, currentPlayerSubject.value, squaresSubject);
  });

  const pacDotEatenCurried = (squares, currentPlayer) => pacDotEaten(squares, currentPlayer, scoreSubject, scoreDisplay);
  const powerPelletEatenCurried = (squares, currentPlayer) => powerPelletEaten(squares, currentPlayer, scoreSubject, scoreDisplay, ghosts);
  const checkForGameOverCurried = (squares, currentPlayer) => checkForGameOver(squares, currentPlayer, ghosts, keyUpSubject);
  const checkForWinCurried = (squares) => checkForWin(squares, scoreSubject, ghosts, keyUpSubject);
  
  function runGameFunctions(squares, currentPlayer) {
    pacDotEatenCurried(squares, currentPlayer);
    powerPelletEatenCurried(squares, currentPlayer);
    checkForGameOverCurried(squares, currentPlayer);
    checkForWinCurried(squares);
  }

  squaresSubject.pipe(
    rxjs.map(newSquares => ({ squares: newSquares, currentPlayer: currentPlayerSubject.value })),
  ).subscribe(({ squares, currentPlayer }) => {
    runGameFunctions(squares, currentPlayer);
  });
  
  //draw my ghosts onto the grid
  ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className)
    squares[ghost.currentIndex].classList.add('ghost')
  })

  //move the Ghosts randomly
  ghosts.forEach(ghost => moveGhost(ghost, squares, currentPlayer, ghosts, keyUp, width));
}

const DOMContent = rxjs.fromEvent(document, 'DOMContentLoaded'); 
DOMContent.subscribe(pacmanGame);