import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VisitingCard, VisitingCardConfidence } from '../types/card';

export interface ExtractionResult {
  fullName?: string;
  designation?: string;
  department?: string;
  companyName?: string;
  companyType?: string;
  phoneNumbers: string[];
  emailAddresses: string[];
  websites: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstin?: string;
  socialLinks: { platform: string; url: string }[];
  services: string[];
  notes?: string;
  confidence: VisitingCardConfidence;
}

const DESIGNATION_KEYWORDS = [
  'CEO', 'CTO', 'CFO', 'COO', 'FOUNDER', 'CO-FOUNDER', 'DIRECTOR',
  'MANAGING DIRECTOR', 'MANAGER', 'ENGINEER', 'DEVELOPER', 'CONSULTANT',
  'EXECUTIVE', 'PROPRIETOR', 'PARTNER', 'PRESIDENT', 'VICE PRESIDENT',
  'GENERAL MANAGER', 'SALES MANAGER', 'MARKETING MANAGER', 'HEAD', 'LEAD',
];

const COMPANY_SUFFIXES = [
  'PVT LTD', 'PRIVATE LIMITED', 'LTD', 'LIMITED', 'LLP', 'INDUSTRIES',
  'TECHNOLOGIES', 'SOLUTIONS', 'ENTERPRISES', 'CORPORATION', 'COMPANY',
  'CONNECTS', 'SERVICES', 'LABS', 'INFRASTRUCTURE', 'SYSTEMS', 'GLOBAL',
  'LOGISTICS', 'TEXTILES', 'GROUP', 'ASSOCIATES',
];

const SERVICE_KEYWORDS = [
  'STAFFING', 'RECRUITMENT', 'HIRING', 'SEARCH', 'SOLUTIONS', 'CONSULTING',
  'DEVELOPMENT', 'EXECUTIVE SEARCH', 'CONTRACT STAFFING', 'RPO', 'CAMPUS',
];

