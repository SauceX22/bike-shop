"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
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
import { userAuthRegisterSchema } from "@/lib/validations/auth";
import { api } from "@/trpc/client";
import Link from "next/link";
import { toast } from "sonner";

type UserRegisterFormProps = React.HTMLAttributes<HTMLDivElement>;

type FormData = z.infer<typeof userAuthRegisterSchema>;

export function UserRegisterForm({
  className,
  ...props
}: UserRegisterFormProps) {
  const registerForm = useForm<FormData>({
    resolver: zodResolver(userAuthRegisterSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = registerForm;

  const router = useRouter();

  const { mutateAsync: registerUser, isLoading } =
    api.user.register.useMutation({
      onError(err) {
        toast.error("Something went wrong.", {
          description: err.message,
        });
      },
      onSuccess(data, variables, context) {
        toast.success("Welcome to the club!", {
          description: "You have been successfully registered.",
        });

        // Redirect to the page the user came from
        router.push("/auth/login");
      },
    });

  async function onSubmit(data: FormData) {
    await registerUser(data);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...registerForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-2 flex flex-col gap-2">
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl id="name">
                      <Input
                        type="text"
                        id="name"
                        autoCapitalize="words"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
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
                control={registerForm.control}
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
              Register with Email
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
            Already have an account?{" "}
            <Link
              prefetch
              className="hover:text-brand underline underline-offset-4"
              href="/auth/login"
            >
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
