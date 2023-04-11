export class Ghost {
  constructor(className, startIndex, speed) {
    this.className = className;
    this.startIndex = startIndex;
    this.speed = speed;
    this.currentIndex = startIndex;
    this.isScared = false;
    this.timerId = NaN;
  }
}

export class Pacman {
  constructor(player, currentIndex) {
    this.player = player;
    this.currentIndex = currentIndex;
  }
}