# @neurofinance/types

Shared TypeScript types for the NeuroFinance application.

## Overview

This package contains centralized type definitions used across the NeuroFinance application. By maintaining types in a single package, we ensure consistency across the codebase and reduce duplication.

## Structure

- `common.ts` - Common utility types used throughout the application
- `api.ts` - API-related types (requests, responses, data models)
- `components.ts` - React component prop types

## Usage

```typescript
// Import specific types
import { Session, Message } from '@neurofinance/types';
import { ChatContainerProps } from '@neurofinance/types';
import { HtmlFile } from '@neurofinance/types';

// Or import everything
import * as Types from '@neurofinance/types';
```

## Installation

This package is part of the NeuroFinance monorepo and can be used by adding it as a dependency in your package.json:

```json
{
  "dependencies": {
    "@neurofinance/types": "workspace:*"
  }
}
``` 