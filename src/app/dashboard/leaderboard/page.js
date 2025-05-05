"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const PAGE_SIZE = 10;

  // Fetch users from Firestore on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (loadMore = false) => {
    try {
      setLoading(true);
      const db = getFirestore(app);
      const usersCollection = collection(db, "users");
      
      let userQuery;
      
      if (loadMore && lastDoc) {
        userQuery = query(
          usersCollection,
          orderBy("xp", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        userQuery = query(
          usersCollection,
          orderBy("xp", "desc"),
          limit(PAGE_SIZE)
        );
      }
      
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      const userData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Anonymous User",
          email: data.email || "",
          xp: data.xp || 0,
          avatarId: data.avatar_id || null,
          profilePicture: data.profilePicture || null
        };
      });
      
      if (loadMore) {
        setUsers(prev => [...prev, ...userData]);
      } else {
        setUsers(userData);
      }
      
      setHasMore(querySnapshot.docs.length >= PAGE_SIZE);
      
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loading || !hasMore) return;
    setPage(prevPage => prevPage + 1);
    await fetchUsers(true);
  };

  // Get top 3 users
  const topUsers = users.slice(0, 3);

  // Get users ranked 4 and below
  const otherUsers = users.slice(3);

  return (
    <div className="w-full space-y-8">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      
      {/* Top performers section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Second place - empty div for smaller screens, actual content for larger screens */}
        <div className="hidden sm:flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border shadow-sm">
          {topUsers[1] && (
            <>
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 bg-blue-500 flex items-center justify-center">
                {topUsers[1].profilePicture ? (
                  <Image 
                    src={topUsers[1].profilePicture}
                    alt={topUsers[1].name}
                    width={80}
                    height={80}
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = `https://avatar.vercel.sh/${topUsers[1].name}`;
                    }}
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">{topUsers[1].name.substring(0, 1)}</span>
                )}
              </div>
              <h3 className="font-bold text-lg">{topUsers[1].name}</h3>
              <p className="text-sm text-muted-foreground">{topUsers[1].email}</p>
              <p className="text-lg font-bold text-blue-500 mt-2">{topUsers[1].xp}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </>
          )}
        </div>
        
        {/* First place */}
        {topUsers[0] && (
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border shadow-sm sm:-mt-4">
            <div className="relative">
              <svg
                className="absolute -top-9 left-1/2 transform -translate-x-1/2 h-10 w-10 text-yellow-500 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
              </svg>
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 bg-yellow-500 flex items-center justify-center">
                {topUsers[0].profilePicture ? (
                  <Image 
                    src={topUsers[0].profilePicture}
                    alt={topUsers[0].name}
                    width={96}
                    height={96}
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = `https://avatar.vercel.sh/${topUsers[0].name}`;
                    }}
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">{topUsers[0].name.substring(0, 1)}</span>
                )}
              </div>
            </div>
            <h3 className="font-bold text-lg">{topUsers[0].name}</h3>
            <p className="text-sm text-muted-foreground">{topUsers[0].email}</p>
            <p className="text-lg font-bold text-yellow-500 mt-2">{topUsers[0].xp}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        )}
        
        {/* Third place - empty div for smaller screens, actual content for larger screens */}
        <div className="hidden sm:flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border shadow-sm">
          {topUsers[2] && (
            <>
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 bg-green-500 flex items-center justify-center">
                {topUsers[2].profilePicture ? (
                  <Image 
                    src={topUsers[2].profilePicture}
                    alt={topUsers[2].name}
                    width={80}
                    height={80}
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = `https://avatar.vercel.sh/${topUsers[2].name}`;
                    }}
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">{topUsers[2].name.substring(0, 1)}</span>
                )}
              </div>
              <h3 className="font-bold text-lg">{topUsers[2].name}</h3>
              <p className="text-sm text-muted-foreground">{topUsers[2].email}</p>
              <p className="text-lg font-bold text-green-500 mt-2">{topUsers[2].xp}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile version of 2nd and 3rd place */}
      <div className="grid grid-cols-2 gap-4 sm:hidden mt-4">
        {/* Second place for mobile */}
        {topUsers[1] && (
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border shadow-sm">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 bg-blue-500 flex items-center justify-center">
              {topUsers[1].profilePicture ? (
                <Image 
                  src={topUsers[1].profilePicture}
                  alt={topUsers[1].name}
                  width={64}
                  height={64}
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = `https://avatar.vercel.sh/${topUsers[1].name}`;
                  }}
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold text-xl">{topUsers[1].name.substring(0, 1)}</span>
              )}
            </div>
            <h3 className="font-bold text-sm">{topUsers[1].name}</h3>
            <p className="text-xs text-muted-foreground truncate w-full text-center">{topUsers[1].email}</p>
            <p className="text-base font-bold text-blue-500 mt-1">{topUsers[1].xp}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        )}
        
        {/* Third place for mobile */}
        {topUsers[2] && (
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border shadow-sm">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 bg-green-500 flex items-center justify-center">
              {topUsers[2].profilePicture ? (
                <Image 
                  src={topUsers[2].profilePicture}
                  alt={topUsers[2].name}
                  width={64}
                  height={64}
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = `https://avatar.vercel.sh/${topUsers[2].name}`;
                  }}
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold text-xl">{topUsers[2].name.substring(0, 1)}</span>
              )}
            </div>
            <h3 className="font-bold text-sm">{topUsers[2].name}</h3>
            <p className="text-xs text-muted-foreground truncate w-full text-center">{topUsers[2].email}</p>
            <p className="text-base font-bold text-green-500 mt-1">{topUsers[2].xp}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        )}
      </div>

      {/* User list section */}
      <div className="space-y-3 mt-8">
        <h2 className="text-lg font-semibold">Other Rankings</h2>
        
        {otherUsers.length > 0 ? (
          otherUsers.map((user, index) => (
            <div 
              key={user.id}
              className="flex items-center p-3 rounded-lg bg-background border border-border shadow-sm"
            >
              <div className="flex-shrink-0 mr-4 font-bold text-muted-foreground w-8 text-center">
                {index + 4}
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mr-4">
                {user.profilePicture ? (
                  <Image 
                    src={user.profilePicture}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = `https://avatar.vercel.sh/${user.name}`;
                    }}
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-medium">{user.name.substring(0, 1)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{user.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="font-bold ml-2">
                {user.xp}
              </div>
            </div>
          ))
        ) : (
          loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No more users to show
            </div>
          )
        )}
        
        {/* Load more button */}
        {hasMore && (
          <button
            onClick={loadMoreUsers}
            disabled={loading}
            className="w-full py-3 rounded-lg border border-border bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-primary rounded-full animate-spin"></div>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 mr-2" />
                <span>Load More</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
} 