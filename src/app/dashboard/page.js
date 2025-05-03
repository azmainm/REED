"use client";

import { useState } from "react";
import { Filter, Search, BookOpen } from "lucide-react";
import Link from "next/link";

// Dummy stories data
const dummyStories = [
  {
    id: 1,
    title: "Introduction to Philosophy",
    description: "Learn the basics of philosophical thinking through interactive dialogue.",
    category: "Philosophy",
    image: "/story-placeholder.jpg"
  },
  {
    id: 2,
    title: "The Art of Rhetoric",
    description: "Master the ancient art of persuasion through practical examples and exercises.",
    category: "Communication",
    image: "/story-placeholder.jpg"
  },
  {
    id: 3,
    title: "Ethics in Modern Society",
    description: "Explore ethical dilemmas and moral reasoning in contemporary contexts.",
    category: "Ethics",
    image: "/story-placeholder.jpg"
  },
  {
    id: 4,
    title: "Logic and Critical Thinking",
    description: "Develop your logical reasoning skills through interactive challenges.",
    category: "Logic",
    image: "/story-placeholder.jpg"
  },
  {
    id: 5,
    title: "The Nature of Consciousness",
    description: "Delve into theories of mind and awareness through guided exploration.",
    category: "Philosophy",
    image: "/story-placeholder.jpg"
  },
  {
    id: 6,
    title: "Political Philosophy",
    description: "Understand different political ideologies and their foundations.",
    category: "Politics",
    image: "/story-placeholder.jpg"
  },
];

// List of categories
const categories = ["All", "Philosophy", "Communication", "Ethics", "Logic", "Politics"];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter stories based on search query and selected category
  const filteredStories = dummyStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || story.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stories..."
            className="w-full rounded-lg border border-input bg-transparent pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
              <div className="p-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent ${selectedCategory === category ? 'bg-accent' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsFilterOpen(false);
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div 
            key={story.id}
            className="card-hover rounded-lg border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="aspect-video bg-muted/50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40" />
              </div>
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
        ))}
      </div>
      
      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No stories found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 