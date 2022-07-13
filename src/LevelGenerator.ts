import Path, { equalPaths } from "./Path";
import seedrandom from "seedrandom";
import { GridPiece, getPieceFromGrid, setPieceInGrid, makeDefaultGrid } from "./LaserGrid";
import Tile from "./Tile";

const defaultGrid = makeDefaultGrid();

export function generateLevel(seed = Date.now().toString(), numPaths = 5) {
  const rng = seedrandom(seed);

  const interestingPaths: Path[] = [];
  const boringPaths: Path[] = [];

  const availablePieces: GridPiece[] = [];

  for (let i = 0; i < 8; i++) {
    availablePieces[i] = { pieceID: Math.floor(rng() * 8), tile: { x: -1, y: -1 }, index: i };
  }

  const randomGrid = makeDefaultGrid();

  availablePieces.forEach((piece: GridPiece) => {
    while (true) {
      const randTile: Tile = { x: Math.floor(rng() * 5), y: Math.floor(rng() * 5) };
      if (!getPieceFromGrid(randomGrid, randTile)) {
        setPieceInGrid(randomGrid, piece, randTile);
        break;
      }
    }
  });

  const gridPaths = randomGrid.paths;

  for (let i = 0; i < gridPaths.length; i++) {
    if (!equalPaths(gridPaths[i], defaultGrid.paths[i])) {
      interestingPaths.push(gridPaths[i]);
    } else {
      boringPaths.push(gridPaths[i]);
    }
  }

  // shuffle cleansedEndings
  shuffle(interestingPaths, rng);

  let randomPaths: Path[] = interestingPaths.slice(0, numPaths);

  if (randomPaths.length < numPaths) {
    shuffle(boringPaths, rng);
    randomPaths = randomPaths.concat(boringPaths.slice(0, numPaths - randomPaths.length));
  }

  randomPaths.sort((a, b) => a.start < b.start ? -1 : 1);

  for (const piece of availablePieces) {
    piece.tile = { x: -1, y: -1 };
  }

  return { paths: randomPaths, availablePieces };
}

function shuffle(paths: Path[], rng: any) {
  let m = paths.length;
  let t: Path; let i: number;
  while (m) {
    i = Math.floor(rng() * m--);

    t = paths[m];
    paths[m] = paths[i];
    paths[i] = t;
  }
}