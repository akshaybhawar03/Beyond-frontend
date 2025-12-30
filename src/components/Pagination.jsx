import React from "react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const getPages = () => {
    const pages = [];

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    for (let p = start; p <= end; p++) pages.push(p);

    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        style={{ padding: "6px 10px" }}
      >
        Prev
      </button>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`dots-${idx}`} style={{ padding: "0 6px" }}>
              ...
            </span>
          );
        }

        const isActive = p === page;

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={isActive}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              background: isActive ? "#111" : "#fff",
              color: isActive ? "#fff" : "#111",
              cursor: isActive ? "default" : "pointer",
            }}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        style={{ padding: "6px 10px" }}
      >
        Next
      </button>

      <span style={{ marginLeft: 8, color: "#555" }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
