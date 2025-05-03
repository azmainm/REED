"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Star, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-context";
import AvatarDisplay from "@/components/avatar-display";

// Import teacher avatar
import teacherAvatar from "@/assets/avatars/teacher.png";

// Dummy conversation data
const dummyConversation = [
  {
    speaker: "teacher",
    text: "Hi there! Welcome to this interactive lesson. I'm your teacher for today."
  },
  {
    speaker: "student",
    text: "Hello! I'm excited to learn something new."
  },
  {
    speaker: "teacher",
    text: "Great! Let's start with a simple question. What's 2+2?"
  },
  {
    speaker: "student",
    text: "That's easy! 2+2 equals 4."
  },
  {
    speaker: "teacher",
    text: "Great job! You've got it right. Mathematics is all about understanding these fundamental concepts."
  }
];

export default function StoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [conversation, setConversation] = useState(dummyConversation);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // Fetch conversation content and initialize screen width
  useEffect(() => {
    const fetchConversation = async () => {
      // In a real app, you would fetch from an API using the ID
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setConversation(dummyConversation);
        setIsLoading(false);
      }, 1000);
    };

    fetchConversation();
    
    // Set initial screen width
    setScreenWidth(window.innerWidth);
    
    // Update screen width on resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  const goToNextDialogue = () => {
    if (currentDialogueIndex < conversation.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    }
  };

  const goToPreviousDialogue = () => {
    if (currentDialogueIndex > 0) {
      setCurrentDialogueIndex(currentDialogueIndex - 1);
    }
  };

  const handleFinish = () => {
    showToastMessage("Reed completed! +50 XP gained");
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    showToastMessage(isFavorited ? "Removed from favorites" : "Added to favorites");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isMobile = screenWidth < 768;

  // Determine which dialogues to show based on the current index and device
  const getVisibleDialogues = () => {
    if (isMobile) {
      // On mobile, show only the current dialogue
      return [conversation[currentDialogueIndex]];
    } else {
      // On desktop, show only the most recent dialogue from each speaker
      const currentDialogue = conversation[currentDialogueIndex];
      const otherSpeaker = currentDialogue.speaker === "teacher" ? "student" : "teacher";
      
      // Find the most recent dialogue from the other speaker
      let otherSpeakerDialogue = null;
      for (let i = currentDialogueIndex - 1; i >= 0; i--) {
        if (conversation[i].speaker === otherSpeaker) {
          otherSpeakerDialogue = conversation[i];
          break;
        }
      }
      
      const result = [currentDialogue];
      if (otherSpeakerDialogue) {
        result.push(otherSpeakerDialogue);
      }
      
      return result;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse h-64 w-full rounded-lg bg-card"></div>
      </div>
    );
  }

  const visibleDialogues = getVisibleDialogues();
  const isLastDialogue = currentDialogueIndex === conversation.length - 1;
  const isFirstDialogue = currentDialogueIndex === 0;

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-6 min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToDashboard}
          className="flex items-center rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        
        <button
          onClick={toggleFavorite}
          className={`rounded-full p-2 transition-colors ${
            isFavorited 
              ? "bg-primary/20 text-primary" 
              : "bg-transparent hover:bg-accent"
          }`}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`h-5 w-5 ${isFavorited ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>
      
      {/* Conversation Area */}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          // Mobile Layout - Show one avatar and bubble at a time
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDialogueIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center w-full max-w-sm"
              >
                {/* Avatar */}
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {visibleDialogues[0].speaker === "teacher" ? (
                    <div className="w-72 h-72 md:w-96 md:h-96">
                      <img 
                        src={teacherAvatar.src} 
                        alt="Teacher" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <AvatarDisplay 
                      avatarId={user?.avatar_id || "boy"} 
                      size="extra-large" 
                      className="w-72 h-72 md:w-96 md:h-96"
                    />
                  )}
                </motion.div>
                
                {/* Speech Bubble */}
                <motion.div 
                  className={`relative p-4 rounded-lg mb-4 max-w-[90%] ${
                    visibleDialogues[0].speaker === "teacher" 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-teal-100 dark:bg-teal-900/30"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className={`absolute w-4 h-4 rotate-45 ${
                    visibleDialogues[0].speaker === "teacher" 
                      ? "bg-blue-100 dark:bg-blue-900/30 -top-2 left-1/2 -translate-x-1/2" 
                      : "bg-teal-100 dark:bg-teal-900/30 -top-2 left-1/2 -translate-x-1/2"
                  }`}></div>
                  <p className="relative z-10">{visibleDialogues[0].text}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          // Desktop Layout - Teacher on right, Student on left
          <div className="flex-1 flex items-center justify-between gap-8 px-4">
            {/* Student Side */}
            <div className="flex-1 flex flex-col items-center">
              <AvatarDisplay 
                avatarId={user?.avatar_id || "boy"} 
                size="extra-large" 
                className="mb-8 w-96 h-96 md:w-[30rem] md:h-[30rem]"
              />
              
              <AnimatePresence mode="wait">
                {visibleDialogues
                  .filter(dialogue => dialogue.speaker === "student")
                  .map(dialogue => (
                    <motion.div
                      key={`student-bubble`}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="relative p-4 rounded-lg bg-teal-100 dark:bg-teal-900/30 mb-3 max-w-[80%]"
                    >
                      <div className="absolute w-4 h-4 rotate-45 bg-teal-100 dark:bg-teal-900/30 -top-2 left-1/2 -translate-x-1/2"></div>
                      <p className="relative z-10">{dialogue.text}</p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
            
            {/* Teacher Side */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-96 h-96 md:w-[30rem] md:h-[30rem] mb-8">
                <img 
                  src={teacherAvatar.src} 
                  alt="Teacher" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <AnimatePresence mode="wait">
                {visibleDialogues
                  .filter(dialogue => dialogue.speaker === "teacher")
                  .map(dialogue => (
                    <motion.div
                      key={`teacher-bubble`}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="relative p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-3 max-w-[80%]"
                    >
                      <div className="absolute w-4 h-4 rotate-45 bg-blue-100 dark:bg-blue-900/30 -top-2 left-1/2 -translate-x-1/2"></div>
                      <p className="relative z-10">{dialogue.text}</p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons - Centered at Bottom */}
      <div className="flex justify-center space-x-4 my-8">
        {!isFirstDialogue && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousDialogue}
            disabled={isLoading}
            className={`flex items-center rounded-lg border border-border bg-transparent px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </motion.button>
        )}
        
        {isLastDialogue ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            className="flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-md"
          >
            Finish
            <Home className="ml-2 h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextDialogue}
            disabled={isLoading}
            className={`flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>
        )}
      </div>
      
      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex gap-1.5">
          {conversation.map((_, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0.5 }}
              animate={{ 
                opacity: 1,
                scale: index <= currentDialogueIndex ? 1.1 : 1,
                backgroundColor: index <= currentDialogueIndex ? "var(--primary)" : "var(--muted)"
              }}
              transition={{ duration: 0.3 }}
              className={`h-2 w-2 rounded-full transition-colors`}
            />
          ))}
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