# GlobeTrotter Quiz Game

## 📌 About the Project

GlobeTrotter is an interactive quiz game where players test their knowledge of world cities. The game provides clues, multiple-choice answers, and fun facts about different destinations. Scores are saved, and players can invite friends to join!

## 🚀 Features

- Random city-based quiz questions
- Multiple-choice answers
- Fun facts revealed after each question
- Score tracking and leaderboard
- User registration and session management
- Invite friends to play

## 🛠 Tech Stack

- **Backend**: Flask, SQLite3
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: TailwindCSS (or Bootstrap if needed)

## 📂 Project Structure

```
📁 quiz_game_project/
│── app.py                # Main Flask application
│── templates/
│   ├── index.html        # Main game interface
│── static/
│   ├── styles.css        # CSS for styling
│   ├── script.js         # JavaScript for game logic
│── quiz_game.db          # SQLite database
│── requirements.txt      # Required Python packages
│── README.md             # Project documentation
```

## 🛠 Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/yourusername/GlobeTrotter-Quiz.git
cd GlobeTrotter-Quiz
```

### 2️⃣ Install Dependencies

```sh
pip install -r requirements.txt
```

### 3️⃣ Run the Application

```sh
python3 app.py
```

The app will run on `http://127.0.0.1:5000/`

### 4️⃣ Database Setup (Optional)

To reset and initialize the database:

```sh
python -c "from app import init_db; init_db()"
```

## 🏆 How to Play

1️⃣ Enter a **registerd username** (Initially use admin) and start the game.  
2️⃣ Read the **clues** about a city.  
3️⃣ Select the **correct answer** from multiple choices.  
4️⃣ If correct, you earn points & see a fun fact.  
5️⃣ If wrong, the correct answer and fun fact appear.  
6️⃣ Try to **get the highest score!**

## 🤝 Contributing

Want to improve GlobeTrotter? Feel free to fork the repo, make changes, and submit a pull request.

---

Happy Coding! 🎉
