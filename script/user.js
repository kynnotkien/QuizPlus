import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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

// Function to display user info
function displayUserInfo(user) {
    const userIdElement = document.getElementById('user-id');
    const usernameElement = document.getElementById('user-username');
    const emailElement = document.getElementById('user-email');

    userIdElement.textContent = user.uid;
    emailElement.textContent = user.email;

    // Get username from Realtime Database
    get(ref(database, `users/${user.uid}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                usernameElement.textContent = userData.username;
            } else {
                usernameElement.textContent = "Username not found.";
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
}

// Check if the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserInfo(user);  // Display user info when logged in
    } else {
        // Redirect to login page or show message if user is not logged in
        window.location.href = "login.html";
    }
});


async function logout() {
    console.log('clicked')
    const auth = getAuth();
    signOut(auth).then(() => {
        console.log("User logged out");
        window.location.href = "login.html";  // Redirect to login page after logout
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}
