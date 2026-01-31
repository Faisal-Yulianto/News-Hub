import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Nama harus terdiri dari minimal 2 karakter"),
    email: z.string().email("Alamat email tidak valid"),
    password: z
      .string()
      .min(6, "Kata sandi harus panjangnya minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi Kata Sandi harus setidaknya 6 karakter"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"], 
        message: "Kata sandi tidak cocok",
      });
    }
  });
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  password: z.string().min(6, "Kata sandi harus panjangnya minimal 6 karakter"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Kata sandi harus panjangnya minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi Kata Sandi harus setidaknya 6 karakter"),
  })
 .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"], 
        message: "Kata sandi tidak cocok",
      });
    }
  });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

