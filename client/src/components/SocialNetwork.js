import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Heart, Star, Award, Share2, Clock, ThumbsUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialNetwork = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('community');
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [userLevel, setUserLevel] = useState(1);
  const [communityPoints, setCommunityPoints] = useState(0);

  useEffect(() => {
    loadCommunityData();
    calculateUserLevel();
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCommunityData = () => {
    // Load mock community data
    const mockPosts = [
      {
        id: 1,
        author: 'Recovery Warrior',
        authorLevel: 5,
        avatar: 'RW',
        type: 'success',
        content: "Just completed my 6-month TB treatment! 🎉 To everyone still on their journey - it gets easier, and you ARE stronger than you think. Don't give up!",
        likes: 23,
        replies: 7,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        tags: ['success-story', 'motivation']
      },
      {
        id: 2,
        author: 'Hope Seeker',
        authorLevel: 2,
        avatar: 'HS',
        type: 'support',
        content: "Feeling overwhelmed today. The medication side effects are hitting hard. Anyone else going through this?",
        likes: 15,
        replies: 12,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        tags: ['support', 'side-effects']
      },
      {
        id: 3,
        author: 'Streak Master',
        authorLevel: 4,
        avatar: 'SM',
        type: 'achievement',
        content: "30-day streak unlocked! 🔥 My secret: Setting 3 different alarms and treating each dose like a victory. We've got this, team!",
        likes: 31,
        replies: 9,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        tags: ['streak', 'tips']
      },
      {
        id: 4,
        author: 'Wellness Guide',
        authorLevel: 6,
        avatar: 'WG',
        type: 'tip',
        content: "💡 Pro tip: Taking your TB meds with a small snack (like a banana) can help reduce nausea. Also, staying hydrated is KEY! What works for you?",
        likes: 18,
        replies: 14,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        tags: ['tips', 'health']
      },
      {
        id: 5,
        author: 'New Journey',
        authorLevel: 1,
        avatar: 'NJ',
        type: 'introduction',
        content: "Hi everyone! Starting my TB treatment journey today. Feeling nervous but hopeful. Any advice for a beginner? 🙏",
        likes: 27,
        replies: 18,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        tags: ['newbie', 'advice']
      }
    ];

    const mockChallenges = [
      {
        id: 1,
        title: "30-Day Consistency Challenge",
        description: "Take your medication every day for 30 consecutive days",
        participants: 47,
        daysLeft: 12,
        reward: "Consistency Champion Badge + 500 points",
        joined: false,
        icon: "🎯"
      },
      {
        id: 2,
        title: "Wellness Wednesday",
        description: "Share one healthy habit you're practicing alongside your TB treatment",
        participants: 23,
        daysLeft: 2,
        reward: "Wellness Advocate Badge + 200 points",
        joined: true,
        icon: "🌱"
      },
      {
        id: 3,
        title: "Motivational Monday",
        description: "Share a motivational quote or message for fellow patients",
        participants: 35,
        daysLeft: 5,
        reward: "Inspiration Master Badge + 300 points",
        joined: false,
        icon: "💪"
      },
      {
        id: 4,
        title: "Side Effect Solutions",
        description: "Share tips for managing TB medication side effects",
        participants: 19,
        daysLeft: 7,
        reward: "Helper Hero Badge + 400 points",
        joined: true,
        icon: "🔧"
      }
    ];

    setPosts(mockPosts);
    setChallenges(mockChallenges);
  };

  const calculateUserLevel = () => {
    if (!patient) return;
    
    // Calculate level based on streak, total days, and community activity
    const streakPoints = patient.currentStreak * 10;
    const totalDaysPoints = patient.totalDays * 5;
    const badgePoints = (patient.badges?.length || 0) * 50;
    
    const totalPoints = streakPoints + totalDaysPoints + badgePoints;
    setCommunityPoints(totalPoints);
    
    // Level calculation
    const level = Math.floor(totalPoints / 100) + 1;
    setUserLevel(Math.min(level, 10)); // Cap at level 10
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
    toast.success('Post liked! ❤️');
  };

  const handleJoinChallenge = (challengeId) => {
    setChallenges(challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, joined: true, participants: challenge.participants + 1 }
        : challenge
    ));
    toast.success('Challenge joined! 🎉');
    setCommunityPoints(prev => prev + 50);
  };

  const handleLeaveChallenge = (challengeId) => {
    setChallenges(challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, joined: false, participants: challenge.participants - 1 }
        : challenge
    ));
    toast.success('Challenge left');
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: patient?.name || 'Anonymous',
      authorLevel: userLevel,
      avatar: patient?.name ? patient.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AN',
      type: 'general',
      content: newPost,
      likes: 0,
      replies: 0,
      timestamp: new Date(),
      tags: ['personal']
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setCommunityPoints(prev => prev + 25);
    toast.success('Post shared with community! 🎉');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPostTypeColor = (type) => {
    const colors = {
      success: 'border-l-green-500 bg-green-50',
      support: 'border-l-blue-500 bg-blue-50',
      achievement: 'border-l-purple-500 bg-purple-50',
      tip: 'border-l-yellow-500 bg-yellow-50',
      introduction: 'border-l-pink-500 bg-pink-50',
      general: 'border-l-gray-500 bg-gray-50'
    };
    return colors[type] || colors.general;
  };

  const getLevelBadgeColor = (level) => {
    if (level >= 5) return 'bg-purple-500';
    if (level >= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Users className="mr-3" />
              TB Support Community
            </h2>
            <p className="text-purple-100 mt-1">Connect, share, and grow together</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${getLevelBadgeColor(userLevel)} text-white text-sm font-bold`}>
              <Star className="w-4 h-4 mr-1" />
              Level {userLevel}
            </div>
            <p className="text-purple-100 text-sm mt-1">{communityPoints} points</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'community'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Community Feed
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'challenges'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('success')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'success'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Success Stories
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* Create Post */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts, ask questions, or offer support to the community..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-500">Posts are anonymous to protect your privacy</p>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => (
              <div key={post.id} className={`border-l-4 p-4 rounded-lg ${getPostTypeColor(post.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-800">{post.author}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getLevelBadgeColor(post.authorLevel)}`}>
                          L{post.authorLevel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{post.replies}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex space-x-2 mt-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Community Challenges</h3>
              <p className="text-gray-600">Participate in challenges to earn badges and points!</p>
            </div>

            {challenges.map((challenge) => (
              <div key={challenge.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{challenge.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{challenge.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{challenge.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {challenge.participants} joined
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {challenge.daysLeft} days left
                        </span>
                      </div>
                      <p className="text-sm font-medium text-purple-600 mt-2">
                        🏆 Reward: {challenge.reward}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => challenge.joined ? handleLeaveChallenge(challenge.id) : handleJoinChallenge(challenge.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      challenge.joined
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {challenge.joined ? '✓ Joined' : 'Join Challenge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'success' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Success Stories</h3>
              <p className="text-gray-600">Inspiring stories from TB survivors and successful patients</p>
            </div>

            {posts.filter(post => post.type === 'success' || post.type === 'achievement').map((post) => (
              <div key={post.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-800">{post.author}</p>
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          SUCCESS
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed text-lg">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-green-600">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      {post.likes} hearts
                    </span>
                    <span className="flex items-center text-gray-500">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.replies} responses
                    </span>
                  </div>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Inspire Others
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialNetwork;