"use client";

import { RefreshCw } from "lucide-react";

export default function QuizStep({
  isGeneratingQuiz,
  quizQuestions,
  setQuizQuestions
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quiz Questions</h2>
      <p className="text-muted-foreground mb-6">
        Review and edit the generated quiz questions based on the dialogue.
      </p>
      
      {isGeneratingQuiz ? (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating quiz questions...</p>
          </div>
        </div>
      ) : quizQuestions.length > 0 ? (
        <div className="space-y-6">
          {quizQuestions.map((question, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Question {index + 1}
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => {
                    const newQuestions = [...quizQuestions];
                    newQuestions[index].question = e.target.value;
                    setQuizQuestions(newQuestions);
                  }}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={question.correctAnswer === option}
                      onChange={() => {
                        const newQuestions = [...quizQuestions];
                        newQuestions[index].correctAnswer = option;
                        setQuizQuestions(newQuestions);
                      }}
                      className="h-4 w-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...quizQuestions];
                        newQuestions[index].options[optionIndex] = e.target.value;
                        setQuizQuestions(newQuestions);
                      }}
                      className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No quiz questions generated yet.
        </div>
      )}
    </div>
  );
} 