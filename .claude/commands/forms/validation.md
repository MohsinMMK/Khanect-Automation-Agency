---
description: Form validation patterns and helpers
allowed-tools: Read, Write, Edit, Glob
argument-hint: [field-type]
---

# Khanect AI - Form Validation

## File Location
`src/utils/validation.ts`

## Validation Functions

```tsx
// Email (RFC 5322)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone (10-15 digits, international)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

// Name (2-100 chars, letters/spaces/hyphens)
export function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s-']+$/.test(name);
}
```

## Form State Pattern

```tsx
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  website: '',
  message: '',
});

const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (name: string, value: string) => {
  let error = '';
  switch (name) {
    case 'email':
      if (!isValidEmail(value)) error = 'Please enter a valid email';
      break;
    case 'phone':
      if (!isValidPhone(value)) error = 'Please enter a valid phone number';
      break;
    // ... more cases
  }
  setErrors(prev => ({ ...prev, [name]: error }));
};
```

## Rate Limiting Pattern

```tsx
const RATE_LIMIT_KEY = 'lastSubmission';
const RATE_LIMIT_MS = 60000; // 60 seconds

const checkRateLimit = (): boolean => {
  const last = sessionStorage.getItem(RATE_LIMIT_KEY);
  if (last && Date.now() - parseInt(last) < RATE_LIMIT_MS) {
    return false; // Rate limited
  }
  return true;
};

const recordSubmission = () => {
  sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
};
```

## Key Files
- `src/utils/validation.ts` - Validation functions
- `src/components/LandingPage.tsx` - Contact form implementation

## Task: $ARGUMENTS
