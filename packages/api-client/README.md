# @neurofinance/api-client

A shared API client package for NeuroFinance applications.

## Features

- Centralized API communication
- Authentication handling
- Type-safe API requests and responses
- Session management
- Message handling
- Caching support

## Installation

This package is part of the NeuroFinance monorepo and can be used by adding it as a dependency in your package.json:

```json
{
  "dependencies": {
    "@neurofinance/api-client": "workspace:*"
  }
}
```

## Usage

```typescript
import { createApiClient, ApiService } from '@neurofinance/api-client';

// Create an API client with authentication
const getToken = async () => {
  // Get token from your auth provider
  return 'your-access-token';
};

const apiClient = createApiClient({ 
  baseUrl: 'http://localhost:8000',
  getAccessToken: getToken
});

// Create API service
const apiService = new ApiService(apiClient);

// Use the API service
const sessions = await apiService.getSessions();
```

## API Reference

### Client

- `createApiClient(config)`: Creates an authenticated API client
- `createPublicApiClient(baseUrl)`: Creates a public API client without authentication

### Services

- `ApiService`: Main service class for interacting with the API
  - `getSessions()`: Get all user sessions
  - `getSessionMessages(sessionId)`: Get messages for a session
  - `createSession(sessionId)`: Create a new session
  - `updateSession(sessionId, htmlFiles, outputFolder, lastMessage)`: Update a session
  - `addMessage(sessionId, content, sender)`: Add a message to a session
  - `askQuestion(sessionId, question)`: Ask a question to the AI agent
  - `checkHealth()`: Check API health 