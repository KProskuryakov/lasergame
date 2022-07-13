import { calculateAllEndings, GridPiece } from "../LaserGrid";
import LevelType from "../LevelType";
import Path, { equalPaths } from "../Path";
import PieceID from "../PieceID";
import LaserGridComponent from "./components/LaserGridComponent";
import PieceComponent from "./components/PieceComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import { pathToString } from "./FrontendPath";
import { canvas, ctx, pathsPre, victoryP, seedLevelButton, seedInput, edgesInput, dailyLevelButton } from "./HTMLElements";
import { generateLevel } from "../LevelGenerator";
import seedrandom from "seedrandom";

export const toolbar = new ToolbarComponent("toolbar.png", { x: 0, y: 7 }, 8, 1, draw);
export const lasergridComponent = new LaserGridComponent("lasergrid.png", { x: 0, y: 0 }, 7, 7, draw);

export const pieceComponents: PieceComponent[] = [];

let currentLevel: Path[];
export let availablePieces: GridPiece[] = [];
export let edgeLevelData: Array<{ edge: number, solved: boolean }>;
let levelType: LevelType = LevelType.Custom;
// let difficulty = "medium";

/**
 * Inits the things that aren't constants
 */
function init() {
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    onClick(e);
  });

  seedLevelButton.addEventListener("click", seedLevel);
  dailyLevelButton.addEventListener("click", dailyLevel);

  pieceComponents[PieceID.FORWARD_SLASH] = new PieceComponent("pieces/mirror_forwardslash.png", draw);
  pieceComponents[PieceID.BACK_SLASH] = new PieceComponent("pieces/mirror_backslash.png", draw);
  pieceComponents[PieceID.BLACK_HOLE] = new PieceComponent("pieces/mirror_blackhole.png", draw);
  pieceComponents[PieceID.HORI_SPLIT] = new PieceComponent("pieces/mirror_sidesplit.png", draw);
  pieceComponents[PieceID.VERT_SPLIT] = new PieceComponent("pieces/mirror_upsplit.png", draw);

  pieceComponents[PieceID.BLUE] = new PieceComponent("pieces/swatch_blue.png", draw);
  pieceComponents[PieceID.RED] = new PieceComponent("pieces/swatch_red.png", draw);
  pieceComponents[PieceID.GREEN] = new PieceComponent("pieces/swatch_green.png", draw);

  for (let i = 0; i < 8; i++) {
    const piece: GridPiece = { pieceID: i, tile: { x: -1, y: -1 }, index: i };
    availablePieces[i] = piece;
  }

  calculateAllEndings(lasergridComponent.lasergrid);
  printPaths();
  lasergridComponent.calculateDrawPathWrapper();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#9c9a9b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  lasergridComponent.draw(ctx);
  toolbar.draw(ctx);
}

function onClick(event: MouseEvent) {
  const loc = windowToCanvas(event.clientX, event.clientY);
  lasergridComponent.processMouseClick(loc.x, loc.y, event.button);
  toolbar.processMouseClick(loc.x, loc.y, event.button);
  printPaths();
  if (currentLevel && checkVictory()) {
    if (levelType === LevelType.Seed) {
      victoryP.textContent = "You beat the seed level!";
    } else if (levelType === LevelType.Daily) {
      victoryP.textContent = "Wow! You beat the daily level!";
    }
    victoryP.hidden = false;
  }
  draw();
}

function populateEdgeLevelData() {
  if (currentLevel) {
    edgeLevelData = [];
    for (const path of currentLevel) {
      const edge = path.start;
      let solved = false;
      if (equalPaths(path, lasergridComponent.lasergrid.paths[path.start - 1])) {
        solved = true;
      }
      edgeLevelData.push({ edge, solved });
    }
  }
}

function checkVictory(): boolean {
  for (const data of edgeLevelData) {
    if (!data.solved) {
      return false;
    }
  }
  return true;
}

export function printPaths() {
  if (currentLevel) {
    populateEdgeLevelData();
    printLevelPaths();
  } else {
    printAllPaths();
  }
}

function printAllPaths() {
  pathsPre.innerHTML = "";
  const paths = lasergridComponent.lasergrid.paths;
  for (let i = 0; i < 20; i++) {
    const curPath = paths[i];
    let line = pathToString(curPath);
    if (lasergridComponent.selectedEdge === i + 1) {
      line = `><b>${line}</b>`;
    }
    pathsPre.innerHTML += line;
    if (i < 19) {
      pathsPre.innerHTML += "\n";
    }
  }
}

function printLevelPaths() {
  pathsPre.innerHTML = "";
  const paths = lasergridComponent.lasergrid.paths;
  for (let i = 0; i < currentLevel.length; i++) {
    const levelPath = currentLevel[i];
    const curPath = paths[levelPath.start - 1];
    let line = pathToString(levelPath);
    line = equalPaths(curPath, levelPath) ? `<span style='color: green'>${line}</span>`
      : `<span style='color: red'>${line}</span>`;
    if (lasergridComponent.selectedEdge === levelPath.start) {
      line = `><b>${line}</b>`;
    }
    pathsPre.innerHTML += line;

    if (i < currentLevel.length - 1) {
      pathsPre.innerHTML += "\n";
    }
  }
}

/**
 * Converts the x, y pixel coordinates from window position to relative canvas position
 * @param {number} x clientX
 * @param {number} y clientY
 * @returns {{x: number, y: number}} a relative location to the canvas
 */
function windowToCanvas(x: number, y: number) {
  const bbox = canvas.getBoundingClientRect();

  return {
    x: x - bbox.left * (canvas.width / bbox.width),
    y: y - bbox.top * (canvas.height / bbox.height),
  };
}

function setNewLevel(seed: string, edges: number | undefined) {
  lasergridComponent.clear();
  const newLevel = generateLevel(seed, edges)
  currentLevel = [];
  newLevel.paths.forEach(p => currentLevel.push(p));
  availablePieces = newLevel.availablePieces;
  printPaths();
  lasergridComponent.calculateDrawPathWrapper();
  draw();
}

function seedLevel() {
  let seed = seedInput.value;
  let edges: number | undefined = parseInt(edgesInput.value);

  if (seed === "") {
    seed = Date.now().toString();
  }

  if (isNaN(edges) || edges < 1 || edges > 20) {
    edges = undefined;
  }

  levelType = LevelType.Seed;
  victoryP.textContent = `Currently playing seed: ${seed}`

  setNewLevel(seed, edges);
}

function dailyLevel() {
  const seed = new Date().toDateString();
  const rng = seedrandom(seed);
  const edges = rng() * 10 + 5;

  levelType = LevelType.Daily;
  victoryP.textContent = `Currently playing daily level: ${seed}`
  setNewLevel(seed, edges);
}

window.addEventListener("load", () => {
  init();
})

