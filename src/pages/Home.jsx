import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { fetchArticles } from "../api/api";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const query = useMemo(
    () => ({ page: currentPage, limit, search }),
    [currentPage, limit, search]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage) return;
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
    scrollToTop();
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchArticles(query);
        if (cancelled) return;

        setResults(data.results || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e.message || "Failed to load articles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [query, retryKey]);

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
    scrollToTop();
  };

  function onSubmitSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
    scrollToTop();
  }

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start;
    let end;
    if (currentPage <= 3) {
      start = 2;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    } else {
      start = currentPage - 1;
      end = currentPage + 1;
    }

    start = Math.max(2, start);
    end = Math.min(totalPages - 1, end);

    const items = [1];
    if (start > 2) items.push("...");
    for (let p = start; p <= end; p += 1) items.push(p);
    if (end < totalPages - 1) items.push("...");
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  const defaultOgImage =
    process.env.REACT_APP_OG_IMAGE ||
    "https://via.placeholder.com/1200x630.png?text=BeyondChats+Blogs";

  return (
    <div className="container">
      <Helmet>
        <title>BeyondChats Blogs</title>
        <link
          rel="canonical"
          href={(typeof window !== "undefined" ? window.location.origin : "http://localhost:3000") + "/"}
        />
        <meta
          name="description"
          content="Read latest blogs and insights from BeyondChats on AI, chatbots, SEO and technology."
        />
        <meta property="og:title" content="BeyondChats Blogs" />
        <meta
          property="og:description"
          content="Read latest blogs and insights from BeyondChats on AI, chatbots, SEO and technology."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={defaultOgImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BeyondChats Blogs" />
        <meta
          name="twitter:description"
          content="Read latest blogs and insights from BeyondChats on AI, chatbots, SEO and technology."
        />
        <meta name="twitter:image" content={defaultOgImage} />
      </Helmet>

      <h1 className="page-title">BeyondChats Blogs</h1>

      <p className="subtext">
          Total items: <b>{totalItems}</b>
      </p>

      <form onSubmit={onSubmitSearch} className="search-bar">
        <input
          className="search-input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or content..."
        />

        <button type="submit" className="btn-primary search-btn">
          Search
        </button>

        {search && (
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setCurrentPage(1);
              scrollToTop();
            }}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="skeleton-list">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line" style={{ width: "85%" }} />
              <div className="skeleton-buttons">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="error-state">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Something went wrong. Please try again.</div>
          <div className="subtext" style={{ marginBottom: 0 }}>
            {error}
          </div>
          <button type="button" className="btn-primary retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && results.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>No articles found</div>
          <div className="subtext" style={{ marginBottom: 0 }}>
            Try searching with a different keyword
          </div>
          {search ? (
            <button
              type="button"
              className="btn-outline retry-btn"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setCurrentPage(1);
                scrollToTop();
              }}
            >
              Reset search
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && results.length > 0 ? (
        <div className="cards-grid">
          {results.map((a) => {
            const excerptText =
              a.excerpt ||
              (a.content
                ? a.content.replace(/\s+/g, " ").trim().slice(0, 180) + (a.content.length > 180 ? "..." : "")
                : "");

            const articlePath = a.slug ? `/blog/${a.slug}` : `/article/${a._id}`;

            return (
              <div key={a._id} className="article-card">
                <h2 className="article-title">
                  <Link to={articlePath}>{a.title}</Link>
                </h2>

                <div className="article-meta">
                  <span>{a.author || "Unknown"}</span>
                  {a.date ? <span> · {a.date}</span> : null}
                </div>

                <p className="article-excerpt">{excerptText}</p>

                <div className="actions">
                  <Link to={articlePath} className="btn-primary">
                    Read more
                  </Link>
                  {a.url ? (
                    <a href={a.url} target="_blank" rel="noreferrer" className="btn-outline">
                      Original
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && results.length > 0 && totalPages > 1 ? (
        <div className="pagination" style={{ marginTop: 18 }}>
          <button
            type="button"
            className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {paginationItems.map((item, idx) => {
            if (item === "...") {
              return (
                <span key={`dots-${idx}`} className="page-btn disabled" aria-hidden="true">
                  ...
                </span>
              );
            }

            const p = item;
            return (
              <button
                key={p}
                type="button"
                className={`page-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => handlePageChange(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className={`page-btn ${currentPage === totalPages ? "disabled" : ""}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
