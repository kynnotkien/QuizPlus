import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

// Firebase config (giữ nguyên như trong mã gốc)
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

// Lấy flashcard set ID từ local storage
const flashcardSetId = localStorage.getItem('flashcardSetId');

if (!flashcardSetId) {
    alert('No flashcard set ID found in local storage!');
    window.location.href = 'index.html';
}

let currentUser = null;
let flashcardsArray = []; // Mảng chứa tất cả flashcards
let currentFlashcardIndex = 0; // Chỉ mục flashcard hiện tại

// Kiểm tra trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadFlashcardSet(flashcardSetId);
    } else {
        alert('You must be logged in to view flashcards.');
        window.location.href = 'login.html';
    }
});

// Load thông tin bộ flashcard từ Firebase
function loadFlashcardSet(flashcardSetId) {
    const flashcardSetRef = ref(database, `users/${currentUser.uid}/flashcard-sets/${flashcardSetId}`);

    get(flashcardSetRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('flashcard-info').innerHTML = `
                    <h2>${data.name}</h2>
                    <p>${data.description}</p>
                `;
                loadFlashcards(data.flashcards); // Load flashcards từ bộ dữ liệu
            } else {
                alert('Flashcard set not found.');
                window.location.href = 'index.html';
            }
        })
        .catch((error) => {
            console.error('Error loading flashcard set:', error);
        });
}

// Load flashcards vào mảng và hiển thị flashcard đầu tiên
function loadFlashcards(flashcards) {
    flashcardsArray = Object.entries(flashcards); // Chuyển flashcards thành mảng [id, flashcard]
    currentFlashcardIndex = 0; // Reset chỉ mục về 0
    displayFlashcard(); // Hiển thị flashcard đầu tiên
}

// Hiển thị flashcard hiện tại
function displayFlashcard() {
    const flashcardsList = document.getElementById('flashcard-container');
    flashcardsList.innerHTML = ''; // Xóa nội dung cũ

    if (flashcardsArray.length === 0) {
        flashcardsList.innerHTML = '<p>No flashcards available.</p>';
        return;
    }

    const [id, flashcard] = flashcardsArray[currentFlashcardIndex];
    const flashcardItem = document.createElement('div');
    flashcardItem.classList.add('flashcard');
    flashcardItem.innerHTML = `
        <div class="front">
            <p>${flashcard.question}</p>
        </div>
        <div class="back">
            <p>${flashcard.answer}</p>
        </div>
    `;
    flashcardsList.appendChild(flashcardItem);

    // Thêm sự kiện click để lật flashcard
    flashcardItem.addEventListener('click', () => {
        flashcardItem.classList.toggle('flipped');
    });
}

// Điều hướng tới flashcard trước
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentFlashcardIndex > 0) {
        currentFlashcardIndex--;
        displayFlashcard();
    } else {
        alert('This is the first flashcard!');
    }
});

// Điều hướng tới flashcard tiếp theo
document.getElementById('next-btn').addEventListener('click', () => {
    if (currentFlashcardIndex < flashcardsArray.length - 1) {
        currentFlashcardIndex++;
        displayFlashcard();
    } else {
        alert('This is the last flashcard!');
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
