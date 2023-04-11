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

export function movePacman(e, squares, player, squaresSubject) {
  const direction = keyMap[e?.keyCode] || 0;
  const newIndex = player.currentIndex + direction;

  if (
    newIndex >= 0 &&
    newIndex < squares.length &&
    !squares[newIndex].classList.contains('wall') &&
    !squares[newIndex].classList.contains('ghost-lair')
  ) {
    squares[player.currentIndex].classList.remove('pac-man');
    player.currentIndex = newIndex;
    squares[player.currentIndex].classList.add('pac-man');
    squaresSubject.next(squares);
  }
}

// what happens when you eat a pac-dot
export function pacDotEaten(squares, player, score, scoreDisplay) {
  if (squares[player.currentIndex].classList.contains('pac-dot')) {
    score++
    scoreDisplay.innerHTML = score
    squares[player.currentIndex].classList.remove('pac-dot')
  }
  return squares;
}

//make the ghosts stop flashing
export function unScareGhosts(ghosts) {
  ghosts.forEach(ghost => ghost.isScared = false)
}

//what happens when you eat a power-pellet

export function powerPelletEaten(squares, player, score, ghosts) {
  if (squares[player.currentIndex].classList.contains('power-pellet')) {
    score +=10
    ghosts.forEach(ghost => ghost.isScared = true)
    setTimeout(() => unScareGhosts(ghosts), 10000)
    squares[player.currentIndex].classList.remove('power-pellet')
  }
  return squares;
}

//check for a game over
export function checkForGameOver(squares, player, ghosts, keyUpSubject) {
  if (squares[player.currentIndex].classList.contains('ghost') &&
    !squares[player.currentIndex].classList.contains('scared-ghost')) {
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    keyUpSubject.next();
    setTimeout(function(){ alert("Game Over"); }, 500);
  }

  return squares
}

//check for a win - more is when this score is reached
export function checkForWin(squares, score, ghosts, keyUpSubject) {
  if (score === 274) {
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    keyUpSubject.next();    
    setTimeout(function(){ alert("You have WON!"); }, 500);
  }

  return squares
}

export function moveGhost(ghost, squares, player, ghosts, keyUp, width) {
  const directions =  [-1, +1, width, -width]
  let direction = directions[Math.floor(Math.random() * directions.length)]

  ghost.timerId = setInterval(function() {
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
    } else direction = directions[Math.floor(Math.random() * directions.length)]

    //if the ghost is currently scared
    if (ghost.isScared) {
      squares[ghost.currentIndex].classList.add('scared-ghost')
    }

    //if the ghost is currently scared and pacman is on it
    if(ghost.isScared && squares[ghost.currentIndex].classList.contains('pac-man')) {
      squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
      ghost.currentIndex = ghost.startIndex
      score +=100
      squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
    }
    checkForGameOver(squares, player, ghosts, keyUp)
  }, ghost.speed)
}