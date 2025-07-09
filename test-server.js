#!/usr/bin/env node

/**
 * Test script for MCP Context Server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('Testing MCP Context Server...\n');
  
  // Start the server
  const serverPath = join(__dirname, 'src', 'simple-server.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test messages
  const testMessages = [
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    },
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    },
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_context',
        arguments: {}
      }
    },
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'search_context',
        arguments: {
          query: 'API'
        }
      }
    }
  ];

  // Handle server output
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        console.log('Server Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw output:', line);
      }
    });
  });

  server.stderr.on('data', (data) => {
    console.log('Server Info:', data.toString());
  });

  // Send test messages
  for (const message of testMessages) {
    console.log(`\nSending: ${message.method}`);
    server.stdin.write(JSON.stringify(message) + '\n');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Clean up
  setTimeout(() => {
    server.kill();
    console.log('\nTest completed!');
  }, 2000);
}

testServer().catch(console.error);
