import useAuthStore from '../store/auth.store.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function buildHeaders(contentType = 'application/json', accept = 'application/json') {
  const headers = {
    'Content-Type': contentType,
    Accept: accept,
  };

  const token = useAuthStore.getState().accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseError(response) {
  const fallback = 'Request failed.';

  try {
    const payload = await response.json();
    return payload.message || payload.error || fallback;
  } catch {
    try {
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

export async function getTripChatHistory(tripId) {
  const response = await fetch(`${API_BASE}/ai/chat/${tripId}`, {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders('application/json', 'application/json'),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function sendTripChatMessage({ tripId, messages, stream = true, onChunk }) {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders('application/json', stream ? 'text/plain' : 'application/json'),
    body: JSON.stringify({ tripId, messages, stream }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await response.json();
    return {
      reply: payload.data?.reply || '',
      streamed: false,
    };
  }

  if (!response.body) {
    return {
      reply: await response.text(),
      streamed: false,
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let reply = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      reply += chunk;
      onChunk?.(chunk, reply);
    }
  }

  const finalChunk = decoder.decode();
  if (finalChunk) {
    reply += finalChunk;
    onChunk?.(finalChunk, reply);
  }

  return {
    reply,
    streamed: true,
  };
}