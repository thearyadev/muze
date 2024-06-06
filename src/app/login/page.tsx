import { redirect } from "next/navigation";
import LoginForm from "~/components/app/login_form";
import { api } from "~/trpc/server";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type LoginInput = {
  username: string;
  password: string;
};

type PageProps = {
  searchParams: { error?: string };
};

export default async function LoginPage({ searchParams }: PageProps) {
  const isAuthenticated = await api.user.isAuthenticated();
  if (isAuthenticated) {
    redirect("/app/home");
  }

  return (
    <div className="flex h-screen items-center justify-center justify-items-center">
      <Card className="w-[350px] border-0 bg-zinc-700">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm error={searchParams.error}></LoginForm>
        </CardContent>
      </Card>
    </div>
  );
}
