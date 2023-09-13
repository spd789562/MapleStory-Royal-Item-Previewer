import type { IRenderRequest } from './IRenderRequest';
export interface IGenerateMaxFrames {
  GetMaxFrames(request: IRenderRequest, action?: String): Promise<number>;
  GetMaxFaceFrames(request: IRenderRequest, action?: String): Promise<number>;
}
