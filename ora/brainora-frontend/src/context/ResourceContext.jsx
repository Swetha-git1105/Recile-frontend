import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getResources,
  getMyUploads,
  getCreditSummary,
  deleteResource as apiDeleteResource,
} from "../services/api";

import { useAuth } from "./AuthContext";

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  // Credit balance, free accesses left, resources already opened ...
  const [creditSummary, setCreditSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [allData, myData, summary] = await Promise.all([
        getResources(),
        getMyUploads(),
        getCreditSummary(),
      ]);

      setCreditSummary(summary);
      setTotalCredits(Number(summary?.balance) || 0);

      setResources(Array.isArray(allData) ? allData : []);
      setMyUploads(Array.isArray(myData) ? myData : []);
    } catch (err) {
      setError(err.message || "Unable to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload only the credit numbers (after a resource was opened).
  const refreshCredits = useCallback(async () => {
    try {
      const summary = await getCreditSummary();

      setCreditSummary(summary);
      setTotalCredits(Number(summary?.balance) || 0);
    } catch {
      // The numbers are refreshed again on the next full reload.
    }
  }, []);

  // Load only when a user is logged in (a token exists), and reload on
  // every login. Clear the lists on logout.
  useEffect(() => {
    if (user) {
      refreshResources();
    } else {
      setResources([]);
      setMyUploads([]);
      setTotalCredits(0);
      setCreditSummary(null);
      setError("");
    }
  }, [user, refreshResources]);

  const addResource = useCallback(async (resource) => {
    // Upload is handled by uploadResource() in the API service.
    // Refresh the backend data after a successful upload.
    await refreshResources();
    return resource;
  }, [refreshResources]);

  const removeResource = useCallback(async (id) => {
    // The backend must verify that the current user owns this resource.
    await apiDeleteResource(id);
    await refreshResources();
  }, [refreshResources]);

  const value = useMemo(
    () => ({
      resources,
      myUploads,
      totalCredits,
      creditSummary,
      loading,
      error,
      refreshResources,
      refreshCredits,
      addResource,
      deleteResource: removeResource,
    }),
    [
      resources,
      myUploads,
      totalCredits,
      creditSummary,
      loading,
      error,
      refreshResources,
      refreshCredits,
      addResource,
      removeResource,
    ]
  );

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);

  if (!context) {
    throw new Error(
      "useResources must be used inside ResourceProvider"
    );
  }

  return context;
}