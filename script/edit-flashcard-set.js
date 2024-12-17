import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get, set, remove, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBedrz5bHO59W0f4TXiXrbRsrFRKUfQj3c",
    authDomain: "flashquiz-6c799.firebaseapp.com",
    databaseURL: "https://flashquiz-6c799-default-rtdb.firebaseio.com",
    projectId: "flashquiz-6c799",
    storageBucket: "flashquiz-6c799.firebasestorage.app",
    messagingSenderId: "446881626634",
    appId: "1:446881626634:web:01abc69ae19d3cd3ccbdf3",
    measurementId: "G-8QJL263E5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Get flashcard set ID from URL
const urlParams = new URLSearchParams(window.location.search);
const flashcardSetId = urlParams.get('id');

// Check user authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchFlashcardSet(user.uid, flashcardSetId);
    } else {
        alert("You must be logged in to edit flashcard sets.");
        window.location.href = "login.html";
    }
});

// Fetch flashcard set details
function fetchFlashcardSet(userId, flashcardSetId) {
    const flashcardSetRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}`);
    get(flashcardSetRef).then((snapshot) => {
        if (snapshot.exists()) {
            const { name, description, flashcards } = snapshot.val();
            
            // Set existing data in the form
            document.getElementById('set-name').value = name;
            document.getElementById('set-description').value = description;

            // Display flashcards
            displayFlashcards(flashcards, flashcardSetId, userId);
        } else {
            alert("Flashcard set not found.");
            window.location.href = "manage-flashcard-sets.html";
        }
    }).catch((error) => {
        console.error("Error fetching flashcard set:", error);
    });
}

// Display flashcards
function displayFlashcards(flashcards, flashcardSetId, userId) {
    const flashcardsList = document.getElementById('flashcardsList');
    flashcardsList.innerHTML = ''; // Clear current list

    if (flashcards) {
        Object.entries(flashcards).forEach(([flashcardId, flashcard]) => {
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <p><strong>Question:</strong> ${flashcard.question}</p>
                <p><strong>Answer:</strong> ${flashcard.answer}</p>
                <button class="edit-flashcard-btn" data-flashcard-id="${flashcardId}">Edit</button>
                <button class="delete-flashcard-btn" data-flashcard-id="${flashcardId}">Delete</button>
                <hr>
            `;
            flashcardsList.appendChild(flashcardDiv);
        });
    } else {
        flashcardsList.innerHTML = "<p>No flashcards found.</p>";
    }

    // Add event listeners for edit and delete buttons
    flashcardsList.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('delete-flashcard-btn')) {
            const flashcardId = event.target.getAttribute('data-flashcard-id');
            deleteFlashcard(userId, flashcardSetId, flashcardId);
        }
    });
}

// Edit Flashcard
function editFlashcard(userId, flashcardSetId, flashcardId, newQuestion, newAnswer) {
    const flashcardRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}/flashcards/${flashcardId}`);
    set(flashcardRef, {
        question: newQuestion,
        answer: newAnswer
    }).then(() => {
        alert("Flashcard updated successfully.");
        fetchFlashcardSet(userId, flashcardSetId);
    }).catch((error) => {
        console.error("Error updating flashcard:", error);
    });
}

// Delete Flashcard
function deleteFlashcard(userId, flashcardSetId, flashcardId) {
    const flashcardRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}/flashcards/${flashcardId}`);
    remove(flashcardRef).then(() => {
        alert("Flashcard deleted successfully.");
        fetchFlashcardSet(userId, flashcardSetId); // Refresh the flashcards list
    }).catch((error) => {
        console.error("Error deleting flashcard:", error);
    });
}

// Add New Flashcard
document.getElementById('addFlashcardForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;

    if (!question || !answer) {
        alert("Please fill out both the question and answer fields.");
        return;
    }

    const userId = auth.currentUser.uid;
    const flashcardRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}/flashcards/${Date.now()}`);
    
    set(flashcardRef, {
        question: question,
        answer: answer
    }).then(() => {
        alert("Flashcard added successfully.");
        fetchFlashcardSet(userId, flashcardSetId); // Refresh the flashcards list
    }).catch((error) => {
        console.error("Error adding flashcard:", error);
    });
});

// Edit Flashcard Set Information
document.getElementById('editFlashcardSetForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newName = document.getElementById('set-name').value;
    const newDescription = document.getElementById('set-description').value;

    const userId = auth.currentUser.uid;
    const flashcardSetRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}`);
    
    set(flashcardSetRef, {
        name: newName,
        description: newDescription,
        flashcards: {} // Do not modify existing flashcards
    }).then(() => {
        alert("Flashcard set updated successfully.");
    }).catch((error) => {
        console.error("Error updating flashcard set:", error);
    });
});
