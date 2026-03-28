import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';
import type { ChatMessage } from './app-store';

describe('AppStore chat state', () => {
  beforeEach(() => {
    useAppStore.setState({
      chatOpen: false,
      messages: [],
    });
  });

  it('should have chatOpen initialized to false', () => {
    const { chatOpen } = useAppStore.getState();
    expect(chatOpen).toBe(false);
  });

  it('should have messages initialized to empty array', () => {
    const { messages } = useAppStore.getState();
    expect(messages).toEqual([]);
  });

  it('should open chat via setChatOpen', () => {
    useAppStore.getState().setChatOpen(true);
    expect(useAppStore.getState().chatOpen).toBe(true);
  });

  it('should close chat via setChatOpen', () => {
    useAppStore.setState({ chatOpen: true });
    useAppStore.getState().setChatOpen(false);
    expect(useAppStore.getState().chatOpen).toBe(false);
  });

  it('should toggle chat via toggleChat', () => {
    useAppStore.getState().toggleChat();
    expect(useAppStore.getState().chatOpen).toBe(true);

    useAppStore.getState().toggleChat();
    expect(useAppStore.getState().chatOpen).toBe(false);
  });

  it('should add a user message via addMessage', () => {
    const message: ChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'What is this drawing?',
      timestamp: 1000,
      image: null,
    };

    useAppStore.getState().addMessage(message);

    const { messages } = useAppStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('msg-1');
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('What is this drawing?');
  });

  it('should add an assistant message via addMessage', () => {
    const message: ChatMessage = {
      id: 'msg-2',
      role: 'assistant',
      content: 'This appears to be a circle.',
      timestamp: 2000,
    };

    useAppStore.getState().addMessage(message);

    const { messages } = useAppStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('assistant');
  });

  it('should accumulate multiple messages in order', () => {
    const first: ChatMessage = { id: 'a', role: 'user', content: 'Hi', timestamp: 1 };
    const second: ChatMessage = { id: 'b', role: 'assistant', content: 'Hello', timestamp: 2 };

    useAppStore.getState().addMessage(first);
    useAppStore.getState().addMessage(second);

    const { messages } = useAppStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0].id).toBe('a');
    expect(messages[1].id).toBe('b');
  });

  it('should clear all messages via clearMessages', () => {
    useAppStore.getState().addMessage({ id: 'x', role: 'user', content: 'test', timestamp: 1 });
    useAppStore.getState().clearMessages();
    expect(useAppStore.getState().messages).toEqual([]);
  });

  it('should support message with image field', () => {
    const message: ChatMessage = {
      id: 'img-1',
      role: 'user',
      content: 'Analyze this',
      timestamp: 3000,
      image: 'data:image/png;base64,abc123',
    };

    useAppStore.getState().addMessage(message);

    const { messages } = useAppStore.getState();
    expect(messages[0].image).toBe('data:image/png;base64,abc123');
  });
});
