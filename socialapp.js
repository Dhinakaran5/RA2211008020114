import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "http://20.244.56.144/test";

const App = () => {
  const [users, setUsers] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/users`);

      if (!data || !data.users) {
        throw new Error("Invalid response format: " + JSON.stringify(data));
      }

      setUsers(data.users);
      fetchPosts(data.users);
    } catch (error) {
      console.error("Error fetching users:", error.response ? error.response.data : error.message);
    }
  };

  const fetchPosts = async (users) => {
    let postCounts = {};
    let allPosts = [];
    let commentCounts = {};

    try {
      await Promise.all(
        Object.keys(users).map(async (userId) => {
          try {
            const { data } = await axios.get(`${API_BASE}/users/${userId}/posts`);
            
            if (!data || !data.posts) {
              console.warn(`Invalid post data for user ${userId}:`, data);
              return;
            }

            allPosts.push(...data.posts);
            postCounts[userId] = data.posts.length;

            await Promise.all(
              data.posts.map(async (post) => {
                try {
                  const commentRes = await axios.get(`${API_BASE}/posts/${post.id}/comments`);
                  
                  if (!commentRes || !commentRes.data || !commentRes.data.comments) {
                    console.warn(`Invalid comments for post ${post.id}:`, commentRes);
                    return;
                  }

                  commentCounts[post.id] = commentRes.data.comments.length;
                } catch (error) {
                  console.error(`Error fetching comments for post ${post.id}:`, error.message);
                }
              })
            );
          } catch (error) {
            console.error(`Error fetching posts for user ${userId}:`, error.message);
          }
        })
      );

      setTopUsers(
        Object.entries(postCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => users[id])
      );

      setTrendingPosts(
        allPosts.sort((a, b) => (commentCounts[b.id] || 0) - (commentCounts[a.id] || 0)).slice(0, 5)
      );

      setFeed(allPosts.sort((a, b) => b.id - a.id));

    } catch (error) {
      console.error("Error processing posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Tabs>
        <TabsList>
          <TabsTrigger value="top-users">Top Users</TabsTrigger>
          <TabsTrigger value="trending-posts">Trending Posts</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="top-users">
          {loading ? <Skeleton count={5} /> : 
            topUsers.length ? topUsers.map((user, index) => (
              <Card key={index} className="mb-4">
                <CardContent>{user}</CardContent>
              </Card>
            )) : <p>No top users found.</p>
          }
        </TabsContent>

        <TabsContent value="trending-posts">
          {loading ? <Skeleton count={5} /> : 
            trendingPosts.length ? trendingPosts.map((post, index) => (
              <Card key={index} className="mb-4">
                <CardContent>{post.content}</CardContent>
              </Card>
            )) : <p>No trending posts found.</p>
          }
        </TabsContent>

        <TabsContent value="feed">
          {loading ? <Skeleton count={5} /> : 
            feed.length ? feed.map((post, index) => (
              <Card key={index} className="mb-4">
                <CardContent>{post.content}</CardContent>
              </Card>
            )) : <p>No posts in feed.</p>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
