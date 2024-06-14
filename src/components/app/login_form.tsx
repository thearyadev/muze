"use client";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2).max(256),
  password: z.string().min(2).max(256),
});

export default function LoginForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn("credentials", {
      username: values.username,
      password: values.password,
      callback: "/app/home",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel hidden>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-zinc-900"
                  placeholder="Username"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel hidden>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-zinc-900"
                  placeholder="Password"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit">Login</Button>
          <Button variant="link" onClick={() => {
            router.push("/register")
          }}>Register</Button>
        </div>
      </form>
    </Form>
  );
}
