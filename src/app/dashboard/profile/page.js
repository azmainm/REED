"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, BookOpen, Star, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";
import AvatarSelectionModal from "@/components/avatar-selection-modal";
import AvatarDisplay from "@/components/avatar-display";

// Dummy story data
const myCreations = [
  {
    id: 101,
    title: "The Allegory of the Cave",
    description: "A modern retelling of Plato's classic thought experiment.",
    category: "Philosophy",
  },
  {
    id: 102,
    title: "Understanding Categorical Imperatives",
    description: "A step-by-step guide to Kantian ethics.",
    category: "Ethics",
  }
];

const favoriteStories = [
  {
    id: 1,
    title: "Introduction to Philosophy",
    description: "Learn the basics of philosophical thinking through interactive dialogue.",
    category: "Philosophy",
  },
  {
    id: 3,
    title: "Ethics in Modern Society",
    description: "Explore ethical dilemmas and moral reasoning in contemporary contexts.",
    category: "Ethics",
  },
  {
    id: 5,
    title: "The Nature of Consciousness",
    description: "Delve into theories of mind and awareness through guided exploration.",
    category: "Philosophy",
  }
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("creations");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: null,
    avatar_id: null,
    xp: 0
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user data from Firestore
  useEffect(() => {
    if (user && user.email) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(firestore, "users", user.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              name: data.name || "",
              email: data.email || "",
              profilePicture: data.profilePicture || null,
              avatar_id: data.avatar_id || null,
              xp: data.xp || 0
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      
      fetchUserData();
    }
  }, [user]);

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      const userDocRef = doc(firestore, "users", userData.email);
      
      await updateDoc(userDocRef, {
        name: formData.name,
        avatar_id: formData.avatar_id
      });
      
      setUserData({
        ...userData,
        name: formData.name,
        avatar_id: formData.avatar_id
      });
      
      setShowEditModal(false);
      setIsEditing(false);
      setToastMessage("Profile updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage("Failed to update profile. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        // Show a preview first
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({
            ...formData,
            profilePicture: reader.result
          });
        };
        reader.readAsDataURL(file);
        
        // Upload to Firebase Storage
        const fileRef = ref(storage, `profile_pictures/${userData.email}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        
        // Update Firestore
        const userDocRef = doc(firestore, "users", userData.email);
        await updateDoc(userDocRef, {
          profilePicture: downloadURL
        });
        
        // Update local state
        setUserData({
          ...userData,
          profilePicture: downloadURL
        });
        
        setFormData({
          ...formData,
          profilePicture: downloadURL
        });
        
        setToastMessage("Profile picture updated successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setToastMessage("Failed to upload profile picture. Please try again.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      // Save changes
      handleEditSubmit();
    } else {
      // Start editing
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        profilePicture: userData.profilePicture || null,
        avatar_id: userData.avatar_id || null,
        xp: userData.xp || 0
      });
      setIsEditing(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAvatarModalClose = (selectedAvatarId) => {
    setShowAvatarModal(false);
    
    if (selectedAvatarId) {
      // The modal component updates the avatar_id in Firestore directly
      // We just need to update our local state
      setUserData({
        ...userData,
        avatar_id: selectedAvatarId
      });
      
      setFormData({
        ...formData,
        avatar_id: selectedAvatarId
      });
    }
  };

  return (
    <div>
      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-md mb-8 relative">
        {/* Edit Button - Positioned at Top Right */}
        <button 
          onClick={toggleEditing}
          className="absolute top-4 right-4 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-accent flex items-center"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mt-8 md:mt-0">
          {/* Avatar */}
          <div className="relative">
            {isEditing ? (
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-primary/50 flex flex-col items-center justify-center cursor-pointer bg-primary/5"
                   onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.profilePicture ? (
                  <img 
                    src={formData.profilePicture} 
                    alt={formData.name} 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {getInitials(formData.name)}
                    </span>
                    <span className="text-xs text-primary mt-1">Upload</span>
                  </>
                )}
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                {userData.profilePicture ? (
                  <img 
                    src={userData.profilePicture} 
                    alt={userData.name} 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {getInitials(userData.name)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-3/4 rounded-md border border-input bg-transparent px-3 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                userData.name || "User"
              )}
            </h1>
            <p className="text-muted-foreground mb-3">{userData.email}</p>
            
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
              <span className="font-medium text-primary">{userData.xp || 0} XP</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab("creations")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "creations"
                ? "border-primary text-primary"
                : "border-transparent hover:text-primary/70 hover:border-primary/30"
            }`}
          >
            My Creations
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "favorites"
                ? "border-primary text-primary"
                : "border-transparent hover:text-primary/70 hover:border-primary/30"
            }`}
          >
            Favorite Reeds
          </button>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "creations" ? (
          myCreations.length > 0 ? (
            myCreations.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No creations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first interactive story now!</p>
              <Link
                href="/dashboard/create"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Create Story
              </Link>
            </div>
          )
        ) : (
          favoriteStories.length > 0 ? (
            favoriteStories.map((story) => (
              <StoryCard key={story.id} story={story} isFavorite />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">Explore the dashboard to find stories to favorite</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Explore Stories
              </Link>
            </div>
          )
        )}
      </div>
      
      {/* Avatar Section */}
      <div className="mt-12 mb-8 text-center">
        <h2 className="text-xl font-bold mb-4">Interactive Reed Avatar</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          This avatar represents you in interactive storytelling experiences.
        </p>
        
        <div className="flex flex-col items-center">
          {userData.avatar_id ? (
            <div className="mb-6">
              <AvatarDisplay avatarId={userData.avatar_id} size="extra-large" className="mx-auto" />
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-primary/30 rounded-lg mb-6">
              <p className="text-muted-foreground">You haven&apos;t selected an avatar yet</p>
            </div>
          )}
          
          <button
            onClick={() => setShowAvatarModal(true)}
            className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-accent flex items-center"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            {userData.avatar_id ? "Change Avatar" : "Choose Avatar"}
          </button>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <AvatarSelectionModal
          isOpen={showAvatarModal}
          onClose={handleAvatarModalClose}
          currentAvatarId={userData.avatar_id}
          isFirstTime={false}
        />
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
          {toastMessage || "Profile updated successfully!"}
        </div>
      )}
    </div>
  );
}

// Story Card Component
function StoryCard({ story, isFavorite = false }) {
  return (
    <div className="card-hover rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="aspect-video bg-muted/50 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
        </div>
        {isFavorite && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-primary mb-2">{story.category}</div>
        <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{story.description}</p>
        <Link
          href={`/dashboard/stories/${story.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-primary bg-transparent px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          Open
        </Link>
      </div>
    </div>
  );
} 