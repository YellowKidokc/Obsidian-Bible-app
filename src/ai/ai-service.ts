import { BibleAppSettings, Verse } from '../types';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  constructor(private settings: BibleAppSettings) {}

  async query(
    userMessage: string,
    context: {
      currentVerse?: Verse;
      surroundingVerses?: Verse[];
      additionalContext?: string;
    }
  ): Promise<string> {
    const messages: AIMessage[] = [];

    // System message
    messages.push({
      role: 'system',
      content: this.getSystemPrompt()
    });

    // Add context
    if (context.currentVerse || context.surroundingVerses) {
      messages.push({
        role: 'system',
        content: this.formatBibleContext(context)
      });
    }

    // User message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Call appropriate AI provider
    if (this.settings.aiProvider === 'openai') {
      return await this.callOpenAI(messages);
    } else {
      return await this.callAnthropic(messages);
    }
  }

  private getSystemPrompt(): string {
    return `You are a helpful Bible study assistant. You have access to the full text of scripture,
commentary, lexicon data, and cross-references. Your role is to help users understand and explore
the Bible through thoughtful analysis, historical context, and theological insights.

When answering questions:
- Be respectful and thoughtful
- Cite specific verses when relevant
- Provide historical and cultural context
- Explain original language meanings when helpful
- Draw connections to other passages
- Remain objective and scholarly

Format your responses in Markdown for clarity.`;
  }

  private formatBibleContext(context: {
    currentVerse?: Verse;
    surroundingVerses?: Verse[];
    additionalContext?: string;
  }): string {
    let contextText = 'Current passage context:\n\n';

    if (context.surroundingVerses && context.surroundingVerses.length > 0) {
      contextText += '```\n';
      context.surroundingVerses.forEach(verse => {
        const marker = verse.uid === context.currentVerse?.uid ? '→ ' : '  ';
        contextText += `${marker}${verse.book} ${verse.chapter}:${verse.verse} - ${verse.text}\n`;
      });
      contextText += '```\n\n';
    } else if (context.currentVerse) {
      contextText += `${context.currentVerse.book} ${context.currentVerse.chapter}:${context.currentVerse.verse}\n`;
      contextText += `"${context.currentVerse.text}"\n\n`;
    }

    if (context.additionalContext) {
      contextText += context.additionalContext;
    }

    return contextText;
  }

  private async callOpenAI(messages: AIMessage[]): Promise<string> {
    if (!this.settings.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.openaiApiKey}`
      },
      body: JSON.stringify({
        model: this.settings.aiModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(messages: AIMessage[]): Promise<string> {
    if (!this.settings.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.settings.aiModel,
        max_tokens: 1000,
        system: systemMessage,
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
}
