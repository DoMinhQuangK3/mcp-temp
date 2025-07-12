/**
 * Integration Test for MCP Context Server
 * 
 * This test validates the actual MCP server implementation by running it
 * and testing the protocol compliance and tool functionality.
 */

import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface MCPMessage {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: any;
}

class MCPTestClient {
  private process: ChildProcess | null = null;
  private messageId = 1;
  private responses: Map<number, MCPResponse> = new Map();

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Build the project first
      this.process = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      if (!this.process) {
        reject(new Error('Failed to start MCP server'));
        return;
      }

      this.process.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line: string) => line.trim());
        
        for (const line of lines) {
          try {
            const response = JSON.parse(line) as MCPResponse;
            this.responses.set(response.id, response);
          } catch (e) {
            // Ignore non-JSON output
          }
        }
      });

      this.process.stderr?.on('data', (data) => {
        // Server ready message comes via stderr
        if (data.toString().includes('MCP Context Server running')) {
          resolve();
        }
      });

      this.process.on('error', reject);

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 5000);
    });
  }

  async sendMessage(method: string, params: any = {}): Promise<any> {
    if (!this.process || !this.process.stdin) {
      throw new Error('MCP server not running');
    }

    const id = this.messageId++;
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    this.process.stdin.write(JSON.stringify(message) + '\n');

    // Wait for response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for response to ${method}`));
      }, 5000);

      const checkResponse = () => {
        if (this.responses.has(id)) {
          clearTimeout(timeout);
          const response = this.responses.get(id)!;
          this.responses.delete(id);
          
          if (response.error) {
            reject(new Error(response.error.message || 'Unknown error'));
          } else {
            resolve(response.result);
          }
        } else {
          setTimeout(checkResponse, 10);
        }
      };

      checkResponse();
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

describe('MCP Server Integration Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = new MCPTestClient();
    await client.start();
  }, 10000);

  afterAll(async () => {
    await client.stop();
  });

  test('should list available tools', async () => {
    const result = await client.sendMessage('tools/list');
    
    expect(result).toHaveProperty('tools');
    expect(Array.isArray(result.tools)).toBe(true);
    
    const toolNames = result.tools.map((tool: any) => tool.name);
    expect(toolNames).toContain('add_context');
    expect(toolNames).toContain('get_context');
    expect(toolNames).toContain('search_context');
    expect(toolNames).toContain('list_context');
    expect(toolNames).toContain('delete_context');
  });

  test('should add context item successfully', async () => {
    const result = await client.sendMessage('tools/call', {
      name: 'add_context',
      arguments: {
        name: 'Test Integration Item',
        content: 'This is test content for integration testing',
        type: 'text',
        tags: ['integration', 'test']
      }
    });

    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].text).toContain('Context item added successfully');
  });

  test('should handle validation errors properly', async () => {
    await expect(client.sendMessage('tools/call', {
      name: 'add_context',
      arguments: {
        name: 'Test',
        content: 'Content',
        type: 'invalid_type'
      }
    })).rejects.toThrow();
  });

  test('should search context items', async () => {
    // First add some items
    await client.sendMessage('tools/call', {
      name: 'add_context',
      arguments: {
        name: 'Search Test 1',
        content: 'Searchable content alpha',
        type: 'text',
        tags: ['searchable']
      }
    });

    await client.sendMessage('tools/call', {
      name: 'add_context',
      arguments: {
        name: 'Search Test 2',
        content: 'Searchable content beta',
        type: 'code',
        tags: ['searchable']
      }
    });

    // Search for items
    const result = await client.sendMessage('tools/call', {
      name: 'search_context',
      arguments: {
        query: 'searchable',
        limit: 5
      }
    });

    expect(result).toHaveProperty('content');
    expect(result.content[0].text).toContain('matching context items');
  });

  test('should list all context items', async () => {
    const result = await client.sendMessage('tools/call', {
      name: 'list_context',
      arguments: {}
    });

    expect(result).toHaveProperty('content');
    expect(result.content[0].text).toContain('Total context items');
  });

  test('should list and read resources', async () => {
    // List resources
    const listResult = await client.sendMessage('resources/list');
    expect(listResult).toHaveProperty('resources');
    expect(Array.isArray(listResult.resources)).toBe(true);

    if (listResult.resources.length > 0) {
      // Read first resource
      const resourceUri = listResult.resources[0].uri;
      const readResult = await client.sendMessage('resources/read', {
        uri: resourceUri
      });

      expect(readResult).toHaveProperty('contents');
      expect(Array.isArray(readResult.contents)).toBe(true);
    }
  });
});
