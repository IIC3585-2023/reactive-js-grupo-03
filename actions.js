//move pacman
export function movePacman(e, squares, player, width, score, scoreDisplay, ghosts, keyUpSubject, squaresSubject) {

  squares[player.currentIndex].classList.remove('pac-man')
  switch(e?.keyCode) {
    case 65:
    case 37:
      if(
        player.currentIndex % width !== 0 &&
        !squares[player.currentIndex -1].classList.contains('wall') &&
        !squares[player.currentIndex -1].classList.contains('ghost-lair')
      )
      player.currentIndex -= 1;
      if (squares[player.currentIndex - 1] === squares[363]) {
        player.currentIndex = 391;
      }
      break;
    case 87:
    case 38:
      if(
        player.currentIndex - width >= 0 &&
        !squares[player.currentIndex -width].classList.contains('wall') &&
        !squares[player.currentIndex -width].classList.contains('ghost-lair')
        ) 
        player.currentIndex -= width;
      break;
    case 68:
    case 39:
      if(
        player.currentIndex % width < width - 1 &&
        !squares[player.currentIndex +1].classList.contains('wall') &&
        !squares[player.currentIndex +1].classList.contains('ghost-lair')
      )
      player.currentIndex += 1;
      if (squares[player.currentIndex + 1] === squares[392]) {
        player.currentIndex = 364;
      }
      break;
    case 83:
    case 40:
      if (
        player.currentIndex + width < width * width &&
        !squares[player.currentIndex + width].classList.contains('wall') &&
        !squares[player.currentIndex + width].classList.contains('ghost-lair')
      )
      player.currentIndex += width;
      break;
  }
  squares[player.currentIndex].classList.add('pac-man')
  // pacDotEaten(squares, pacmanCurrentIndex, score, scoreDisplay);
  // powerPelletEaten(squares, pacmanCurrentIndex, score, ghosts);
  // checkForGameOver(squares, pacmanCurrentIndex, ghosts, keyUpSubject);
  // checkForWin(score, ghosts, keyUpSubject);
  squaresSubject.next(squares);
  // pacmanCurrentIndexSubject.next(player.currentIndex);
}

// document.addEventListener('keyup', movePacman)

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
  // TODO: AIUDA
  console.log('🥵🍆💦 ~ file: actions.js:88 ~ checkForGameOver ~ player:', player)
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
  console.log('🥵🍆💦 ~ file: actions.js:110 ~ moveGhost ~ player:', player)
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
  checkForGameOver(squares, player.currentIndex, ghosts, keyUp)
  }, ghost.speed)
}