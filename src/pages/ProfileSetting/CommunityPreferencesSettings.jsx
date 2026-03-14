import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import axios from 'axios';

const CommunityPreferencesSettings = () => {
  const [allPreferences, setAllPreferences] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [allRes, userRes] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/community-preferences`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        axios.get(`${apiUrl}/api/v1/community-preferences/user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (allRes.data?.ok && Array.isArray(allRes.data.data)) {
        setAllPreferences(allRes.data.data);
      }

      if (userRes.data?.ok && userRes.data.data?.preference_ids) {
        setSelectedIds(userRes.data.data.preference_ids || []);
      }
    } catch (err) {
      console.error('Error fetching community preferences:', err);
      setError('Failed to load community preferences.');
      // Still try to load all options if user prefs fail (e.g. no auth)
      try {
        const allRes = await axios.get(`${apiUrl}/api/v1/community-preferences`);
        if (allRes.data?.ok && Array.isArray(allRes.data.data)) {
          setAllPreferences(allRes.data.data);
        }
      } catch (e) {
        setAllPreferences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/community-preferences/user`,
        { preference_ids: selectedIds },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.ok) {
        setSuccess('Community preferences updated successfully.');
      } else {
        setError(response.data?.message || 'Failed to save preferences.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#d3d1d1] p-6">
        <p className="text-gray-500">Loading community preferences...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#d3d1d1] p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <FiHeart className="text-[#1d60eb]" />
        Community Preferences
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Select the communities you are interested in. Your feed will show posts from these communities.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {allPreferences.length === 0 ? (
        <p className="text-gray-500">No community preferences available yet.</p>
      ) : (
        <form onSubmit={handleSave}>
          <div className="flex flex-wrap gap-3 mb-6">
            {allPreferences.map((pref) => (
              <label
                key={pref.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
                  selectedIds.includes(pref.id)
                    ? 'bg-[#1d60eb]/10 border-[#1d60eb] text-[#1d60eb]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(pref.id)}
                  onChange={() => togglePreference(pref.id)}
                  className="rounded border-gray-300 text-[#1d60eb] focus:ring-[#1d60eb]"
                />
                <span>{pref.name}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#1d60eb] text-white rounded-lg font-medium hover:bg-[#1a4fc7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CommunityPreferencesSettings;
