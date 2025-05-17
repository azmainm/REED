"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ArrowRight, 
  Filter, 
  Book, 
  LayoutGrid, 
  List, 
  Clock,
  Star as StarIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reeds, setReeds] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // or "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReeds, setFilteredReeds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favoriteReeds, setFavoriteReeds] = useState([]);
  const [completedReeds, setCompletedReeds] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Categories
  const categories = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Philosophy",
    "Religion",
    "Biography",
    "Finance",
    "Marketing",
    "Technology",
    "Software",
    "Business",
    "Research",
    "Corporate",
    "Product",
    "Project",
    "Education",
    "Self-Help",
    "Psychology",
    "History",
    "Politics",
    "Science",
    "Law",
    "Health & Wellness",
    "Career & Skills",
    "Travel",
    "Art & Design",
    "Literature",
    "Case Studies",
    "Tutorials & How-To",
    "Reports & Whitepapers"
  ];

  // Fetch reeds from Firestore
  useEffect(() => {
    const fetchReeds = async () => {
      try {
        setIsLoading(true);
        
        const reedsCollection = collection(firestore, "reeds");
        
        // Get all public reeds
        const fallbackQuery = query(
          reedsCollection,
          where("isPrivate", "==", false)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackReeds = [];
        
        fallbackSnapshot.forEach((doc) => {
          fallbackReeds.push({
            id: doc.id,
            ...doc.data(),
            postedOn: doc.data().postedOn?.toDate?.() || new Date()
          });
        });
        
        // Sort manually client-side
        fallbackReeds.sort((a, b) => b.postedOn - a.postedOn);
        
        // Limit to 20 items
        const limitedReeds = fallbackReeds.slice(0, 20);
        
        setReeds(limitedReeds);
        setFilteredReeds(limitedReeds);

        // Fetch user favorites from Firestore
        if (user && user.email) {
          const userDocRef = doc(firestore, "users", user.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().favorites) {
            setFavoriteReeds(userDoc.data().favorites);
          } else {
            setFavoriteReeds([]);
          }
        } else {
          setFavoriteReeds([]);
        }
        
        // Get completed reeds from localStorage (keeping this for now)
        const completed = JSON.parse(localStorage.getItem('completedReeds') || '[]');
        setCompletedReeds(completed);
        
      } catch (error) {
        console.error("Error fetching reeds:", error);
        // Set empty arrays to show "No reeds found" instead of error state
        setReeds([]);
        setFilteredReeds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReeds();
  }, [user]);

  // Filter reeds when search query or category changes
  useEffect(() => {
    let filtered = reeds;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reed => 
        reed.title.toLowerCase().includes(query) || 
        reed.description.toLowerCase().includes(query) ||
        reed.category.toLowerCase().includes(query) ||
        reed.authorName.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(reed => reed.category === selectedCategory);
    }
    
    setFilteredReeds(filtered);
  }, [searchQuery, selectedCategory, reeds]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleViewReed = (reedId) => {
    router.push(`/dashboard/stories/${reedId}`);
  };

  const isFavorite = (reedId) => {
    return favoriteReeds.includes(reedId);
  };

  const isCompleted = (reedId) => {
    return completedReeds.includes(reedId);
  };

  // Generate a color based on category
  const getCategoryColor = (category) => {
    const colors = {
      "Philosophy": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "Ethics": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "Logic": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      "Politics": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      "Communication": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      "Science": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      "Mathematics": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Explore interactive reeds and continue your learning journey
          </p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2 items-center">
          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reeds"
              value={searchQuery}
              onChange={handleSearch}
              className="search-reed-input w-full rounded-lg border border-input bg-background pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground placeholder:text-xs md:placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="relative inline-block md:w-auto">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-10 appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center justify-between min-w-[120px]"
            >
              <span>{selectedCategory}</span>
              <Filter className="h-4 w-4 ml-2 opacity-50" />
            </button>
            
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute z-20 mt-1 max-h-60 w-[200px] overflow-auto rounded-md border border-border bg-background right-0 shadow-lg">
                  <div className="py-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-accent ${
                          selectedCategory === category ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => {
                          handleCategoryChange(category);
                          setDropdownOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center rounded-lg border border-input p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1 ${viewMode === "grid" ? "bg-muted" : ""}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-1 ${viewMode === "list" ? "bg-muted" : ""}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading reeds..." />
          </div>
        ) : filteredReeds.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Reeds Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "All" 
                ? "Try adjusting your search or filters" 
                : "No reeds are available yet. Check back later!"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReeds.map((reed) => (
              <div 
                key={reed.id} 
                className="reed-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleViewReed(reed.id)}
              >
                <div className="relative h-48 bg-muted">
                  {reed.coverImageUrl ? (
                    reed.coverImageUrl.startsWith('data:') ? (
                      <img 
                        src={reed.coverImageUrl} 
                        alt={reed.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img 
                        src={reed.coverImageUrl} 
                        alt={reed.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12 text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path><path d="M8 15h6"></path></svg></div>`;
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Book className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  
                  {/* Category badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reed.category)}`}>
                    {reed.category}
                  </div>
                  
                  {/* Style badge if available */}
                  {reed.style && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {reed.style}
                    </div>
                  )}
                  
                  {/* Completed badge */}
                  {isCompleted(reed.id) && (
                    <div className="absolute top-12 right-3 bg-green-500 text-white rounded-full p-1">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Favorite badge */}
                  {isFavorite(reed.id) && (
                    <div className="absolute bottom-3 right-3 bg-yellow-500 text-white rounded-full p-1">
                      <StarIcon className="h-4 w-4 fill-white" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{reed.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{reed.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>By {reed.authorName || "Anonymous"}</span>
                    <span>{formatDate(reed.postedOn)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReeds.map((reed) => (
              <div 
                key={reed.id} 
                className="reed-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleViewReed(reed.id)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-32 md:w-48 bg-muted">
                    {reed.coverImageUrl ? (
                      reed.coverImageUrl.startsWith('data:') ? (
                        <img 
                          src={reed.coverImageUrl} 
                          alt={reed.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img 
                          src={reed.coverImageUrl} 
                          alt={reed.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path><path d="M8 15h6"></path></svg></div>`;
                          }}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Book className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    
                    {/* Category badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(reed.category)}`}>
                      {reed.category}
                    </div>
                    
                    {/* Style badge if available */}
                    {reed.style && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {reed.style}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold group-hover:text-primary transition-colors">{reed.title}</h3>
                      <div className="flex space-x-2">
                        {isFavorite(reed.id) && (
                          <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {isCompleted(reed.id) && (
                          <Clock className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{reed.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>By {reed.authorName || "Anonymous"}</span>
                      <span>{formatDate(reed.postedOn)}</span>
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <div className="text-sm text-primary font-medium flex items-center">
                        Read Reed
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 