import ItemUtilities from 'maplestory/dist/Item/Utilities';
import IVector from 'maplestory/dist/PKG1/IVector';
import type { IGenerateMaxFrames } from './ICalculateMaxFrames';
import type { IRenderRequest } from './IRenderRequest';
import IGenerateRenderPlans from './Renderer';
import RenderPiece from './RenderPiece';
import { RenderPlan } from './RenderPlan';

export class AnimatedRenderPlan {
  OriginalRenderRequest: IRenderRequest;
  Canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  maxFrame: number;
  frameIndex: number;
  frames: RenderPlan[];
  equipOverrides?: Record<string, RenderPiece>;
  maxFramesCalculator: IGenerateMaxFrames;
  renderer: IGenerateRenderPlans;
  MaxFeetPosition: IVector;
  width: number;
  height: number;
  nextFrameTimeout: number = 0;
  _frameMs: number = 0;
  _lastDelta: number = 0;

  public get frame(): RenderPlan {
    return this.frames[this.frameIndex];
  }
  public set frame(value: RenderPlan) {
    const index = this.frames.indexOf(value);
    if (index === -1) throw new Error('Invalid frame specified, must be based off of the existing frames.');

    this.frameIndex = index;
  }

  constructor(
    renderer: IGenerateRenderPlans,
    maxFramesCalculator: IGenerateMaxFrames,
    request: IRenderRequest,
    equipOverrides?: Record<string, RenderPiece>,
  ) {
    this.OriginalRenderRequest = request;

    this.Canvas = document.createElement('canvas');
    this.Canvas.style.display = 'none';
    document.body.appendChild(this.Canvas);
    this.context = this.Canvas.getContext('2d')!;
    this.renderer = renderer;
    this.equipOverrides = equipOverrides;
    this.maxFramesCalculator = maxFramesCalculator;
  }

  async Prepare() {
    const selectedItemPositionById = Object.keys(this.OriginalRenderRequest.selectedItems).reduce((total, position) => {
      const itemId = this.OriginalRenderRequest.selectedItems[position].id;
      total[itemId.toString()] = position;

      return total;
    }, {} as Record<string, string>);

    const [maxFaceFrames, maxFrames] = await Promise.all([
      this.maxFramesCalculator.GetMaxFaceFrames(this.OriginalRenderRequest),
      this.maxFramesCalculator.GetMaxFrames(this.OriginalRenderRequest),
    ]);

    // TODO: Handle effects
    this.maxFrame = (maxFaceFrames + 1) * (maxFrames + 1);

    let timeOffset = this.OriginalRenderRequest.timeOffset || 0;
    const remainingTimeDelays = {} as Record<string, number>;
    let previousFrame = null as unknown as RenderPlan;

    const frameNumberTracker = {} as Record<string, number>;

    this.frames = [];

    for (let i = 0; i < this.maxFrame; ++i) {
      const frameRenderRequest = {
        ...this.OriginalRenderRequest,
      } as IRenderRequest;
      frameRenderRequest.frame = 0;
      frameRenderRequest.timeOffset = timeOffset;

      // Progress any timers and increment any frames
      if (previousFrame) {
        const elapsedTime = previousFrame.minimumDelay;

        Object.keys(remainingTimeDelays).forEach((itemId) => {
          const remainingDelay = (remainingTimeDelays[itemId] -= elapsedTime);
          if (remainingDelay <= 0) {
            if (!frameNumberTracker[itemId]) frameNumberTracker[itemId] = 1;
            else frameNumberTracker[itemId]++;
          }

          // If it's the body, increment the entire plan, otherwise increment the item's frame
          if (Number(itemId) <= 10000) {
            frameRenderRequest.frame = frameNumberTracker[itemId];
          } else {
            const position = selectedItemPositionById[itemId];
            frameRenderRequest.selectedItems[position] = {
              ...frameRenderRequest.selectedItems[position],
              frame: frameNumberTracker[itemId],
            };
          }
        });

        // console.log(`Elapsed: ${elapsedTime}, resulting frames: `, frameNumberTracker)
      }

      const frameRenderPlan = await this.renderer.GenerateRenderPlan(frameRenderRequest, this.equipOverrides);

      timeOffset += frameRenderPlan.minimumDelay;
      previousFrame = frameRenderPlan;

      // Reset any timers
      Object.keys(frameRenderPlan.loadedPieces.delays).forEach((itemId) => {
        let delay = frameRenderPlan.loadedPieces.delays[itemId];
        const remainingDelay = remainingTimeDelays[itemId];
        if (remainingDelay <= 0 || !remainingDelay) {
          // TODO: Do we handle blink here? Or somewhere else? I feel like somewhere else.
          // if (ItemUtilities.prototype.IsFaceId(Number(itemId))) {
          //   const position = selectedItemPositionById[itemId]
          //   const currentFrame = frameRenderRequest.selectedItems[position].frame
          // }

          remainingTimeDelays[itemId] = delay;
          if (!frameNumberTracker[itemId]) frameNumberTracker[itemId] = 0;
        }
      });

      // console.log(`Frame ${i} = ${frameRenderPlan.request.frame}`)
      this.frames[i] = frameRenderPlan;
    }

    // Alert and Stand poses play the animation forward and then backward
    // We reverse the animations, and skip the first and last, and then combine to achieve this
    // We skip first and last to prevent duplicate frames, similar to official
    const originalAction = this.OriginalRenderRequest.action;
    if (originalAction.startsWith('stand') || originalAction.startsWith('alert')) {
      const frameCopy = [...this.frames].reverse();
      frameCopy.shift();
      frameCopy.pop();
      this.frames.push.apply(this.frames, frameCopy);
      this.maxFrame = this.frames.length;
    }

    // Calculate a common size that works for all frames

    const feetPositions = this.frames.map((framePlan) => framePlan.feetCenter);

    this.MaxFeetPosition = {
      x: Math.max.apply(
        null,
        feetPositions.map((position) => position.x),
      ),
      y: Math.max.apply(
        null,
        feetPositions.map((position) => position.y),
      ),
    } as IVector;

    const maxFeetDifference = {
      x:
        this.MaxFeetPosition.x -
        Math.min.apply(
          null,
          feetPositions.map((position) => position.x),
        ),
      y:
        this.MaxFeetPosition.y -
        Math.min.apply(
          null,
          feetPositions.map((position) => position.y),
        ),
    } as IVector;

    // Determine and update correct width of the animated canvas
    const widths = [] as Array<number>;
    const heights = [] as Array<number>;
    this.frames.forEach((frame) => {
      widths.push(frame.bounds.size.x);
      heights.push(frame.bounds.size.y);
    });

    // Set the correct width, including the difference in feet, as that'll be adjusted further down the rendering path
    this.width = Math.max.apply(null, widths) + maxFeetDifference.x;
    this.height = Math.max.apply(null, heights) + maxFeetDifference.y;

    this.ReplaceCanvas(this.Canvas, this.context);

    // Set default frame and any final preparations
    this.frameIndex = 0;

    this.Canvas.remove();
    this.Canvas.style.display = 'block';
  }

