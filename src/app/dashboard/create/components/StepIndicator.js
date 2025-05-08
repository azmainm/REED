"use client";

export default function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Interactive Reed</h1>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of 5
        </div>
      </div>
      
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((step) => (
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
              {step === 3 && "Dialogue"}
              {step === 4 && "Quiz"}
              {step === 5 && "Publish"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 