"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  FileText, 
  Sparkles, 
  BookText, 
  BookCopy, 
  RefreshCw, 
  Tag,
  X,
  Camera,
  Trash,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';
import ImageUploader from "@/components/image-uploader";
import { generateReed, formatDialogue, dialogueToJsonString } from "@/lib/reed-service";

// List of categories
const categories = ["Philosophy", "Ethics", "Logic", "Politics", "Communication", "Science", "Mathematics"];

export default function CreatePage() {
  const router = useRouter();
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
    title: "The Socratic Method",
    description: "An interactive dialogue on critical thinking",
    category: "Philosophy",
    coverImage: null
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
          
          // Clear any previous text
          setStoryText("");
          
          const result = await generateReed(extractedContent.text, selectedStyle);
          
          if (result.success) {
            const formattedDialogue = formatDialogue(result.generatedText);
            setStoryText(dialogueToJsonString(formattedDialogue));
            setDialogueGenerated(true);
            showToastMessage('Reed generated successfully');
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
  }, [currentStep, selectedStyle, extractedContent, dialogueGenerated]);

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
    setFileUploaded(files.length > 0);
    
    if (files.length === 1 && !files[0].type.startsWith('image/')) {
      // If it's a single non-image file, update the fileName
      setFileName(files[0].name);
    } else if (files.length > 0) {
      // If it's images, update with a count
      setFileName(`${files.length} file(s) selected`);
    }
    
    showToastMessage(files.length > 0 ? "Files uploaded successfully" : "No files selected");
  };

  const handleTextExtracted = (text) => {
    // Store the extracted text instead of displaying it
    setRecognizedText(text);
    setExtractedContent({
      type: 'ocr',
      text: text,
      timestamp: new Date().toISOString()
    });
    
    showToastMessage("Text extracted and stored for processing");
  };

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

  const handlePublish = () => {
    showToastMessage("Module published successfully");
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
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
      console.log("Proceeding with extracted content:", extractedContent);
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
        return !fileUploaded;
      case 2:
        return !selectedStyle;
      case 4:
        return !metadata.title || !metadata.description || !metadata.category;
      default:
        return false;
    }
  };

  const handleCameraCapture = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      
      // Create preview URLs for the captured images
      const imageUrls = newImages.map(file => {
        return {
          file,
          url: URL.createObjectURL(file)
        };
      });
      
      // Check if adding these images would exceed the max of 10
      if (capturedImages.length + imageUrls.length > 10) {
        showToastMessage("You can upload a maximum of 10 images");
        return;
      }
      
      setCapturedImages(prev => [...prev, ...imageUrls]);
      setFileUploaded(true);
      showToastMessage(`${newImages.length} image(s) captured`);
    }
  };
  
  const handleRemoveImage = (index) => {
    setCapturedImages(prev => {
      const newImages = [...prev];
      // Release the object URL to free memory
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      if (newImages.length === 0) {
        setFileUploaded(false);
      }
      return newImages;
    });
  };
  
  const toggleImagePreview = () => {
    setShowPreview(!showPreview);
  };
  
  const processImagesWithOCR = async () => {
    if (capturedImages.length === 0) return;
    
    setIsProcessing(true);
    showToastMessage("Processing images with OCR...");
    
    try {
      const worker = await createWorker();
      let combinedText = "";
      
      for (let i = 0; i < capturedImages.length; i++) {
        const { data: { text } } = await worker.recognize(capturedImages[i].file);
        combinedText += text + "\n\n";
      }
      
      await worker.terminate();
      setRecognizedText(combinedText.trim());
      setFileName("Extracted from camera");
      showToastMessage("OCR processing complete");
    } catch (error) {
      console.error("OCR processing error:", error);
      showToastMessage("Error processing images");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUploadSection = () => (
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
      
      {/* We're no longer displaying the recognized text */}
    </div>
  );

  // Render review section with waiting state
  const renderReviewSection = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Review & Edit Reed</h2>
      <p className="text-muted-foreground mb-6">
        Review the generated dialogue and make any necessary edits.
      </p>
      
      <div className="relative mb-4">
        <textarea
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          className="w-full min-h-[300px] rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Reed will appear here once generated..."
          readOnly={isGenerating || !dialogueGenerated}
        />
        
        {/* Always show loading overlay when generating */}
        {isGenerating && (
          <div className="absolute inset-0 bg-card/90 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <RefreshCw className="h-12 w-12 text-primary animate-spin" />
              <p className="font-medium text-base">
                {isGenerating ? 'Generating Reed...' : 'Regenerating Reed...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a moment as we create your dialogue
              </p>
            </div>
          </div>
        )}
      </div>
      
      {generationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error generating reed</p>
            <p className="mt-1">{generationError}</p>
            <button 
              onClick={() => {
                setDialogueGenerated(false);
                setGenerationError(null);
                const generateDialogueOnStep3 = async () => {
                  if (selectedStyle && extractedContent) {
                    try {
                      setIsGenerating(true);
                      const result = await generateReed(extractedContent.text, selectedStyle);
                      if (result.success) {
                        const formattedDialogue = formatDialogue(result.generatedText);
                        setStoryText(dialogueToJsonString(formattedDialogue));
                        setDialogueGenerated(true);
                        showToastMessage('Reed generated successfully');
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
              }}
              className="mt-2 text-primary font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleRegenerate}
        disabled={isRegenerating || isGenerating || !dialogueGenerated}
        className={`inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors ${
          isRegenerating || isGenerating || !dialogueGenerated 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:bg-accent"
        }`}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        Regenerate
      </button>
    </div>
  );

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Interactive Reed</h1>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </div>
        </div>
        
        <div className="flex items-center">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className="flex-1 flex flex-col items-center"
            >
              <div className={`h-2 w-full mb-2 rounded-full ${
                step < currentStep
                  ? "bg-primary"
                  : step === currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              }`} />
              <div className={`text-xs font-medium ${
                step === currentStep ? "text-primary" : "text-muted-foreground"
              }`}>
                {step === 1 && "Upload"}
                {step === 2 && "Style"}
                {step === 3 && "Review"}
                {step === 4 && "Publish"}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-md mb-8">
        {/* Step 1: Upload */}
        {currentStep === 1 && renderUploadSection()}
        
        {/* Step 2: Style Selection */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Style</h2>
            <p className="text-muted-foreground mb-6">
              Choose a style for your interactive reed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedStyle === "Platonic"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleStyleSelect("Platonic")}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <BookText className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Platonic</h3>
                      {selectedStyle === "Platonic" && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Traditional dialogue format with clear explanations and guided learning.
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedStyle === "Socratic"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleStyleSelect("Socratic")}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Socratic</h3>
                      {selectedStyle === "Socratic" && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Question-based approach that guides learners to discover answers through reflection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Story Review */}
        {currentStep === 3 && renderReviewSection()}
        
        {/* Step 4: Metadata & Publish */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Add Metadata & Publish</h2>
            <p className="text-muted-foreground mb-6">
              Add final details to your reed before publishing.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image
                </label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-2 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors h-40 flex items-center justify-center"
                  onClick={() => coverImageInputRef.current?.click()}
                  onDrop={handleCoverImageDrop}
                  onDragOver={handleCoverImageDragOver}
                >
                  <input
                    type="file"
                    ref={coverImageInputRef}
                    onChange={handleCoverImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  
                  {coverImagePreview ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 text-white rounded-lg transition-opacity">
                        <p>Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload a cover image
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200 x 630 pixels (16:9 ratio)
                </p>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={metadata.description}
                  onChange={handleMetadataChange}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={metadata.category}
                    onChange={handleMetadataChange}
                    className="w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
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
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={isNextDisabled() || (currentStep === 2 && isGenerating)}
              className={`flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors ${
                isNextDisabled() || (currentStep === 2 && isGenerating) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {currentStep === 2 && isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
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
              disabled={isNextDisabled()}
              className={`flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors ${
                isNextDisabled() ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              Publish
              <BookCopy className="ml-2 h-4 w-4" />
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