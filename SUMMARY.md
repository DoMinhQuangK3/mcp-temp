# MCP Context Server - Complete Example

## Overview

This is a complete working example of a Model Context Protocol (MCP) server that provides context management tools. The server allows you to store, retrieve, search, and manage contextual information.

## What Was Created

### Core Files
- **`src/index.ts`** - Full TypeScript implementation using MCP SDK
- **`src/simple-server.js`** - Simplified JavaScript implementation (no external dependencies)
- **`package.json`** - Node.js package configuration with dependencies
- **`tsconfig.json`** - TypeScript configuration

### Documentation
- **`README.md`** - Basic setup and usage instructions
- **`EXAMPLE.md`** - Comprehensive documentation with examples
- **`mcp-config.json`** - Example MCP client configuration

### Testing & Utilities
- **`test.js`** - Simple test script
- **`test-server.js`** - Advanced test script with multiple test cases
- **`install.bat`** - Windows installation script

### Configuration
- **`.gitignore`** - Git ignore file
- **`mcp-config.json`** - Example MCP client configuration

## Key Features

### 🔧 Tools Available
1. **add_context** - Add new context items
2. **get_context** - Retrieve context by ID
3. **search_context** - Search through context items
4. **list_context** - List all context items
5. **delete_context** - Remove context items

### 📚 Resources Available
- Context items exposed as MCP resources with URIs like `context://item-id`

### 🗄️ Pre-loaded Sample Data
- Project Overview
- API Guidelines
- Sample Code

## Quick Start

### Option 1: Simple Server (No Dependencies)
```bash
node src/simple-server.js
```

### Option 2: Full TypeScript Implementation
1. Run `install.bat` (Windows) or manually install dependencies
2. Build with `npm run build`
3. Run with `npm start`

## Testing

Run the test script:
```bash
node test-server.js
```

## Example Usage

### Adding Context
```json
{
  "jsonrpc": "2.0",
  "id": 1,
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

### Searching Context
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_context",
    "arguments": {
      "query": "authentication"
    }
  }
}
```

## Integration with MCP Clients

Use the configuration in `mcp-config.json`:
```json
{
  "mcpServers": {
    "context-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "d:/example/mcp-temp"
    }
  }
}
```

## Next Steps

1. **Install Dependencies**: Run `install.bat` or use npm directly
2. **Test the Server**: Run `node test-server.js`
3. **Integrate with MCP Client**: Use the configuration provided
4. **Extend Features**: Add persistence, more search options, etc.

This example provides a solid foundation for building your own MCP servers with context management capabilities!
