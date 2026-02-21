import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration: Ensure environment variables exist to avoid startup crashes
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing Supabase environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

---

### API Endpoints

@app.route('/guestbook', methods=['GET'])
def fetch_guestbook():
    """Retrieve all entries, newest first."""
    try:
        query = supabase.table("guestbook").select("*").order("created_at", desc=True).execute()
        return jsonify(query.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/guestbook', methods=['POST'])
def create_entry():
    """Add a new entry to the guestbook."""
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        result = supabase.table("guestbook").insert(payload).execute()
        return jsonify(result.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/guestbook/<int:entry_id>', methods=['PUT'])
def modify_entry(entry_id):
    """Update an existing entry by ID."""
    payload = request.get_json()
    try:
        result = supabase.table("guestbook").update(payload).eq("id", entry_id).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/guestbook/<int:entry_id>', methods=['DELETE'])
def remove_entry(entry_id):
    """Delete an entry from the database."""
    try:
        supabase.table("guestbook").delete().eq("id", entry_id).execute()
        return jsonify({"message": f"Entry {entry_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

---

### Server Entry Point

if __name__ == '__main__':
    # Standard Render deployment configuration
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
