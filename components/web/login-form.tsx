"use client"

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from 'sonner'
import { useTransition } from 'react'
import { Spinner } from '../ui/spinner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { loginSchema } from '@/app/schemas/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import z from 'zod'


export function LoginForm({

}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

 function onSubmit(value: z.infer<typeof loginSchema>) {
  startTransition(async () => {
    await authClient.signIn.email({
      email: value.email,
      password: value.password,
      fetchOptions: {
        onSuccess: () => {
          toast.success('Logged in successfully!')
          router.push('/dashboard/items')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  })
}


  return (
    <div
      className={cn(
        'flex flex-col gap-6 border border-dashed bg-background text-foreground p-4 sm:p-6 ',
      )}
  
    >
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
          onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>

              <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john.doe@example.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

               <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

      
              <Field>
                <Button type="submit" disabled={isPending}>{isPending ? <><Spinner /> Logging in...</> : 'Login'}</Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
