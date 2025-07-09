#!/usr/bin/env node

/**
 * Simple MCP Context Server Example
 * 
 * This is a simplified version that demonstrates the core concepts
 * without requiring the full MCP SDK installation.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';

// Context storage
const contextStore = new Map();

// Sample context data
const sampleContexts = [
  {
    id: '1',
    name: 'Project Overview',
    content: 'This is a Model Context Protocol (MCP) server that provides context management tools.',
    type: 'text',
    tags: ['project', 'overview'],
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'API Guidelines',
    content: 'When building APIs, always follow REST principles and use proper HTTP status codes.',
    type: 'text',
    tags: ['api', 'guidelines'],
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sample Code',
    content: `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);`,
    type: 'code',
    tags: ['javascript', 'example'],
    timestamp: new Date().toISOString(),
  },
];

// Initialize context store
sampleContexts.forEach(item => {
  contextStore.set(item.id, item);
});

// MCP Protocol handlers
const tools = [
  {
    name: 'add_context',
    description: 'Add a new context item to the store',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the context item' },
        content: { type: 'string', description: 'Content of the context item' },
        type: { type: 'string', enum: ['text', 'code', 'data'] },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'content', 'type'],
    },
  },
  {
    name: 'get_context',
    description: 'Retrieve a context item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the context item' },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_context',
    description: 'Search context items by query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', enum: ['text', 'code', 'data'] },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_context',
    description: 'List all context items',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'delete_context',
    description: 'Delete a context item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the context item' },
      },
      required: ['id'],
    },
  },
];

// Tool implementations
function addContext(args) {
  const { name, content, type, tags = [] } = args;
  
  if (!name || !content || !type) {
    throw new Error('Missing required fields: name, content, type');
  }

  const id = Date.now().toString();
  const item = {
    id,
    name,
    content,
    type,
    tags,
    timestamp: new Date().toISOString(),
  };

  contextStore.set(id, item);
  return { success: true, id, message: `Context item added with ID: ${id}` };
}

function getContext(args) {
  const { id } = args;
  
  if (!id) {
    throw new Error('Missing required field: id');
  }

  const item = contextStore.get(id);
  if (!item) {
    throw new Error(`Context item not found: ${id}`);
  }

  return item;
}

function searchContext(args) {
  const { query, type, tags } = args;
  
  if (!query) {
    throw new Error('Missing required field: query');
  }

  const results = [];
  const searchTerm = query.toLowerCase();

  for (const item of contextStore.values()) {
    const matchesQuery = 
      item.name.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    const matchesType = !type || item.type === type;
    const matchesTags = !tags || tags.length === 0 || 
      tags.some(tag => item.tags.includes(tag));

    if (matchesQuery && matchesType && matchesTags) {
      results.push(item);
    }
  }

  return { results, count: results.length };
}

function listContext() {
  const items = Array.from(contextStore.values());
  return { items, count: items.length };
}

function deleteContext(args) {
  const { id } = args;
  
  if (!id) {
    throw new Error('Missing required field: id');
  }

  const item = contextStore.get(id);
  if (!item) {
    throw new Error(`Context item not found: ${id}`);
  }

  contextStore.delete(id);
  return { success: true, message: `Context item deleted: ${item.name}` };
}

// Protocol message handlers
function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;
  
  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Invalid Request' }
    };
  }

  try {
    let result;
    
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
          },
          serverInfo: {
            name: 'mcp-context-server',
            version: '1.0.0',
          },
        };
        break;

      case 'tools/list':
        result = { tools };
        break;

      case 'tools/call':
        const { name, arguments: args } = params;
        
        switch (name) {
          case 'add_context':
            result = { content: [{ type: 'text', text: JSON.stringify(addContext(args), null, 2) }] };
            break;
          case 'get_context':
            result = { content: [{ type: 'text', text: JSON.stringify(getContext(args), null, 2) }] };
            break;
          case 'search_context':
            result = { content: [{ type: 'text', text: JSON.stringify(searchContext(args), null, 2) }] };
            break;
          case 'list_context':
            result = { content: [{ type: 'text', text: JSON.stringify(listContext(), null, 2) }] };
            break;
          case 'delete_context':
            result = { content: [{ type: 'text', text: JSON.stringify(deleteContext(args), null, 2) }] };
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        break;

      case 'resources/list':
        const resources = Array.from(contextStore.values()).map(item => ({
          uri: `context://${item.id}`,
          name: item.name,
          description: `Context item: ${item.name} (${item.type})`,
          mimeType: 'text/plain',
        }));
        result = { resources };
        break;

      case 'resources/read':
        const uri = params.uri;
        const match = uri.match(/^context:\/\/(.+)$/);
        
        if (!match) {
          throw new Error(`Invalid resource URI: ${uri}`);
        }

        const resourceId = match[1];
        const item = contextStore.get(resourceId);
        
        if (!item) {
          throw new Error(`Context item not found: ${resourceId}`);
        }

        result = {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: `Name: ${item.name}\nType: ${item.type}\nTags: ${item.tags.join(', ')}\nTimestamp: ${item.timestamp}\n\nContent:\n${item.content}`,
          }],
        };
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return {
      jsonrpc: '2.0',
      id,
      result,
    };

  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error.message,
      },
    };
  }
}

// Main server logic
function startServer() {
  console.error('MCP Context Server starting...');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const message = JSON.parse(line);
        const response = handleMessage(message);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  });

  process.stdin.on('end', () => {
    console.error('MCP Context Server stopping...');
    process.exit(0);
  });
}

// Start the server
startServer();
