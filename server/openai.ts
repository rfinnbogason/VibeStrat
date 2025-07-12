import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fromPath } from "pdf2pic";

const execAsync = promisify(exec);

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Audio transcription for meeting recordings
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
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
      language: "en", // You can make this configurable if needed
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

// Generate professional meeting minutes from transcription
export async function generateMeetingMinutes(
  transcription: string, 
  meetingTitle: string, 
  meetingType: string,
  chairperson?: string,
  agenda?: string
): Promise<string> {
  try {
    const prompt = `
You are a professional meeting secretary. Please create formal, well-structured meeting minutes from the following transcription.

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

Make the minutes clear, concise, and professionally formatted. Focus on key decisions, action items, and important discussions. Avoid including filler words or casual conversation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a professional meeting secretary with expertise in creating formal meeting minutes for strata/condominium board meetings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, professional output
      max_tokens: 2000
    });

    return response.choices[0].message.content || "Failed to generate meeting minutes";
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
        density: 100,           // DPI
        saveFilename: "page",   // Output filename
        savePath: tempDir,      // Output directory
        format: "jpeg",         // Output format
        width: 800,             // Width
        height: 1000,           // Height
        quality: 70             // JPEG quality
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
      
      const command = `pdftoppm -f 1 -l 1 -jpeg -r 100 -scale-to-x 800 -scale-to-y 1000 "${tempPdfPath}" "${outputPrefix}"`;
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
      const command = `convert -density 100 -quality 70 -resize 800x1000 "${tempPdfPath}[0]" "${outputImagePath}"`;
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
  try {
    let imageData = base64Data;
    let imageMimeType = mimeType;
    
    // Handle PDF conversion with multiple fallback methods
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
    
    // Only process if we have an image (either original or converted from PDF)
    if (!imageMimeType.startsWith('image/')) {
      throw new Error("Unsupported file type. Only images and PDFs are supported.");
    }

    // Check image size - OpenAI has limits on image size
    const imageSizeKB = (imageData.length * 3) / 4 / 1024; // Rough base64 to bytes conversion
    console.log(`Image size: ${imageSizeKB.toFixed(2)} KB`);
    
    // Check if image data is empty
    if (!imageData || imageData.length === 0) {
      throw new Error("No image data available for analysis. PDF conversion may have failed.");
    }
    
    if (imageSizeKB > 5000) { // Much smaller 5MB limit to avoid quota issues
      throw new Error("Image too large for AI analysis. Please use a smaller image or lower resolution PDF.");
    }
    
    if (imageSizeKB < 1) { // Check for suspiciously small images
      throw new Error("Image appears to be empty or corrupted. Please try a different file.");
    }

    console.log("Sending image to OpenAI for analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured information from construction and service quotes/estimates. 
          Analyze the document and extract relevant information for a quote management system.
          
          Return a JSON object with the following fields (only include fields if information is clearly present):
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
          
          Be conservative - only extract information that is clearly stated. Don't make assumptions.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this quote/estimate document and extract the structured information in JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMimeType};base64,${imageData}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    console.log("OpenAI analysis completed successfully");
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ExtractedQuoteData;
  } catch (error: any) {
    console.error("Error extracting quote data:", error);
    
    // Provide more specific error messages based on the error type
    if (error.status === 429) {
      if (error.error?.code === 'insufficient_quota') {
        throw new Error("OpenAI API quota exceeded. Please check your billing details at https://platform.openai.com/account/billing");
      } else {
        throw new Error("Too many requests to OpenAI API. Please wait a moment and try again.");
      }
    } else if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
    } else if (error.status === 413) {
      throw new Error("Image file is too large for AI analysis. Please use a smaller file.");
    } else {
      throw new Error(`Failed to analyze document with AI: ${error.message || 'Unknown error'}`);
    }
  }
}

export async function extractQuoteDataFromText(text: string): Promise<ExtractedQuoteData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured information from construction and service quotes/estimates text. 
          Analyze the text and extract relevant information for a quote management system.
          
          Return a JSON object with the following fields (only include fields if information is clearly present):
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
          
          Be conservative - only extract information that is clearly stated. Don't make assumptions.`
        },
        {
          role: "user",
          content: `Please analyze this quote/estimate text and extract the structured information in JSON format:\n\n${text}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ExtractedQuoteData;
  } catch (error) {
    console.error("Error extracting quote data from text:", error);
    throw new Error("Failed to analyze text with AI");
  }
}