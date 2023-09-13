import type { IRenderRequest } from './IRenderRequest';
import RenderPiece from './RenderPiece';
import { RenderPlan } from './RenderPlan';
export interface IGenerateRenderPlans {
  GenerateRenderPlan(request: IRenderRequest, equipOverrides?: Record<string, RenderPiece>): Promise<RenderPlan>;
}
