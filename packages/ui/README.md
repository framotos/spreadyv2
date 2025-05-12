# @neurofinance/ui

A shared UI component library for NeuroFinance applications.

## Components

- `Button`: A customizable button component with various styles and states
- `Card`: A container component for content with different variants
- `Input`: A form input component with label and error handling
- `ChatInput`: A specialized input for chat interfaces
- `ChatMessage`: A component for displaying chat messages with HTML file support
- `Sidebar`: A navigation sidebar for session management
- `NavbarItem`: A navigation item for the sidebar

## Installation

This package is part of the NeuroFinance monorepo and is not published externally.

## Usage

```tsx
import { Button, Card, Input } from '@neurofinance/ui';

function MyComponent() {
  return (
    <Card variant="bordered" padding="md">
      <h2>Login Form</h2>
      <Input 
        label="Email" 
        type="email" 
        placeholder="Enter your email" 
      />
      <Button variant="primary" size="md">
        Submit
      </Button>
    </Card>
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