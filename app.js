class UI {
  constructor() {
    this.bombRange = document.getElementById('bombRangeContainer');
    this.rowRange = document.getElementById('rowRangeContainer');
    this.columnRange = document.getElementById('columnRangeContainer');
    this.winContent = document.getElementById('winContent');
    this.bestTimeDisplay = document.getElementById('bestTime');
    this.reset = document.getElementById('reset');
    this.custom = document.getElementById('custom');
    this.easy = document.getElementById('easy');
    this.normal = document.getElementById('normal');
    this.difficult = document.getElementById('difficult');
    this.grid = document.getElementById('grid');
    this.navbar = document.getElementById('navbar');
    this.fontSize = 0;
    this.bombsLeft = 4;
    this.rows = 9;
    this.columns = 9;
    this.bombs = 10;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.uiMap = new Map();
    this.hiddenMap = new Map();
    this.bombSet = new Set();
    this.tileWidth = 0;
    this.openCount = 0;
    this.mouseMove = true;
    this.displayId;
    this.active = false;
    this.open = false;
    this.touchable = true;
    this.touchStart;
  }
}

const ui = new UI();

document.addEventListener('DOMContentLoaded', () => {
  createGrid();
});

window.addEventListener('resize', () => {
  ui.width = window.innerWidth;
  ui.height = window.innerHeight;
  resizeGrid();
});

ui.navbar.addEventListener('click', event => {
  touchControl(event);
});

ui.navbar.addEventListener('touchmove', event => {
  touchControl(event);
});

ui.navbar.addEventListener('mouseenter', () => {
  showModes();
});

ui.navbar.addEventListener('mouseleave', () => {
  hideModes();
});

ui.easy.addEventListener('click', () => {
  setMode('easy');
});

ui.normal.addEventListener('click', () => {
  setMode('normal');
});

ui.difficult.addEventListener('click', () => {
  setMode('difficult');
});

ui.custom.addEventListener('click', () => {
  if (!ui.active) {
    if (ui.width < 768) {
      $('#navbarMain').collapse('hide');
    }
    setMode('custom');
  } else if (ui.active && ui.width < 768) {
    $('#navbarCustom').collapse('hide');
    $('#navbarMain').collapse('show');
    setMode('easy');
  }
});

