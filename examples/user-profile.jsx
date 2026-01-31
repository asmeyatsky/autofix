// Simple React component with a common error for testing AutoFix
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // This will cause an error if userId is undefined
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        // This line will cause "Cannot read property 'map' of undefined" if data.posts is undefined
        const postTitles = data.posts.map(post => post.title);
        
        setUser({ ...data, postTitles });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error) return <div className="error">Error: {error}</div>;
  
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      
      <div className="posts">
        <h2>Recent Posts</h2>
        {/* This will cause error if postTitles is undefined */}
        {user.postTitles.map((title, index) => (
          <div key={index} className="post-title">
            {title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;