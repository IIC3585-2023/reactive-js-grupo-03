import { layout, width, createBoard } from "./setup.js"
import { movePacman, pacDotEaten, powerPelletEaten, checkForGameOver, checkForWin, moveGhost } from "./actions.js"
import { Ghost, Pacman } from "./classes.js";

// of, scan, interval, fromEvent, pipe

function pacmanGame() {
  const p1Movements = [65, 87, 68, 83];
  let player1 = new Pacman(1, 490);
  let player2 = new Pacman(2, 489);
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

  squares[player1.currentIndex].classList.add('pac-man');
  squares[player2.currentIndex].classList.add('pac-man');

  const squaresSubject = new rxjs.Subject();
  const keyUpSubject = new rxjs.Subject();
  const currentPlayerSubject = new rxjs.BehaviorSubject(player1);

  const keyUp = rxjs.fromEvent(document, 'keyup')
                  .pipe(rxjs.takeUntil(keyUpSubject))
                  .subscribe((e) => {
                    currentPlayerSubject.next(p1Movements.includes(e.keyCode) ? player1 : player2);
                    movePacman(e, squares, currentPlayerSubject.value, width, score, scoreDisplay, ghosts, keyUpSubject, squaresSubject);
                  });

  const pacDotEatenCurried = (squares, currentPlayer) => pacDotEaten(squares, currentPlayer, score, scoreDisplay);
  const powerPelletEatenCurried = (squares, currentPlayer) => powerPelletEaten(squares, currentPlayer, score, ghosts);
  const checkForGameOverCurried = (squares, currentPlayer) => checkForGameOver(squares, currentPlayer, ghosts, keyUpSubject);
  const checkForWinCurried = (squares) => checkForWin(squares, score, ghosts, keyUpSubject);
  
  squaresSubject.pipe(
    rxjs.mergeMap((newSquares) => rxjs.of(newSquares).pipe(
      rxjs.map(squares => ({
        squares,
        currentPlayer: currentPlayerSubject.value
      }))
    )),
  ).subscribe(({ squares, currentPlayer }) => {
    pacDotEatenCurried(squares, currentPlayer);
    powerPelletEatenCurried(squares, currentPlayer);
    checkForGameOverCurried(squares, currentPlayer);
    checkForWinCurried(squares, currentPlayer);
  });

  // pacmanCurrentIndexSubject.subscribe((newPacmanCurrentIndex) => {
  //   pacmanCurrentIndex = newPacmanCurrentIndex
  // });
  
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