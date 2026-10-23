import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { IconButton } from '@/components/common/IconButton'
import { TextField, type TextFieldProps } from './TextField'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>

/** TextField kata sandi + tombol mata (tampilkan/sembunyikan). Kompatibel `register()`. */
export function PasswordField({ disabled, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...rest}
      disabled={disabled}
      type={visible ? 'text' : 'password'}
      trailing={
        <IconButton
          icon={visible ? EyeOff : Eye}
          label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          variant="ghost"
          size="sm"
          tooltipSide="top"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
        />
      }
    />
  )
}