ui.rowRange.addEventListener('mousemove', () => {
  if (ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.rowRange.addEventListener('mouseup', () => {
  if (!ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.rowRange.addEventListener('touchmove', () => {
  if (ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.rowRange.addEventListener('touchend', () => {
  if (!ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.rowRange.addEventListener('keydown', () => {
  updateGrid('resize');
});

ui.columnRange.addEventListener('mousemove', () => {
  if (ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.columnRange.addEventListener('mouseup', () => {
  if (!ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.columnRange.addEventListener('touchmove', () => {
  if (ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.columnRange.addEventListener('touchend', () => {
  if (!ui.mouseMove) {
    updateGrid('resize');
  }
});

ui.columnRange.addEventListener('keydown', () => {
  updateGrid('resize');
});

ui.bombRange.addEventListener('mousemove', () => {
  if (ui.mouseMove) {
    updateGrid();
  }
});

ui.bombRange.addEventListener('mouseup', () => {
  if (!ui.mouseMove) {
    updateGrid();
  }
});

ui.bombRange.addEventListener('touchmove', () => {
  if (ui.mouseMove) {
    updateGrid();
  }
});

ui.bombRange.addEventListener('touchend', () => {
  if (!ui.mouseMove) {
    updateGrid();
  }
});

ui.bombRange.addEventListener('keydown', () => {
  updateGrid();
});

ui.grid.addEventListener('touchstart', () => {
  if (ui.touchable) {
    ui.touchStart = new Date();
    ui.touchable = false;
  }
});

ui.grid.addEventListener('touchend', event => {
  const touchEnd = new Date();
  if (Math.abs(touchEnd.getTime() - ui.touchStart.getTime()) > 500) {
    flagTile(event);
  }
  ui.touchable = true;
});

ui.grid.addEventListener('contextmenu', event => {
  if (ui.touchable) {
    flagTile(event);
  }
});

ui.grid.addEventListener('click', event => {
  const tile = event.target;
  if (
    tile.className.includes('btn-dark border-light') &&
    tile.innerHTML === '' &&
    event.which === 1
  ) {
    const id = tile.getAttribute('id');
    if (ui.openCount === 0) {
      generateBombs(id);
      ui.mouseMove = false;
      displayTime();
    }
    if (tile.innerHTML === '') {
      ui.uiMap.set(id, 'open');
      updateTile(tile, id);
      gameController(id, 'click');
    }
  }
  event.preventDefault();
});

ui.grid.addEventListener('dblclick', event => {
  const tile = event.target;
  if (tile.className.includes('btn-light border-dark')) {
    const id = tile.getAttribute('id');
    uncoverTiles(id);
  } else if (tile.className === 'font-weight-bold') {
    const id = tile.parentElement.getAttribute('id');
    uncoverTiles(id);
  }
  event.preventDefault();
});

document.getElementById('playAgain').addEventListener('click', () => {
  $('#modal').modal('hide');
  createGrid();
  const updatedTime = document.getElementById('updatedTime');
  if (updatedTime !== null) {
    ui.winContent.removeChild(updatedTime);
  }
});

ui.reset.addEventListener('click', () => {
  localStorage.clear();
  if (ui.reset.className.includes('btn-outline-success')) {
    ui.reset.setAttribute('class', 'btn btn-outline-success btn-sm disabled');
  } else {
    ui.reset.setAttribute('class', 'btn btn-outline-danger btn-sm disabled');
  }
  ui.bestTimeDisplay.innerText = '00:00';
});

document.getElementById('playAgain').addEventListener('click', () => {
  $('#loseModal').modal('hide');
  createGrid();
});

function createGrid() {
  ui.hiddenMap.clear();
  ui.uiMap.clear();
  ui.openCount = 0;
  finishTiming();
  document.getElementById('time').innerText = '00:00';
  adjustGrid();
  for (let i = 1; i <= ui.rows; i++) {
    const row = createRow();
    for (let j = 1; j <= ui.columns; j++) {
      const id = `${i},${j}`;
      ui.uiMap.set(id, 'closed');
      ui.hiddenMap.set(id, 0);
      const tile = createTile(id);
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
  ui.bombsLeft = ui.bombs;
  document.getElementById('bombsLeft').innerText = ui.bombsLeft;
}

function resizeGrid() {
  adjustGrid();
  for (let i = 1; i <= ui.rows; i++) {
    const row = createRow();
    for (let j = 1; j <= ui.columns; j++) {
      const id = `${i},${j}`;
      const tile = createTile(id, 'resize');
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
}

function adjustGrid() {
  ui.grid.innerHTML = '';
  ui.grid.parentElement.setAttribute(
    'style',
    `width: ${ui.width}px; height: ${ui.height -
      121}px; margin-top: 121px; background-color: #007bff;`
  );
  ui.tileWidth = calculateTileWidth();
  ui.fontSize = Math.floor(ui.tileWidth * 0.5);
}

function touchControl(event) {
  const target = event.target.className;
  if (
    ui.open &&
    !target.includes('btn') &&
    !target.includes('custom-range') &&
    !target.includes('fa')
  ) {
    hideModes();
  } else {
    showModes();
  }
}

function showModes() {
  $('#navbarModes').collapse('show');
  if (!(ui.active && ui.width < 768)) {
    $('#navbarMain').collapse('show');
  }
  if (ui.active) {
    $('#navbarCustom').collapse('show');
  }
  ui.open = true;
}

function hideModes() {
  $('#navbarModes').collapse('hide');
  $('#navbarMain').collapse('hide');
  $('#navbarCustom').collapse('hide');
  ui.open = false;
}

function setMode(mode) {
  let btnClass = 'btn btn-block btn-outline-light btn-lg';
  ui.easy.setAttribute('class', btnClass);
  ui.normal.setAttribute('class', btnClass);
  ui.difficult.setAttribute('class', btnClass);
  ui.custom.setAttribute('class', btnClass);
  btnClass += ' active';
  document.getElementById(mode).setAttribute('class', btnClass);
  let rowMode;
  let columnMode;
  let bombMode;
  switch (mode) {
    case 'easy':
      rowMode = 9;
      columnMode = 9;
      bombMode = 10;
      break;
    case 'normal':
      rowMode = 16;
      columnMode = 16;
      bombMode = 40;
      break;
    case 'difficult':
      if (ui.width >= ui.height) {
        rowMode = 16;
        columnMode = 30;
        bombMode = 99;
      } else {
        rowMode = 30;
        columnMode = 16;
        bombMode = 99;
      }
      break;
  }
  if (mode === 'custom') {
    ui.active = true;
    $('#navbarCustom').collapse('show');
  } else {
    ui.active = false;
    $('#navbarCustom').collapse('hide');
    ui.rowRange.innerHTML = `<input id="rowRange" class="custom-range" min="2" max="30" step="1" value="${rowMode}" type="range">`;
    ui.columnRange.innerHTML = `<input id="columnRange" class="custom-range" min="2" max="30" step="1" value="${columnMode}" type="range">`;
    ui.bombRange.innerHTML = `<input id="bombRange" class="custom-range" min="1" max="${rowMode *
      columnMode -
      1}" step="1" value="${bombMode}" type="range">`;
    updateGrid();
  }
}

function updateGrid(event) {
  ui.rows = document.getElementById('rowRange').value;
  ui.columns = document.getElementById('columnRange').value;
  if (event === 'resize') {
    updateMaxBombs();
  }
  document.getElementById('rowCount').textContent = ui.rows;
  document.getElementById('columnCount').textContent = ui.columns;
  ui.bombs = document.getElementById('bombRange').value;
  document.getElementById('bombCount').textContent = ui.bombs;
  createGrid();
  ui.mouseMove = true;
}

function updateMaxBombs() {
  const maxBombs = Math.floor(ui.rows * ui.columns - 1);
  const valBombs = Math.ceil(ui.rows * ui.columns * 0.2);
  ui.bombRange.innerHTML = `<input id="bombRange" class="custom-range" min="1" max="${maxBombs}" step="1" value="${valBombs}" type="range">`;
}

function calculateTileWidth() {
  let maxRowSize = Math.floor((ui.height - 145) / ui.rows);
  let maxColumnSize = Math.floor((ui.width - 24) / ui.columns);
  if (maxRowSize > maxColumnSize) {
    return maxColumnSize;
  } else {
    return maxRowSize;
  }
}

function createRow() {
  const row = document.createElement('div');
  row.setAttribute('style', `height: ${ui.tileWidth}px;`);
  row.setAttribute(
    'class',
    'row d-flex align-items-center justify-content-center'
  );
  return row;
}

function createTile(id, event) {
  const tile = document.createElement('div');
  tile.setAttribute('id', id);
  tile.setAttribute(
    'style',
    `width: ${ui.tileWidth}px; height: ${ui.tileWidth}px; padding: 0px;`
  );
  updateTile(tile, id, event);
  return tile;
}

function updateTile(tile, id, event) {
  if (ui.uiMap.get(id) === 'closed') {
    tile.className =
      'btn btn-dark border-light d-flex align-items-center justify-content-center';
    tile.innerHTML = '';
  } else if (ui.uiMap.get(id) === 'flag') {
    if (event !== 'resize') {
      --ui.bombsLeft;
      document.getElementById('bombsLeft').innerText = ui.bombsLeft;
    }
    tile.className =
      'btn btn-dark border-light d-flex align-items-center justify-content-center';
    tile.appendChild(createFlagIcon());
  } else if (ui.uiMap.get(id) === 'open') {
    tile.innerHTML = '';
    tile.className =
      'btn btn-light border-dark d-flex align-items-center justify-content-center';
    const displayType = ui.hiddenMap.get(id);
    if (displayType === 'bomb') {
      tile.appendChild(createBombIcon());
    } else if (displayType !== 0) {
      tile.appendChild(createSpan(displayType));
    }
  }
}

function createFlagIcon() {
  const flagIcon = document.createElement('i');
  flagIcon.setAttribute('style', `font-size: ${ui.fontSize}px;`);
  flagIcon.setAttribute('class', 'fas fa-flag-checkered');
  return flagIcon;
}

function createBombIcon() {
  const bombIcon = document.createElement('i');
  bombIcon.setAttribute('style', `font-size: ${ui.fontSize}px;`);
  bombIcon.setAttribute('class', 'fas fa-bomb');
  return bombIcon;
}

function createSpan(displayType) {
  const span = document.createElement('span');
  span.setAttribute(
    'style',
    `font-size: ${ui.fontSize}px; ${colorNumber(displayType)}`
  );
  span.setAttribute('class', 'font-weight-bold');
  span.innerText = displayType;
  return span;
}

function colorNumber(displayType) {
  switch (displayType) {
    case 1:
      return `color: #007bff;`;
    case 2:
      return `color: #dc3545;`;
    case 3:
      return `color: #28a745;`;
    case 4:
      return `color: #17a2b8;`;
    case 5:
      return `color: #6610f2;`;
    case 6:
      return `color: #fd7e14;`;
    case 7:
      return `color: #e83e8c;`;
    case 8:
      return `color: #20c997;`;
  }
}

function generateBombs(firstClicked) {
  ui.bombSet.clear();
  const keys = Array.from(ui.hiddenMap.keys());
  const removeIndex = keys.indexOf(firstClicked);
  keys.splice(removeIndex, 1);
  for (let i = 1; i <= ui.bombs; i++) {
    const index = Math.floor(Math.random() * (ui.rows * ui.columns - i));
    bombId = keys[index];
    ui.hiddenMap.set(bombId, 'bomb');
    ui.bombSet.add(bombId);
    const row = parseInt(bombId.split(',')[0]);
    const column = parseInt(bombId.split(',')[1]);
    keys.splice(index, 1);
    for (let j = row - 1; j <= row + 1; j++) {
      for (let k = column - 1; k <= column + 1; k++) {
        const id = `${j},${k}`;
        let bombCount = ui.hiddenMap.get(id);
        if (id !== bombId && bombCount !== undefined && bombCount !== 'bomb') {
          ++bombCount;
          ui.hiddenMap.set(id, bombCount);
        }
      }
    }
  }
}

function flagTile(event) {
  const tile = event.target;
  if (tile.className.includes('btn-dark border-light')) {
    const id = tile.getAttribute('id');
    if (tile.innerHTML === '') {
      ui.uiMap.set(id, 'flag');
      updateTile(tile, id);
    } else {
      ui.uiMap.set(id, 'closed');
      updateTile(tile, id);
      ++ui.bombsLeft;
      document.getElementById('bombsLeft').innerText = ui.bombsLeft;
    }
  } else if (tile.className.includes('fa-flag-checkered')) {
    const id = tile.parentElement.getAttribute('id');
    ui.uiMap.set(id, 'closed');
    updateTile(tile.parentElement, id);
    ++ui.bombsLeft;
    document.getElementById('bombsLeft').innerText = ui.bombsLeft;
  }
  event.preventDefault();
}

function uncoverTiles(targetId, event) {
  const row = parseInt(targetId.split(',')[0]);
  const column = parseInt(targetId.split(',')[1]);
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = column - 1; j <= column + 1; j++) {
      const id = `${i},${j}`;
      if (id !== targetId && document.getElementById(id) !== null) {
        const tile = document.getElementById(id);
        if (
          tile.className.includes('btn-dark border-light') &&
          (tile.innerHTML === '' || event === 'click')
        ) {
          if (tile.innerHTML !== '') {
            ++ui.bombsLeft;
            document.getElementById('bombsLeft').innerText = ui.bombsLeft;
          }
          ui.uiMap.set(id, 'open');
          updateTile(tile, id);
          gameController(id, event);
        }
      }
    }
  }
  checkWin();
}

function gameController(id, event) {
  const displayType = ui.hiddenMap.get(id);
  if (displayType === 0) {
    ++ui.openCount;
    uncoverTiles(id, event);
  } else if (displayType === 'bomb') {
    checkLose();
  } else {
    ++ui.openCount;
    if (event === 'click') {
      checkWin();
    }
  }
}

function displayTime() {
  const startDate = new Date();
  ui.displayId = setInterval(() => {
    const currentDate = new Date();
    const time = new Date(
      Math.abs(currentDate.getTime() - startDate.getTime())
    );
    const timeFormat = timeToString(time);
    if (timeFormat === '59:59') {
      checkLose();
    }
    document.getElementById('time').innerText = timeFormat;
  }, 1000);
}

function timeToString(time) {
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  let timeFormat = '';
  if (minutes < 10) {
    timeFormat += `0${minutes}`;
  } else {
    timeFormat += `${minutes}`;
  }
  timeFormat += ':';
  if (seconds < 10) {
    timeFormat += `0${seconds}`;
  } else {
    timeFormat += `${seconds}`;
  }
  return timeFormat;
}

function finishTiming() {
  clearInterval(ui.displayId);
  return document.getElementById('time').innerText;
}

function checkWin() {
  if (ui.openCount === ui.rows * ui.columns - ui.bombs) {
    adjustModal('win');
  }
}

function checkLose() {
  ui.bombSet.forEach(id => {
    if (ui.uiMap.get(id) !== 'flag') {
      ui.uiMap.set(id, 'open');
      tile = document.getElementById(id);
      updateTile(tile, id);
    }
  });
  adjustModal();
}

function adjustModal(type) {
  let id;
  if (ui.rows >= ui.columns) {
    id = `${ui.columns}x${ui.rows}x${ui.bombs}`;
  } else {
    id = `${ui.rows}x${ui.columns}x${ui.bombs}`;
  }
  updateModalTime(type, id);
  updateModalDisplay(type, id);
  $('#modal').modal({
    backdrop: false,
    keyboard: false
  });
  ui.mouseMove = true;
}

function updateModalDisplay(type, id) {
  const border = document.getElementById('border');
  const header = document.getElementById('header');
  const title = document.getElementById('title');
  const footer = document.getElementById('footer');
  const icon = document.getElementById('headerIcon');
  const playAgain = document.getElementById('playAgain');
  const mode = document.getElementById('mode');
  mode.innerText = modeDisplay(id);
  document.getElementById('size').innerText = `${ui.rows} x ${ui.columns}`;
  document.getElementById('bombsWin').innerText = `${ui.bombs}`;
  if (type === 'win') {
    border.setAttribute('class', 'modal-content border border-warning');
    title.innerText = 'YOU HAVE WON';
    icon.setAttribute('class', 'justify-self-end fas fa-trophy fa-2x');
    playAgain.setAttribute(
      'class',
      'btn btn-success btn-block btn-lg text-warning'
    );
    ui.reset.setAttribute('class', 'btn btn-outline-success btn-sm');
    ui.winContent.setAttribute('class', 'modal-body bg-warning text-success');
    header.setAttribute(
      'class',
      'modal-header border-bottom border-success bg-success text-warning align-items-center'
    );
    footer.setAttribute(
      'class',
      'modal-footer bg-warning border-top border-success'
    );
  } else {
    border.setAttribute('class', 'modal-content border border-danger');
    title.innerText = 'GAME OVER';
    icon.setAttribute('class', 'justify-self-end fas fa-sad-tear fa-2x');
    playAgain.setAttribute('class', 'btn btn-danger btn-lg btn-block');
    ui.reset.setAttribute('class', 'btn btn-outline-danger btn-sm');
    ui.winContent.setAttribute('class', 'modal-body bg-light text-danger');
    header.setAttribute(
      'class',
      'modal-header bg-danger text-light align-items-center'
    );
    footer.setAttribute('class', 'modal-footer border-top border-danger');
  }
}

function modeDisplay(id) {
  switch (id) {
    case '9x9x10':
      return 'EASY';
    case '16x16x40':
      return 'NORMAL';
    case '16x30x99':
      return 'DIFFICULT';
    default:
      return 'CUSTOM';
  }
}

function updateModalTime(type, id) {
  const winString = finishTiming();
  document.getElementById('yourTime').innerText = winString;
  const minutes = parseInt(winString.split(':')[0]);
  const seconds = parseInt(winString.split(':')[1]);
  const winTime = new Date(minutes * 60000 + seconds * 1000);
  const timeStored = localStorage.getItem('timeMap');
  let timeMap;
  if (timeStored) {
    timeMap = new Map(JSON.parse(timeStored));
    const timeString = timeMap.get(id);
    if (timeString) {
      const bestTime = new Date(timeString);
      modeChecker(type, timeMap, id, winTime, winString, bestTime);
    } else {
      modeChecker(type, timeMap, id, winTime, winString);
    }
  } else {
    timeMap = new Map();
    modeChecker(type, timeMap, id, winTime, winString);
  }
}

function modeChecker(type, timeMap, id, winTime, winString, bestTime) {
  if (type === 'win') {
    if (bestTime) {
      if (Math.abs(bestTime.getTime()) > Math.abs(winTime.getTime())) {
        setBestTime(timeMap, id, winTime, winString);
      } else {
        ui.bestTimeDisplay.innerText = timeToString(bestTime);
      }
    } else {
      setBestTime(timeMap, id, winTime, winString);
    }
  } else {
    if (bestTime) {
      ui.bestTimeDisplay.innerText = timeToString(bestTime);
    } else {
      ui.bestTimeDisplay.innerText = '00:00';
    }
  }
}

function setBestTime(timeMap, id, winTime, winString) {
  timeMap.set(id, winTime);
  ui.bestTimeDisplay.innerText = winString;
  const div = document.createElement('div');
  div.setAttribute('class', 'row justify-content-center');
  div.setAttribute('id', 'updatedTime');
  const h5 = document.createElement('h5');
  const i = document.createElement('i');
  i.setAttribute('class', 'far fa-star');
  h5.appendChild(i);
  const info = document.createTextNode(' New best time');
  h5.appendChild(info);
  div.appendChild(h5);
  ui.winContent.insertBefore(div, document.getElementById('modeRow'));
  localStorage.setItem('timeMap', JSON.stringify(Array.from(timeMap)));
}

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
