import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
// Lazy import pdf2pic - it depends on system libraries not available on Vercel
let fromPath: any = null;
try {
  const pdf2pic = await import("pdf2pic");
  fromPath = pdf2pic.fromPath;
} catch {
  // pdf2pic not available in this environment
}

const execAsync = promisify(exec);

// Claude API (Anthropic) - Primary AI provider
let anthropic: Anthropic | null = null;

if (process.env.ANTHROPIC_API_KEY) {
  console.log('🤖 Claude API (Anthropic) configured');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} else {
  console.log('ℹ️  Claude API not configured - AI features will be disabled');
}

// OpenAI for audio transcription only (Anthropic doesn't support audio)
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  console.log('🎤 OpenAI Whisper configured for audio transcription');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface ExtractedQuoteData {
  projectTitle?: string;
  projectType?: string;
  description?: string;
  scope?: string;
  amount?: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  vendorWebsite?: string;
  licenseNumber?: string;
  hasLiabilityInsurance?: boolean;
  startDate?: string;
  estimatedCompletion?: string;
  validUntil?: string;
  warranty?: string;
  paymentTerms?: string;
  notes?: string;
}

// Audio transcription for meeting recordings (still uses OpenAI Whisper)
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API is not configured. Audio transcription requires OpenAI Whisper. Please add OPENAI_API_KEY to your .env file, or use manual note-taking.");
  }

  const tempDir = path.join(process.cwd(), 'temp');

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const tempAudioPath = path.join(tempDir, `audio_${timestamp}_${filename}`);

  try {
    // Write audio data to temporary file
    fs.writeFileSync(tempAudioPath, audioBuffer);
    console.log(`Audio file size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);

    // Create a readable stream for OpenAI
    const audioStream = fs.createReadStream(tempAudioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });

    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }
  }
}

// Generate professional meeting minutes from transcription using Claude
export async function generateMeetingMinutes(
  transcription: string,
  meetingTitle: string,
  meetingType: string,
  chairperson?: string,
  agenda?: string
): Promise<string> {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable meeting minutes generation.");
  }

  try {
    const prompt = `You are a professional meeting secretary. Please create formal, well-structured meeting minutes from the following transcription.

Meeting Information:
- Title: ${meetingTitle}
- Type: ${meetingType}
- Chairperson: ${chairperson || 'Not specified'}
- Agenda: ${agenda || 'Not specified'}

Transcription:
${transcription}

Please format the minutes professionally with the following structure:
1. Meeting Header (Title, Date, Type, Chairperson)
2. Attendees (extract from transcription if mentioned)
3. Agenda Items Discussed
4. Key Decisions Made
5. Action Items (with responsible parties if mentioned)
6. Next Steps/Follow-up
7. Meeting Adjournment

Make the minutes clear, concise, and professionally formatted. Focus on key decisions, action items, and important discussions. Avoid including filler words or casual conversation.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      temperature: 0.3,
      system: "You are a professional meeting secretary with expertise in creating formal meeting minutes for strata/condominium board meetings.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const textContent = response.content.find(block => block.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text : "Failed to generate meeting minutes";
  } catch (error) {
    console.error("Error generating meeting minutes:", error);
    throw new Error("Failed to generate meeting minutes with AI");
  }
}

