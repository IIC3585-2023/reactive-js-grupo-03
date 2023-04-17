import { layout, createBoard } from "./setup.js"
import { unScareGhosts, checkForWin, moveGhost, keyMapPlayer1, keyMapPlayer2, handlePlayerMovement, showScore } from "./actions.js"

const PLAYER_1_STARTING_POSITION = 489;
const PLAYER_2_STARTING_POSITION = 490;
const grid = document.querySelector('.grid');

let squares = createBoard(layout, grid, []);
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

const ScoreBehavior$ = new rxjs.BehaviorSubject(0);
const IsAlive$ = new rxjs.BehaviorSubject(true)
const Ghosts$ = new rxjs.Subject(ghosts);

const handlePlayerMovementCurried = (prevIndex, key) => handlePlayerMovement(prevIndex, key, squares);

const Player1Movement$ = rxjs.fromEvent(document, 'keydown').pipe(
  rxjs.filter((e) => e?.keyCode in keyMapPlayer1),
  rxjs.scan(handlePlayerMovementCurried, PLAYER_1_STARTING_POSITION),
  rxjs.startWith(PLAYER_1_STARTING_POSITION),
)

const Player2Movement$ = rxjs.fromEvent(document, 'keydown').pipe(
  rxjs.filter((e) => e?.keyCode in keyMapPlayer2),
  rxjs.scan(handlePlayerMovementCurried, PLAYER_2_STARTING_POSITION),
  rxjs.startWith(PLAYER_2_STARTING_POSITION),
)

const Game$ = rxjs.combineLatest(
  ScoreBehavior$, Player1Movement$, Player2Movement$, Ghosts$,
  (score, player1, player2, ghosts) => ({ score, player1, player2, ghosts })
  ).pipe(
    rxjs.sample(rxjs.interval(10)),
    rxjs.takeWhile(() => IsAlive$.getValue())
  )

const DOMContent = rxjs.fromEvent(document, 'DOMContentLoaded').pipe(
  rxjs.tap(_ => {
    ghosts.forEach(ghost => moveGhost(ghost, squares));
  })
);

DOMContent.subscribe(() => {
  initialPositions();
  startGame();
  ScoreBehavior$.next(0);
  Ghosts$.next(ghosts);
});

function startGame() {
  Game$.subscribe(renderGameScene);
}

function renderGameScene({ score, player1, player2, ghosts }) {
  showScore(score);
  eatPacDot(player1);
  eatPacDot(player2);
  checkForGameOver(player1, ghosts);
  checkForGameOver(player2, ghosts);
  checkForWin(score, ghosts);
}

function eatPacDot(newIndex) {
  if (squares[newIndex].classList.contains('pac-dot')) {
    ScoreBehavior$.next((ScoreBehavior$.value || 0) + 1);
    squares[newIndex].classList.remove('pac-dot')
  } else if (squares[newIndex].classList.contains('power-pellet')) {
    ScoreBehavior$.next(ScoreBehavior$.value + 10);
    ghosts.forEach(ghost => ghost.isScared = true)
    setTimeout(() => unScareGhosts(ghosts), 10000)
    squares[newIndex].classList.remove('power-pellet')
  }
}

function checkForGameOver(newIndex, ghosts) {
  if (squares[newIndex].classList.contains('ghost') &&
    !squares[newIndex].classList.contains('scared-ghost')) {
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    setTimeout(function(){ alert("Game Over"); }, 500);
    IsAlive$.next(false);
  }
}

function initialPositions() {
  squares[PLAYER_1_STARTING_POSITION].classList.add(`pac-man-p1`);
  squares[PLAYER_2_STARTING_POSITION].classList.add(`pac-man-p2`);
}