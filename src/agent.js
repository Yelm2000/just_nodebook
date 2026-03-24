/**
 * Cloud AI Agent delegation module.
 * Handles dispatching cell content to a cloud AI agent and returning responses.
 */

const https = require('https');
const http = require('http');

/**
 * Default agent configuration.
 */
const DEFAULT_CONFIG = {
  /** Endpoint URL for the cloud AI agent API */
  endpoint: process.env.AGENT_ENDPOINT || null,
  /** API key for authentication */
  apiKey: process.env.AGENT_API_KEY || null,
  /** Timeout in milliseconds */
  timeoutMs: 30000,
};

/**
 * Sends a prompt to the configured cloud AI agent endpoint.
 *
 * When no endpoint is configured this function returns a friendly placeholder
 * response so the application can still be exercised without a real backend.
 *
 * @param {string} prompt - The prompt to send to the agent
 * @param {object} [config] - Optional overrides for DEFAULT_CONFIG
 * @returns {Promise<{ success: boolean, response: string, error?: string }>}
 */
async function delegateToAgent(prompt, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return { success: false, response: '', error: 'Prompt must be a non-empty string.' };
  }

  // When no endpoint is configured, return a simulated placeholder response.
  if (!cfg.endpoint) {
    return {
      success: true,
      response: simulateAgentResponse(prompt),
    };
  }

  try {
    const result = await postJson(cfg.endpoint, { prompt }, cfg.apiKey, cfg.timeoutMs);
    const response = result.response || result.text || result.content || JSON.stringify(result);
    return { success: true, response };
  } catch (err) {
    return { success: false, response: '', error: err.message };
  }
}

/**
 * Sends a POST request with a JSON body and returns the parsed JSON response.
 * @param {string} url
 * @param {object} body
 * @param {string|null} apiKey
 * @param {number} timeoutMs
 * @returns {Promise<object>}
 */
function postJson(url, body, apiKey, timeoutMs) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (_) {
          resolve({ response: data });
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Returns a simulated agent response when no real endpoint is configured.
 * @param {string} prompt
 * @returns {string}
 */
function simulateAgentResponse(prompt) {
  const lines = prompt.split('\n').filter(Boolean);
  const preview = lines.slice(0, 3).join(' ').slice(0, 120);
  return (
    `[云智能体模拟响应 / Cloud AI Agent Simulated Response]\n\n` +
    `已收到您的委托请求。内容预览：\n"${preview}"\n\n` +
    `（请配置 AGENT_ENDPOINT 环境变量以启用真实的云智能体集成。）\n\n` +
    `Received your delegation request. Content preview:\n"${preview}"\n\n` +
    `(Set the AGENT_ENDPOINT environment variable to enable real cloud AI agent integration.)`
  );
}

module.exports = {
  delegateToAgent,
  simulateAgentResponse,
  DEFAULT_CONFIG,
};
