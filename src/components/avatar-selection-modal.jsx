"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Import avatar images
import boyAvatar from "@/assets/avatars/boy.png";
import girlAvatar from "@/assets/avatars/girl.png";
import manAvatar from "@/assets/avatars/man.png";
import womanAvatar from "@/assets/avatars/woman.png";

const avatarOptions = [
  { id: "woman", name: "Woman", image: womanAvatar },
  { id: "girl", name: "Girl", image: girlAvatar },
  { id: "boy", name: "Boy", image: boyAvatar },
  { id: "man", name: "Man", image: manAvatar },
];

export default function AvatarSelectionModal({ isOpen, onClose, currentAvatarId, isFirstTime = false }) {
  const { user } = useAuth();
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (currentAvatarId) {
      setSelectedAvatarId(currentAvatarId);
    }
  }, [currentAvatarId]);

  if (!isOpen) return null;

  const handleSelectAvatar = (avatarId) => {
    setSelectedAvatarId(avatarId);
  };

  const handleConfirm = async () => {
    if (!user || !selectedAvatarId) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(firestore, "users", user.email);
      await updateDoc(userDocRef, {
        avatar_id: selectedAvatarId
      });

      setToastMessage("Avatar updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onClose(selectedAvatarId);
    } catch (error) {
      console.error("Error updating avatar:", error);
      setToastMessage("Failed to update avatar. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md md:max-w-3xl rounded-lg border border-border bg-card p-4 md:p-6 shadow-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {isFirstTime ? "Choose Your Avatar" : "Change Avatar"}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              This avatar will represent you in interactive Reeds
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="rounded-full p-1 hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 md:my-6">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.id}
              className={`relative rounded-lg border ${
                selectedAvatarId === avatar.id
                  ? "border-primary border-2"
                  : "border-border"
              } overflow-hidden cursor-pointer transition-all hover:shadow-md`}
              onClick={() => handleSelectAvatar(avatar.id)}
            >
              <div className="aspect-square bg-accent/20 flex items-center justify-center p-2 md:p-6 lg:p-8">
                <img
                  src={avatar.image.src}
                  alt={avatar.name}
                  className="w-full h-auto object-contain max-h-24 md:max-h-52 lg:max-h-64"
                />
              </div>
              {selectedAvatarId === avatar.id && (
                <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg"></div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          {!isFirstTime && (
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-lg border border-border bg-transparent px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium hover:bg-accent mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962.0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
} 