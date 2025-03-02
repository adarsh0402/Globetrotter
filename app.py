from flask import Flask, render_template, jsonify, request
import random
import json, os
import sqlite3
from datetime import datetime

app = Flask(__name__)


# Database setup with default admin user
def init_db():
    conn = sqlite3.connect("quiz_game.db")
    c = conn.cursor()

    # Create users table
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # Create scores table
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            score INTEGER,
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )

    # Ensure admin user exists
    c.execute("SELECT id FROM users WHERE username = ?", ("admin",))
    admin_user = c.fetchone()

    if not admin_user:
        c.execute("INSERT INTO users (username) VALUES ('admin')")
        conn.commit()

    conn.close()


def get_db():
    conn = sqlite3.connect("quiz_game.db")
    conn.row_factory = sqlite3.Row
    return conn


# Load game data
with open("data.json", "r") as f:
    destinations = json.load(f)


def shuffle_array(array):
    random.shuffle(array)
    return array


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register_user", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    isInvite = data.get("isInvite")
    print(isInvite)
    if not username:
        return jsonify({"error": "Username is required!"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()

        # Check if username exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify(
                {
                    "success": True,
                    "user_id": existing_user["id"],
                    "username": username,
                    "isexisting": True,
                }
            )
        else:
            if isInvite is None:
                return jsonify({"error": "User not found. Please register first!"}), 404
            # Insert new user
            cursor.execute("INSERT INTO users (username) VALUES (?)", (username,))
            conn.commit()

            # Get the user ID
            user_id = cursor.lastrowid
            return jsonify({"success": True, "user_id": user_id, "username": username})

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/get_destination", methods=["GET"])
def get_destination():
    destination = random.choice(destinations)
    clues = destination["clues"][: random.randint(1, 2)]
    answers = shuffle_array(destination["answers"][:])
    return jsonify(
        {
            "city": destination["city"],
            "clues": clues,
            "answers": answers,
            "facts": destination["facts"],
        }
    )


@app.route("/check_answer", methods=["POST"])
def check_answer():
    data = request.get_json()
    selected_answer = data.get("selectedAnswer")
    correct_answer = data.get("correctAnswer")
    user_id = data.get("userId")
    final_score = data.get("finalScore", 0)
    is_game_over = data.get("isGameOver", False)

    # If game is over, save the score
    print(user_id)
    os._exit
    if is_game_over and user_id:
        conn = get_db()
        try:
            cursor = conn.cursor()
            # Check if user already has a score
            cursor.execute("SELECT score FROM scores WHERE user_id = ?", (user_id,))
            existing_score = cursor.fetchone()

            if existing_score is not None:
                # Update score if user exists and new score is higher
                if final_score > existing_score["score"]:
                    cursor.execute(
                        "UPDATE scores SET score = ? WHERE user_id = ?",
                        (final_score, user_id),
                    )
            else:
                # Insert new score if user does not exist
                cursor.execute(
                    "INSERT INTO scores (user_id, score) VALUES (?, ?)",
                    (user_id, final_score),
                )

            conn.commit()
        except sqlite3.Error as e:
            print(f"Error saving score: {e}")
        finally:
            conn.close()

    return jsonify({"correct": selected_answer == correct_answer})


@app.route("/get_top_scores", methods=["GET"])
def get_top_scores():
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.username, s.score, s.played_at
            FROM scores s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.score DESC
            LIMIT 10
        """
        )

        top_scores = [dict(row) for row in cursor.fetchall()]
        return jsonify(top_scores)

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0")
