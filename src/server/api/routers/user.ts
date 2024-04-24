import { createTRPCClient } from "@trpc/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

// export const postRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ text: z.string() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input.text}`,
//       };
//     }),

//   create: publicProcedure
//     .input(z.object({ name: z.string().min(1) }))
//     .mutation(async ({ ctx, input }) => {
//       // simulate a slow db call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       await ctx.db.insert(posts).values({
//         name: input.name,
//       });
//     }),

//   getLatest: publicProcedure.query(({ ctx }) => {
//     return ctx.db.query.posts.findFirst({
//       orderBy: (posts, { desc }) => [desc(posts.createdAt)],
//     });
//   }),
// });
//

export const userRouter = createTRPCRouter({
  userList: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        password: false,
      },
    });
  }),
  createUser: publicProcedure
    .input(
      z.object({ username: z.string().min(1), password: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        (
          await ctx.db.query.users.findMany({
            where: (users, { eq }) => eq(users.username, input.username),
          })
        ).length == 0
      ) {
        await ctx.db.insert(users).values({
          username: input.username,
          password: input.password,
        });
        return { success: true };
      }
      throw new Error("User already exists")
    }),
});
