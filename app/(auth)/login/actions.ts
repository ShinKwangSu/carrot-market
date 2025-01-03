"use server"

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants"
import db from "@/lib/db"
import getSession from "@/lib/session"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { z } from "zod"

const checkEmailExist = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  })
  return Boolean(user)
}

const formSchema = z.object({
  email: z.string().email().toLowerCase().refine(checkEmailExist, "An account with this email does not exist"),
  password: z.string({
    required_error: "Password is require"
  }).min(PASSWORD_MIN_LENGTH).regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR)
})

export async function login(prevState: unknown, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password")
  }
  const result = await formSchema.spa(data)
  if (!result.success) {
    return result.error.flatten()
  } else {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email
      },
      select: {
        id: true,
        password: true
      }
    })
    const ok = await bcrypt.compare(result.data.password, user!.password ?? "xxx")

    if (ok) {
      const session = await getSession()
      session.id = user!.id
      await session.save()
      redirect("/profile")
    } else {
      return {
        fieldErrors: {
          password: ["Wrong password"],
          email: []
        }
      }
    }
  }
}