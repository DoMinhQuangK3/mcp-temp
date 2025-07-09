# MCP Context Server Example

This repository contains a complete example of a Model Context Protocol (MCP) server that provides context management tools. The server allows you to store, retrieve, search, and manage contextual information.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol that allows AI assistants to access external tools and resources in a consistent way. This server implements the MCP specification to provide context management capabilities.

## Features

### Tools Available

1. **add_context** - Add new context items with name, content, type, and tags
2. **get_context** - Retrieve specific context items by ID
3. **search_context** - Search through context items by query, type, or tags
4. **list_context** - List all stored context items
5. **delete_context** - Remove context items by ID

### Resources Available

Context items are also exposed as MCP resources with URIs like `context://item-id`, allowing direct access to context data.

## Files in this Example

- `src/index.ts` - Full TypeScript implementation with MCP SDK
- `src/simple-server.js` - Simplified JavaScript implementation without external dependencies
- `package.json` - Node.js package configuration
- `tsconfig.json` - TypeScript configuration
- `mcp-config.json` - Example MCP client configuration
- `test.js` - Simple test script
- `install.bat` - Windows installation script

## Quick Start

### Option 1: Using the Simple Server (No Dependencies)

```bash
# Run the simple server directly
node src/simple-server.js
```

### Option 2: Using the Full TypeScript Implementation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

## Testing the Server

You can test the server using the provided test script:

```bash
node test.js
```

Or manually test by sending JSON-RPC messages to the server:

### Example: List Available Tools

Input:
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

### Example: Add Context Item

Input:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "add_context",
    "arguments": {
      "name": "Authentication Flow",
      "content": "Users authenticate using OAuth 2.0 with JWT tokens",
      "type": "text",
      "tags": ["auth", "security"]
    }
  }
}
```

### Example: Search Context

Input:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_context",
    "arguments": {
      "query": "authentication",
      "type": "text"
    }
  }
}
```

## Using with MCP Clients

This server can be integrated with any MCP-compatible client. Here's an example configuration:

```json
{
  "mcpServers": {
    "context-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-context-server"
    }
  }
}
```

## Sample Context Data

The server comes pre-loaded with sample context items:

1. **Project Overview** - General information about the MCP server
2. **API Guidelines** - Best practices for API development
3. **Sample Code** - Example TypeScript/JavaScript code

## Context Item Structure

Each context item has the following structure:

```typescript
interface ContextItem {
  id: string;           // Unique identifier
  name: string;         // Human-readable name
  content: string;      // The actual content
  type: 'text' | 'code' | 'data';  // Content type
  tags: string[];       // Tags for categorization
  timestamp: string;    // ISO timestamp
}
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Project Structure

```
mcp-context-server/
├── src/
│   ├── index.ts          # Main TypeScript server
│   └── simple-server.js  # Simplified JavaScript server
├── dist/                 # Compiled output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── mcp-config.json       # Example MCP configuration
└── README.md            # This file
```

## Error Handling

The server includes comprehensive error handling:

- Validation of required parameters
- Proper error responses following MCP protocol
- Graceful handling of invalid requests

## Contributing

This is an example implementation. Feel free to extend it with additional features:

- Persistence to file system or database
- More sophisticated search capabilities
- Context item versioning
- Access control and permissions
- Integration with external knowledge bases

## License

MIT License - feel free to use this example as a starting point for your own MCP servers.
