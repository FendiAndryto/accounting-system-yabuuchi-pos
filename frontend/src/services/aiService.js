import { request, API_BASE } from './apiClient';

export const aiService = {
  async chat(message, history = []) {
    return await request(`${API_BASE}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
      }),
    });
  },

  async getTools() {
    return await request(`${API_BASE}/ai/tools`);
  },

  async executeTool(toolName, parameters = {}) {
    return await request(`${API_BASE}/ai/execute-tool`, {
      method: 'POST',
      body: JSON.stringify({
        tool: toolName,
        parameters,
      }),
    });
  },
};
