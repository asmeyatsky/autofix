import axios, { AxiosInstance } from 'axios';
import { AutoFixConfig, DetectedError, FixResult, LLMFix } from '../types';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';
import { isJavaScriptFile } from '../utils/validation';

export class LLMService {
  private config: AutoFixConfig;
  private httpClient: AxiosInstance;

  constructor(config: AutoFixConfig) {
    this.config = config;
    
    this.httpClient = axios.create({
      baseURL: this.config.llmEndpoint || 'https://api.openai.com/v1',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.llmApiKey || process.env.AUTOFIX_LLM_API_KEY || ''}`,
      },
    });
  }

  async generateFix(detectedError: DetectedError): Promise<FixResult> {
    try {
      // Analyze errors and find relevant files
      const relevantFiles = await this.findRelevantFiles(detectedError);
      
      // Prepare context for LLM
      const context = await this.prepareContext(detectedError, relevantFiles);
      
      // Generate prompt
      const prompt = this.buildPrompt(context);
      
      // Call LLM
      const response = await this.callLLM(prompt);
      
      // Parse response
      const fixes = await this.parseResponse(response.data.choices[0].message.content, relevantFiles);
      
      return {
        success: fixes.length > 0,
        fixes,
        explanation: response.data.choices[0].message.content,
        attempt: 1,
      };

    } catch (error) {
      console.error('LLM service error:', error);
      return {
        success: false,
        fixes: [],
        explanation: `Failed to generate fix: ${error}`,
        attempt: 1,
      };
    }
  }

  private async findRelevantFiles(error: DetectedError): Promise<string[]> {
    const files: string[] = [];
    
    // Extract file paths from error messages
    for (const consoleError of error.consoleErrors) {
      if (consoleError.url && isJavaScriptFile(consoleError.url)) {
        const filePath = this.mapUrlToFilePath(consoleError.url);
        if (filePath && !files.includes(filePath)) {
          files.push(filePath);
        }
      }
    }

    // If no specific files found, search for common frontend files
    if (files.length === 0) {
      const commonFiles = [
        'index.js', 'index.tsx', 'App.js', 'App.tsx', 'main.js', 'main.tsx',
        'index.html', 'src/index.js', 'src/App.js', 'src/main.js',
        'client/index.js', 'client/App.js'
      ];

      for (const file of commonFiles) {
        const filePath = resolve(this.config.project || '.', file);
        try {
          await fs.access(filePath);
          files.push(filePath);
        } catch {
          // File doesn't exist, continue
        }
      }
    }

    // Also look for component files that might be related to errors
    if (error.consoleErrors.length > 0) {
      const errorText = error.consoleErrors[0].text.toLowerCase();
      
      // Extract potential component names from error
      const componentMatches = errorText.match(/[A-Z][a-zA-Z]*/g);
      if (componentMatches) {
        for (const componentName of componentMatches) {
          const possibleFiles = [
            `${componentName}.js`, `${componentName}.jsx`, `${componentName}.ts`, `${componentName}.tsx`,
            `${componentName.toLowerCase()}.js`, `${componentName.toLowerCase()}.jsx`,
            join('components', `${componentName}.js`), join('components', `${componentName}.jsx`),
            join('src', 'components', `${componentName}.js`), join('src', 'components', `${componentName}.jsx`)
          ];
          
          for (const file of possibleFiles) {
            const filePath = resolve(this.config.project || '.', file);
            try {
              await fs.access(filePath);
              if (!files.includes(filePath)) {
                files.push(filePath);
              }
            } catch {
              // File doesn't exist, continue
            }
          }
        }
      }
    }

    return files;
  }

  private mapUrlToFilePath(url: string): string | null {
    // Remove localhost/protocol and map to file system
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      // Extract path from URL and map to project directory
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Common mappings
        if (pathname.startsWith('/static/')) {
          return resolve(this.config.project || '.', pathname.slice(1));
        }
        if (pathname.startsWith('/src/')) {
          return resolve(this.config.project || '.', pathname);
        }
        if (pathname.endsWith('.js') || pathname.endsWith('.jsx') || pathname.endsWith('.ts') || pathname.endsWith('.tsx')) {
          return resolve(this.config.project || '.', pathname.slice(1));
        }
      } catch {
        return null;
      }
    }
    
    return null;
  }

  private async prepareContext(error: DetectedError, files: string[]): Promise<any> {
    const fileContents: { [key: string]: string } = {};
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        fileContents[file] = content;
      } catch {
        // Skip files that can't be read
      }
    }

    return {
      error: {
        consoleErrors: error.consoleErrors,
        networkErrors: error.networkErrors,
        pageLoadError: error.pageLoadError,
        timestamp: error.timestamp,
      },
      files: fileContents,
      projectPath: this.config.project,
    };
  }

  private buildPrompt(context: any): string {
    const { error, files, projectPath } = context;
    
    let prompt = `You are an expert frontend developer helping to debug and fix a web application error.

## Error Details:
`;

    if (error.pageLoadError) {
      prompt += `Page Load Error: ${error.pageLoadError}\n`;
    }

    if (error.consoleErrors.length > 0) {
      prompt += `\nConsole Errors:\n`;
      error.consoleErrors.forEach((err: any, index: number) => {
        prompt += `${index + 1}. [${err.type.toUpperCase()}] ${err.text}\n`;
        if (err.url) prompt += `   Location: ${err.url}:${err.line || '?'}:${err.column || '?'}\n`;
      });
    }

    if (error.networkErrors.length > 0) {
      prompt += `\nNetwork Errors:\n`;
      error.networkErrors.forEach((err: any, index: number) => {
        prompt += `${index + 1}. ${err.status} ${err.statusText} - ${err.url}\n`;
      });
    }

    prompt += `\n## Relevant Files:\n`;
    Object.entries(files).forEach(([filePath, content]) => {
      const relativePath = filePath.replace(projectPath, '');
      prompt += `\n### ${relativePath}\n\`\`\`${this.getFileLanguage(filePath)}\n${content}\n\`\`\`\n`;
    });

    prompt += `

## Task:
1. Analyze the errors and the provided code
2. Identify the root cause of the issues
3. Provide specific code fixes for each issue
4. Focus on minimal, targeted fixes that won't break other functionality
5. Ensure your fixes handle edge cases and error states

## Response Format:
Please respond with a JSON object in this format:

\`\`\`json
{
  "fixes": [
    {
      "filePath": "path/to/file.js",
      "originalCode": "existing code snippet",
      "fixedCode": "fixed code snippet", 
      "explanation": "why this fix works",
      "confidence": 0.9
    }
  ],
  "summary": "brief summary of what was fixed and why"
}
\`\`\`

## Guidelines:
- Be specific with file paths relative to project root
- Include minimal code snippets (5-10 lines) for clarity
- Ensure fixes are syntactically correct and follow best practices
- Consider error handling and edge cases
- Provide confidence scores (0.0-1.0) for each fix
- Focus on the most critical errors first
`;

    return prompt;
  }

  private getFileLanguage(filePath: string): string {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      return 'javascript';
    }
    if (filePath.endsWith('.ts')) {
      return 'typescript';
    }
    if (filePath.endsWith('.js')) {
      return 'javascript';
    }
    if (filePath.endsWith('.vue')) {
      return 'vue';
    }
    if (filePath.endsWith('.html')) {
      return 'html';
    }
    return 'javascript';
  }

