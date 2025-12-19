import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .nonempty({ message: "Email is required" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .nonempty({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .nonempty({ message: "Name is required" })
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name must be less than 100 characters" }),
    email: z
      .email({ message: "Invalid email address" })
      .nonempty({ message: "Email is required" })
      .max(255, { message: "Email must be less than 255 characters" }),
    password: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().nonempty({ message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, { message: "OTP code must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP code must contain only numbers" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;

export type FormErrorProps = {
  email?:
    | {
        errors: string[];
      }
    | undefined;
  password?:
    | {
        errors: string[];
      }
    | undefined;
  name?:
    | {
        errors: string[];
      }
    | undefined;
  confirmPassword?:
    | {
        errors: string[];
      }
    | undefined;
};
