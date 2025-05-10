"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Star, Home, ArrowRight, ArrowLeft, AlertCircle, Check, X, Trophy, RefreshCw, Share2, Facebook, Mail, MessageCircle, Link, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AvatarDisplay from "@/components/avatar-display";
import LoadingSpinner from "@/components/loading-spinner";
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import AvatarSelectionModal from "@/components/avatar-selection-modal";
import SignInModal from "@/components/sign-in-modal";
import {
  FacebookShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';

// Import teacher avatar
import teacherAvatar from "@/assets/avatars/teacher.png";

// SVGs for official logos
const FacebookSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#1877F2"/><path d="M16.671 15.273l.508-3.31h-3.18v-2.15c0-.906.444-1.79 1.87-1.79h1.447V5.29S15.5 5 14.29 5c-2.42 0-4.004 1.47-4.004 4.13v2.833H7.5v3.31h2.786V21h3.213v-5.727h2.172z" fill="#fff"/></svg>
);
const MessengerSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#00B2FF"/><path d="M12 2C6.477 2 2 6.02 2 11.09c0 2.62 1.07 4.98 2.85 6.7V22l2.61-1.44c1.13.31 2.33.48 3.54.48 5.523 0 10-4.02 10-9.09C22 6.02 17.523 2 12 2zm.13 13.09l-2.13-2.28-4.09 2.28 5.09-5.56 2.13 2.28 4.09-2.28-5.09 5.56z" fill="#fff"/></svg>
);
const WhatsAppSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#25D366"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.85.504 3.58 1.38 5.07L2 22l5.13-1.36A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm5.07 14.07c-.21.59-1.23 1.16-1.7 1.23-.44.07-.99.1-1.6-.1-.37-.12-.85-.28-1.47-.55-2.6-1.13-4.3-3.8-4.43-3.98-.13-.18-1.06-1.41-1.06-2.7 0-1.29.68-1.93.92-2.18.24-.25.52-.31.7-.31.18 0 .36.01.52.01.16 0 .4-.06.62.47.22.53.75 1.84.82 1.98.07.14.11.31.02.5-.09.19-.13.31-.25.48-.12.17-.26.38-.37.51-.12.13-.24.27-.1.53.14.26.62 1.02 1.33 1.65.92.82 1.7 1.08 1.96 1.2.26.12.41.1.56-.06.15-.16.64-.75.81-1 .17-.25.34-.21.57-.13.23.08 1.47.7 1.72.83.25.13.41.19.47.3.06.11.06.63-.15 1.22z" fill="#fff"/></svg>
);

