"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Dummy story data
const dummyStoryContent = {
  id: 1,
  title: "Introduction to Philosophy",
  author: "Socrates",
  scenes: [
    {
      id: 1,
      text: "Welcome to the world of philosophy. My name is Socrates, and I'll be your guide on this journey. Philosophy begins with questioning the world around us and the ideas we take for granted. Are you ready to begin this exploration?",
      choices: null
    },
    {
      id: 2,
      text: "Excellent! The first step in philosophy is to acknowledge what we don't know. As I once said, 'I know that I know nothing.' This is the beginning of wisdom. When we accept our ignorance, we open ourselves to true learning.",
      choices: null
    },
    {
      id: 3,
      text: "Let's explore a fundamental question: What is justice? Many believe justice is simply 'helping friends and harming enemies.' But is this truly just? Consider a scenario: Your friend has entrusted you with their weapon, but now they've become mentally unstable and demand it back. What would be the just action?",
      choices: null
    },
    {
      id: 4,
      text: "An interesting perspective. This raises another question: Is justice merely what the stronger party decides? Or is there an objective standard of justice that exists independent of power? These are the kinds of questions that philosophers have debated for centuries.",
      choices: null
    },
    {
      id: 5,
      text: "Philosophy isn't just about finding answers; it's about asking better questions. By examining our beliefs critically, we can move closer to truth and wisdom. Remember, the unexamined life is not worth living. I hope this brief introduction has sparked your curiosity about philosophical inquiry.",
      choices: null
    }
  ]
};

export default function StoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [storyContent, setStoryContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch story content (simulated)
  useEffect(() => {
    const fetchStory = async () => {
      // In a real app, you would fetch from an API using the ID
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setStoryContent(dummyStoryContent);
        setIsLoading(false);
      }, 1000);
    };

    fetchStory();
  }, [id]);

  const goToNextScene = () => {
    if (currentSceneIndex < storyContent.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      
      // Simulate progress tracking
      if (currentSceneIndex === 2) {
        showProgressToast("Milestone reached: Philosophy Novice!");
      }
    } else {
      // Last scene
      showProgressToast("Story completed! +50 XP gained");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  const goToPrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const showProgressToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse h-64 w-full rounded-lg bg-card"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      {/* Story Title */}
      <h1 className="text-3xl font-bold mb-6">{storyContent.title}</h1>
      
      {/* Scene Container */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-md mb-6">
        <p className="mb-4 text-lg">
          {storyContent.scenes[currentSceneIndex].text}
        </p>
        
        <div className="text-sm text-muted-foreground">
          Scene {currentSceneIndex + 1} of {storyContent.scenes.length}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPrevScene}
          disabled={currentSceneIndex === 0}
          className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            currentSceneIndex === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent"
          }`}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        
        <button
          onClick={goToNextScene}
          className="flex items-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          {currentSceneIndex === storyContent.scenes.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </button>
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