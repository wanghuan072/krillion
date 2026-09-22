"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  commentConfig,
  commentConfigReady,
} from "@/src/config/comments";
import styles from "@/src/style/site.module.css";

type Review = {
  id: string;
  body: string;
  rating: number | null;
  authorDisplayName: string | null;
  createdAt: string;
};

type ReviewPage = {
  data: Review[];
  page: number;
  pageSize: number;
  total: number;
};

const ratingChoices = [1, 2, 3, 4, 5] as const;

function reviewsEndpoint(gameSlug: string, page?: number) {
  const path = `/api/v1/p/${encodeURIComponent(commentConfig.projectSlug)}/sections/${encodeURIComponent(commentConfig.sectionSlug)}/reviews`;
  const url = new URL(path, `${commentConfig.apiOrigin}/`);
  if (page) {
    url.searchParams.set("itemSlug", gameSlug);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(commentConfig.pageSize));
    url.searchParams.set("sort", "createdAt_desc");
  }
  return url.toString();
}

function readableError(status: number) {
  if (status === 429) return "Too many reviews were sent recently. Please wait a moment and try again.";
  if (status === 403) return "Player ratings are not available from this address yet.";
  return "Player ratings could not be reached. Please try again.";
}

async function fetchReviewPage(gameSlug: string, page: number, signal?: AbortSignal) {
  const response = await fetch(reviewsEndpoint(gameSlug, page), {
    headers: { "X-API-Key": commentConfig.apiKey },
    signal,
  });
  if (!response.ok) throw new Error(readableError(response.status));
  return (await response.json()) as ReviewPage;
}

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className={styles.reviewStars} aria-label={`${label}: ${value} out of 5 stars`}>
      {ratingChoices.map((star) => (
        <span key={star} aria-hidden="true" data-filled={star <= value}>
          ★
        </span>
      ))}
    </span>
  );
}

export function GameReviews({ gameSlug, gameTitle }: { gameSlug: string; gameTitle: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(commentConfigReady);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [previewRating, setPreviewRating] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const headingId = useMemo(() => `player-ratings-${gameSlug}`, [gameSlug]);

  useEffect(() => {
    if (!commentConfigReady) return;
    const controller = new AbortController();
    fetchReviewPage(gameSlug, 1, controller.signal)
      .then((result) => {
        setReviews(result.data);
        setTotal(result.total);
        setPage(result.page);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : readableError(0));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [gameSlug]);

  async function loadMore() {
    setLoadingMore(true);
    setError("");
    try {
      const result = await fetchReviewPage(gameSlug, page + 1);
      setReviews((current) => [...current, ...result.data]);
      setTotal(result.total);
      setPage(result.page);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : readableError(0));
    } finally {
      setLoadingMore(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanBody = body.trim();
    const cleanName = displayName.trim();
    if (!rating) {
      setError("Choose a star rating before posting.");
      return;
    }
    if (!cleanBody) {
      setError("Write a short comment before posting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(reviewsEndpoint(gameSlug), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": commentConfig.apiKey,
        },
        body: JSON.stringify({
          body: cleanBody,
          rating,
          ...(cleanName ? { authorDisplayName: cleanName } : {}),
          itemSlug: gameSlug,
          itemTitle: gameTitle,
        }),
      });
      if (!response.ok) throw new Error(readableError(response.status));
      const created = (await response.json()) as Review;
      setReviews((current) => [created, ...current]);
      setTotal((current) => current + 1);
      setBody("");
      setRating(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : readableError(0));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.reviewPanel} aria-labelledby={headingId}>
      <div className={styles.reviewHeading}>
        <div>
          <span className={styles.reviewKicker}>Community score</span>
          <h2 id={headingId}>Player Ratings</h2>
        </div>
        {commentConfigReady && !loading ? <strong>{total}</strong> : null}
      </div>

      {!commentConfigReady ? (
        <p className={styles.reviewNotice}>Ratings are temporarily unavailable.</p>
      ) : (
        <>
          <form className={styles.reviewForm} onSubmit={submitReview}>
            <fieldset className={styles.ratingField}>
              <legend>Your rating</legend>
              <div className={styles.ratingPicker} onMouseLeave={() => setPreviewRating(0)}>
                {ratingChoices.map((star) => (
                  <button
                    type="button"
                    key={star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    aria-pressed={rating === star}
                    data-filled={star <= (previewRating || rating)}
                    onMouseEnter={() => setPreviewRating(star)}
                    onFocus={() => setPreviewRating(star)}
                    onBlur={() => setPreviewRating(0)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
            <label className={styles.reviewField}>
              <span>Display name <small>optional</small></span>
              <input value={displayName} maxLength={120} autoComplete="nickname" onChange={(event) => setDisplayName(event.target.value)} placeholder="Player" />
            </label>
            <label className={styles.reviewField}>
              <span>Your comment</span>
              <textarea value={body} maxLength={2000} rows={4} required onChange={(event) => setBody(event.target.value)} placeholder={`What did you think of ${gameTitle}?`} />
            </label>
            <div className={styles.reviewSubmitRow}>
              <span>{body.length}/2000</span>
              <button type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post Review"}</button>
            </div>
          </form>

          <div className={styles.reviewList} aria-live="polite">
            {loading ? <p className={styles.reviewNotice}>Loading player ratings…</p> : null}
            {!loading && !reviews.length && !error ? <p className={styles.reviewNotice}>No ratings yet. Be the first player to leave one.</p> : null}
            {reviews.map((review) => (
              <article className={styles.reviewItem} key={review.id}>
                <div className={styles.reviewMeta}>
                  <strong>{review.authorDisplayName?.trim() || "Player"}</strong>
                  {review.rating ? <Stars value={review.rating} label={`${review.authorDisplayName?.trim() || "Player"}'s rating`} /> : null}
                </div>
                <p>{review.body}</p>
                <time dateTime={review.createdAt}>{new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(review.createdAt))}</time>
              </article>
            ))}
          </div>
          {error ? <p className={styles.reviewError} role="alert">{error}</p> : null}
          {reviews.length < total ? <button className={styles.reviewMore} type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load More"}</button> : null}
        </>
      )}
    </section>
  );
}
