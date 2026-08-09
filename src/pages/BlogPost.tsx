import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, ChevronRight, ArrowRight } from 'lucide-react'
import { Helmet } from 'react-helmet'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Button } from '@/components/ui/button'
import { getPostBySlug, getRelatedPosts, BlogCategory } from '../data/blogPosts'

const CATEGORY_COLOURS: Record<BlogCategory, string> = {
  instructor: 'bg-primary/15 text-primary',
  learner: 'bg-blue-500/15 text-blue-400',
  comparison: 'bg-purple-500/15 text-purple-400',
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = getPostBySlug(slug ?? '')

  if (!post) return <Navigate to="/blog" replace />

  const related = getRelatedPosts(post.slug)

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | Donna Drive Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Donna Drive" />
        <link rel="canonical" href={`https://donnadrive.co.uk/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.metaDescription,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "Donna Drive" },
          "publisher": {
            "@type": "Organization",
            "name": "Donna Drive",
            "url": "https://donnadrive.co.uk"
          },
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://donnadrive.co.uk/blog/${post.slug}` }
        })}</script>
      </Helmet>

      <Header />

      {/* pt clears the fixed header — py-10 alone left the breadcrumb
          sitting underneath it. */}
      <div className="container mx-auto px-4 pt-32 pb-10 lg:pb-16 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLOURS[post.category]}`}>
              {post.categoryLabel}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
            <span className="text-sm text-muted-foreground">{post.date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8" />

        {/* Article body */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-4
            prose-li:text-muted-foreground prose-li:my-1
            prose-ul:my-4 prose-ol:my-4
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* CTA box */}
        <div className="mt-12 bg-gradient-primary rounded-2xl p-6 lg:p-8 text-center">
          <div className="text-2xl mb-2">🤖</div>
          <h2 className="text-xl font-bold text-white mb-2">See Donna Drive in Action</h2>
          <p className="text-white/80 mb-5 text-sm leading-relaxed max-w-md mx-auto">
            Donna handles your WhatsApp bookings, sends reminders, and keeps your diary organised — automatically. Book a free demo to see how it works.
          </p>
          <Link to="/book-demo">
            <Button variant="secondary" className="font-semibold">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
            </Button>
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-border pt-10">
            <h3 className="text-lg font-bold text-foreground mb-5">More articles</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
                  <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-200 h-full flex flex-col">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit mb-2 ${CATEGORY_COLOURS[p.category]}`}>
                      {p.categoryLabel}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug flex-1">
                      {p.title}
                    </h4>
                    <span className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
