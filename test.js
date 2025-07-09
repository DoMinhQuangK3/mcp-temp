import { spawn } from 'child_process';
import { readFileSync } from 'fs';

// Simple test script to verify the MCP server works
async function testMCPServer() {
  console.log('Testing MCP Context Server...');
  
  try {
    // Start the server process
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    // Test message to list tools
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    // Send the message
    serverProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');

    // Listen for response
    serverProcess.stdout.on('data', (data) => {
      console.log('Server response:', data.toString());
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('Server stderr:', data.toString());
    });

    // Clean up after 5 seconds
    setTimeout(() => {
      serverProcess.kill();
      console.log('Test completed');
    }, 5000);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMCPServer();
