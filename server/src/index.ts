import express, { type Request, type Response } from "express";
import cors from "cors";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Chat history type
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Chat streaming endpoint (SSE)
app.post('/api/v1/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Extract headers from request for forwarding
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);

    // Initialize LLM client
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // System prompt for AI assistant
    const systemPrompt: Message = {
      role: 'system',
      content: '你是一个友好、专业的 AI 助手。请用简洁、清晰的语言回答用户的问题。如果用户问的是编程相关问题，请提供代码示例。'
    };

    // Prepare messages with system prompt
    const fullMessages = [systemPrompt, ...messages];

    // Stream the response
    const stream = client.stream(fullMessages, {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7,
    });

    try {
      for await (const chunk of stream) {
        if (chunk.content) {
          const text = chunk.content.toString();
          // Send SSE data
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
      // Send end signal
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
