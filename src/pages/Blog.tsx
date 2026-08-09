import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { blogPosts, BlogCategory } from '../data/blogPosts'

const CATEGORIES: { value: BlogCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Posts' },
  { value: 'instructor', label: 'Instructor Tips' },
  { value: 'learner', label: 'Learner Guides' },
  { value: 'comparison', label: 'Comparisons' },
]

const CATEGORY_COLOURS: Record<BlogCategory, string> = {
  instructor: 'bg-primary/15 text-primary',
  learner: 'bg-blue-500/15 text-blue-400',
  comparison: 'bg-purple-500/15 text-purple-400',
}

export default function Blog() {
  const [active, setActive] = useState<BlogCategory | 'all'>('all')

  const filtered = active === 'all' ? blogPosts : blogPosts.filter(p => p.category === active)
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* pt clears the fixed header — py-12 alone left the breadcrumb
          sitting underneath it. */}
      <div className="container mx-auto px-4 pt-32 pb-12 lg:pb-20 max-w-5xl">
        {/* Page header */}
        <div className="mb-10 lg:mb-14">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Blog</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">Resources & Guides</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Practical guides for driving instructors and learners — from pricing your lessons to passing your test first time.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setActive(c.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === c.value
                  ? 'bg-primary text-primary-foreground shadow-button'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {featured && (
          <>
            {/* Featured post */}
            <Link to={`/blog/${featured.slug}`} className="block mb-10 group">
              <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 hover:border-primary/50 transition-all duration-200 hover:shadow-elegant">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLOURS[featured.category]}`}>
                    {featured.categoryLabel}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.readTime}
                  </span>
                  <span className="text-xs text-muted-foreground">{featured.date}</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground mb-5 leading-relaxed">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Rest of posts grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(post => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-200 hover:shadow-card h-full flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLOURS[post.category]}`}>
                          {post.categoryLabel}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No posts in this category yet.</div>
        )}
      </div>

      <Footer />
    </div>
  )
}
