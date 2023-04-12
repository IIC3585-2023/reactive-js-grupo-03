import { layout, width, createBoard } from "./setup.js"
import { movePacman, pacDotEaten, powerPelletEaten, checkForGameOver, checkForWin, moveGhost, keyMap } from "./actions.js"
import { Ghost, Pacman } from "./classes.js";

// of, scan, interval, fromEvent, pipe

function pacmanGame() {
  const p1Movements = [65, 87, 68, 83];
  let player1 = new Pacman(1, 489);
  let player2 = new Pacman(2, 490);
  let currentPlayer = player1;
  let score = 0;
  let squares = [];
  let ghosts = [
    new Ghost('blinky', 348, 250),
    new Ghost('pinky', 376, 400),
    new Ghost('inky', 351, 300),
    new Ghost('clyde', 379, 500),
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