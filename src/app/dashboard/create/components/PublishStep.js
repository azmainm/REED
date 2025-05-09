"use client";

import { Upload, Tag } from "lucide-react";

export default function PublishStep({
  metadata,
  handleMetadataChange,
  coverImagePreview,
  handleCoverImageUpload,
  handleCoverImageDrop,
  handleCoverImageDragOver,
  coverImageInputRef,
  isPublic,
  setIsPublic,
  categories,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Metadata & Publish</h2>
      <p className="text-muted-foreground mb-6">
        Add final details to your reed before publishing.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image
          </label>
          <div 
            className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-2 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors h-40 flex items-center justify-center"
            onClick={() => coverImageInputRef.current?.click()}
            onDrop={handleCoverImageDrop}
            onDragOver={handleCoverImageDragOver}
          >
            <input
              type="file"
              ref={coverImageInputRef}
              onChange={handleCoverImageUpload}
              className="hidden"
              accept="image/*"
            />
            
            {coverImagePreview ? (
              <div className="w-full h-full relative">
                <img 
                  src={coverImagePreview} 
                  alt="Cover" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 text-white rounded-lg transition-opacity">
                  <p>Click to change</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload a cover image
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: 1200 x 630 pixels (16:9 ratio)
          </p>
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={metadata.title}
            onChange={handleMetadataChange}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium mb-1">
            Author Name
          </label>
          <input
            id="authorName"
            name="authorName"
            type="text"
            value={metadata.authorName}
            onChange={handleMetadataChange}
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
            value={metadata.description}
            onChange={handleMetadataChange}
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <div className="relative">
            {/* Desktop Select */}
            <div className="hidden md:block">
              <select
                id="category"
                name="category"
                value={metadata.category}
                onChange={handleMetadataChange}
                className="w-full appearance-none rounded-md border border-input bg-white text-black dark:bg-zinc-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            {/* Mobile Custom Dropdown */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center justify-between w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span>{metadata.category}</span>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-white text-black dark:bg-zinc-800 dark:text-white shadow-lg max-h-60 overflow-auto">
                  <ul className="py-1 text-sm">
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          type="button"
                          onClick={() => {
                            const e = {
                              target: {
                                name: 'category',
                                value: category
                              }
                            };
                            handleMetadataChange(e);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-primary dark:hover:bg-zinc-700 ${
                            metadata.category === category
                              ? 'bg-accent text-primary dark:bg-zinc-700 dark:text-primary'
                              : ''
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Privacy Setting</h3>
            <p className="text-sm text-muted-foreground">
              {isPublic ? 'This reed will be visible to everyone' : 'This reed will only be visible to you'}
            </p>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Creating reeds gains 30 XP.
      </p>
    </div>
  );
} 