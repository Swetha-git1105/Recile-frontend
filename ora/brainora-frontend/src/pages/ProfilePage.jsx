import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { getResourceFileBlob } from '../services/api';
import { formatCredits } from '../utils/credits';
import '../styles/ProfilePage.css';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { myUploads, totalCredits, deleteResource, loading, error } = useResources();
  const imageInput = useRef(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageError, setImageError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  const displayName = user?.name?.trim() || 'Recile User';
  const instituteName =
    user?.campus ||
    user?.institute ||
    user?.college ||
    user?.collegeName ||
    '';
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'U';

  const visibleUploads = useMemo(() => myUploads.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const matchesSemester = semesterFilter === 'All' || item.semester === semesterFilter;
    return matchesSearch && matchesType && matchesSemester;
  }), [myUploads, search, typeFilter, semesterFilter]);

  function startEditing() {
    setName(user?.name || '');
    setMobile(user?.mobile || '');
    setProfileImage(user?.profileImage || '');
    setImageError('');
    setEditing(true);
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Please choose an image smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setProfileImage(String(reader.result)); setImageError(''); };
    reader.readAsDataURL(file);
  }

  function saveProfile(event) {
    event.preventDefault();
    if (!name.trim()) return;
    if (mobile && !/^[0-9+()\-\s]{7,16}$/.test(mobile.trim())) {
      setImageError('Enter a valid mobile number.');
      return;
    }
    updateUser({ name: name.trim(), mobile: mobile.trim(), profileImage });
    setEditing(false);
  }

  async function openResource(item, action = 'preview') {
    try {
      const blob = await getResourceFileBlob(item.id, action);
      const url = window.URL.createObjectURL(blob);

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = item.originalFilename || 'resource';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      alert(error.message || 'Unable to open resource.');
    }
  }

  // Original upload  -> deletes the file for everyone.
  // Duplicate upload -> removes only this user's contribution and credits;
  //                     the file stays in the library.
  async function handleDelete(item) {
    const isDuplicate = item.contributionType === 'DUPLICATE_SOURCE';

    const message = isDuplicate
      ? `Remove your contribution to "${item.title}"?\n\nYou will lose ${formatCredits(item.creditsEarned)} credits. The file stays in the library because it was uploaded by someone else first.`
      : `Delete "${item.title}"?\n\nThe file will be removed from the library for everyone.`;

    if (!window.confirm(message)) return;

    try {
      await deleteResource(item.id);
    } catch (error) {
      alert(error.message || 'Unable to delete this upload.');
    }
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <h1>My Profile</h1>
        <p>View and manage your profile information and your uploaded resources.</p>
      </header>

      <section className="profile-summary-card">
        <div className="profile-summary-avatar-wrap">
          {user?.profileImage ? (
            <img className="profile-summary-avatar" src={user.profileImage} alt={`${displayName} profile`} />
          ) : (
            <div className="profile-summary-avatar profile-summary-initials">{initials}</div>
          )}
        </div>
        <div className="profile-summary-divider" />
        <div className="profile-summary-info">
          <h2>{displayName}</h2>
          <div className="profile-summary-meta">
            <span><span aria-hidden="true">✉</span>{user?.email || 'Email not provided'}</span>
            <span><span aria-hidden="true">▦</span>{instituteName || 'Institute not provided'}</span>
          </div>
          {user?.mobile && <p className="profile-summary-mobile">Mobile: {user.mobile}</p>}
          <p className="profile-credit-badge">
            <span aria-hidden="true">★</span>
            Total credits: <strong>{formatCredits(totalCredits)}</strong>
          </p>
        </div>
        <button className="profile-edit-button" type="button" onClick={startEditing}>✎ <span>Edit Profile</span></button>

      </section>

      {editing && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <form className="profile-edit-modal" onSubmit={saveProfile}>
            <div className="profile-edit-modal-heading"><h2>Edit Profile</h2><button type="button" onClick={() => setEditing(false)} aria-label="Close">×</button></div>
            <div className="profile-photo-editor">
              {profileImage ? <img src={profileImage} alt="Profile preview" /> : <div className="profile-photo-placeholder">{initials}</div>}
              <div><button type="button" className="profile-secondary-button" onClick={() => imageInput.current?.click()}>Change photo</button>
                {profileImage && <button type="button" className="profile-text-button" onClick={() => setProfileImage('')}>Remove photo</button>}
                <small>JPG, PNG or WEBP · Max 2 MB</small>
                <input ref={imageInput} type="file" accept="image/*" hidden onChange={choosePhoto} />
              </div>
            </div>
            <label className="profile-edit-field">Full name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>
            <label className="profile-edit-field">Mobile number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter mobile number" maxLength={16} /></label>
            <label className="profile-edit-field">College email<input value={user?.email || ''} readOnly /></label>
            <label className="profile-edit-field">Institute / college<input value={instituteName || 'Not provided'} readOnly /></label>
            {imageError && <p className="profile-edit-error">{imageError}</p>}
            <div className="profile-edit-actions"><button type="button" className="profile-secondary-button" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="profile-save-button">Save changes</button></div>
          </form>
        </div>
      )}

      <section className="my-uploads-card">
        <div className="my-uploads-heading">
          <div className="my-uploads-icon" aria-hidden="true">⇧</div>
          <div><h2>My Uploads</h2><p>Resources you have uploaded to the library.</p></div>
          <span className="my-uploads-count">{myUploads.length} uploads</span>
        </div>
        <div className="my-uploads-toolbar">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your uploads..." aria-label="Search your uploads" />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by type"><option>All</option><option>Notes</option><option>QP</option><option>Video</option><option>Other</option></select>
          <select value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)} aria-label="Filter by semester"><option>All</option>{[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={`Semester ${n}`}>Semester {n}</option>)}</select>
        </div>
        {visibleUploads.length ? (
          <div className="my-uploads-table-wrap"><table className="my-uploads-table"><thead><tr><th>#</th><th>Title</th><th>Type</th><th>Subject</th><th>Semester</th><th>Upload Date</th><th>Credits</th><th>Actions</th></tr></thead>
            <tbody>{visibleUploads.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><span className="my-upload-file-mark">{(item.originalFilename?.split('.').pop() || 'FILE').toUpperCase().slice(0, 3)}</span>{item.title}</td><td><span className={`my-upload-type type-${(item.type || '').toLowerCase()}`}>{item.type || "—"}</span></td><td>{item.subject || '—'}</td><td>{item.semester || '—'}</td><td>{formatDate(item.uploadedAt)}</td><td className="my-upload-credits">+{formatCredits(item.creditsEarned)}{item.contributionType === 'DUPLICATE_SOURCE' && <small>duplicate</small>}</td><td className="my-upload-actions">
              <button
                className="my-upload-action"
                type="button"
                onClick={() => openResource(item, 'preview')}
                title="Preview"
                aria-label="Preview"
              >
                👁
              </button>

              <button
                className="my-upload-action"
                type="button"
                onClick={() => openResource(item, 'download')}
                title="Download"
                aria-label="Download"
              >
                ↓
              </button>

              <button
                className="my-upload-action delete"
                type="button"
                onClick={() => handleDelete(item)}
                title={item.contributionType === 'DUPLICATE_SOURCE' ? 'Remove my contribution' : 'Delete'}
                aria-label={item.contributionType === 'DUPLICATE_SOURCE' ? 'Remove my contribution' : 'Delete'}
              >
                🗑
              </button>
            </td></tr>)}</tbody>
          </table></div>
        ) : <div className="my-uploads-empty"><div>⇧</div><h3>{myUploads.length ? 'No matching uploads' : 'You have not uploaded anything yet'}</h3><p>{myUploads.length ? 'Try changing your search or filters.' : 'Your uploaded notes and study materials will appear here.'}</p></div>}
        <div className="my-uploads-footer"><span>Showing {visibleUploads.length} of {myUploads.length} uploads</span></div>
      </section>
    </main>
  );
}