import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this environment variable points to your Flask/Render API
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/guestbook";

const Guestbook = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({ name: '', message: '' });
  
  // Refined loading states
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // 1. GET: Fetch all entries
  const fetchEntries = async () => {
    try {
      const response = await axios.get(API_URL);
      setEntries(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load entries. The server might be waking up (this can take ~50s).");
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Generic change handler for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2 & 3. POST / PUT: Add or update an entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      
      // Reset form and UI state on success
      setFormData({ name: '', message: '' });
      setEditingId(null);
      await fetchEntries();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. DELETE: Remove an entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchEntries(); // Refresh list after deletion
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the entry.");
    }
  };

  // UI Helpers
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({ name: entry.name, message: entry.message });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll user back to the form
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', message: '' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header>
        <h2>📖 Guestbook</h2>
      </header>
      
      {/* Form Section */}
      <section style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
          />
          <textarea 
            name="message"
            placeholder="Leave a message..." 
            value={formData.message}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            rows="4"
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={isSubmitting} style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? "Saving..." : editingId ? "Update Entry" : "Sign Guestbook"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />

      {/* List Section */}
      <section>
        {isInitialLoad ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>☕ Waking up the server... Please wait a moment.</p>
          </div>
        ) : error ? (
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className="entries">
            {entries.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No entries yet. Be the first to sign!</p>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{entry.name}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#555' }}>{entry.message}</p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.9em' }}>
                    <button onClick={() => startEdit(entry)} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', padding: 0 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', padding: 0 }}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Guestbook;