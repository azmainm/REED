"use client";

import { useState, useRef } from 'react';
import { Camera, FileText, Upload, Trash, RefreshCw } from 'lucide-react';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

export default function ImageUploader({ 
  onFilesSelected, 
  onTextExtracted,
  maxFiles = 10,
  acceptedFileTypes = ".pdf,.txt,.docx",
  showOCR = false
}) {
  const { isMobile } = useDeviceDetect();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Set as the document file for display
      setDocumentFile(file);
      
      // Also track in all files for processing
      setAllFiles(prev => [...prev, file]);
      onFilesSelected([...allFiles, file]);
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
      
      // Check if adding these images would exceed the max
      if (capturedImages.length + imageUrls.length > maxFiles) {
        alert(`You can upload a maximum of ${maxFiles} images`);
        return;
      }
      
      const updatedImages = [...capturedImages, ...imageUrls];
      setCapturedImages(updatedImages);
      
      // Add to all files collection for OCR
      const newFiles = [...allFiles, ...newImages];
      setAllFiles(newFiles);
      onFilesSelected(newFiles);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Set as the document file for display
      setDocumentFile(file);
      
      // Also track in all files for processing
      setAllFiles(prev => [...prev, file]);
      onFilesSelected([...allFiles, file]);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleRemoveImage = (index) => {
    setCapturedImages(prev => {
      const newImages = [...prev];
      
      // Remove file from allFiles as well
      setAllFiles(currentFiles => {
        const fileToRemove = newImages[index].file;
        return currentFiles.filter(file => file !== fileToRemove);
      });
      
      // Release the object URL to free memory
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      
      onFilesSelected(allFiles.filter(file => 
        !newImages.some(img => img.file === file)
      ));
      
      return newImages;
    });
  };
  
  const handleRemoveDocument = () => {
    // Remove the document file from allFiles
    setAllFiles(currentFiles => 
      currentFiles.filter(file => file !== documentFile)
    );
    
    // Clear the document file
    setDocumentFile(null);
    
    // Update files selected
    onFilesSelected(allFiles.filter(file => file !== documentFile));
  };
  
  const toggleImagePreview = () => {
    setShowPreview(!showPreview);
  };
  
  const processImagesWithOCR = async () => {
    if (allFiles.length === 0 || !showOCR) return;
    
    setIsProcessing(true);
    
    try {
      // Dynamically import tesseract.js to reduce initial load time
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      let combinedText = "";
      
      // Only process image files with OCR
      const imageFiles = allFiles.filter(file => file.type.startsWith('image/'));
      
      for (let i = 0; i < imageFiles.length; i++) {
        const { data: { text } } = await worker.recognize(imageFiles[i]);
        combinedText += text + "\n\n";
      }
      
      await worker.terminate();
      onTextExtracted(combinedText.trim());
    } catch (error) {
      console.error("OCR processing error:", error);
      alert("Error processing images");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div>
      {/* Camera button only for mobile */}
      <div className="mb-6 w-full">
        <div 
          className="relative w-full"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={!isMobile}
            className={`w-full flex items-center justify-center gap-2 p-4 border rounded-lg 
              ${isMobile 
                ? "hover:bg-zinc-200 dark:hover:bg-zinc-800" 
                : "opacity-50 cursor-not-allowed"} 
              transition-colors`}
          >
            <Camera className="h-5 w-5" />
            <span>Take Pictures</span>
          </button>
          
          {/* Tooltip */}
          {showTooltip && !isMobile && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
              This feature is only available on mobile devices
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
            </div>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes}
      />
      
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        className="hidden"
        accept="image/*"
        capture="environment"
        multiple
      />
      
      {/* File drop area */}
      {!capturedImages.length && !documentFile && (
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Drag and drop or click to upload</p>
            <p className="text-sm text-muted-foreground">
              {showOCR ? "Supports images and documents" : `Supports ${acceptedFileTypes}`}
            </p>
          </div>
        </div>
      )}
      
      {/* Document file display */}
      {documentFile && (
        <div className="mb-6 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{documentFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(documentFile.size)} • {documentFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleRemoveDocument}
              className="p-1 rounded-full hover:bg-muted/20"
              aria-label="Remove file"
            >
              <Trash className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              Change file
            </button>
          </div>
        </div>
      )}
      
      {/* Image preview section */}
      {capturedImages.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Captured Images ({capturedImages.length}/{maxFiles})</h3>
            <div className="flex gap-2">
              <button
                onClick={toggleImagePreview}
                className="text-sm font-medium text-primary"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              {showOCR && (
                <button
                  onClick={processImagesWithOCR}
                  disabled={isProcessing}
                  className="flex items-center gap-1 text-sm font-medium bg-primary text-white px-3 py-1 rounded-md"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Extract Text</>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {showPreview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {capturedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image.url} 
                    alt={`Captured ${index}`} 
                    className="w-full h-32 object-cover rounded-md" 
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
