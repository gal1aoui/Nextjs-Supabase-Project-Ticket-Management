"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { resendVerificationAction, verificationAction } from "./actions";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading((prev) => !prev);
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    const { serverError } = await verificationAction(otp);

    if (serverError) {
      toast.error(serverError);
    }

    setIsLoading((prev) => !prev);
  };

  const resendVerificationEmail = async () => {
    const { serverError } = await resendVerificationAction();

    serverError ? toast.error(serverError) : toast.success("Code resent!");
  };

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center">
          <Logo />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email address</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={resendVerificationEmail}
            >
              Resend
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