  private async callLLM(prompt: string): Promise<any> {
    const payload = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert frontend developer specializing in debugging and fixing web applications. Always provide responses in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    };

    const response = await this.httpClient.post('/chat/completions', payload);
    return response.data;
  }

  private async parseResponse(response: string, relevantFiles: string[]): Promise<LLMFix[]> {
    const fixes: LLMFix[] = [];
    
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : response;
      
      const parsed = JSON.parse(jsonContent);
      
      if (parsed.fixes && Array.isArray(parsed.fixes)) {
        for (const fixData of parsed.fixes) {
          // Validate and normalize file path
          const filePath = resolve(this.config.project || '.', fixData.filePath);
          
          // Check if file exists in our relevant files
          if (relevantFiles.includes(filePath) || relevantFiles.includes(resolve(filePath))) {
            fixes.push({
              filePath,
              originalCode: fixData.originalCode,
              fixedCode: fixData.fixedCode,
              explanation: fixData.explanation || 'Fixed syntax/logic error',
              confidence: fixData.confidence || 0.5,
            });
          }
        }
      }
      
    } catch (error) {
      console.warn('Failed to parse LLM response as JSON:', error);
      
      // Fallback: try to extract fix information from plain text
      const fixMatches = response.match(/fix.*?(\.js|\.jsx|\.ts|\.tsx).*?->/gi);
      if (fixMatches) {
        console.warn('Found potential fixes but could not parse properly');
      }
    }
    
    return fixes;
  }
}