export const importPre = document.getElementById("imported-pre") as HTMLPreElement;
export const pathsPre = document.getElementById("paths-pre") as HTMLPreElement;
export const canvas = document.getElementById("laser-game-canvas") as HTMLCanvasElement;
export const victoryP = document.getElementById("victory-p") as HTMLParagraphElement;

export const seedLevelButton = document.getElementById("seed-level") as HTMLInputElement;
export const dailyLevelButton = document.getElementById("daily-level") as HTMLInputElement;
export const edgesInput = document.getElementById("edges") as HTMLInputElement;
export const seedInput = document.getElementById("seed") as HTMLInputElement;

export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