export const cardExtractionService = {
  /**
   * Extract card data from Front + Back image URIs.
   */
  async extractCardData(
    frontImageUri: string,
    backImageUri?: string
  ): Promise<ExtractionResult> {
    // 1. Primary: Python FastAPI backend (http://192.168.68.56:8000 or http://localhost:8000)
    try {
      const result = await this._callPythonBackendAPI(frontImageUri, backImageUri);
      return result;
    } catch (backendErr) {
      console.warn('Python FastAPI backend connection error:', backendErr);
    }

    // 2. Secondary: OpenAI Vision API if EXPO_PUBLIC_VISION_API_KEY is provided
    const apiKey = process.env.EXPO_PUBLIC_VISION_API_KEY;
    if (apiKey && (apiKey.startsWith('sk-') || apiKey.length > 20)) {
      try {
        return await this._callRealVisionAPI(apiKey, frontImageUri, backImageUri);
      } catch (err) {
        console.warn('Live AI Vision API call failed:', err);
      }
    }

    // 3. Fallback Client-side Tesseract OCR (with IO error safety)
    try {
      return await this._runTesseractClientOCR(frontImageUri, backImageUri);
    } catch (tessErr) {
      console.warn('Tesseract client OCR error:', tessErr);
    }

    // 4. Clean Empty Result (No fake names)
    return {
      fullName: '',
      designation: '',
      department: '',
      companyName: '',
      companyType: '',
      phoneNumbers: [],
      emailAddresses: [],
      websites: [],
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      gstin: '',
      socialLinks: [],
      services: [],
      notes: '',
      confidence: {
        fullName: 'low',
        companyName: 'low',
        phoneNumbers: 'low',
        emailAddresses: 'low',
        address: 'low',
      },
    };
  },

  /**
   * Get Candidate Backend URLs for mobile vs web
   */
  async _getBackendCandidateUrls(): Promise<string[]> {
    const candidates: string[] = [];

    // Vercel Serverless Function live URL
    candidates.push('https://card-scan-flame.vercel.app');
    candidates.push('/api');
    candidates.push('https://muscle-funky-molecules-source.trycloudflare.com');
    candidates.push('https://duties-shareware-recordings-practitioners.trycloudflare.com');
    candidates.push('https://reducing-previews-steal-pentium.trycloudflare.com');
    candidates.push('https://subsequent-recordings-particle-image.trycloudflare.com');
    candidates.push('https://reach-adapters-pillow-winter.trycloudflare.com');
    candidates.push('https://cardscan-ai-backend.loca.lt');

    // Check user saved custom URL from AsyncStorage
    try {
      const savedUrl = await AsyncStorage.getItem('@cardscan_backend_url');
      if (savedUrl && savedUrl.trim().length > 0) {
        candidates.push(savedUrl.trim());
      }
    } catch {}

    // Check env variable
    if (process.env.EXPO_PUBLIC_BACKEND_URL) {
      candidates.push(process.env.EXPO_PUBLIC_BACKEND_URL);
    }

    // Local Wi-Fi PC IP for mobile devices
    candidates.push('http://192.168.68.56:8000');
    candidates.push('http://192.168.137.1:8000');
    candidates.push('http://10.0.2.2:8000');
    candidates.push('http://localhost:8000');

    // Deduplicate
    return Array.from(new Set(candidates));
  },

  /**
   * Call Python FastAPI backend service running at /extract-card
   */
  async _callPythonBackendAPI(
    frontImageUri: string,
    backImageUri?: string
  ): Promise<ExtractionResult> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const frontRes = await fetch(frontImageUri);
      const frontBlob = await frontRes.blob();
      formData.append('front_image', frontBlob, 'front.jpg');

      if (backImageUri) {
        const backRes = await fetch(backImageUri);
        const backBlob = await backRes.blob();
        formData.append('back_image', backBlob, 'back.jpg');
      }
    } else {
      formData.append('front_image', {
        uri: frontImageUri,
        name: 'front.jpg',
        type: 'image/jpeg',
      } as any);

      if (backImageUri) {
        formData.append('back_image', {
          uri: backImageUri,
          name: 'back.jpg',
          type: 'image/jpeg',
        } as any);
      }
    }

    const candidateUrls = await this._getBackendCandidateUrls();
    let lastError: any = null;

    for (const baseUrl of candidateUrls) {
      try {
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const response = await fetch(`${cleanBase}/extract-card`, {
          method: 'POST',
          headers: {
            'bypass-tunnel-reminder': 'true',
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return {
            fullName: data.fullName || '',
            designation: data.designation || '',
            department: data.department || '',
            companyName: data.companyName || '',
            companyType: data.companyType || '',
            phoneNumbers: data.phoneNumbers || [],
            emailAddresses: data.emailAddresses || [],
            websites: data.websites || [],
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'India',
            pincode: data.pincode || '',
            gstin: data.gstin || '',
            socialLinks: data.socialLinks || [],
            services: data.services || [],
            notes: data.notes || '',
            confidence: data.confidence || {
              fullName: 'high',
              companyName: 'high',
              phoneNumbers: 'high',
              emailAddresses: 'high',
              address: 'medium',
            },
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('All candidate backend URLs failed');
  },

  /**
   * Client-Side OCR engine fallback
   */
  async _runTesseractClientOCR(
    frontUri: string,
    backUri?: string
  ): Promise<ExtractionResult> {
    const Tesseract = require('tesseract.js');
    const frontText = await this._recognizeImageText(Tesseract, frontUri);
    const backText = backUri ? await this._recognizeImageText(Tesseract, backUri) : '';

    const combinedText = `${frontText}\n${backText}`;
    const lines = combinedText
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    // --- 1. Extract Phone Numbers ---
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/g;
    const phoneMatches = combinedText.match(phoneRegex) || [];
    const phones: string[] = [];
    for (const match of phoneMatches) {
      const clean = match.trim().replace(/^[^0-9+]+|[^0-9]+$/g, '');
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 8 && digits.length <= 13 && digits.length !== 6 && digits.length !== 15) {
        if (!phones.includes(clean)) {
          phones.push(clean);
        }
      }
    }

    // --- 2. Extract Emails ---
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = combinedText.match(emailRegex) || [];
    const emails: string[] = Array.from(new Set(emailMatches.map((e: string) => e.toLowerCase())));

    // --- 3. Extract Websites ---
    const webRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
    const webMatches = combinedText.match(webRegex) || [];
    const websites: string[] = [];
    for (const w of webMatches) {
      if (!w.includes('@')) {
        const cleanW = w.toLowerCase().startsWith('http') ? w.toLowerCase() : `https://${w.toLowerCase()}`;
        if (!websites.includes(cleanW)) {
          websites.push(cleanW);
        }
      }
    }

    if (websites.length === 0 && emails.length > 0) {
      const domain = emails[0].split('@')[1];
      if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
        websites.push(`https://www.${domain}`);
      }
    }

    // --- 4. Extract GSTIN ---
    const gstinRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;
    const gstinMatch = combinedText.toUpperCase().replace(/\s/g, '').match(gstinRegex);
    const gstin = gstinMatch ? gstinMatch[0] : '';

    // --- 5. Extract Company Name ---
    let companyName = '';
    for (const line of lines) {
      const upper = line.toUpperCase();
      for (const suffix of COMPANY_SUFFIXES) {
        if (upper.includes(suffix)) {
          companyName = line;
          break;
        }
      }
      if (companyName) break;
    }

    // --- 6. Extract Designation & Person Name ---
    let designation = '';
    let fullName = '';
    for (const line of lines) {
      const upper = line.toUpperCase();
      for (const des of DESIGNATION_KEYWORDS) {
        if (upper.includes(des)) {
          designation = line;
          break;
        }
      }
      if (designation) break;
    }

    for (const line of lines) {
      if (line === companyName || line === designation || line.includes('@') || line.match(phoneRegex)) {
        continue;
      }
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && /^[A-Za-z.\s-]+$/.test(line)) {
        fullName = line;
        break;
      }
    }

    return {
      fullName,
      designation,
      department: '',
      companyName,
      companyType: '',
      phoneNumbers: phones,
      emailAddresses: emails,
      websites,
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      gstin,
      socialLinks: [],
      services: [],
      notes: '',
      confidence: {
        fullName: fullName ? 'high' : 'low',
        companyName: companyName ? 'high' : 'low',
        phoneNumbers: phones.length > 0 ? 'high' : 'low',
        emailAddresses: emails.length > 0 ? 'high' : 'low',
        address: 'low',
      },
    };
  },

  async _recognizeImageText(TesseractInstance: any, uri: string): Promise<string> {
    try {
      const result = await TesseractInstance.recognize(uri, 'eng', {
        logger: () => {},
      });
      return result?.data?.text || '';
    } catch {
      return '';
    }
  },

  async _callRealVisionAPI(
    apiKey: string,
    frontImageUri: string,
    backImageUri?: string
  ): Promise<ExtractionResult> {
    const promptText = `
You are an expert OCR AI for business cards. Analyze the front image (and optional back image) of this visiting card.
Extract and return a raw JSON object with the following fields:
{
  "fullName": string,
  "designation": string,
  "department": string,
  "companyName": string,
  "companyType": string,
  "phoneNumbers": string[],
  "emailAddresses": string[],
  "websites": string[],
  "address": string,
  "city": string,
  "state": string,
  "country": string,
  "pincode": string,
  "gstin": string,
  "socialLinks": [{"platform": string, "url": string}],
  "services": string[],
  "notes": string,
  "confidence": {
    "fullName": "high"|"medium"|"low",
    "companyName": "high"|"medium"|"low",
    "phoneNumbers": "high"|"medium"|"low",
    "emailAddresses": "high"|"medium"|"low",
    "address": "high"|"medium"|"low"
  }
}
Return ONLY valid JSON.
`;

    const contentItems: any[] = [
      { type: 'text', text: promptText },
      { type: 'image_url', image_url: { url: frontImageUri } },
    ];

    if (backImageUri) {
      contentItems.push({ type: 'image_url', image_url: { url: backImageUri } });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: contentItems }],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultJson = JSON.parse(data.choices[0].message.content);

    return {
      fullName: resultJson.fullName || '',
      designation: resultJson.designation || '',
      department: resultJson.department || '',
      companyName: resultJson.companyName || '',
      companyType: resultJson.companyType || '',
      phoneNumbers: resultJson.phoneNumbers || [],
      emailAddresses: resultJson.emailAddresses || [],
      websites: resultJson.websites || [],
      address: resultJson.address || '',
      city: resultJson.city || '',
      state: resultJson.state || '',
      country: resultJson.country || '',
      pincode: resultJson.pincode || '',
      gstin: resultJson.gstin || '',
      socialLinks: resultJson.socialLinks || [],
      services: resultJson.services || [],
      notes: resultJson.notes || '',
      confidence: resultJson.confidence || {
        fullName: 'high',
        companyName: 'high',
        phoneNumbers: 'high',
        emailAddresses: 'high',
        address: 'medium',
      },
    };
  },
};
