"use client";

import { RefreshCw, AlertCircle } from "lucide-react";

export default function ReviewStep({
  storyText,
  setStoryText,
  isGenerating,
  dialogueGenerated,
  generationError,
  handleRegenerate,
  isRegenerating
}) {
  return (
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
} 