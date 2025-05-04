const fs = require('fs');
const path = require('path');
const { PDFExtract } = require('pdf.js-extract');
const { createWorker } = require('tesseract.js');
const pdfExtract = new PDFExtract();

// Path to test files - update these paths as needed
const pdfPath = "C:\\Users\\hp\\Downloads\\alibaba_red_envelope.pdf";
const imagePath = "C:\\Users\\hp\\Downloads\\test.png"; 

async function extractTextFromPdf(filePath) {
  try {
    console.log(`Extracting text from PDF: ${filePath}`);
    
    const data = await pdfExtract.extract(filePath, {});
    
    // Extract text from each page and combine
    let extractedText = '';
    data.pages.forEach((page) => {
      // Get text content from the page
      const pageText = page.content
        .map(item => item.str)
        .join(' ');
      
      extractedText += pageText + '\n\n';
    });
    
    return {
      success: true,
      text: extractedText.trim(),
      pageCount: data.pages.length
    };
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function extractTextFromImage(filePath) {
  try {
    console.log(`Extracting text from image: ${filePath}`);
    
    const worker = await createWorker();
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    
    return {
      success: true,
      text: text.trim()
    };
  } catch (error) {
    console.error('Error extracting image text with OCR:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function extractFromFile(filePath) {
  const fileExt = path.extname(filePath).toLowerCase();
  
  if (fileExt === '.pdf') {
    return await extractTextFromPdf(filePath);
  } else if (['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'].includes(fileExt)) {
    return await extractTextFromImage(filePath);
  } else {
    return {
      success: false,
      error: `Unsupported file type: ${fileExt}`
    };
  }
}

async function main() {
  try {
    // Get file path from command line arguments or use default
    const filePath = process.argv[2] || imagePath;
    
    console.log(`Processing file: ${filePath}`);
    const result = await extractFromFile(filePath);
    
    if (result.success) {
      // Create an object to store extracted content similar to the app
      const extractedContent = {
        type: path.extname(filePath).substring(1), // remove the dot
        text: result.text,
        pageCount: result.pageCount || 1,
        timestamp: new Date().toISOString(),
        filePath: filePath,
        fileName: path.basename(filePath)
      };
      
      // Save to JSON file
      const outputPath = path.join(process.cwd(), 'extracted-content.json');
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(extractedContent, null, 2)
      );
      
      console.log(`Extraction successful! Content saved to: ${outputPath}`);
      console.log(`Text preview: ${result.text.substring(0, 200)}...`);
    } else {
      console.error('Extraction failed:', result.error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 