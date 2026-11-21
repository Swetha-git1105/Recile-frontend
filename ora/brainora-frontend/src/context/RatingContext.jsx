import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getRatingSummaries, rateResource } from "../services/api";
import { useAuth } from "./AuthContext";

const RatingContext = createContext(null);

const EMPTY = { average: 0, count: 0, myRating: 0 };

function normalizeEntry(entry) {
  return {
    average: Number(entry?.average) || 0,
    count: Number(entry?.count) || 0,
    myRating: Number(entry?.myRating) || 0,
  };
}

// The backend may send an object keyed by resource id, or a list.
function normalizeSummaries(data) {
  const result = {};

  if (Array.isArray(data)) {
    data.forEach((entry) => {
      if (entry?.resourceId != null) {
        result[entry.resourceId] = normalizeEntry(entry);
      }
    });
  } else if (data && typeof data === "object") {
    Object.entries(data).forEach(([id, entry]) => {
      result[id] = normalizeEntry(entry);
    });
  }

  return result;
}

// Updates the numbers instantly (before the server answers) so the stars
// feel responsive. The server's answer replaces this right after.
function applyRating(entry, value) {
  const { average, count, myRating } = entry || EMPTY;
  const total = average * count;

  if (myRating) {
    return { average: (total - myRating + value) / count, count, myRating: value };
  }

  return {
    average: (total + value) / (count + 1),
    count: count + 1,
    myRating: value,
  };
}

export function RatingProvider({ children }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);

  const ratingsRef = useRef(ratings);

  useEffect(() => {
    ratingsRef.current = ratings;
  }, [ratings]);

  const refreshRatings = useCallback(async () => {
    try {
      setLoading(true);
      setRatings(normalizeSummaries(await getRatingSummaries()));
    } catch (error) {
      // Ratings are an extra. If this fails the app still works without stars.
      console.error("Unable to load ratings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshRatings();
    } else {
      setRatings({});
    }
  }, [user, refreshRatings]);

  // Throws if saving fails, so the card can show the message.
  const rate = useCallback(async (resourceId, value) => {
    const previous = ratingsRef.current[resourceId];

    setRatings((current) => ({
      ...current,
      [resourceId]: applyRating(current[resourceId], value),
    }));

    try {
      const saved = await rateResource(resourceId, value);

      setRatings((current) => ({
        ...current,
        [resourceId]: saved ? normalizeEntry(saved) : current[resourceId],
      }));
    } catch (error) {
      setRatings((current) => {
        const next = { ...current };

        if (previous) next[resourceId] = previous;
        else delete next[resourceId];

        return next;
      });

      throw error;
    }
  }, []);

  const getRating = useCallback(
    (resourceId) => ratings[resourceId] || EMPTY,
    [ratings]
  );

  const value = useMemo(
    () => ({ ratings, loading, getRating, rate, refreshRatings }),
    [ratings, loading, getRating, rate, refreshRatings]
  );

  return (
    <RatingContext.Provider value={value}>{children}</RatingContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingContext);

  if (!context) {
    throw new Error("useRatings must be used inside RatingProvider");
  }

  return context;
}