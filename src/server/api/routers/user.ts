import { createTRPCClient } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  isAuthenticated: publicProcedure.query(({ ctx }) => {
    if (!ctx.session || !ctx.session.user) return false;
    console.log(ctx.session)
    return true;
  }),
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(users)
        .values({ username: input.username, password: input.password });
    }),
});