  ReplaceCanvas(target: HTMLCanvasElement, context?: CanvasRenderingContext2D) {
    this.Canvas = target;
    target.width = this.width;
    target.height = this.height;

    if (!context) this.context = this.Canvas.getContext('2d')!;
    else this.context = context;
  }

  // Note: Advances the current frame as a side-effect
  async RenderSingleFrame() {
    const rendered = await this.frame.Render();

    const center = this.frame.feetCenter;
    const destinationOffset = {
      ...center,
    } as IVector;
    destinationOffset.x -= this.MaxFeetPosition.x;
    destinationOffset.y -= this.MaxFeetPosition.y;

    // console.log(`(${this.frameIndex})`, "Center:", center.x, center.y, "Offset: ", destinationOffset.x, destinationOffset.y, `(Width: ${this.frame.lockedPieces.body.canvas.width}, Origin: ${this.frame.lockedPieces.body.origin.x})`)

    this.context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);

    this.context.drawImage(rendered, -destinationOffset.x, -destinationOffset.y);

    this.frameIndex++;
    if (this.frameIndex >= this.maxFrame) this.frameIndex = 0;
  }

  async GetAllFrames() {
    return Promise.all(this.frames.map((frame) => frame.Render()));
  }

  async RenderLoop() {
    // await this.RenderSingleFrame();

    // this.nextFrameTimeout = setTimeout(() => {
    //   this.RenderLoop();
    // }, this.frame.minimumDelay);

    // return this.Canvas;

    this.nextFrameTimeout = requestAnimationFrame(async (delta) => {
      const deltaMs = delta - this._lastDelta;
      this._frameMs = this._frameMs + deltaMs;
      if (this._frameMs >= this.frame.minimumDelay) {
        this._frameMs = 0;
        await this.RenderSingleFrame();
      }
      this._lastDelta = delta;
      this.RenderLoop();
    });

    return this.Canvas;
  }

  async Stop() {
    // clearTimeout(this.nextFrameTimeout);
    cancelAnimationFrame(this.nextFrameTimeout);
  }
}
