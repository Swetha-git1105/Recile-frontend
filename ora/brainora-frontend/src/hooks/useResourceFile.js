import { useCallback, useState } from "react";
import { resolveResourceUrl } from "../services/api";

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

      const target = await resolveResourceUrl(resource.id, "preview");
      previewWindow.location.href = target.url;

      if (target.revoke) window.setTimeout(target.revoke, 5 * 60 * 1000);
      setOpened(true);
    } catch (err) {
      previewWindow.close();
      setError(err.message || "Unable to preview this resource.");
    } finally {
      setBusy("");
    }
  }, [resource.id]);

  const download = useCallback(async () => {
    try {
      setBusy("download");
      setError("");

      const target = await resolveResourceUrl(resource.id, "download");
      const link = document.createElement("a");

      link.href = target.url;
      link.download = resource.originalFilename || `${resource.title}.file`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (target.revoke) window.setTimeout(target.revoke, 60 * 1000);
      setOpened(true);
    } catch (err) {
      setError(err.message || "Unable to download this resource.");
    } finally {
      setBusy("");
    }
  }, [resource.id, resource.originalFilename, resource.title]);

  return { busy, error, opened, preview, download, setError };
}