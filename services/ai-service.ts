import { ChatMessage } from '@/types';

export class AIService {
  private baseUrl = 'https://toolkit.rork.com/text/llm/';

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.completion || 'Sorry, I couldn\'t process your request.';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  getVybzzzContext(): string {
    return `You are an AI assistant for Vybzzz, a concert and live music video platform. 
    
    Vybzzz is like TikTok but specifically for live music content. Users can:
    - Discover concerts and festivals through short-form videos
    - Buy tickets directly through the app
    - Share their concert experiences
    - Follow their favorite artists
    - Go live during concerts
    - Access premium features with subscriptions
    
    Key features:
    - Home feed with concert videos
    - Discover page with event calendar and map
    - Create page for posting videos and going live
    - Tickets/Shop page for purchasing
    - Profile management
    - Premium subscriptions (ad-free, exclusive content)
    - Pro dashboard for artists and business users
    - Referral program
    - Multi-language support
    
    User roles:
    - Fan: Regular users who watch content and buy tickets
    - Artist: Verified musicians who can upload content and sell tickets
    - Business Introducer: Affiliate marketers who earn commissions
    - Regional Manager: Local event managers
    
    Always be helpful, friendly, and focused on music and live events. Provide specific guidance about using the app's features.`;
  }

  async getContextualResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const systemMessage: ChatMessage = {
      id: 'system',
      role: 'user',
      content: this.getVybzzzContext() + '\n\nUser question: ' + userMessage,
      timestamp: new Date().toISOString(),
    };

    const messages = [systemMessage, ...conversationHistory.slice(-5)]; // Keep last 5 messages for context
    
    return this.sendMessage(messages);
  }

  getSuggestedQuestions(): string[] {
    return [
      'How do I upload a video?',
      'How can I find events near me?',
      'How do I buy tickets?',
      'How can I become a verified artist?',
      'What are the benefits of Premium?',
      'How does the referral program work?',
      'How do I go live during a concert?',
      'Can I download videos for offline viewing?',
    ];
  }
}

export const aiService = new AIService();