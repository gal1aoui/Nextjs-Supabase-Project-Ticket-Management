"use client";

import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { routes } from "@/app/routes";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FormErrorProps, LoginInput } from "@/types/authentication";
import { loginAction } from "./actions";

export default function Login() {
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<FormErrorProps>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading((prev) => !prev);
    e.preventDefault();
    setErrors({});
    const result = await loginAction(form);

    if (result?.error) {
      setErrors(result.error);
    }

    if (result?.supabaseError) {
      toast.error(result.supabaseError);
    }

    setIsLoading((prev) => !prev);
  };

  const handleProviderLogin = async (_provider: "google" | "github" | "microsoft") => {
    try {
      // await loginWithProvider(provider);
      toast.success("Welcome!");
      // router.push("/dashboard");
    } catch (_error) {
      toast.error("Authentication failed");
    }
  };

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center">
          <Logo />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Button
            variant="outline"
            onClick={() => handleProviderLogin("google")}
            disabled={isLoading}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleProviderLogin("github")}
            disabled={isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            onClick={() => handleProviderLogin("microsoft")}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => {
                  return {
                    ...prev,
                    email: e.target.value,
                  };
                })
              }
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.errors}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => {
                  return {
                    ...prev,
                    password: e.target.value,
                  };
                })
              }
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.errors}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href={routes.auth.register} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
