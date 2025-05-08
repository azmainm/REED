"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  X,
  BookCopy,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';
import { 
  generateReed, 
  formatDialogue, 
  dialogueToJsonString, 
  extractPdfText, 
  saveReedToFirestore,
  generateQuizQuestions 
} from "@/lib/api-service";
import { useAuth } from "@/contexts/AuthContext";

// Import components
import StepIndicator from "./components/StepIndicator";
import UploadStep from "./components/UploadStep";
import StyleStep from "./components/StyleStep";
import ReviewStep from "./components/ReviewStep";
import QuizStep from "./components/QuizStep";
import PublishStep from "./components/PublishStep";

// List of categories
const categories = ["Fiction", "Biographies", "Business", "Finance", "Philosophy", "Ethics", "Logic", "Politics", "Communication", "Science", "Mathematics"];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [storyText, setStoryText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    category: "Philosophy",
    coverImage: null,
    authorName: ""
  });
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedContent, setExtractedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [dialogueGenerated, setDialogueGenerated] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [extractionTimer, setExtractionTimer] = useState(null);
  const [dialogueData, setDialogueData] = useState(null);
  const [savingReed, setSavingReed] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [generationDelayComplete, setGenerationDelayComplete] = useState(false);
  const [generationDelayTimer, setGenerationDelayTimer] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Detect device type on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Auto-generate dialogue when entering step 3
  useEffect(() => {
    const generateDialogueOnStep3 = async () => {
      if (currentStep === 3 && selectedStyle && extractedContent && !dialogueGenerated) {
        try {
          setIsGenerating(true);
          setGenerationError(null);
          setGenerationDelayComplete(false);
          
          // Clear any previous text
          setStoryText("");
          
          const result = await generateReed(extractedContent.text, selectedStyle);
          
          if (result.success) {
            const formattedDialogue = formatDialogue(result.generatedText);
            setDialogueData(formattedDialogue);
            setStoryText(dialogueToJsonString(formattedDialogue));
            setDialogueGenerated(true);
            showToastMessage('Reed generated successfully');
            
            // Clear any existing timer
            if (generationDelayTimer !== null) {
              clearTimeout(generationDelayTimer);
            }
            
            // Set a 3-second timer before enabling the next button
            const timer = setTimeout(() => {
              setGenerationDelayComplete(true);
              showToastMessage("Ready to continue to next step");
            }, 1000);
            
            setGenerationDelayTimer(timer);
          } else {
            throw new Error(result.error || 'Failed to generate reed');
          }
        } catch (error) {
          console.error('Error generating reed:', error);
          setGenerationError(error.message);
          showToastMessage('Error generating reed: ' + error.message);
        } finally {
          setIsGenerating(false);
        }
      }
    };
    
    generateDialogueOnStep3();
    
    // Cleanup
    return () => {
      if (generationDelayTimer !== null) {
        clearTimeout(generationDelayTimer);
      }
    };
  }, [currentStep, selectedStyle, extractedContent, dialogueGenerated, generationDelayTimer]);

  // Add useEffect for quiz generation when entering step 4
  useEffect(() => {
    const generateQuizOnStep4 = async () => {
      if (currentStep === 4 && dialogueData && !quizGenerated) {
        try {
          setIsGeneratingQuiz(true);
          
          // Convert dialogue data to text format
          const dialogueText = dialogueData.dialogues
            .map(d => `${d.speaker === 'teacher' ? 'Teacher' : 'Student'}: ${d.content}`)
            .join('\n\n');
          
          const result = await generateQuizQuestions(dialogueText);
          
          if (result.success) {
            setQuizQuestions(result.questions);
            setQuizGenerated(true);
            showToastMessage('Quiz questions generated successfully');
          } else {
            throw new Error(result.error || 'Failed to generate quiz questions');
          }
        } catch (error) {
          console.error('Error generating quiz:', error);
          showToastMessage('Error generating quiz: ' + error.message);
        } finally {
          setIsGeneratingQuiz(false);
        }
      }
    };
    
    generateQuizOnStep4();
  }, [currentStep, dialogueData, quizGenerated]);

  const handleFilesSelected = async (files) => {
    if (files.length === 0) {
      setFileUploaded(false);
      setFileName("");
      showToastMessage("No files selected");
      return;
    }

    setUploadedFiles(files);
    setFileUploaded(true);
    setExtractionComplete(false);
    
    if (files.length === 1 && !files[0].type.startsWith('image/')) {
      // If it's a single non-image file, update the fileName
      setFileName(files[0].name);
    } else if (files.length > 0) {
      // If it's images, update with a count
      setFileName(`${files.length} file(s) selected`);
    }
    
    showToastMessage("Files uploaded successfully");
    
    // Begin extraction process
    await extractTextFromFiles(files);
  };

  const extractTextFromFiles = async (files) => {
    setIsExtracting(true);
    setExtractionComplete(false);
    
    try {
      // Handle text files directly
      if (files.length === 1 && files[0].type === 'text/plain') {
        await handleTextFile(files[0]);
        return;
      }
      
      // Handle PDF files
      if (files.length === 1 && files[0].type === 'application/pdf') {
        await handlePdfFile(files[0]);
        return;
      }
      
      // Handle DOC/DOCX files (would need a service)
      if (files.length === 1 && 
         (files[0].type === 'application/msword' || 
          files[0].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        // This would require a backend service
        showToastMessage("Word documents require server processing, uploading...");
        // Here you'd send to your server
        return;
      }
      
      // Handle image files with OCR
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        await handleImageFiles(imageFiles);
        return;
      }

      // If we got here, we don't know how to handle these files
      showToastMessage("Unsupported file type");
      setIsExtracting(false);
      
    } catch (error) {
      console.error("Error extracting content:", error);
      showToastMessage("Error extracting content from files");
      setIsExtracting(false);
    }
  };

  const handleTextFile = async (file) => {
    showToastMessage("Reading text file...");
    
    try {
      const text = await readTextFile(file);
      
      const content = {
        type: 'text',
        text: text,
        timestamp: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        filePath: URL.createObjectURL(file)
      };
      
      // Store in state and localStorage/sessionStorage for persistence
      setExtractedContent(content);
      sessionStorage.setItem('extractedContent', JSON.stringify(content));
      
      
      finishExtraction();
    } catch (error) {
      console.error("Error reading text file:", error);
      showToastMessage("Error reading text file");
      setIsExtracting(false);
    }
  };

  const handlePdfFile = async (file) => {
    showToastMessage("Extracting text from PDF...");
    
    try {
      // Call the API service to extract text from the PDF
      const result = await extractPdfText(file);
      
      // Create content object from the result
      const content = {
        type: 'pdf',
        text: result.data.text,
        pageCount: result.data.pageCount,
        timestamp: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size
      };
      
      // Store in state and sessionStorage for persistence
      setExtractedContent(content);
      sessionStorage.setItem('extractedContent', JSON.stringify(content));
      
      
      finishExtraction();
    } catch (error) {
      console.error("Error extracting PDF:", error);
      showToastMessage("Error extracting PDF content: " + error.message);
      setIsExtracting(false);
    }
  };

  const handleImageFiles = async (files) => {
    showToastMessage("Processing images with OCR...");
    
    try {
      const worker = await createWorker();
      let combinedText = "";
      
      for (let i = 0; i < files.length; i++) {
        showToastMessage(`Processing image ${i+1} of ${files.length}...`);
        const { data: { text } } = await worker.recognize(files[i]);
        combinedText += text + "\n\n";
      }
      
      await worker.terminate();
      
      const content = {
        type: 'ocr',
        text: combinedText.trim(),
        timestamp: new Date().toISOString(),
        imageCount: files.length,
        fileName: files.length === 1 ? files[0].name : `${files.length} images`
      };
      
      setExtractedContent(content);
      sessionStorage.setItem('extractedContent', JSON.stringify(content));
      
      
      finishExtraction();
    } catch (error) {
      console.error("OCR processing error:", error);
      showToastMessage("Error processing images with OCR");
      setIsExtracting(false);
    }
  };

  const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  const finishExtraction = () => {
    showToastMessage("Text extraction complete!");
    setIsExtracting(false);
    
    // Clear any existing timer
    if (extractionTimer !== null) {
      clearTimeout(extractionTimer);
    }
    
    // Set a 2-second timer before enabling the next button
    const timer = setTimeout(() => {
      setExtractionComplete(true);
      showToastMessage("Ready to continue to next step");
    }, 1000);
    
    setExtractionTimer(timer);
  };

  const handleTextExtracted = (text) => {
    // This handles OCR text extracted in ImageUploader component
    const content = {
      type: 'ocr',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    setExtractedContent(content);
    sessionStorage.setItem('extractedContent', JSON.stringify(content));
    
    
    // Show toast and set timer
    showToastMessage("Text extracted and stored for processing");
    setIsExtracting(false);
    
    // Clear any existing timer
    if (extractionTimer !== null) {
      clearTimeout(extractionTimer);
    }
    
    // Set a 2-second timer before enabling the next button
    const timer = setTimeout(() => {
      setExtractionComplete(true);
      showToastMessage("Ready to continue to next step");
    }, 1000);
    
    setExtractionTimer(timer);
  };

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (extractionTimer !== null) {
        clearTimeout(extractionTimer);
      }
    };
  }, [extractionTimer]);

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    showToastMessage(`You selected ${style} style`);
  };

  const handleRegenerate = async () => {
    if (!selectedStyle || !extractedContent) {
      showToastMessage('Missing required data for regeneration');
      return;
    }
    
    try {
      setIsRegenerating(true);
      setGenerationError(null);
      
      const result = await generateReed(extractedContent.text, selectedStyle);
      
      if (result.success) {
        const formattedDialogue = formatDialogue(result.generatedText);
        setStoryText(dialogueToJsonString(formattedDialogue));
        showToastMessage('Reed regenerated successfully');
      } else {
        throw new Error(result.error || 'Failed to regenerate reed');
      }
    } catch (error) {
      console.error('Error regenerating reed:', error);
      setGenerationError(error.message);
      showToastMessage('Error regenerating reed: ' + error.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata({
      ...metadata,
      [name]: value
    });
  };

  const handlePublish = async () => {
    try {
      setSavingReed(true);
      setSaveError(null);
      
      const reedData = {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        dialogues: dialogueData.dialogues,
        quizQuestions,
        isPrivate: !isPublic,
        userName: user?.displayName || "Anonymous User",
        authorName: metadata.authorName || "Anonymous",
        userId: user?.uid || null,
        coverImageUrl: coverImagePreview,
        style: selectedStyle,
        originalContent: extractedContent ? {
          type: extractedContent.type,
          timestamp: extractedContent.timestamp,
          fileName: extractedContent.fileName || null
        } : null
      };
      
      const result = await saveReedToFirestore(reedData);
      
      showToastMessage("Reed published successfully!");
      
      // Save to recent reeds
      const recentReeds = JSON.parse(localStorage.getItem('recentReeds') || '[]');
      recentReeds.unshift({
        id: result.reedId,
        title: metadata.title,
        category: metadata.category,
        timestamp: new Date().toISOString(),
        authorName: metadata.authorName || "Anonymous"
      });
      localStorage.setItem('recentReeds', JSON.stringify(recentReeds.slice(0, 5)));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error publishing reed:", error);
      setSaveError(error.message);
      showToastMessage("Error publishing reed: " + (error.message || "Unknown error occurred"));
    } finally {
      setSavingReed(false);
    }
  };

  const handleCancel = () => {
    // Show toast message
    showToastMessage("Creation cancelled");
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const nextStep = async () => {
    // If moving from step 1 to step 2 and we have extracted content
    if (currentStep === 1 && extractedContent) {
    }
    
    // For step 3, we'll handle generation in the useEffect hook
    if (currentStep === 2 && selectedStyle && extractedContent) {
      setDialogueGenerated(false); // Reset dialogue generation flag
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCoverImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
        setMetadata({
          ...metadata,
          coverImage: file
        });
        showToastMessage("Cover image uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
        setMetadata({
          ...metadata,
          coverImage: file
        });
        showToastMessage("Cover image uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageDragOver = (e) => {
    e.preventDefault();
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !fileUploaded || isExtracting || !extractionComplete;
      case 2:
        return !selectedStyle;
      case 3:
        return isGenerating || !dialogueGenerated || !generationDelayComplete;
      case 4:
        return isGeneratingQuiz || !quizGenerated;
      case 5:
        return !metadata.title || !metadata.description || !metadata.category || !metadata.authorName;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStep
            isExtracting={isExtracting}
            extractedContent={extractedContent}
            extractionComplete={extractionComplete}
            handleFilesSelected={handleFilesSelected}
            handleTextExtracted={handleTextExtracted}
          />
        );
      case 2:
        return (
          <StyleStep
            selectedStyle={selectedStyle}
            handleStyleSelect={handleStyleSelect}
          />
        );
      case 3:
        return (
          <ReviewStep
            storyText={storyText}
            setStoryText={setStoryText}
            isGenerating={isGenerating}
            dialogueGenerated={dialogueGenerated}
            generationError={generationError}
            handleRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        );
      case 4:
        return (
          <QuizStep
            isGeneratingQuiz={isGeneratingQuiz}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
          />
        );
      case 5:
        return (
          <PublishStep
            metadata={metadata}
            handleMetadataChange={handleMetadataChange}
            coverImagePreview={coverImagePreview}
            handleCoverImageUpload={handleCoverImageUpload}
            handleCoverImageDrop={handleCoverImageDrop}
            handleCoverImageDragOver={handleCoverImageDragOver}
            coverImageInputRef={coverImageInputRef}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            categories={categories}
            isCategoryDropdownOpen={isCategoryDropdownOpen}
            setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <StepIndicator currentStep={currentStep} />
      
      <div className="rounded-lg border border-border bg-card p-6 shadow-md mb-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {currentStep > 1 ? (
          <button
            onClick={prevStep}
            className="flex items-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center rounded-lg bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 hover:shadow-md"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={isNextDisabled()}
              className={`flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors ${
                isNextDisabled() ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {currentStep === 1 && isExtracting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : currentStep === 1 && !extractionComplete && extractedContent ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : currentStep === 2 && isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : currentStep === 3 && dialogueGenerated && !generationDelayComplete ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : currentStep === 4 && isGeneratingQuiz ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isNextDisabled() || savingReed}
              className={`flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors ${
                isNextDisabled() || savingReed ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {savingReed ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish
                  <BookCopy className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
} 