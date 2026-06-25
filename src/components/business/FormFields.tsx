import { Input, Text, Textarea, View } from '@tarojs/components'
import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  desc?: string
  children: ReactNode
}

interface BaseFieldProps {
  label: string
  value: string
  placeholder?: string
  required?: boolean
  onChange: (value: string) => void
}

interface FormTextFieldProps extends BaseFieldProps {
  type?: 'text' | 'number' | 'idcard' | 'digit'
}

export function FormSection({ title, desc, children }: FormSectionProps) {
  return (
    <View className="rounded-lg bg-white p-4 shadow-soft">
      <View className="flex items-center gap-2">
        <View className="h-4 w-1 rounded bg-gold" />
        <Text className="block text-base font-bold text-ink">{title}</Text>
      </View>
      {desc ? <Text className="mt-2 block text-sm leading-6 text-muted">{desc}</Text> : null}
      <View className="mt-4 grid gap-3">{children}</View>
    </View>
  )
}

export function FormTextField({
  label,
  value,
  placeholder,
  required = false,
  type = 'text',
  onChange
}: FormTextFieldProps) {
  return (
    <View>
      <Text className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? <Text className="text-[#E53E3E]"> *</Text> : null}
      </Text>
      <View className="rounded-lg border border-line bg-canvas px-3 py-3">
        <Input
          className="min-h-[28px] text-sm text-ink"
          type={type}
          value={value}
          placeholder={placeholder}
          placeholderClass="text-muted"
          onInput={(event) => onChange(event.detail.value)}
        />
      </View>
    </View>
  )
}

export function FormTextareaField({ label, value, placeholder, required = false, onChange }: BaseFieldProps) {
  return (
    <View>
      <Text className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? <Text className="text-[#E53E3E]"> *</Text> : null}
      </Text>
      <View className="rounded-lg border border-line bg-canvas px-3 py-3">
        <Textarea
          className="min-h-[92px] w-full text-sm leading-6 text-ink"
          value={value}
          placeholder={placeholder}
          placeholderClass="text-muted"
          maxlength={500}
          onInput={(event) => onChange(event.detail.value)}
        />
      </View>
    </View>
  )
}
