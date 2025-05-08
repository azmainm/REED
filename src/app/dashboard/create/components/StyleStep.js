"use client";

import { Check } from "lucide-react";

export default function StyleStep({ selectedStyle, handleStyleSelect }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Choose Teaching Style</h2>
      <p className="text-muted-foreground mb-6">
        Select a style for your interactive reed. Each style has its own unique approach to teaching.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Platonic Style */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedStyle === 'Platonic' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-accent'
          }`}
          onClick={() => handleStyleSelect('Platonic')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Platonic</h3>
            {selectedStyle === 'Platonic' && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            A structured dialogue that builds understanding through logical progression and clear explanations.
          </p>
        </div>
        
        {/* Socratic Style */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedStyle === 'Socratic' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-accent'
          }`}
          onClick={() => handleStyleSelect('Socratic')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Socratic</h3>
            {selectedStyle === 'Socratic' && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            A question-based approach that encourages critical thinking and self-discovery.
          </p>
        </div>
        
        {/* Story Style */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedStyle === 'Story' 
              ? 'border-primary bg-primary/5' 
              : 'hover:bg-accent'
          }`}
          onClick={() => handleStyleSelect('Story')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Story</h3>
            {selectedStyle === 'Story' && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            A narrative approach that teaches through engaging stories and real-world examples.
          </p>
        </div>
      </div>
    </div>
  );
} 