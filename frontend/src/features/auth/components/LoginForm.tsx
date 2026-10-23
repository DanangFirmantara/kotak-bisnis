import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { ActionButton } from '@/components/common/ActionButton'
import { CheckboxField } from '@/components/form/CheckboxField'
import { FormAlert } from '@/components/form/FormAlert'
import { PasswordField } from '@/components/form/PasswordField'
import { TextField } from '@/components/form/TextField'
import { useLogin } from '@/hooks/useLogin'
import { getErrorMessage } from '@/lib/api'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { loginSchema, type LoginInput } from '@/schemas/auth.schema'

const DEFAULT_VALUES: LoginInput = { email: '', password: '', remember: false }

/** Form login: validasi Zod per field, error submit di FormAlert, loading di tombol. Sukses → dashboard (useLogin). */
export function LoginForm() {
  const login = useLogin()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: DEFAULT_VALUES })

  const pending = login.isPending
  const onSubmit = handleSubmit((values) => login.mutate(values))

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={pending}>
      {/* fieldset disabled → semua input, checkbox & tombol terkunci selama submit (tanpa prop disabled satu-satu) */}
      <fieldset disabled={pending} className="flex flex-col gap-5">
        <legend className="sr-only">Data masuk</legend>

        <TextField
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          inputMode="email"
          placeholder="nama@bisnis.id"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          label="Kata sandi"
          icon={Lock}
          autoComplete="current-password"
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <CheckboxField
                label="Ingat saya"
                name={field.name}
                checked={field.value}
                onCheckedChange={(value) => field.onChange(value === true)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <Link
            to="/bantuan"
            className={cn(
              HIT_AREA,
              'rounded-sm text-sm font-semibold text-sage-dark outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
            )}
          >
            Lupa kata sandi?
          </Link>
        </div>

        <FormAlert message={login.isError ? getErrorMessage(login.error) : null} />

        <ActionButton type="submit" className="h-12 w-full">
          {pending ? (
            <>
              <Loader2 aria-hidden className="motion-safe:animate-spin" />
              <span>Memproses…</span>
            </>
          ) : (
            'Masuk'
          )}
        </ActionButton>
      </fieldset>
    </form>
  )
}
