"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { type z } from "zod";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { userAuthLoginSchema } from "@/lib/validations/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UserLoginFormProps = React.HTMLAttributes<HTMLDivElement>;

type FormData = z.infer<typeof userAuthLoginSchema>;

export function UserLoginForm({ className, ...props }: UserLoginFormProps) {
  const loginForm = useForm<FormData>({
    resolver: zodResolver(userAuthLoginSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = loginForm;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      if (signInResult?.error === "BannedError") {
        return toast.error("Your account has been disabled.", {
          description: "Please contact support to reinstate your account.",
        });
      }

      return toast.error("Something went wrong.", {
        description: "Your sign in request failed. Please try again.",
        action: {
          label: "Retry",
          onClick: () => void onSubmit(data),
        },
      });
    }

    toast.success("Welcome back!", {
      description: "You have been successfully signed in.",
    });

    // Redirect to the page the user came from
    return router.push("/home");
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...loginForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-col gap-2">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl id="email">
                      <Input
                        type="email"
                        id="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-col gap-2">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl id="password">
                      <Input
                        type="password"
                        id="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <button className={cn(buttonVariants())} disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with Email
            </button>
          </div>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            No account?{" "}
            <Link
              prefetch
              className="hover:text-brand underline underline-offset-4"
              href="/auth/register"
            >
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
