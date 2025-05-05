"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function FeedbackPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError("Please fill out all fields");
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      // Get a reference to Firestore
      const db = getFirestore(app);
      
      // Create feedback data
      const feedbackData = {
        title: title.trim(),
        description: description.trim(),
        posted_on: serverTimestamp()
      };
      
      // Add document to feedback collection
      await addDoc(collection(db, "feedback"), feedbackData);
      
      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to send feedback. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Anonymous Feedback</h1>
      <p className="text-muted-foreground mb-6">Share your thoughts without providing any personal information</p>
      
      <div className="bg-background border border-border rounded-lg p-4 sm:p-6 shadow-sm">
        <p className="text-muted-foreground mb-6">
          We value your feedback! Please let us know how we can improve your experience.
        </p>
        
        {success && (
          <div className="mb-6 p-3 sm:p-4 rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm sm:text-base">
            Thank you for your feedback! We&apos;ll review it as soon as possible.
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-3 sm:p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1 sm:mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              className="w-full px-3 sm:px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm sm:text-base"
              disabled={isSending}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about your feedback..."
              rows={6}
              className="w-full px-3 sm:px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm sm:text-base"
              disabled={isSending}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSending}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium shadow-md hover:opacity-90 transition-colors disabled:opacity-70 text-sm sm:text-base"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 