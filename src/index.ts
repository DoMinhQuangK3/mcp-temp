#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
  ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';

// Context storage for the server
interface ContextItem {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'code' | 'data';
  tags: string[];
  timestamp: Date;
  created: Date;
  updated: Date;
}

// Type definitions for tool arguments
interface AddContextArgs {
  name: string;
  content: string;
  type: 'text' | 'code' | 'data';
  tags?: string[];
}

interface GetContextArgs {
  id: string;
}

interface SearchContextArgs {
  query: string;
  type?: 'text' | 'code' | 'data';
  tags?: string[];
  limit?: number;
}

interface DeleteContextArgs {
  id: string;
}

interface UpdateContextArgs {
  id: string;
  name?: string;
  content?: string;
  type?: 'text' | 'code' | 'data';
  tags?: string[];
}

// Utility function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

class ContextServer {
  private server: Server;
  private contextStore: Map<string, ContextItem> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-context-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.initializeDefaultContext();
  }

  private initializeDefaultContext() {
    // Add some sample context items
    const now = new Date();
    const sampleContexts: ContextItem[] = [
      {
        id: '1',
        name: 'Project Overview',
        content: 'This is a Model Context Protocol (MCP) server that provides context management tools. It allows storing, retrieving, and managing contextual information.',
        type: 'text',
        tags: ['project', 'overview'],
        timestamp: now,
        created: now,
        updated: now,
      },
      {
        id: '2',
        name: 'API Guidelines',
        content: 'When building APIs, always follow REST principles, use proper HTTP status codes, and implement proper error handling.',
        type: 'text',
        tags: ['api', 'guidelines', 'best-practices'],
        timestamp: now,
        created: now,
        updated: now,
      },
      {
        id: '3',
        name: 'Sample Code',
        content: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Usage
const message = greet("World");
console.log(message);`,
        type: 'code',
        tags: ['typescript', 'example'],
        timestamp: now,
        created: now,
        updated: now,
      },
    ];

    sampleContexts.forEach(item => {
      this.contextStore.set(item.id, item);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_context',
            description: 'Add a new context item to the store',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the context item',
                },
                content: {
                  type: 'string',
                  description: 'Content of the context item',
                },
                type: {
                  type: 'string',
                  enum: ['text', 'code', 'data'],
                  description: 'Type of the context item',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags for categorizing the context item',
                },
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
                id: {
                  type: 'string',
                  description: 'ID of the context item to retrieve',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'search_context',
            description: 'Search context items by name, content, or tags',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                type: {
                  type: 'string',
                  enum: ['text', 'code', 'data'],
                  description: 'Filter by type (optional)',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags (optional)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10)',
                  minimum: 1,
                  maximum: 100,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_context',
            description: 'List all context items',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'delete_context',
            description: 'Delete a context item by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID of the context item to delete',
                },
              },
              required: ['id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_context':
            return await this.addContext(args);
          case 'get_context':
            return await this.getContext(args);
          case 'search_context':
            return await this.searchContext(args);
          case 'list_context':
            return await this.listContext();
          case 'delete_context':
            return await this.deleteContext(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources: Resource[] = Array.from(this.contextStore.values()).map(item => ({
        uri: `context://${item.id}`,
        name: item.name,
        description: `Context item: ${item.name} (${item.type})`,
        mimeType: item.type === 'code' ? 'text/plain' : 'text/plain',
      }));

      return { resources };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const uri = request.params.uri;
      const match = uri.match(/^context:\/\/(.+)$/);
      
      if (!match) {
        throw new Error(`Invalid resource URI: ${uri}`);
      }

      const id = match[1];
      const item = this.contextStore.get(id);
      
      if (!item) {
        throw new Error(`Context item not found: ${id}`);
      }

      const result: ReadResourceResult = {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `Name: ${item.name}\nType: ${item.type}\nTags: ${item.tags.join(', ')}\nTimestamp: ${item.timestamp.toISOString()}\n\nContent:\n${item.content}`,
          },
        ],
      };

      return result;
    });
  }

  private async addContext(args: AddContextArgs): Promise<CallToolResult> {
    const { name, content, type, tags = [] } = args;
    
    if (!name || !content || !type) {
      throw new Error('Missing required fields: name, content, type');
    }

    // Validate type
    if (!['text', 'code', 'data'].includes(type)) {
      throw new Error('Invalid type. Must be one of: text, code, data');
    }

    // Validate content size (max 50KB)
    if (content.length > 50000) {
      throw new Error('Content too large. Maximum size is 50KB');
    }

    const id = generateId();
    const now = new Date();
    const item: ContextItem = {
      id,
      name,
      content,
      type,
      tags,
      timestamp: now,
      created: now,
      updated: now,
    };

    this.contextStore.set(id, item);

    return {
      content: [
        {
          type: 'text',
          text: `Context item added successfully with ID: ${id}`,
        },
      ],
    };
  }

  private async getContext(args: GetContextArgs): Promise<CallToolResult> {
    const { id } = args;
    
    if (!id) {
      throw new Error('Missing required field: id');
    }

    const item = this.contextStore.get(id);
    if (!item) {
      throw new Error(`Context item not found: ${id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(item, null, 2),
        },
      ],
    };
  }

  private async searchContext(args: SearchContextArgs): Promise<CallToolResult> {
    const { query, type, tags, limit = 10 } = args;
    
    if (!query) {
      throw new Error('Missing required field: query');
    }

    const results: ContextItem[] = [];
    const searchTerm = query.toLowerCase();

    for (const item of this.contextStore.values()) {
      // Check if item matches search criteria
      const matchesQuery = 
        item.name.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      const matchesType = !type || item.type === type;
      const matchesTags = !tags || tags.length === 0 || 
        tags.some((tag: string) => item.tags.includes(tag));

      if (matchesQuery && matchesType && matchesTags) {
        results.push(item);
      }

      // Apply limit
      if (results.length >= limit) {
        break;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} matching context items:\n\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  private async listContext(): Promise<CallToolResult> {
    const items = Array.from(this.contextStore.values());
    
    return {
      content: [
        {
          type: 'text',
          text: `Total context items: ${items.length}\n\n${JSON.stringify(items, null, 2)}`,
        },
      ],
    };
  }

  private async deleteContext(args: DeleteContextArgs): Promise<CallToolResult> {
    const { id } = args;
    
    if (!id) {
      throw new Error('Missing required field: id');
    }

    const item = this.contextStore.get(id);
    if (!item) {
      throw new Error(`Context item not found: ${id}`);
    }

    this.contextStore.delete(id);

    return {
      content: [
        {
          type: 'text',
          text: `Context item deleted successfully: ${item.name}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Context Server running on stdio');
  }
}

// Start the server
const server = new ContextServer();
server.run().catch(console.error);
