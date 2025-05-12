# @neurofinance/hooks

A collection of shared React hooks for NeuroFinance applications.

## Hooks

- `useLocalStorage`: A hook for persisting and retrieving data from localStorage
- `useSessionStorage`: A hook for managing session data in storage
- `useSession`: A hook for managing the current session
- `useSessionData`: A hook for accessing and manipulating session data
- `useSessionMessages`: A hook for managing chat messages in a session
- `useSessionManagement`: A hook for managing multiple sessions
- `useHtmlFileSelection`: A hook for selecting and managing HTML files

## Installation

This package is part of the NeuroFinance monorepo and is not published externally.

## Usage

```tsx
import { useLocalStorage } from '@neurofinance/hooks';

function MyComponent() {
  const [value, setValue] = useLocalStorage('my-key', 'default-value');
  
  return (
    <div>
      <p>Current value: {value}</p>
      <button onClick={() => setValue('new-value')}>
        Update Value
      </button>
    </div>
  );
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run development mode with watch
pnpm dev
``` 