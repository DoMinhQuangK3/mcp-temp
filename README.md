# MCP Context Server

This is an example Model Context Protocol (MCP) server that provides context management tools. It allows you to store, retrieve, and manage contextual information that can be used by AI assistants and other applications.

## Features

- **Add Context**: Store new context items with name, content, type, and tags
- **Get Context**: Retrieve specific context items by ID
- **Search Context**: Search through context items by name, content, or tags
- **List Context**: View all stored context items
- **Delete Context**: Remove context items by ID
- **Resources**: Access context items as MCP resources

## Installation

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

## Development

For development with auto-reload:
```bash
npm run dev
```

## Tools Available

### add_context
Add a new context item to the store.

**Parameters:**
- `name` (required): Name of the context item
- `content` (required): Content of the context item
- `type` (required): Type of the context item ('text', 'code', 'data')
- `tags` (optional): Array of tags for categorizing the context item

### get_context
Retrieve a context item by ID.

**Parameters:**
- `id` (required): ID of the context item to retrieve

### search_context
Search context items by name, content, or tags.

**Parameters:**
- `query` (required): Search query
- `type` (optional): Filter by type ('text', 'code', 'data')
- `tags` (optional): Array of tags to filter by

### list_context
List all context items in the store.

**Parameters:** None

### delete_context
Delete a context item by ID.

**Parameters:**
- `id` (required): ID of the context item to delete

## Usage with MCP Client

This server can be used with any MCP-compatible client. The server communicates over stdio and provides both tools and resources.

### Example Usage

1. **Adding Context:**
```json
{
  "name": "add_context",
  "arguments": {
    "name": "Authentication Flow",
    "content": "Users authenticate using OAuth 2.0 with JWT tokens",
    "type": "text",
    "tags": ["auth", "security"]
  }
}
```

2. **Searching Context:**
```json
{
  "name": "search_context",
  "arguments": {
    "query": "authentication",
    "type": "text"
  }
}
```

3. **Getting Context:**
```json
{
  "name": "get_context",
  "arguments": {
    "id": "1"
  }
}
```

## Resources

Context items are also available as MCP resources with URIs in the format:
```
context://<item-id>
```

## Sample Data

The server comes with sample context items including:
- Project Overview
- API Guidelines
- Sample Code

These can be used to test the functionality immediately after starting the server.
