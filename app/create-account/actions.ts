"use server"

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato")

const checkPassword = ({password, confirmPassword}: {password: string, confirmPassword: string}) => password === confirmPassword

const checkUniqueEmail = async(email: string) => {
  const user = await db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  })
  return !Boolean(user)
}

const formSchema = z.object({
  username: z.string({
    invalid_type_error: "Username must be a string",
    required_error: "Where is my username?"
  })
  .toLowerCase()
  .trim()
  .refine(checkUsername, "potato is not allowed"),
  email: z.string().email().toLowerCase().refine(checkUniqueEmail, "This email is already taken"),
  password: z.string().min(PASSWORD_MIN_LENGTH).regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
  confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
}).refine(checkPassword, {
  message: "password should be same",
  path: ["confirmPassword"]
})

export async function createAccount(prevState: unknown, formData: FormData) {
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    const result = await formSchema.safeParseAsync(data)
    if (!result.success) {
      return result.error.flatten()
    } else {
      const hashPassword = await bcrypt.hash(result.data.password, 12)

      const user = await db.user.create({
        data: {
          username: result.data.username,
          email: result.data.email,
          password: hashPassword
        },
        select: {
          id: true
        }
      })

      console.log(user)
    }
}