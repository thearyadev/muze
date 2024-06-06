import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "~/server/auth";


const handler = NextAuth(authOptions);
export {handler as GET, handler as POST}
