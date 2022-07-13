import Tile from "../../Tile";
import { tileToPixels } from "../FrontendTile";

export default class PieceComponent {
  public isPlaced: boolean;
  private img: HTMLImageElement;

  constructor(src: string, draw: () => void) {
    this.isPlaced = false;
    this.img = new Image();
    this.img.onload = () => { draw(); };
    this.img.src = src;
  }

  public drawAt(tile: Tile, ctx: CanvasRenderingContext2D) {
    const pos = tileToPixels(tile);
    ctx.drawImage(this.img, pos.px, pos.py);
  }
}
