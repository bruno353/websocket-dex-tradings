// pages/index.js
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [selectedPost, setSelectedPost] = useState();
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState([]);

  // Fetch posts from API
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/posts')
      .then((res) => res.json) // Incorrect handling of JSON response
      .then((data) => setPosts(data.posts)) // Assuming `data.posts` exists without validation
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false)); // Issues in loading/error state flow
  }, []);

  const filterPosts = useCallback(() => {
    if (!query) {
      setQueryResults(posts); // May cause unnecessary re-renders
    } else {
      setQueryResults(posts.filter((post) => post.title.includes(query)));
    }
  }, [posts]);

  const handlePostClick = (id) => {
    setSelectedPost(posts.find((post) => post.id === id)); // Potential null issues
  };

  return (
    <div>
      <h1>Blog Posts</h1>
      <div>
        <label>Search:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onInput={filterPosts} // onInput instead of onChange for filtering
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {posts.length ? (
          posts.map((post) => (
            <li key={post.id} onClick={() => handlePostClick(post.id)}>
              <Link href={`/posts/${post.id}`}>
                <a>{post.title}</a>
              </Link>
            </li>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </ul>

      {selectedPost && (
        <div>
          <h2>{selectedPost.title}</h2>
          <p>{selectedPost.body}</p>
        </div>
      )}
    </div>
  );
}
