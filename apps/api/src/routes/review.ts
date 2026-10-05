import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ReviewController } from "../controllers/ReviewController.js";

const controller = new ReviewController();

export async function reviewRoutes(fastify: FastifyInstance) {
  // GET /applications/:id/review — fetch review details
  fastify.get<{ Params: { id: string } }>(
    "/:id/review",
    async (request, reply) => {
      const result = await controller.getReview(request.params.id);
      if (!result) return reply.status(404).send({ error: "Application not found" });
      return result;
    },
  );

  // POST /applications/:id/approve — approve for submission
  fastify.post<{ Params: { id: string } }>(
    "/:id/approve",
    async (request, reply) => {
      const result = await controller.approve(request.params.id);
      if (!result) return reply.status(404).send({ error: "Application not found" });
      return result;
    },
  );

  // POST /applications/:id/reject — reject (cancel) the application
  fastify.post<{ Params: { id: string } }>(
    "/:id/reject",
    async (request, reply) => {
      const result = await controller.reject(request.params.id);
      if (!result) return reply.status(404).send({ error: "Application not found" });
      return result;
    },
  );
}
