import React, { useEffect, useMemo, useState } from 'react';

export default function ResourceHub() {
  const STORAGE_KEY = 'eztutor_resources_v1';
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const MAX_FILE_MB = 10;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setResources(parsed);
        }
      } catch (err) {
        setError('Failed to load saved resources.');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const extractTags = (file) => {
    const tags = new Set();
    if (file.type) {
      const type = file.type.split('/')[0];
      if (type) tags.add(type);
    }
    const ext = file.name.split('.').pop();
    if (ext) tags.add(ext.toLowerCase());
    const tokens = file.name
      .replace(/\.[^/.]+$/, '')
      .split(/[\s-_]+/)
      .map((t) => t.toLowerCase())
      .filter((t) => t.length > 3);
    tokens.slice(0, 3).forEach((t) => tags.add(t));
    return Array.from(tags);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`File too large. Max size is ${MAX_FILE_MB}MB.`);
        return;
      }
      const newItem = {
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        addedAt: new Date().toISOString(),
        tags: extractTags(file),
      };
      setResources([newItem, ...resources]);
      e.target.value = '';
    }
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return resources.filter((r) => {
      return (
        r.name.toLowerCase().includes(query) ||
        r.tags?.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [resources, search]);

  return (
    <div className="page">
      <div className="container space-y-6">
      <div className="card section-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Resource Organizer</h2>
          <button className="btn btn-outline" onClick={() => setResources([])} disabled={resources.length === 0}>
            Clear All
          </button>
        </div>
        <p className="text-gray-600">
          Upload files, auto-tag them, and search by keyword or tag. Resources are saved locally.
        </p>
        <input type="file" onChange={handleUpload} className="mb-4" />
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      <input 
        className="input w-full"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      </div>
      {resources.length === 0 ? (
        <div className="text-gray-600">No resources uploaded yet.</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No matches for your search.</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="card section-card">
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-600">
                {(r.size / 1024).toFixed(1)} KB • {r.type} • {new Date(r.addedAt).toLocaleString()}
              </div>
              {r.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.tags.map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
