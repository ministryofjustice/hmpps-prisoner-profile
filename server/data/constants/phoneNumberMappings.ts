export interface PhoneNumberTypeMapping {
  description: string
  formValue: string
}

export const PhoneNumberTypeMappings: Record<string, PhoneNumberTypeMapping> = {
  HOME: { description: 'Home', formValue: 'home' },
  MOB: { description: 'Mobile', formValue: 'mobile' },
  BUS: { description: 'Business', formValue: 'business' },
}
