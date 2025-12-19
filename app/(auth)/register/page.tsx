"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { routes } from "@/app/routes";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormErrorProps, RegisterInput } from "@/types/authentication";
import { registerAction } from "./actions";

const formatErrorMessages = (errors: string[]) => {
  return errors.map((error, index) => (
    <span key={`${index}: ${error}`}>
      {error}
      {index < errors.length - 1 && <br />}
    </span>
  ));
};

export default function Register() {
  const [form, setForm] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrorProps>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading((prev) => !prev);
    e.preventDefault();
    setErrors({});

    const { error, serverError } = await registerAction(form);

    if (error) {
      setErrors(error);
    }

    if (serverError) {
      toast.error(serverError);
    }

    setIsLoading((prev) => !prev);
  };

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center">
          <Logo />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => {
                  return {
                    ...prev,
                    name: e.target.value,
                  };
                })
              }
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.errors}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
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
              name="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => {
                  return {
                    ...prev,
                    name: e.target.value,
                  };
                })
              }
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {formatErrorMessages(errors.password.errors)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => {
                  return {
                    ...prev,
                    name: e.target.value,
                  };
                })
              }
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.errors}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
