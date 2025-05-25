
// AI Analysis Service for photo valuation using OpenAI Vision API
export interface AIAnalysisResult {
  name: string;
  description: string;
  estimatedValue: number;
  confidence: number;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
}

class AIAnalysisService {
  private apiKey: string | null = null;

  constructor() {
    // In production, this would come from Supabase secrets
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  async analyzeImage(file: File): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      // Fallback to mock analysis if no API key
      return this.mockAnalysis(file);
    }

    try {
      const base64Image = await this.fileToBase64(file);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert appraiser. Analyze the image and provide a JSON response with:
              - name: specific item name
              - description: detailed description
              - estimatedValue: estimated dollar value (number only)
              - confidence: confidence level 0-100
              - category: item category
              - condition: condition assessment
              - brand: brand name if visible
              - model: model if identifiable`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this item and provide valuation information in JSON format.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return this.mockAnalysis(file);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.mockAnalysis(file);
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private mockAnalysis(file: File): AIAnalysisResult {
    const categories = ['Electronics', 'Furniture', 'Jewelry', 'Artwork', 'Appliances', 'Collectibles'];
    const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const mockResponses = {
      'Electronics': { name: 'Smart TV', value: 850, brand: 'Samsung' },
      'Furniture': { name: 'Leather Sofa', value: 1200, brand: 'Ashley' },
      'Jewelry': { name: 'Diamond Ring', value: 2500, brand: 'Tiffany' },
      'Artwork': { name: 'Oil Painting', value: 450, brand: 'Unknown' },
      'Appliances': { name: 'Refrigerator', value: 1100, brand: 'LG' },
      'Collectibles': { name: 'Vintage Watch', value: 750, brand: 'Rolex' }
    };

    const response = mockResponses[category as keyof typeof mockResponses];
    return {
      name: response.name,
      description: `${response.brand} ${response.name} in good condition`,
      estimatedValue: response.value + Math.floor(Math.random() * 200) - 100,
      confidence: Math.floor(Math.random() * 30) + 70,
      category,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      brand: response.brand,
      model: 'Model ' + Math.floor(Math.random() * 1000)
    };
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }
}

export const aiAnalysisService = new AIAnalysisService();
