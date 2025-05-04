"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, BookOpen, Star, X, Edit } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";
import AvatarSelectionModal from "@/components/avatar-selection-modal";
import AvatarDisplay from "@/components/avatar-display";
import LoadingSpinner from "@/components/loading-spinner";
import { compressImage } from "@/lib/image-utils";

export default function ProfilePage() {
  const { user, loading, updateProfilePicture } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);
  const [userReeds, setUserReeds] = useState([]);
  const [favoriteReeds, setFavoriteReeds] = useState([]);
  const [showReedEditModal, setShowReedEditModal] = useState(false);
  const [currentReedEdit, setCurrentReedEdit] = useState(null);

  // Initialize form data from user if available
  useEffect(() => {
    if (user && !userData) {
      setFormData({
        name: user.displayName || "",
        email: user.email || "",
        profilePicture: user.photoURL || null,
        avatar_id: user.avatar_id || null,
        xp: 0
      });
    }
  }, [user, userData]);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user || !user.email) {
          setIsLoading(false);
          return;
        }
        
        const userDocRef = doc(firestore, "users", user.email);
        
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              name: data.name || user.displayName || "",
              email: data.email || user.email || "",
              profilePicture: data.profilePicture || user.photoURL || null,
              avatar_id: data.avatar_id || null,
              xp: data.xp || 0
            });
            
            // Fetch user's favorite reeds if they exist
            if (data.favorites && Array.isArray(data.favorites) && data.favorites.length > 0) {
              fetchFavoriteReeds(data.favorites);
            } else {
              setFavoriteReeds([]);
            }
          } else {
            // Handle case where document doesn't exist
            console.warn("User document does not exist in Firestore");
            // Set default values
            const defaultUserData = {
              name: user.displayName || "",
              email: user.email || "",
              profilePicture: user.photoURL || null,
              avatar_id: null,
              xp: 0,
              favorites: []
            };
            
            setUserData(defaultUserData);
            setFormData(defaultUserData);
            setFavoriteReeds([]);
          }
        } catch (dbError) {
          console.error("Firestore error:", dbError);
          // Handle database error by using auth user info as fallback
          const fallbackData = {
            name: user.displayName || "",
            email: user.email || "",
            profilePicture: user.photoURL || null,
            avatar_id: null,
            xp: 0,
            favorites: []
          };
          
          setUserData(fallbackData);
          setFormData(fallbackData);
          setFavoriteReeds([]);
        }
        
        // Fetch user's created reeds regardless of user document status
        fetchUserReeds(user.uid);
      } catch (error) {
        console.error("Error in profile data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Fetch reeds created by the user
  const fetchUserReeds = async (userId) => {
    try {
      if (!userId) return;
      
      const reedsCollection = collection(firestore, "reeds");
      const userReedsQuery = query(reedsCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(userReedsQuery);
      
      const reeds = [];
      querySnapshot.forEach((doc) => {
        reeds.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUserReeds(reeds);
    } catch (error) {
      console.error("Error fetching user reeds:", error);
      setUserReeds([]);
    }
  };
  
  // Fetch favorite reeds by IDs
  const fetchFavoriteReeds = async (favoriteIds) => {
    try {
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavoriteReeds([]);
        return;
      }
      
      const favoritesData = [];
      
      // Firestore doesn't support array queries with more than 10 items
      // So we need to fetch them in batches if we have more than 10 favorites
      const batchSize = 10;
      for (let i = 0; i < favoriteIds.length; i += batchSize) {
        const batch = favoriteIds.slice(i, i + batchSize);
        const reedsCollection = collection(firestore, "reeds");
        const favoritesQuery = query(reedsCollection, where("__name__", "in", batch));
        const querySnapshot = await getDocs(favoritesQuery);
        
        querySnapshot.forEach((doc) => {
          favoritesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      setFavoriteReeds(favoritesData);
    } catch (error) {
      console.error("Error fetching favorite reeds:", error);
      setFavoriteReeds([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your profile</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading profile data..." />
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
        
        // Compress the image and store as base64 directly in Firestore
        console.log("Compressing image...");
        const compressedImage = await compressImage(file);
        console.log("Image compressed successfully");
        
        // Update Firestore and auth context with the compressed base64 image
        const result = await updateProfilePicture(compressedImage);
        
        if (result.success) {
          setUserData({
            ...userData,
            profilePicture: compressedImage
          });
          
          setToastMessage("Profile picture updated successfully!");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        } else {
          throw new Error("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setToastMessage("Error updating profile picture. Please try again.");
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

  const handleEditReed = (reed) => {
    setCurrentReedEdit({
      id: reed.id,
      title: reed.title || "",
      description: reed.description || "",
      category: reed.category || "",
      authorName: reed.authorName || ""
    });
    setShowReedEditModal(true);
  };
  
  const handleReedEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentReedEdit({
      ...currentReedEdit,
      [name]: value
    });
  };
  
  const handleReedEditSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      if (!currentReedEdit || !currentReedEdit.id) {
        throw new Error("No reed selected for editing");
      }
      
      const reedDocRef = doc(firestore, "reeds", currentReedEdit.id);
      
      await updateDoc(reedDocRef, {
        title: currentReedEdit.title,
        description: currentReedEdit.description,
        category: currentReedEdit.category,
        authorName: currentReedEdit.authorName
      });
      
      // Update local state
      setUserReeds(userReeds.map(reed => 
        reed.id === currentReedEdit.id
          ? { ...reed, ...currentReedEdit }
          : reed
      ));
      
      setShowReedEditModal(false);
      setToastMessage("Reed updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error updating reed:", error);
      setToastMessage("Failed to update reed. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
                {userData?.profilePicture ? (
                  <img 
                    src={userData.profilePicture} 
                    alt={userData.name} 
                    className="h-24 w-24 w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.parentElement.innerHTML = `<span class="text-3xl font-bold text-primary">${getInitials(userData?.name)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {getInitials(userData?.name)}
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
                userData?.name || "User"
              )}
            </h1>
            <p className="text-muted-foreground mb-3">{userData?.email}</p>
            
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
              <span className="font-medium text-primary">{userData?.xp || 0} XP</span>
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
          userReeds.length > 0 ? (
            userReeds.map((reed) => (
              <StoryCard 
                key={reed.id} 
                story={reed} 
                isEditable={true}
                onEdit={() => handleEditReed(reed)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No creations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first interactive story now!</p>
              <Link
                href="/dashboard/create"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-sm"
              >
                Create Story
              </Link>
            </div>
          )
        ) : (
          favoriteReeds.length > 0 ? (
            favoriteReeds.map((reed) => (
              <StoryCard key={reed.id} story={reed} isFavorite />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">Explore the dashboard to find stories to favorite</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-sm"
              >
                Explore Stories
              </Link>
            </div>
          )
        )}
      </div>
      
      {/* Avatar Section */}
      {userData && (
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
      )}
      
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
      
      {/* Reed Edit Modal */}
      {showReedEditModal && currentReedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Reed</h2>
              <button
                onClick={() => setShowReedEditModal(false)}
                className="rounded-full p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleReedEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={currentReedEdit.title}
                  onChange={handleReedEditChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentReedEdit.description}
                  onChange={handleReedEditChange}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={currentReedEdit.category}
                  onChange={handleReedEditChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Biographies">Biographies</option>
                  <option value="Business">Business</option>
                  <option value="Finance">Finance</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Ethics">Ethics</option>
                  <option value="Logic">Logic</option>
                  <option value="Politics">Politics</option>
                  <option value="Communication">Communication</option>
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="authorName" className="block text-sm font-medium mb-1">
                  Author Name
                </label>
                <input
                  id="authorName"
                  name="authorName"
                  type="text"
                  value={currentReedEdit.authorName}
                  onChange={handleReedEditChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReedEditModal(false)}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
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
function StoryCard({ story, isFavorite = false, isEditable = false, onEdit }) {
  // Function to handle clicks on the edit button without navigating
  const handleEditClick = (e) => {
    if (onEdit) {
      e.stopPropagation();
      onEdit();
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Unknown date";
    
    // Check if date is a Firebase Timestamp
    if (typeof date === 'object' && date.toDate) {
      date = date.toDate();
    }
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="card-hover rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="aspect-video bg-muted/50 relative">
        {story.coverImageUrl ? (
          story.coverImageUrl.startsWith('data:') ? (
            <img 
              src={story.coverImageUrl} 
              alt={story.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <img 
              src={story.coverImageUrl} 
              alt={story.title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12 text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path><path d="M8 15h6"></path></svg></div>`;
              }}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {isFavorite && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-primary mb-2">{story.category || "Uncategorized"}</div>
        <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{story.description}</p>
        <div className="flex justify-between items-center">
          <Link
            href={`/dashboard/stories/${story.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-transparent px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Open
          </Link>
          
          {isEditable && (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-2 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </button>
          )}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground flex justify-between items-center">
          <span>By {story.authorName || "Anonymous"}</span>
          {story.postedOn && <span>{formatDate(story.postedOn)}</span>}
        </div>
      </div>
    </div>
  );
} 