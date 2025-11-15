import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  userType: 'citizen' | 'journalist' | 'news_channel';
  isVerified: boolean;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: Date;
  SignalAIPoints: number;
  followers: number;
  following: number;
  publishedStories: number;
  specializations?: string[];
  credentials?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  videos?: string[];
  type: 'breaking' | 'story' | 'opinion' | 'footage' | 'tip';
  location?: string;
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  isVerified: boolean;
  tags: string[];
  isEncrypted?: boolean;
}

export interface Appointment {
  id: string;
  journalistId: string;
  clientId: string;
  title: string;
  description: string;
  type: 'consultation' | 'interview' | 'collaboration' | 'news_exchange';
  duration: number;
  price: number;
  scheduledDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingLink?: string;
}

export interface Book {
  id: string;
  authorId: string;
  author: User;
  title: string;
  description: string;
  cover: string;
  price: number;
  category: string;
  pages: number;
  publishedDate: Date;
  rating: number;
  downloads: number;
  preview?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  posts: Post[];
  createPost: (postData: Omit<Post, 'id' | 'userId' | 'user' | 'timestamp' | 'likes' | 'shares' | 'comments'>) => void;
  likePost: (postId: string) => void;
  sharePost: (postId: string) => void;
  appointments: Appointment[];
  bookAppointment: (appointmentData: Omit<Appointment, 'id' | 'status'>) => void;
  books: Book[];
  purchaseBook: (bookId: string) => void;
  addSignalAIPoints: (points: number, reason: string) => void;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  userType: 'citizen' | 'journalist' | 'news_channel';
  bio?: string;
  location?: string;
  specializations?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'Venkatesh@example.com',
    username: 'Venkatesh',
    fullName: 'Venkatesh ',
    userType: 'journalist',
    isVerified: true,
    avatar: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Investigative journalist with 10+ years experience covering politics and social issues.',
    location: 'New Delhi, India',
    joinedDate: new Date('2020-01-15'),
    SignalAIPoints: 2500,
    followers: 15000,
    following: 500,
    publishedStories: 150,
    specializations: ['Politics', 'Social Issues', 'Investigative Reporting'],
    credentials: ['Reuters Institute Fellowship', 'Pulitzer Prize Nominee'],
    socialLinks: {
      twitter: '@Venkatesh_news',
      linkedin: 'Venkatesh-journalist',
      website: 'Venkatesh.news'
    }
  },
  {
    id: '2',
    email: 'priya.sharma@example.com',
    username: 'priyasharma',
    fullName: 'Priya Sharma',
    userType: 'citizen',
    isVerified: false,
    avatar: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Citizen journalist passionate about local news and community issues.',
    location: 'Mumbai, India',
    joinedDate: new Date('2023-06-20'),
    SignalAIPoints: 750,
    followers: 1200,
    following: 300,
    publishedStories: 25
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'BREAKING: Major infrastructure development announced in Delhi. This will impact thousands of residents. Full investigation coming soon. #Delhi #Infrastructure #Breaking',
    images: ['https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'],
    type: 'breaking',
    location: 'New Delhi, India',
    timestamp: new Date(Date.now() - 3600000),
    likes: 245,
    shares: 89,
    comments: 34,
    isVerified: true,
    tags: ['Delhi', 'Infrastructure', 'Breaking']
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    content: 'Witnessed flooding in my neighborhood. Local authorities need to take immediate action. Sharing footage to raise awareness. #MumbaiFloods #CitizenJournalism',
    videos: ['https://example.com/flood-video.mp4'],
    type: 'footage',
    location: 'Mumbai, India',
    timestamp: new Date(Date.now() - 7200000),
    likes: 156,
    shares: 67,
    comments: 23,
    isVerified: false,
    tags: ['Mumbai', 'Floods', 'CitizenJournalism']
  }
];

const mockBooks: Book[] = [
  {
    id: '1',
    authorId: '1',
    author: mockUsers[0],
    title: 'Democracy Under Pressure: A Journalist\'s Perspective',
    description: 'An in-depth analysis of modern democratic challenges through the lens of investigative journalism.',
    cover: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 299,
    category: 'Politics',
    pages: 320,
    publishedDate: new Date('2023-08-15'),
    rating: 4.7,
    downloads: 1250,
    preview: 'In today\'s rapidly changing world, democracy faces unprecedented challenges...'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [books] = useState<Book[]>(mockBooks);

  useEffect(() => {
    const savedUser = localStorage.getItem('SignalAI-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('SignalAI-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      isVerified: userData.userType === 'journalist' ? false : false, // Journalists need manual verification
      avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=100`,
      joinedDate: new Date(),
      SignalAIPoints: 100, // Welcome bonus
      followers: 0,
      following: 0,
      publishedStories: 0
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('SignalAI-user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('SignalAI-user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('SignalAI-user', JSON.stringify(updatedUser));
    }
  };

  const createPost = (postData: Omit<Post, 'id' | 'userId' | 'user' | 'timestamp' | 'likes' | 'shares' | 'comments'>) => {
    if (!user) return;

    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      userId: user.id,
      user: user,
      timestamp: new Date(),
      likes: 0,
      shares: 0,
      comments: 0
    };

    setPosts(prev => [newPost, ...prev]);
    
    // Award points for posting
    addSignalAIPoints(10, 'Posted news content');
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const sharePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const bookAppointment = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      status: 'pending'
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const purchaseBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book && user && user.SignalAIPoints >= book.price) {
      updateProfile({ SignalAIPoints: user.SignalAIPoints - book.price });
      // In real app, would add book to user's library
    }
  };

  const addSignalAIPoints = (points: number, reason: string) => {
    if (user) {
      updateProfile({ SignalAIPoints: user.SignalAIPoints + points });
      // In real app, would log the transaction
      console.log(`+${points} SignalAI Points: ${reason}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      posts,
      createPost,
      likePost,
      sharePost,
      appointments,
      bookAppointment,
      books,
      purchaseBook,
      addSignalAIPoints
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};