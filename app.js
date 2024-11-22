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
    this.probMap = new Map();
    this.tileWidth = 0;
    this.openCount = 0;
    this.mouseMove = true;
    this.displayId;
    this.active = false;
    this.open = false;
    this.touchable = true;
    this.touchStart;
    this.control_num = 0;
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
    (tile.innerHTML === '' || parseInt(tile.innerHTML) >= 0) &&
    event.which === 1
  ) {
    const id = tile.getAttribute('id');
    if (ui.openCount === 0) {
      generateBombs(id);
      ui.mouseMove = false;
      displayTime();
    }
    if (tile.innerHTML === '' || parseInt(tile.innerHTML) >= 0) {
      ui.uiMap.set(id, 'open');
      updateTile(tile, id);
      const losed = gameController(id, 'click');
      if (tile.innerHtml !== '' && losed === undefined) {
        frontline(false);
      }
      resizeGrid();
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
  if (ui.openCount !== 0) {
    displayProb();
  }
}

function adjustGrid() {
  ui.grid.innerHTML = '';
  ui.grid.parentElement.setAttribute(
    'style',
    `width: ${ui.width}px; height: ${ui.height -
      97}px; margin-top: 97px; background-color: #007bff;`
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
    ui.probMap.set(id, 0);
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
    if (tile.innerHTML === '' || parseInt(tile.innerHTML) >= 0) {
      ui.uiMap.set(id, 'flag');
      updateTile(tile, id);
      resizeGrid();
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
          if (tile.innerHTML !== '' && parseInt(tile.innerHTML) < 0) {
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
  return checkWin();
}

function gameController(id, event) {
  const displayType = ui.hiddenMap.get(id);
  if (displayType === 0) {
    ++ui.openCount;
    return uncoverTiles(id, event);
  } else if (displayType === 'bomb') {
    checkLose();
    return 'lose';
  } else {
    ++ui.openCount;
    if (event === 'click') {
      return checkWin();
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
    return 'win';
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

// Solver

function displayProb() {
  ui.probMap.forEach((prob, key) => {
    if (ui.uiMap.get(key) === 'closed') {
      let style =
        document.getElementById(key).getAttribute('style') +
        `background-color: rgb(${Math.round(prob[0] * 255)},0,0);`;
      document.getElementById(key).setAttribute('style', style);
      if (prob[1]) {
        document.getElementById(key).innerHTML = Math.round(prob[0] * 100);
      }
    }
  });
}

function frontline(preprocessed) {
  this.control_num = 0;
  if (ui.openCount !== 0) {
    let prohibited = new Set();
    const hiddenUiMap = hiddenUi(prohibited);
    const nearbySet = openFrontline(hiddenUiMap);
    const openSurrounding = new Map();
    nearbySet.forEach(key => unitConstraints(key, openSurrounding, prohibited));
    const mappingsMap = obtainAllMappings(openSurrounding, hiddenUiMap);
    const subsystems = divideProblem(openSurrounding);
    let knownClosed = new Set();
    subsystems.forEach(subsystem => {
      knownClosed = new Set([...knownClosed, ...subsystem[1]]);
    });
    let closedSize = knownClosed.size;
    ui.uiMap.forEach((value, key) => {
      if (value === 'flag') {
        ++closedSize;
      }
    });

    const uknownClosed =
      ui.rows * ui.columns - ui.openCount - closedSize - prohibited.size;
    const solutionSet = new Set();
    let overallMax = 0;
    let overallMin = 0;
    try {
      subsystems.forEach(subsystem => {
        const subSolution = commonSolution(
          subsystem[0],
          openSurrounding,
          mappingsMap
        );
        let minimum = 900;
        let maximum = 0;
        subSolution.forEach(mapping => {
          const bombs = mapping.get('bombs');
          if (bombs < minimum) {
            minimum = bombs;
          }
          if (bombs > maximum) {
            maximum = bombs;
          }
        });
        overallMax += maximum;
        overallMin += minimum;
        solutionSet.add([subSolution, minimum, maximum]);
      });
    } catch (e) {
      document.getElementById('prob').innerHTML = 'Too many combinations. I cannot help you. 😓'
      return;
    }

    if (overallMax > ui.bombsLeft || overallMin + uknownClosed < ui.bombsLeft) {
      const toCombine = new Set();
      solutionSet.forEach(subSolution => {
        if (subSolution[1] !== subSolution[2]) {
          solutionSet.delete(subSolution);
          toCombine.add(subSolution);
        }
      });
      let firstSub = toCombine.entries().next().value[0];
      toCombine.delete(firstSub);
      while (toCombine.size !== 0) {
        const intermediate = new Set();
        const nextSub = toCombine.entries().next().value[0];
        toCombine.delete(nextSub);
        firstSub[1] = firstSub[1] + nextSub[1];
        firstSub[2] = firstSub[2] + nextSub[2];
        firstSub[0].forEach(mapping1 => {
          firstSub[0].delete(mapping1);
          const bombs1 = mapping1.get('bombs');
          nextSub[0].forEach(mapping2 => {
            const bombs2 = mapping2.get('bombs');
            const union = new Map([...mapping1, ...mapping2]);
            union.set('bombs', bombs1 + bombs2);
            intermediate.add(union);
          });
        });
        firstSub[0] = intermediate;
      }
      postProcess(firstSub, overallMin, overallMax, uknownClosed);
      solutionSet.add(firstSub);
    }

    solutionSet.forEach(subSolution => {
      if (subSolution.length === 3) {
        const bombsInSolutionMap = new Map();
        subSolution[0].forEach(mapping => {
          const bombs = mapping.get('bombs');
          let bombsInSol = bombsInSolutionMap.get(bombs);
          if (bombsInSol) {
            ++bombsInSol;
            bombsInSolutionMap.set(bombs, bombsInSol);
          } else {
            bombsInSolutionMap.set(bombs, 1);
          }
        });
        solutionSet.delete(subSolution);
        subSolution.push(bombsInSolutionMap);
        solutionSet.add(subSolution);
      }
    });

    let flaggedTiles = 0;
    if (!preprocessed) {
      flaggedTiles = flagCertainTiles(solutionSet);
    }

    if (flaggedTiles === 0) {
      let expectedBombs = 0;
      if (solutionSet.size !== 0) {
        const result = computeTotalComb(
          solutionSet,
          uknownClosed,
          flaggedTiles
        );
        const totalComb = result[0];
        expectedBombs = result[1];
        computeProb(solutionSet, uknownClosed, totalComb, flaggedTiles);
      }
      // solutionSet.forEach(solution => {
      //   displaySolution(solution[0]);
      // });

      document.getElementById('prob').innerHTML =
        Math.round(((ui.bombsLeft - expectedBombs) / uknownClosed) * 1000) /
          10 +
        '%';

      ui.uiMap.forEach((value, key) => {
        if (prohibited.has(key)) {
          ui.probMap.set(key, [0, 1]);
        } else if (value === 'closed' && !knownClosed.has(key)) {
          ui.probMap.set(key, [
            (ui.bombsLeft - expectedBombs) / uknownClosed,
            0
          ]);
        }
      });
    } else {
      frontline(true);
    }
  }
}

function computeProb(solutionSet, unknownClosed, totalComb, flaggedTiles) {
  solutionSet.forEach(subSolution => {
    const firstAssignment = subSolution[0].entries().next().value[0];
    const closedSet = new Set();
    for (key of firstAssignment) {
      if (key[0] !== 'bombs') {
        closedSet.add(key[0]);
      }
    }
    closedSet.forEach(tile => {
      const bombsInMapFreq = new Map();
      subSolution[0].forEach(mapping => {
        // populate number of bombs vs frequency map for given tile
        if (mapping.get(tile)) {
          const count = mapping.get('bombs');
          let bombFreq = bombsInMapFreq.get(count);
          if (bombFreq) {
            ++bombFreq;
            bombsInMapFreq.set(count, bombFreq);
          } else {
            bombsInMapFreq.set(count, 1);
          }
        }
      });

      let coefSet = new Set();
      bombsInMapFreq.forEach((freq, count) => {
        let ready = new Set();
        ready.add([count, freq]);
        const remainingSolutions = new Set(solutionSet);
        remainingSolutions.delete(subSolution);
        remainingSolutions.forEach(sub => {
          const intermediate = new Set();
          sub[3].forEach((freq2, count2) => {
            ready.forEach(sol => {
              const x = sol[0] + count2;
              const y = sol[1] * freq2;
              intermediate.add([x, y]);
            });
          });
          ready = new Set(intermediate);
        });
        ready.forEach(pair => {
          coefSet.add(pair);
        });
      });

      let res = 0;
      coefSet.forEach(val => {
        res += val[1] * combination(unknownClosed, ui.bombsLeft - val[0]);
      });
      if (totalComb !== 0) {
        res /= totalComb;
      }
      ui.probMap.set(tile, [res, 1]);
    });
  });
}

function computeTotalComb(solutionSet, unknownClosed, flaggedTiles) {
  let coefSet = new Set();
  const first = solutionSet.entries().next().value[0];
  first[3].forEach((freq, count) => {
    let ready = new Set();
    ready.add([count, freq]);
    const remainingSolutions = new Set(solutionSet);
    remainingSolutions.delete(first);
    remainingSolutions.forEach(sub => {
      const intermediate = new Set();
      sub[3].forEach((freq2, count2) => {
        ready.forEach(sol => {
          const x = sol[0] + count2;
          const y = sol[1] * freq2;
          intermediate.add([x, y]);
        });
      });
      ready = new Set(intermediate);
    });
    ready.forEach(pair => {
      coefSet.add(pair);
    });
  });

  let res = 0;
  coefSet.forEach(val => {
    res += val[1] * combination(unknownClosed, ui.bombsLeft - val[0]);
  });

  let expectedBombs = 0;
  if (res !== 0) {
    coefSet.forEach(val => {
      expectedBombs +=
        (val[1] * val[0] * combination(unknownClosed, ui.bombsLeft - val[0])) /
        res;
    });
    expectedBombs -= flaggedTiles;
  }

  return [res, expectedBombs];
}

function flagCertainTiles(solutionSet) {
  let flaggedTiles = 0;
  solutionSet.forEach(subSolution => {
    const firstAssignment = subSolution[0].entries().next().value[0];
    const closedSet = new Set();
    for (key of firstAssignment) {
      if (key[0] !== 'bombs') {
        closedSet.add(key[0]);
      }
    }
    for (key of closedSet) {
      let count = 0;
      for (solution of subSolution[0]) {
        if (solution.get(key)) {
          ++count;
        }
      }
      if (count === subSolution[0].size) {
        ++flaggedTiles;
        ui.probMap.set(key, [1, 0]);
        ui.uiMap.set(key, 'flag');
        updateTile(document.getElementById(key), key);
        subSolution[0].forEach(mapping => {
          mapping.delete(key);
        });
      }
    }
  });
  return flaggedTiles;
}

// function displaySolution(subSolution) {
//   const closedSet = new Set();
//   const firstAssignment = subSolution.entries().next().value[0];
//   for (key of firstAssignment) {
//     if (key[0] !== 'bombs') {
//       closedSet.add(key[0]);
//     }
//   }
//   let flaggedTiles = 0;
//   for (key of closedSet) {
//     let count = 0;
//     for (solution of subSolution) {
//       if (solution.get(key)) {
//         ++count;
//       }
//     }
//     const chance = Math.round((count / subSolution.size) * 100);
//     if (chance === 100) {
//       ui.probMap.set(key, 1);
//       ui.uiMap.set(key, 'flag');
//       updateTile(document.getElementById(key), key);
//       ++flaggedTiles;
//     } else {
//       ui.probMap.set(key, [count / subSolution.size, 1]);
//     }
//   }
//   return flaggedTiles;
// }

function postProcess(solution, min, max, availableTiles) {
  solution[0].forEach(mapping => {
    if (
      mapping.get('bombs') + min - solution[1] > ui.bombsLeft ||
      mapping.get('bombs') + max - solution[2] + availableTiles < ui.bombsLeft
    ) {
      solution[0].delete(mapping);
    }
  });
}

function divideProblem(problemMap) {
  const intermediate = new Set();
  const final = new Set();
  problemMap.forEach((value, key) => {
    keySet = new Set();
    keySet.add(key);
    intermediate.add([keySet, value]);
  });
  intersectionLoop: while (intermediate.size !== 0) {
    for (tuple1 of intermediate) {
      intermediate.delete(tuple1);
      for (tuple2 of intermediate) {
        const intersection = new Set(
          [...tuple2[1]].filter(x => tuple1[1].has(x))
        );
        if (intersection.size !== 0) {
          intermediate.delete(tuple2);
          intermediate.add([
            new Set([...tuple1[0], ...tuple2[0]]),
            new Set([...tuple1[1], ...tuple2[1]])
          ]);
          continue intersectionLoop;
        }
      }
      final.add(tuple1);
    }
  }
  return final;
}

document.addEventListener('keyup', event => {
  if (event.keyCode === 13) {
    // frontline(false);
    // displayProb();
    const probSet = new Set();
    ui.probMap.forEach((value, key) => {
      if (value[0] !== 0) {
        probSet.add(value[0]);
      }
    });
    const probArr = Array.from(probSet);
    probArr.sort();
    const lowestProb = new Array();
    ui.probMap.forEach((value, key) => {
      if (value[0] === probArr[0]) {
        lowestProb.push(key);
      }
    });
    const toRemove = Math.floor(Math.random() * lowestProb.length);
    const id = lowestProb[toRemove];
    let style =
      document.getElementById(id).getAttribute('style') +
      `background-color: rgb(0,0,255);`;
    document.getElementById(id).setAttribute('style', style);
  }
});

function commonSolution(constraintSet, openSurrounding, mappingsMap) {
  const firstElem = constraintSet.entries().next().value[0];
  constraintSet.delete(firstElem);
  const openCluster = new Set();
  openCluster.add(firstElem);
  let closedCluster = new Set(openSurrounding.get(firstElem));
  let finalMappings = new Set(mappingsMap.get(firstElem));
  for (constraint of constraintSet) {
    finalMappings = combineMappings(
      openSurrounding.get(constraint),
      mappingsMap.get(constraint),
      closedCluster,
      finalMappings
    );
    openCluster.add(constraint);
    closedCluster = new Set([
      ...closedCluster,
      ...openSurrounding.get(constraint)
    ]);
  }
  return finalMappings;
}

function combineMappings(nearby1, mappings1, nearby2, mappings2) {
  const intersection = new Set([...nearby1].filter(x => nearby2.has(x)));
  const newMappings = new Set();
  for (mapping1 of mappings1) {
    for (mapping2 of mappings2) {
      let match = true;
      for (commonTile of intersection) {
        if (mapping1.get(commonTile) !== mapping2.get(commonTile)) {
          match = false;
        }
      }
      if (match) {
        const union = new Map([...mapping1, ...mapping2]);
        union.delete('bombs');
        let bombs = 0;
        for (value of union.values()) {
          if (value) {
            ++bombs;
          }
        }
        union.set('bombs', bombs);
        newMappings.add(union);
        this.control_num += 1;

        if (this.control_num >= 1000000) {
          throw new Error('Too many Combinations');
        }
      }
    }
  }
  return newMappings;
}

function obtainAllMappings(openMap, hiddenUiMap) {
  const mappingsMap = new Map();
  openMap.forEach((closedSet, key) => {
    const item = closedSet.entries().next().value[0];
    closedCopy = new Set(closedSet);
    closedCopy.delete(item);
    const assignments = new Set();
    const map1 = new Map();
    map1.set(item, true);
    map1.set('bombs', 1);
    let mappings;
    if (closedCopy.size > hiddenUiMap.get(key) - 1) {
      assignments.add(map1);
      const map2 = new Map();
      map2.set(item, false);
      map2.set('bombs', 0);
      assignments.add(map2);
      mappings = solve2(
        closedCopy,
        hiddenUiMap.get(key),
        assignments,
        closedCopy.size + 2
      );
    } else {
      closedSet.forEach(elem => {
        map1.set(elem, true);
      });
      map1.set('bombs', hiddenUiMap.get(key));
      assignments.add(map1);
    }
    if (mappings) {
      mappingsMap.set(key, mappings);
    } else {
      mappingsMap.set(key, assignments);
    }
  });
  return mappingsMap;
}

function solve2(closedSet, limit, assignments, problemSize) {
  let intermediate;
  while (closedSet.size !== 0) {
    const item = closedSet.entries().next().value[0];
    closedSet.delete(item);
    intermediate = new Set(assignments);
    for (map of assignments) {
      const bombs = map.get('bombs');
      if (bombs < limit && problemSize > map.size) {
        intermediate.delete(map);
        const map1 = new Map(map);
        map1.set(item, true);
        map1.set('bombs', bombs + 1);
        if (bombs + closedSet.size !== limit - 1) {
          const map2 = new Map(map);
          map2.set(item, false);
          map2.set('bombs', bombs);
          intermediate.add(map2);
        } else {
          closedSet.forEach(elem => {
            map1.set(elem, true);
          });
          map1.set('bombs', limit);
        }
        intermediate.add(map1);
      } else if (problemSize > map.size) {
        intermediate.delete(map);
        map.set(item, false);
        closedSet.forEach(elem => {
          map.set(elem, false);
        });
        intermediate.add(new Map(map));
      }
    }
    assignments = new Set(intermediate);
  }
  return intermediate;
}

function unitConstraints(key, problemMap, prohibited) {
  const closedSet = new Set();
  const row = parseInt(key.split(',')[0]);
  const column = parseInt(key.split(',')[1]);
  for (let j = row - 1; j <= row + 1; j++) {
    for (let k = column - 1; k <= column + 1; k++) {
      const id = `${j},${k}`;
      if (ui.uiMap.get(id) === 'closed' && !prohibited.has(id)) {
        closedSet.add(id);
      }
    }
  }
  problemMap.set(key, closedSet);
}

function openFrontline(map) {
  const constraints = new Set();
  map.forEach((value, key) => {
    if (value !== 0) {
      constraints.add(key);
    }
  });
  return constraints;
}

function hiddenUi(prohibited) {
  const hiddenUi = new Map();
  ui.uiMap.forEach((value, key) => {
    if (value === 'open' && ui.hiddenMap.get(key) !== 0) {
      let remaininigBombs = ui.hiddenMap.get(key);
      const row = parseInt(key.split(',')[0]);
      const column = parseInt(key.split(',')[1]);
      const intermediate = new Set();
      for (let j = row - 1; j <= row + 1; j++) {
        for (let k = column - 1; k <= column + 1; k++) {
          const id = `${j},${k}`;
          if (ui.uiMap.get(id) === 'flag') {
            --remaininigBombs;
          } else if (ui.uiMap.get(id) === 'closed') {
            intermediate.add(id);
          }
        }
      }
      if (remaininigBombs === 0 && intermediate.size !== 0) {
        intermediate.forEach(wrong => {
          prohibited.add(wrong);
        });
      }
      hiddenUi.set(key, remaininigBombs);
    }
  });
  return hiddenUi;
}

function combination(n, r) {
  if (r > n || r < 0) {
    return 0;
  }
  result = 1;
  for (d = 1; d <= r; ++d) {
    result *= n--;
    result /= d;
  }
  return result;
}

function test() {
  ui.openCount = 65;
  ui.bombs = 12;
  ui.bombsLeft = 4;
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      ui.uiMap.set(i + ',' + j, 'open');
      ui.hiddenMap.set(i + ',' + j, 0);
    }
  }
  ui.bombSet = new Set([
    '2,8',
    '4,8',
    '5,8',
    '5,9',
    '7,3',
    '8,4',
    '9,1',
    '9,4',
    '8,2',
    '1,9',
    '3,9',
    '4,9'
  ]);
  ui.bombSet.forEach(bombId => {
    ui.hiddenMap.set(bombId, 'bomb');
  });
  ui.bombSet.forEach(bombId => {
    const row = parseInt(bombId.split(',')[0]);
    const column = parseInt(bombId.split(',')[1]);
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
  });
  ui.uiMap.set('2,8', 'flag');
  ui.uiMap.set('4,8', 'flag');
  ui.uiMap.set('5,8', 'flag');
  ui.uiMap.set('5,9', 'flag');
  ui.uiMap.set('7,3', 'flag');
  ui.uiMap.set('8,4', 'flag');
  ui.uiMap.set('9,1', 'flag');
  ui.uiMap.set('9,4', 'flag');
  ui.uiMap.set('1,9', 'closed');
  ui.uiMap.set('2,9', 'closed');
  ui.uiMap.set('3,9', 'closed');
  ui.uiMap.set('4,9', 'closed');
  ui.uiMap.set('8,1', 'closed');
  ui.uiMap.set('8,2', 'closed');
  ui.uiMap.set('9,2', 'closed');
  ui.uiMap.set('9,3', 'closed');
  frontline(false);
  displayProb();
}