async function convertPdfToImage(base64Data: string): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const tempPdfPath = path.join(tempDir, `temp_${timestamp}.pdf`);

  try {
    // Write PDF data to temporary file
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Method 1: Try pdf2pic with optimized settings
    console.log("Attempting PDF conversion with pdf2pic...");
    try {
      const options = {
        density: 100,
        saveFilename: "page",
        savePath: tempDir,
        format: "jpeg",
        width: 1568,  // Claude can handle larger images
        height: 1568,
        quality: 85
      };

      const convert = fromPath(tempPdfPath, options);
      const result = await convert(1, { responseType: "buffer" });

      if (result && result.buffer && result.buffer.length > 100) {
        const base64Image = result.buffer.toString('base64');
        console.log(`PDF converted successfully: ${(result.buffer.length / 1024).toFixed(2)} KB`);

        // Clean up
        fs.unlinkSync(tempPdfPath);
        return base64Image;
      }
    } catch (pdf2picError) {
      console.log("pdf2pic failed, trying system command...");
    }

    // Method 2: Try system pdftoppm command
    console.log("Attempting PDF conversion with pdftoppm...");
    try {
      const outputPrefix = path.join(tempDir, `page_${timestamp}`);
      const outputPath = `${outputPrefix}-01.jpg`;

      const command = `pdftoppm -f 1 -l 1 -jpeg -r 150 -scale-to-x 1568 -scale-to-y 1568 "${tempPdfPath}" "${outputPrefix}"`;
      await execAsync(command);

      if (fs.existsSync(outputPath)) {
        const imageBuffer = fs.readFileSync(outputPath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString('base64');
          console.log(`PDF converted with pdftoppm: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

          // Clean up
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputPath);
          return base64Image;
        }
      }
    } catch (pdftoppmError) {
      console.log("pdftoppm failed, trying ImageMagick...");
    }

    // Method 3: Try ImageMagick convert command
    console.log("Attempting PDF conversion with ImageMagick...");
    try {
      const outputImagePath = path.join(tempDir, `converted_${timestamp}.jpg`);
      const command = `convert -density 150 -quality 85 -resize 1568x1568 "${tempPdfPath}[0]" "${outputImagePath}"`;
      await execAsync(command);

      if (fs.existsSync(outputImagePath)) {
        const imageBuffer = fs.readFileSync(outputImagePath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString('base64');
          console.log(`PDF converted with ImageMagick: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

          // Clean up
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputImagePath);
          return base64Image;
        }
      }
    } catch (imageMagickError) {
      console.log("ImageMagick failed");
    }

    throw new Error('All PDF conversion methods failed');

  } catch (error) {
    console.error("PDF conversion error:", error);

    // Clean up temporary files in case of error
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }

    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractQuoteDataFromDocument(base64Data: string, mimeType: string): Promise<ExtractedQuoteData> {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable AI document analysis.");
  }

  try {
    let imageData = base64Data;
    let imageMimeType = mimeType;

    // Handle PDF conversion
    if (mimeType === 'application/pdf') {
      console.log("Converting PDF to image for AI analysis...");
      try {
        imageData = await convertPdfToImage(base64Data);
        imageMimeType = 'image/jpeg';
        console.log("PDF conversion successful, proceeding with AI analysis...");
      } catch (pdfError) {
        console.error("PDF conversion failed:", pdfError);
        throw new Error("PDF conversion failed. Please convert your PDF to an image (JPG/PNG) and try again, or fill out the form manually.");
      }
    }

    // Only process if we have an image
    if (!imageMimeType.startsWith('image/')) {
      throw new Error("Unsupported file type. Only images and PDFs are supported.");
    }

    // Check image size
    const imageSizeKB = (imageData.length * 3) / 4 / 1024;
    console.log(`Image size: ${imageSizeKB.toFixed(2)} KB`);

    if (!imageData || imageData.length === 0) {
      throw new Error("No image data available for analysis.");
    }

    // Claude can handle up to 5MB per image
    if (imageSizeKB > 5000) {
      throw new Error("Image too large for AI analysis. Please use a smaller image.");
    }

    if (imageSizeKB < 1) {
      throw new Error("Image appears to be empty or corrupted.");
    }

    console.log("Sending image to Claude for analysis...");

    // Map MIME types to Claude's expected format
    let claudeMediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    if (imageMimeType === 'image/jpeg' || imageMimeType === 'image/jpg') {
      claudeMediaType = 'image/jpeg';
    } else if (imageMimeType === 'image/png') {
      claudeMediaType = 'image/png';
    } else if (imageMimeType === 'image/gif') {
      claudeMediaType = 'image/gif';
    } else if (imageMimeType === 'image/webp') {
      claudeMediaType = 'image/webp';
    } else {
      // Default to JPEG for unknown types
      claudeMediaType = 'image/jpeg';
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: `You are an expert at extracting structured information from construction and service quotes/estimates.
      Analyze the document and extract relevant information for a quote management system.

      Return ONLY a valid JSON object with the following fields (only include fields if information is clearly present):
      - projectTitle: Brief title of the project/work
      - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
      - description: Detailed description of work to be performed
      - scope: Specific scope of work, materials, specifications
      - amount: Total estimated cost (extract numbers and currency)
      - vendorName: Company/contractor name
      - vendorEmail: Contact email
      - vendorPhone: Phone number
      - vendorAddress: Business address
      - vendorWebsite: Website URL
      - licenseNumber: License or certification number
      - hasLiabilityInsurance: true/false if insurance is mentioned
      - startDate: Proposed start date (YYYY-MM-DD format)
      - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
      - validUntil: Quote expiration date (YYYY-MM-DD format)
      - warranty: Warranty terms/period
      - paymentTerms: Payment schedule or terms
      - notes: Additional important details or conditions

      Be conservative - only extract information that is clearly stated. Don't make assumptions.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: claudeMediaType,
                data: imageData,
              },
            },
            {
              type: "text",
              text: "Please analyze this quote/estimate document and extract the structured information in JSON format. Return ONLY the JSON object, no other text."
            }
          ],
        },
      ],
    });

    console.log("Claude analysis completed successfully");

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(jsonText);
    return result as ExtractedQuoteData;
  } catch (error: any) {
    console.error("Error extracting quote data:", error);

    // Provide specific error messages
    if (error.status === 429) {
      throw new Error("Too many requests to Claude API. Please wait a moment and try again.");
    } else if (error.status === 401) {
      throw new Error("Invalid Claude API key. Please check your ANTHROPIC_API_KEY configuration.");
    } else if (error.status === 413) {
      throw new Error("Image file is too large for AI analysis. Please use a smaller file.");
    } else {
      throw new Error(`Failed to analyze document with AI: ${error.message || 'Unknown error'}`);
    }
  }
}

export async function extractQuoteDataFromText(text: string): Promise<ExtractedQuoteData> {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable AI text analysis.");
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: `You are an expert at extracting structured information from construction and service quotes/estimates text.
      Analyze the text and extract relevant information for a quote management system.

      Return ONLY a valid JSON object with the following fields (only include fields if information is clearly present):
      - projectTitle: Brief title of the project/work
      - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
      - description: Detailed description of work to be performed
      - scope: Specific scope of work, materials, specifications
      - amount: Total estimated cost (extract numbers and currency)
      - vendorName: Company/contractor name
      - vendorEmail: Contact email
      - vendorPhone: Phone number
      - vendorAddress: Business address
      - vendorWebsite: Website URL
      - licenseNumber: License or certification number
      - hasLiabilityInsurance: true/false if insurance is mentioned
      - startDate: Proposed start date (YYYY-MM-DD format)
      - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
      - validUntil: Quote expiration date (YYYY-MM-DD format)
      - warranty: Warranty terms/period
      - paymentTerms: Payment schedule or terms
      - notes: Additional important details or conditions

      Be conservative - only extract information that is clearly stated. Don't make assumptions.`,
      messages: [
        {
          role: "user",
          content: `Please analyze this quote/estimate text and extract the structured information in JSON format. Return ONLY the JSON object, no other text:\n\n${text}`
        },
      ],
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from response
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const result = JSON.parse(jsonText);
    return result as ExtractedQuoteData;
  } catch (error) {
    console.error("Error extracting quote data from text:", error);
    throw new Error("Failed to analyze text with AI");
  }
}
