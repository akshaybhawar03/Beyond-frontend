import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { fetchArticleById, fetchArticleBySlug } from "../api/api";

export default function Article() {
  const { id, slug } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);

        const data = slug ? await fetchArticleBySlug(slug) : await fetchArticleById(id);
        if (cancelled) return;

        setArticle(data);
      } catch (e) {
        if (cancelled) return;
        setError(true);
        setArticle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  const seoTitle = article?.title || "BeyondChats Blogs";
  const seoDescription = (article?.content || "").replace(/\s+/g, " ").trim().slice(0, 160);

  function firstImageUrl(text) {
    const input = String(text || "");
    const match = input.match(/https?:\/\/[^\s"')>]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s"')>]*)?/i);
    return match ? match[0] : "";
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const preferredPath = article?.slug ? `/blog/${article.slug}` : slug ? `/blog/${slug}` : id ? `/article/${id}` : "/";
  const seoUrl = `${origin}${preferredPath}`;

  const defaultOgImage =
    process.env.REACT_APP_OG_IMAGE ||
    "https://via.placeholder.com/1200x630.png?text=BeyondChats+Blogs";

  const seoImage = firstImageUrl(article?.content) || defaultOgImage;

  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        author: {
          "@type": "Person",
          name: article.author || "Unknown",
        },
        datePublished: article.date,
        articleBody: article.content,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": seoUrl,
        },
      }
    : null;

  const rawContent = article?.content || "";

  const blocks = (() => {
    const lines = rawContent.split("\n");
    const out = [];
    let buffer = [];

    const flush = () => {
      const text = buffer.join(" ").trim();
      if (text) out.push({ type: "p", text });
      buffer = [];
    };

    for (const line of lines) {
      const t = line.trim();
      if (!t) {
        flush();
        continue;
      }

      if (/^###\s+/.test(t)) {
        flush();
        out.push({ type: "h3", text: t.replace(/^###\s+/, "") });
        continue;
      }

      if (/^##\s+/.test(t)) {
        flush();
        out.push({ type: "h2", text: t.replace(/^##\s+/, "") });
        continue;
      }

      if (/^#\s+/.test(t)) {
        flush();
        out.push({ type: "h2", text: t.replace(/^#\s+/, "") });
        continue;
      }

      buffer.push(t);
    }

    flush();
    return out;
  })();

  return (
    <div className="container">
      <Helmet>
        <title>{seoTitle}</title>
        <link rel="canonical" href={seoUrl} />
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:image" content={seoImage} />

        <meta name="twitter:image" content={seoImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />

        {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
      </Helmet>
      <div className="article-page">
        <div className="actions">
          <Link to="/" className="btn-outline">
            ← Back to articles
          </Link>

          {!loading && !error && article?.url ? (
            <a href={article.url} target="_blank" rel="noreferrer" className="btn-outline">
              Read original
            </a>
          ) : null}
        </div>

        <article className="article-card">
          {loading ? <div className="state">Loading article...</div> : null}
          {!loading && error ? <div className="state error">Article not found</div> : null}
          {!loading && !error && !article ? <div className="state">Article not found</div> : null}

          {!loading && !error && article ? (
            <>
              <header>
                <h1 className="page-title">{article.title}</h1>

                <div className="article-meta">
                  <span>{article.author || "Unknown"}</span>
                  {article.date ? <span> · {article.date}</span> : null}
                </div>
              </header>

              <main className="article-content">
                {blocks.map((b, idx) => {
                  if (b.type === "h2") return <h2 key={idx}>{b.text}</h2>;
                  if (b.type === "h3") return <h3 key={idx}>{b.text}</h3>;
                  return <p key={idx}>{b.text}</p>;
                })}
              </main>
            </>
          ) : null}
        </article>
      </div>
    </div>
  );
}
