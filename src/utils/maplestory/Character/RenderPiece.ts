import type { IProperty } from 'maplestory/dist/PKG1/IProperty';
import type IVector from 'maplestory/dist/PKG1/IVector';
import { CanvasProperty } from 'maplestory/dist/PKG1/Properties/PropertyList';
import type { IPieceInfo } from './IPieceInfo';
import { NodeItemPair } from './NodeItemPair';
import { RenderPieceInfo } from './RenderPieceInfo';

export default class RenderPiece implements IPieceInfo {
  canvas: CanvasProperty;
  slot: string;
  originalPiece: RenderPieceInfo;
  resolvedPiece: RenderPieceInfo;
  item: NodeItemPair;
  private _canvas: HTMLCanvasElement;
  private _textureId: WebGLTexture;
  private _cachedHueCanvases: Record<number, HTMLCanvasElement> = {};
  visible: boolean;
  hasLock: boolean;
  // Specifies which items are taking priority over this item's required locks
  lockBlame: NodeItemPair[];

  public get origin(): IVector {
    return this.originalPiece.origin || this.resolvedPiece.origin;
  }
  public get z(): string {
    return this.originalPiece.z || this.resolvedPiece.z;
  }
  public get map(): Record<string, IVector> {
    // These should basically always have a map, but occassionally don't.
    // Theory is that they don't when they map to an effect instead of a real item
    return this.originalPiece.map || this.resolvedPiece.map || { navel: { x: 0, y: 0 } };
  }
  public get group(): string {
    return this.originalPiece.group || this.resolvedPiece.group;
  }

  constructor(item: NodeItemPair, pieceNode: IProperty, resolvedPiece: IProperty) {
    this.visible = true;

    this.item = item;
    if (resolvedPiece.type === 'canvas') this.canvas = resolvedPiece as CanvasProperty;
    else if (pieceNode.type === 'canvas') this.canvas = pieceNode as CanvasProperty;
    else throw new Error('No renderable canvas found!');

    this.slot = pieceNode.name;

    if (pieceNode.children) {
      this.originalPiece = new RenderPieceInfo(pieceNode);
    } else {
      this.originalPiece = new RenderPieceInfo(resolvedPiece);
      this.resolvedPiece = this.originalPiece;
      return;
    }

    if (pieceNode === resolvedPiece || !resolvedPiece) {
      this.resolvedPiece = this.originalPiece;
    } else {
      this.resolvedPiece = new RenderPieceInfo(resolvedPiece);
    }
  }

  async GetWebGLTexture(gl: WebGLRenderingContext) {
    if (this._textureId !== undefined) return this._textureId;

    const data = await this.canvas.GetValue();

    const textureId = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.canvas.width,
      this.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(data.data),
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    this._textureId = textureId!;
    return textureId;
  }

  async GetHueCanvasTexture() {
    const hue = this.item.item.hue || 0;
    if (hue === 0) return this.GetCanvasTexture();
    if (this._cachedHueCanvases[hue] !== undefined) return this._cachedHueCanvases[hue];
    const data = await this.canvas.GetValue();
    const matrix = this.createHueMatrix(hue);

    for (let i = 0; i < data.data.length; i += 4) {
      const rIdx = i;
      const gIdx = i + 1;
      const bIdx = i + 2;

      const r = data.data[rIdx];
      const g = data.data[gIdx];
      const b = data.data[bIdx];

      const [newR, newG, newB] = this.HueShift(r, g, b, matrix);

      data.data[rIdx] = newR;
      data.data[gIdx] = newG;
      data.data[bIdx] = newB;
    }

    const canvasTarget = document.createElement('canvas');
    canvasTarget.style.display = 'none';
    canvasTarget.width = this.canvas.width;
    canvasTarget.height = this.canvas.height;
    document.body.appendChild(canvasTarget);
    const ctx = canvasTarget.getContext('2d')!;
    ctx.putImageData(data, 0, 0);

    this._cachedHueCanvases[hue] = canvasTarget;

    canvasTarget.remove();
    return canvasTarget;
  }

  async GetCanvasTexture() {
    if (this._canvas !== undefined) return this._canvas;

    const data = await this.canvas.GetValue();

    const canvasTarget = document.createElement('canvas');
    canvasTarget.style.display = 'none';
    canvasTarget.width = this.canvas.width;
    canvasTarget.height = this.canvas.height;
    document.body.appendChild(canvasTarget);
    const ctx = canvasTarget.getContext('2d')!;
    ctx.putImageData(data, 0, 0);

    this._canvas = canvasTarget;
    canvasTarget.remove();
    return canvasTarget;
  }

  async GetImageData() {
    const data = await this.canvas.GetValue();
    return {
      data,
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  createHueMatrix(hue: number = 0) {
    const deg = (hue / 180) * Math.PI;

    const cosDeg = Math.cos(deg);
    const sinDeg = Math.sin(deg);

    const weight = 1 / 3;
    const sqrtWeight = Math.sqrt(weight);

    const a00 = cosDeg + (1.0 - cosDeg) * weight;
    const a01 = (1.0 - cosDeg) * weight - sqrtWeight * sinDeg;
    const a02 = (1.0 - cosDeg) * weight + sqrtWeight * sinDeg;

    const a10 = (1.0 - cosDeg) * weight + sqrtWeight * sinDeg;
    const a11 = cosDeg + (1.0 - cosDeg) * weight;
    const a12 = (1.0 - cosDeg) * weight - sqrtWeight * sinDeg;

    const a20 = (1.0 - cosDeg) * weight - sqrtWeight * sinDeg;
    const a21 = (1.0 - cosDeg) * weight + sqrtWeight * sinDeg;
    const a22 = cosDeg + (1.0 - cosDeg) * weight;

    return [a00, a01, a02, 0, a10, a11, a12, 0, a20, a21, a22, 0, 0, 0, 0, 1];
  }

  HueShift(r: number, g: number, b: number, matrix: number[]) {
    const newR = r * matrix[0] + g * matrix[1] + b * matrix[2];
    const newG = r * matrix[4] + g * matrix[5] + b * matrix[6];
    const newB = r * matrix[8] + g * matrix[9] + b * matrix[10];

    return [newR, newG, newB];
  }
}
