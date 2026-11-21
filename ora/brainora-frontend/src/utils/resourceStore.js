
const STORAGE_KEY = "recile_resources";

function readResources() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Unable to read resources:", error);
    return [];
  }
}

// Get all uploaded resources
export function getResources() {
  return readResources();
}

// Save a successfully uploaded resource
export function saveUploadedResource(resource) {
  const resources = readResources();

  const newResource = {
    id: resource.id || crypto.randomUUID(),
    title: resource.title || resource.file?.name || "Untitled resource",
    fileName: resource.fileName || resource.file?.name || "",
    department: resource.department || "",
    semester: resource.semester || "",
    subject: resource.subject || "",
    resourceType: resource.resourceType || resource.type || "Other",
    description: resource.description || "",

    uploadedByEmail: (
      resource.uploadedByEmail ||
      resource.user?.email ||
      ""
    ).toLowerCase(),

    uploadedByName:
      resource.uploadedByName ||
      resource.user?.name ||
      "",

    uploadedAt: new Date().toISOString(),

    fileUrl: resource.fileUrl || resource.url || "",
  };

  const updatedResources = [
    newResource,
    ...resources,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedResources)
  );

  window.dispatchEvent(
    new Event("recile:resources-updated")
  );

  return newResource;
}

// Delete a resource
export function deleteResource(resourceId) {
  const updatedResources = readResources().filter(
    (resource) => resource.id !== resourceId
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedResources)
  );

  window.dispatchEvent(
    new Event("recile:resources-updated")
  );

  return updatedResources;
}
