import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "~/server/auth";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// const handler = NextAuth(authOptions);
//
//
//

async function auth(req: NextRequest, res: NextResponse) {
  const protocol = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  process.env.NEXTAUTH_URL = `${protocol}://${host}/api/auth`; // thanks next-auth

  return await NextAuth(
    req as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
    authOptions,
  );
}

export { auth as GET, auth as POST };
