/**
 * Tests for the cloud AI agent delegation module (src/agent.js).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { delegateToAgent, simulateAgentResponse, DEFAULT_CONFIG } = require('../src/agent');

describe('delegateToAgent – no endpoint configured', () => {
  it('returns a simulated success response when no endpoint is set', async () => {
    const result = await delegateToAgent('Hello, agent!', { endpoint: null });
    assert.equal(result.success, true);
    assert.ok(result.response.length > 0);
    assert.equal(result.error, undefined);
  });

  it('includes a preview of the prompt in the simulated response', async () => {
    const prompt = 'Please analyze this code:\nconsole.log("test");';
    const result = await delegateToAgent(prompt, { endpoint: null });
    assert.ok(result.response.includes('console.log'));
  });
});

describe('delegateToAgent – input validation', () => {
  it('returns failure for an empty prompt', async () => {
    const result = await delegateToAgent('', { endpoint: null });
    assert.equal(result.success, false);
    assert.ok(result.error.length > 0);
  });

  it('returns failure for a whitespace-only prompt', async () => {
    const result = await delegateToAgent('   ', { endpoint: null });
    assert.equal(result.success, false);
  });

  it('returns failure for a non-string prompt', async () => {
    const result = await delegateToAgent(null, { endpoint: null });
    assert.equal(result.success, false);
  });
});

describe('simulateAgentResponse', () => {
  it('contains bilingual marker text', () => {
    const response = simulateAgentResponse('test prompt');
    assert.ok(response.includes('云智能体'));
    assert.ok(response.includes('Cloud AI Agent'));
  });

  it('includes a preview of the supplied prompt', () => {
    const response = simulateAgentResponse('my special prompt content');
    assert.ok(response.includes('my special prompt content'));
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has a null endpoint by default (unless env var is set)', () => {
    // Only assert when env var is absent.
    if (!process.env.AGENT_ENDPOINT) {
      assert.equal(DEFAULT_CONFIG.endpoint, null);
    }
  });

  it('has a positive timeoutMs', () => {
    assert.ok(DEFAULT_CONFIG.timeoutMs > 0);
  });
});
