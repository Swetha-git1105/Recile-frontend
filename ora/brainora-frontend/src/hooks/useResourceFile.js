import { useCallback, useState } from "react";
import { resolveResourceUrl } from "../services/api";
import { useResources } from "../context/ResourceContext";

const LOADING_PAGE =
  "<!doctype html><title>Loading preview</title>" +
  '<body style="margin:0;display:grid;place-items:center;height:100vh;' +
  'font-family:system-ui,sans-serif;color:#555;background:#fafafa">' +
  "Loading preview...</body>";

// Preview / Download for one resource, shared by every card in the app.
// busy is "" or "preview" / "download" so the buttons can show progress.
export default function useResourceFile(resource) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false); // true after a preview or download
  const [unavailable, setUnavailable] = useState(false); // the file is missing (410)
  const [needsCredits, setNeedsCredits] = useState(false); // not enough credits (402)
  const { refreshCredits } = useResources();

  // 410 = the file is gone, 402 = no free access left and not enough credits.
  const handleFailure = useCallback((err, fallback) => {
    if (err?.status === 410) setUnavailable(true);
    if (err?.status === 402) setNeedsCredits(true);

    setError(err?.message || fallback);
  }, []);

  const preview = useCallback(async () => {
    // Open the tab first, inside the click, so the browser does not block it.
    const previewWindow = window.open("about:blank", "_blank");

    if (!previewWindow) {
      setError("Please allow pop-ups to preview resources.");
      return;
    }

    previewWindow.document.write(LOADING_PAGE);
    previewWindow.document.close();

    try {
      setBusy("preview");
      setError("");
      setNeedsCredits(false);

      const target = await resolveResourceUrl(resource.id, "preview");
      previewWindow.location.href = target.url;

      if (target.revoke) window.setTimeout(target.revoke, 5 * 60 * 1000);
      setOpened(true);
      refreshCredits(); // the first open may have used a free access or credits
    } catch (err) {
      previewWindow.close();
      handleFailure(err, "Unable to preview this resource.");
    } finally {
      setBusy("");
    }
  }, [resource.id, refreshCredits, handleFailure]);

  const download = useCallback(async () => {
    try {
      setBusy("download");
      setError("");
      setNeedsCredits(false);

      const target = await resolveResourceUrl(resource.id, "download");
      const link = document.createElement("a");

      link.href = target.url;
      link.download = resource.originalFilename || `${resource.title}.file`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (target.revoke) window.setTimeout(target.revoke, 60 * 1000);
      setOpened(true);
      refreshCredits();
    } catch (err) {
      handleFailure(err, "Unable to download this resource.");
    } finally {
      setBusy("");
    }
  }, [resource.id, resource.originalFilename, resource.title, refreshCredits, handleFailure]);

  return {
    busy,
    error,
    opened,
    unavailable,
    needsCredits,
    preview,
    download,
    setError,
  };
}