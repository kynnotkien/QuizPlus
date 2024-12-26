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

// Check user authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchFlashcardSets(user.uid); // Fetch flashcard sets when logged in
    } else {
        alert("You must be logged in to manage flashcard sets.");
        window.location.href = "login.html"; // Redirect to login page if not logged in
    }
});

// Fetch all flashcard sets for the current user
function fetchFlashcardSets(userId) {
    const flashcardSetsRef = ref(database, `users/${userId}/flashcard-sets`);
    get(flashcardSetsRef).then((snapshot) => {
        const flashcardSetsList = document.getElementById('flashcardSetsList');
        flashcardSetsList.innerHTML = ''; // Clear existing list

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const flashcardSetId = childSnapshot.key;
                const { name, description } = childSnapshot.val();

                const flashcardSetDiv = document.createElement('div');
                flashcardSetDiv.classList.add('flashcard-set');
                flashcardSetDiv.innerHTML = `
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${description}</p>
                    <button class="study-btn " data-id="${flashcardSetId}">Study</button>
                    <button class="edit-btn" data-id="${flashcardSetId}">Edit</button>
                    <button class="delete-btn" data-id="${flashcardSetId}">Delete</button>
                    `;
                flashcardSetsList.appendChild(flashcardSetDiv);
            });
        } else {
            flashcardSetsList.innerHTML = "<p>No flashcard sets found.</p>";
        }
    }).catch((error) => {
        console.error("Error fetching flashcard sets:", error);
    });
}

// Handle the form submission to create a new flashcard set
document.getElementById('createFlashcardSetForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const setName = document.getElementById('set-name').value;
    const setDescription = document.getElementById('set-description').value;

    if (!setName || !setDescription) {
        alert("Please fill out all fields.");
        return;
    }

    const userId = auth.currentUser.uid;
    const flashcardSetId = `flashcard-set-${Date.now()}`; // Unique ID for the flashcard set

    const flashcardSetRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}`);
    
    set(flashcardSetRef, {
        name: setName,
        description: setDescription,
        flashcards: {} // Initialize an empty flashcards object
    }).then(() => {
        alert("Flashcard set created successfully!");
        fetchFlashcardSets(userId); // Refresh the list
    }).catch((error) => {
        console.error("Error creating flashcard set:", error);
        alert("Error creating flashcard set. Please try again.");
    });
});

// Delete a flashcard set
function deleteFlashcardSet(flashcardSetId) {
    const userId = auth.currentUser.uid;
    const flashcardSetRef = ref(database, `users/${userId}/flashcard-sets/${flashcardSetId}`);
    
    remove(flashcardSetRef).then(() => {
        alert("Flashcard set deleted successfully.");
        fetchFlashcardSets(userId); //  Refresh the list
    }).catch((error) => {
        console.error("Error deleting flashcard set:", error);
    });
}

// Edit flashcard set: Just log the flashcard set ID to the console
document.getElementById('flashcardSetsList').addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('edit-btn')) {
        const flashcardSetId = event.target.getAttribute('data-id');
        console.log("Editing flashcard set with ID:", flashcardSetId);
        localStorage.setItem('flashcardSetId', flashcardSetId); // Store ID in local storage
        window.location.href = 'edit-flashcard-set.html'; // Navigate to the edit page
    }

    if (event.target && event.target.classList.contains('delete-btn')) {
        const flashcardSetId = event.target.getAttribute('data-id');
        deleteFlashcardSet(flashcardSetId);
    }
});

document.getElementById('flashcardSetsList').addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('study-btn')) {
        const flashcardSetId = event.target.getAttribute('data-id');
        console.log("Studying flashcard set with ID:", flashcardSetId);
        localStorage.setItem('flashcardSetId', flashcardSetId); // Store ID in local storage
        window.location.href = 'study-flashcard.html'; // Navigate to the study page
    }
});

async function logout() {
    try {
        await auth.signOut();
        alert('You have been logged out.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out. Please try again.');
    }
}

document.getElementById('logout').addEventListener('click', logout);
