"use client";

import { useState, useRef } from "react";
import { Pencil, BookOpen, Star, X } from "lucide-react";
import Link from "next/link";

// Dummy user data
const dummyUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  dob: "1990-01-01",
  xp: 750,
  avatarUrl: null
};

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
  const [activeTab, setActiveTab] = useState("creations");
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState(dummyUser);
  const [formData, setFormData] = useState(dummyUser);
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUserData(formData);
    setShowEditModal(false);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local URL
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatarUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      // Save changes
      setUserData(formData);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      // Start editing
      setFormData(userData);
    }
    setIsEditing(!isEditing);
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
                {formData.avatarUrl ? (
                  <img 
                    src={formData.avatarUrl} 
                    alt={formData.name} 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {formData.name.split(" ").map(n => n[0]).join("")}
                    </span>
                    <span className="text-xs text-primary mt-1">Upload</span>
                  </>
                )}
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                {userData.avatarUrl ? (
                  <img 
                    src={userData.avatarUrl} 
                    alt={userData.name} 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {userData.name.split(" ").map(n => n[0]).join("")}
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
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                userData.name
              )}
            </h1>
            <p className="text-muted-foreground mb-1">{userData.email}</p>
            <div className="mb-3">
              {isEditing ? (
                <div className="mt-2">
                  <label className="text-sm text-muted-foreground">Date of Birth</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  <span className="text-sm">Date of Birth</span><br />
                  {new Date(userData.dob).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
              <span className="font-medium text-primary">{userData.xp} XP</span>
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
              
              <div>
                <label htmlFor="dob" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">
                  Avatar URL
                </label>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  value={formData.avatarUrl || ""}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-primary p-4 text-white shadow-lg animation-fade-in">
          Profile updated successfully!
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