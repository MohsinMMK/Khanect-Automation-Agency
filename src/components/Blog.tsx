import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../data/blogPosts';
import Navbar from './Navbar';
import Footer from './Footer';

// Gradient mesh background component (reused from LandingPage style)
const BackgroundGradient = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[100px] opacity-20" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[100px] opacity-20" />
  </div>
);

export default function Blog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <Helmet>
        <title>Insights & Strategy | Khanect AI Blog</title>
        <meta name="description" content="Expert insights on AI automation, agency growth algorithms, and the future of work. Read our latest articles." />
      </Helmet>

      <div className="min-h-screen bg-gray-950 text-white relative flex flex-col pt-24">
        <BackgroundGradient />
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex-grow">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              Insights & <span className="text-brand-lime">Strategy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              The playbook for scaling agencies with Artificial Intelligence.
              No fluff, just actionable automation strategies.
            </motion.p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-lime/50 transition-colors"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedTag === null 
                    ? 'bg-brand-lime text-black font-medium' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    tag === selectedTag 
                      ? 'bg-brand-lime text-black font-medium' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredPosts.map((post, index) => (
              <motion.article 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group cursor-pointer bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-brand-lime/30 transition-all duration-300 hover:bg-white/[0.04]"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={post.coverImage || '/placeholder-blog.jpg'} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-md text-xs text-brand-lime">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3 leading-snug group-hover:text-brand-lime transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-brand-lime text-sm font-medium">
                    Read Article 
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No articles found matching your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
