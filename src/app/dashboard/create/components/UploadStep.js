"use client";

import { RefreshCw, Check } from "lucide-react";
import ImageUploader from "@/components/image-uploader";

export default function UploadStep({ 
  isExtracting, 
  extractedContent, 
  extractionComplete,
  handleFilesSelected,
  handleTextExtracted 
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <p className="text-muted-foreground mb-6">
        Upload a PDF, text file, or take photos to convert into an interactive reed.
      </p>
      
      <ImageUploader
        onFilesSelected={handleFilesSelected}
        onTextExtracted={handleTextExtracted}
        maxFiles={10}
        acceptedFileTypes=".pdf,.txt,.docx"
        showOCR={true}
      />
      
      {/* Extraction Status */}
      {isExtracting && (
        <div className="mt-6 p-4 border rounded-md bg-primary/5 flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          <div>
            <p className="font-medium">Extracting text from your document</p>
            <p className="text-sm text-muted-foreground">This may take a moment depending on the file size</p>
          </div>
        </div>
      )}
      
      {extractedContent && !isExtracting && (
        <div className="mt-6 p-4 border rounded-md bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-600 dark:text-green-400">
              Text extraction complete
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {extractionComplete ? 
              "You can now proceed to the next step." : 
              "Please wait a moment before continuing..."}
          </p>
          
          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md max-h-32 overflow-y-auto text-sm font-mono">
            <p className="text-xs">Preview:</p>
            <p className="whitespace-pre-wrap">
              {extractedContent.text.substring(0, 200)}
              {extractedContent.text.length > 200 ? "..." : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 