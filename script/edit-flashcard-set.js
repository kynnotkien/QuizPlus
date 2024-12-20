import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, remove, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// Firebase config (same as before)
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

// Get the flashcard set ID from local storage
const flashcardSetId = localStorage.getItem('flashcardSetId');

if (!flashcardSetId) {
    alert('No flashcard set ID found in local storage!');
    window.location.href = 'index.html'; // Redirect to home or another page
}

let currentUser = null;

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadFlashcardSet(flashcardSetId);
    } else {
        alert('You must be logged in to edit flashcard sets.');
        window.location.href = 'login.html'; // Redirect to login page
    }
});

// Load the flashcard set and flashcards data from Firebase
function loadFlashcardSet(flashcardSetId) {
    const flashcardSetRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}`);

    get(flashcardSetRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('edit-set-name').value = data.name;
            document.getElementById('edit-set-description').value = data.description;
            loadFlashcards(data.flashcards);
        } else {
            alert('Flashcard set not found.');
            window.location.href = 'index.html';
        }
    }).catch((error) => {
        console.error('Error loading flashcard set:', error);
    });
}

// Load flashcards into the list
function loadFlashcards(flashcards) {
    const flashcardsList = document.getElementById('flashcardsList');
    flashcardsList.innerHTML = '';

    if (flashcards && Object.keys(flashcards).length > 0) {
        for (const flashcardId in flashcards) {
            const flashcard = flashcards[flashcardId];
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <p><strong>Question:</strong> ${flashcard.question}</p>
                <p><strong>Answer:</strong> ${flashcard.answer}</p>
                <button class="edit-flashcard-btn" data-id="${flashcardId}">Edit</button>
                <button class="delete-flashcard-btn" data-id="${flashcardId}">Delete</button>
                <hr>
            `;
            flashcardsList.appendChild(flashcardDiv);
        }
    } else {
        flashcardsList.innerHTML = '<p>No flashcards found.</p>';
    }
}

// Save changes to flashcard set (name and description)
document.getElementById('editFlashcardSetForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const setName = document.getElementById('edit-set-name').value;
    const setDescription = document.getElementById('edit-set-description').value;

    if (!setName || !setDescription) {
        alert('Please fill out all fields.');
        return;
    }

    const flashcardSetRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}`);

    set(flashcardSetRef, {
        name: setName,
        description: setDescription,
        flashcards: {} // Keep existing flashcards intact
    }).then(() => {
        alert('Flashcard set updated successfully!');
    }).catch((error) => {
        console.error('Error updating flashcard set:', error);
        alert('Error updating flashcard set.');
    });
});

// Add a new flashcard
document.getElementById('addFlashcardBtn').addEventListener('click', () => {
    const question = prompt('Enter the flashcard question:');
    const answer = prompt('Enter the flashcard answer:');

    if (!question || !answer) {
        alert('Both question and answer are required.');
        return;
    }

    const flashcardsRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}/flashcards`);
    const newFlashcardRef = push(flashcardsRef);

    set(newFlashcardRef, { question, answer }).then(() => {
        alert('Flashcard added!');
        loadFlashcardSet(flashcardSetId); // Reload flashcards
    }).catch((error) => {
        console.error('Error adding flashcard:', error);
        alert('Error adding flashcard.');
    });
});

// Delete a flashcard
document.getElementById('flashcardsList').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('delete-flashcard-btn')) {
        const flashcardId = e.target.getAttribute('data-id');
        const flashcardRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}/flashcards/${flashcardId}`);

        if (confirm('Are you sure you want to delete this flashcard?')) {
            remove(flashcardRef).then(() => {
                alert('Flashcard deleted.');
                loadFlashcardSet(flashcardSetId); // Reload flashcards
            }).catch((error) => {
                console.error('Error deleting flashcard:', error);
                alert('Error deleting flashcard.');
            });
        }
    }
});

// Edit flashcard (you can create a form for editing flashcards if needed)
document.getElementById('flashcardsList').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('edit-flashcard-btn')) {
        const flashcardId = e.target.getAttribute('data-id');
        const flashcardRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}/flashcards/${flashcardId}`);

        get(flashcardRef).then((snapshot) => {
            if (snapshot.exists()) {
                const flashcard = snapshot.val();
                const newQuestion = prompt('Edit Question:', flashcard.question);
                const newAnswer = prompt('Edit Answer:', flashcard.answer);

                if (newQuestion !== null && newAnswer !== null) {
                    set(flashcardRef, { question: newQuestion, answer: newAnswer }).then(() => {
                        alert('Flashcard updated!');
                        loadFlashcardSet(flashcardSetId); // Reload flashcards
                    }).catch((error) => {
                        console.error('Error updating flashcard:', error);
                        alert('Error updating flashcard.');
                    });
                }
            }
        }).catch((error) => {
            console.error('Error fetching flashcard:', error);
        });
    }
});
