import { width } from "./setup.js"

//move pacman
export const keyMap = {
  65: -1, // a or left arrow
  37: -1, // a or left arrow
  87: -width, // w or up arrow
  38: -width, // w or up arrow
  68: 1, // d or right arrow
  39: 1, // d or right arrow
  83: width, // s or down arrow
  40: width, // s or down arrow
};

export const keyMapPlayer1 = {
  65: -1, // a or left arrow
  87: -width, // w or up arrow
  68: 1, // d or right arrow
  83: width, // s or down arrow
};

export const keyMapPlayer2 = {
  37: -1, // a or left arrow
  38: -width, // w or up arrow
  39: 1, // d or right arrow
  40: width, // s or down arrow
};

export function handlePlayerMovement(prevIndex, key, squares) {
  const direction = keyMap[key?.keyCode] || 0;
  const newIndex = prevIndex + direction;
  const player = key?.keyCode in keyMapPlayer1 ? 1 : 2;
  if (
    newIndex >= 0 &&
    newIndex < squares.length &&
    !squares[newIndex].classList.contains('wall') &&
    !squares[newIndex].classList.contains('ghost-lair')
  ) {
    squares[prevIndex].classList.remove(`pac-man-p${player}`);
    squares[newIndex].classList.add(`pac-man-p${player}`);
    return newIndex;
  }
  squares[prevIndex].classList.add(`pac-man-p${player}`);
  return prevIndex;
}

export function showScore(score) {
  const scoreDisplay = document.getElementById('score');
  scoreDisplay.innerHTML = score;
}


//make the ghosts stop flashing
export function unScareGhosts(ghosts) {
  ghosts.forEach(ghost => ghost.isScared = false)
}

//check for a win - more is when this score is reached
export function checkForWin(score, ghosts) {
  if (score.value === 274) {
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    setTimeout(function(){ alert("You have WON!"); }, 500);
  }
}

export function moveGhost(ghost, squares) {
  let direction = getRandomDirection();

  ghost.timerId = rxjs.interval(ghost.speed).subscribe(() =>  {
    direction = showGhost(ghost, squares, direction);
  })
}

function showGhost(ghost, squares, direction) {
  //if the next squre your ghost is going to go to does not have a ghost and does not have a wall
  if  (!squares[ghost.currentIndex + direction].classList.contains('ghost') &&
    !squares[ghost.currentIndex + direction].classList.contains('wall') ) {
    //remove the ghosts classes
    squares[ghost.currentIndex].classList.remove(ghost.className)
    squares[ghost.currentIndex].classList.remove('ghost', 'scared-ghost')
    //move into that space
    ghost.currentIndex += direction
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
    //else find a new random direction ot go in
  } else direction = getRandomDirection();

  //if the ghost is currently scared
  if (ghost.isScared) {
    squares[ghost.currentIndex].classList.add('scared-ghost')
  }

  //if the ghost is currently scared and pacman is on it
  if(ghost.isScared && squares[ghost.currentIndex].classList.contains('pac-man')) {
    squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
    ghost.currentIndex = ghost.startIndex
    squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
  }

  return direction;
}

function getRandomDirection() {
  const directions =  [-1, +1, width, -width];
  return directions[Math.floor(Math.random() * directions.length)];
}