// Add Quiz component
const QuizComponent = ({ questions, onComplete, onRetake, hasTakenQuiz, quizAttempts, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [submitted, setSubmitted] = useState({});
  const [isCorrect, setIsCorrect] = useState({});

  const handleAnswerSelect = (answer) => {
    if (submitted[currentQuestionIndex]) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    if (selectedAnswers[currentQuestionIndex] == null) return;
    const correct = questions[currentQuestionIndex].correctAnswer === selectedAnswers[currentQuestionIndex];
    setSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
    setIsCorrect(prev => ({ ...prev, [currentQuestionIndex]: correct }));
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setCorrectAnswers(0);
    setSubmitted({});
    setIsCorrect({});
    onRetake();
  };

  const handleFinishQuiz = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setCorrectAnswers(correct);
    setShowResults(true);
    onComplete(correct * 10); // Pass XP gained
  };

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 bg-background rounded-lg border border-border shadow-lg"
      >
        <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
        <p className="text-lg mb-4">
          You got {correctAnswers} out of {questions.length} questions correct!
        </p>
        <p className="text-primary font-medium mb-6">
          {correctAnswers * 10} XP gained!
        </p>
        <button
          onClick={handleRetake}
          className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mb-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Quiz
        </button>
        <button
          onClick={onFinish}
          className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-colors"
        >
          Finish
          <Home className="ml-2 h-4 w-4" />
        </button>
        {hasTakenQuiz && (
          <p className="mt-4 text-sm text-muted-foreground">
            Note: You&apos;ve taken this quiz {quizAttempts} times. XP will not increase on retakes.
          </p>
        )}
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isSubmitted = submitted[currentQuestionIndex];
  const userAnswer = selectedAnswers[currentQuestionIndex];
  const correctAnswer = currentQuestion.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 bg-background rounded-lg border border-border shadow-lg"
    >
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
            <div className="flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestionIndex
                      ? "bg-primary"
                      : index < currentQuestionIndex
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-lg mb-6">{currentQuestion.question}</p>
        </div>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            let optionClass = "";
            if (isSubmitted) {
              if (option === correctAnswer) {
                optionClass = "border-green-500 bg-green-100 text-green-900";
              } else if (option === userAnswer) {
                optionClass = "border-red-500 bg-red-100 text-red-900";
              } else {
                optionClass = "border-border";
              }
            } else {
              optionClass = userAnswer === option ? "border-primary bg-primary/10" : "border-border hover:border-primary/50";
            }
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${optionClass}`}
                disabled={isSubmitted}
              >
                {option}
                {isSubmitted && option === correctAnswer && (
                  <Check className="inline ml-2 text-green-600" />
                )}
                {isSubmitted && option === userAnswer && userAnswer !== correctAnswer && (
                  <X className="inline ml-2 text-red-600" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={userAnswer == null}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                userAnswer != null
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Submit
              <Check className="w-4 h-4 ml-2" />
            </button>
          ) : (
            currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinishQuiz}
                className="flex items-center px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:opacity-90"
              >
                Finish Quiz
                <Trophy className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Update ShareModal component
const ShareModal = ({ isOpen, onClose, storyUrl, storyTitle }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const shareOptions = [
    {
      name: 'Facebook',
      component: FacebookShareButton,
      icon: FacebookIcon,
      props: {
        url: storyUrl,
        hashtag: '#Reed',
      }
    },
    {
      name: 'WhatsApp',
      component: WhatsappShareButton,
      icon: WhatsappIcon,
      props: {
        url: storyUrl,
        title: `Check out this story on Reed: ${storyTitle}`
      }
    },
    {
      name: 'Email',
      component: EmailShareButton,
      icon: EmailIcon,
      props: {
        url: storyUrl,
        subject: `Check out this story on Reed: ${storyTitle}`,
        body: `I thought you might enjoy this story:\n\n${storyTitle}\n${storyUrl}`
      }
    },
    {
      name: 'Copy Link',
      icon: Link,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(storyUrl);
          showToastMessage("Link copied to clipboard!");
        } catch (err) {
          showToastMessage("Failed to copy link");
        }
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-background rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Share Reed</h2>
        <div className="grid grid-cols-2 gap-4">
          {shareOptions.map((option) => {
            if (option.component) {
              const ShareButton = option.component;
              const ShareIcon = option.icon;
              return (
                <ShareButton
                  key={option.name}
                  {...option.props}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
                >
                  <ShareIcon size={32} round />
                  <span className="mt-2 text-sm">{option.name}</span>
                </ShareButton>
              );
            } else {
              return (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className="flex flex-col items-center justify-center p-4 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
                >
                  <option.icon className="w-8 h-8" />
                  <span className="mt-2 text-sm">{option.name}</span>
                </button>
              );
            }
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function StoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [error, setError] = useState(null);
  const [reedData, setReedData] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const PREVIEW_DIALOGUE_LIMIT = 4;

  // Add quiz-related state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizXpGained, setQuizXpGained] = useState(0);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);

  // Add this near the top of the component where other state is defined
  const storyUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Check if user needs to select an avatar (only after login)
  useEffect(() => {
    if (user && !user.avatar_id && !isLoading && !showAvatarModal) {
      setShowAvatarModal(true);
    }
  }, [user, isLoading]);

  // Fetch reed content from Firestore
  useEffect(() => {
    const fetchReedContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const reedRef = doc(firestore, "reeds", id);
        const reedSnap = await getDoc(reedRef);
        
        if (reedSnap.exists()) {
          const data = reedSnap.data();
          setReedData(data);
          
          // Format dialogues for display
          if (data.dialogues && Array.isArray(data.dialogues)) {
            setConversation(data.dialogues);
          } else {
            throw new Error("Invalid dialogue format");
          }
          
          // Check if user has favorited this reed from Firestore
          if (user?.email) {
            const userDocRef = doc(firestore, "users", user.email);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Check favorites
              if (userData.favorites) {
                setIsFavorited(userData.favorites.includes(id));
              }
              
              // Check if user has taken the quiz
              if (userData.completedQuizzes && userData.completedQuizzes[id]) {
                setHasTakenQuiz(true);
                setQuizAttempts(userData.completedQuizzes[id].attempts || 0);
              }
            }
          }
          
          // Increment view count
          await updateDoc(reedRef, {
            views: increment(1)
          });
          
          // Only show content if user has an avatar or after they select one
          if (user) {
            setContentReady(!!user.avatar_id);
          } else {
            setContentReady(true);
          }
        } else {
          throw new Error("Reed not found");
        }
      } catch (err) {
        console.error("Error fetching reed:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReedContent();
    }
  }, [id, user?.email]);

  // Add this effect near the top of the component
  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Add quiz-related functions
  const handleQuizStart = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizXpGained(0);
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleQuizSubmit = async (xpGained) => {
    try {
      if (!user || !user.email) {
        showToastMessage("Please sign in to submit quiz");
        return;
      }
      // Update user document in Firestore
      const userDocRef = doc(firestore, "users", user.email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const completedQuizzes = userData.completedQuizzes || {};
        const reedQuizData = completedQuizzes[id] || { attempts: 0, xpGained: 0 };
        // Only update XP if this is the first attempt
        if (reedQuizData.attempts === 0) {
          await updateDoc(userDocRef, {
            xp: increment(xpGained),
            [`completedQuizzes.${id}`]: {
              attempts: reedQuizData.attempts + 1,
              xpGained: xpGained,
              lastAttempt: new Date().toISOString()
            }
          });
          setQuizXpGained(xpGained);
          showToastMessage(`Quiz completed! +${xpGained} XP gained`);
        } else {
          await updateDoc(userDocRef, {
            [`completedQuizzes.${id}.attempts`]: reedQuizData.attempts + 1,
            [`completedQuizzes.${id}.lastAttempt`]: new Date().toISOString()
          });
          showToastMessage("Quiz completed! No XP gained as this is a retake.");
        }
      }
      setQuizCompleted(true);
      setQuizAttempts(prev => prev + 1);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      showToastMessage("Failed to submit quiz");
    }
  };

  const handleQuizRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizXpGained(0);
  };

  // Modify handleFinish to check for quiz completion
  const handleFinish = async () => {
    try {
      if (!user || !user.email) {
        showToastMessage("Please sign in to track progress");
        return;
      }

      // Check if user has completed the quiz
      if (!quizCompleted) {
        showToastMessage("Please complete the quiz first");
        return;
      }

      // XP gained for completing a reed
      const xpGained = 50;
      showToastMessage(`Reed completed! +${xpGained} XP gained`);

      // Update user document in Firestore
      const userDocRef = doc(firestore, "users", user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Get current completed reeds or initialize if it doesn't exist
        const completedReeds = userDoc.data().completedReeds || [];
        const currentXp = userDoc.data().xp || 0;

        // Add to completed reeds if not already there
        if (!completedReeds.includes(id)) {
          await updateDoc(userDocRef, {
            completedReeds: [...completedReeds, id],
            xp: currentXp + xpGained
          });
        }
      } else {
        // Document doesn't exist, create it with the completed reed
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "",
          completedReeds: [id],
          xp: xpGained
        });
      }

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      console.error("Error completing reed:", error);
      showToastMessage("Failed to record completion");
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!user || !user.email) {
        showToastMessage("Please sign in to add favorites");
        return;
      }
      
      const newFavoriteStatus = !isFavorited;
      setIsFavorited(newFavoriteStatus);
      
      // Update the user document in Firestore
      const userDocRef = doc(firestore, "users", user.email);
      
      // Get the current user document
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        // Get current favorites array or initialize if it doesn't exist
        const favorites = userDoc.data().favorites || [];
        
        if (newFavoriteStatus) {
          // Add to favorites if not already there
          if (!favorites.includes(id)) {
            await updateDoc(userDocRef, {
              favorites: [...favorites, id]
            });
          }
        } else {
          // Remove from favorites
          const updatedFavorites = favorites.filter(favId => favId !== id);
          await updateDoc(userDocRef, {
            favorites: updatedFavorites
          });
        }
      } else {
        // Document doesn't exist, create it with the favorite
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "",
          favorites: newFavoriteStatus ? [id] : []
        });
      }
      
      showToastMessage(newFavoriteStatus ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToastMessage("Failed to update favorites");
      setIsFavorited(!isFavorited); // Revert the UI state
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const isMobile = screenWidth < 768;

  // Determine which dialogues to show based on the current index and device
  const getVisibleDialogues = () => {
    if (!conversation || conversation.length === 0) {
      return [];
    }
    
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

  const handleAvatarModalClose = (selectedAvatarId) => {
    setShowAvatarModal(false);
    if (selectedAvatarId) {
      // Avatar selected, now show the content
      setContentReady(true);
    } else {
      // No avatar selected, go back to dashboard
      router.push("/dashboard");
    }
  };

  // Add this function to handle dialogue navigation
  const handleDialogueNavigation = (direction) => {
    if (!user && currentDialogueIndex >= PREVIEW_DIALOGUE_LIMIT - 1 && direction === 'next') {
      setShowLoginPrompt(true);
      return;
    }

    if (direction === 'next') {
      goToNextDialogue();
    } else {
      goToPreviousDialogue();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="large" text="Loading reed..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Reed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={goToDashboard}
            className="flex items-center mx-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const visibleDialogues = getVisibleDialogues();
  const isLastDialogue = currentDialogueIndex === conversation.length - 1;
  const isFirstDialogue = currentDialogueIndex === 0;

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-6 min-h-[80vh] flex flex-col relative">
      {showAvatarModal && user && (
        <AvatarSelectionModal
          isOpen={showAvatarModal}
          onClose={handleAvatarModalClose}
          currentAvatarId={user?.avatar_id}
          isFirstTime={true}
        />
      )}
      
      {contentReady ? (
        <>
          {/* Header with Reed Title and Author */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={goToDashboard}
                className="flex items-center rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="rounded-full p-2 hover:bg-accent transition-colors"
                  aria-label="Share story"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                
                {user && (
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
                )}
              </div>
            </div>
            
            {reedData && (
              <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold">{reedData.title}</h1>
                <p className="text-muted-foreground">
                  By {reedData.authorName || "Anonymous"} · {reedData.category}
                </p>
                {reedData.userName && currentDialogueIndex === 0 && (
                  <div className="text-xs text-muted-foreground opacity-60 select-none mt-1">
                    Reed created by {reedData.userName}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Add ShareModal */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            storyUrl={storyUrl}
            storyTitle={reedData?.title || "Story"}
          />
          
          {!showQuiz ? (
            <>
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
                          {visibleDialogues[0]?.speaker === "teacher" ? (
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
                            visibleDialogues[0]?.speaker === "teacher" 
                              ? "bg-blue-100 dark:bg-blue-900/30" 
                              : "bg-teal-100 dark:bg-teal-900/30"
                          }`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className={`absolute w-4 h-4 rotate-45 ${
                            visibleDialogues[0]?.speaker === "teacher" 
                              ? "bg-blue-100 dark:bg-blue-900/30 -top-2 left-1/2 -translate-x-1/2" 
                              : "bg-teal-100 dark:bg-teal-900/30 -top-2 left-1/2 -translate-x-1/2"
                          }`}></div>
                          <p className="relative z-10 whitespace-pre-wrap">{visibleDialogues[0]?.content}</p>
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
                          .map((dialogue, index) => (
                            <motion.div
                              key={`student-bubble-${index}`}
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              className="relative p-4 rounded-lg bg-teal-100 dark:bg-teal-900/30 mb-3 max-w-[80%]"
                            >
                              <div className="absolute w-4 h-4 rotate-45 bg-teal-100 dark:bg-teal-900/30 -top-2 left-1/2 -translate-x-1/2"></div>
                              <p className="relative z-10 whitespace-pre-wrap">{dialogue.content}</p>
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
                          .map((dialogue, index) => (
                            <motion.div
                              key={`teacher-bubble-${index}`}
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              className="relative p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-3 max-w-[80%]"
                            >
                              <div className="absolute w-4 h-4 rotate-45 bg-blue-100 dark:bg-blue-900/30 -top-2 left-1/2 -translate-x-1/2"></div>
                              <p className="relative z-10 whitespace-pre-wrap">{dialogue.content}</p>
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
                    onClick={() => handleDialogueNavigation('prev')}
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
                    onClick={handleQuizStart}
                    className="flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-md"
                  >
                    Start Quiz
                    <Trophy className="ml-2 h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDialogueNavigation('next')}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <QuizComponent
                questions={reedData.quizQuestions}
                onComplete={handleQuizSubmit}
                onRetake={handleQuizRetake}
                hasTakenQuiz={hasTakenQuiz}
                quizAttempts={quizAttempts}
                onFinish={() => router.push("/dashboard")}
              />
            </div>
          )}
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
              {toastMessage}
            </div>
          )}
        </>
      ) : null}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
} 