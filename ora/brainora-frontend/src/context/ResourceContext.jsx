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
  getMyCredits,
  deleteResource as apiDeleteResource,
} from "../services/api";

import { useAuth } from "./AuthContext";

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [allData, myData, credits] = await Promise.all([
        getResources(),
        getMyUploads(),
        getMyCredits(),
      ]);

      setTotalCredits(credits);

      setResources(Array.isArray(allData) ? allData : []);
      setMyUploads(Array.isArray(myData) ? myData : []);
    } catch (err) {
      setError(err.message || "Unable to load resources.");
    } finally {
      setLoading(false);
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
      loading,
      error,
      refreshResources,
      addResource,
      deleteResource: removeResource,
    }),
    [
      resources,
      myUploads,
      totalCredits,
      loading,
      error,
      refreshResources,
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