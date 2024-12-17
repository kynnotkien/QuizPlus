import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { checkUserLoginAndRole } from "/script/account-status.js";

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyBedrz5bHO59W0f4TXiXrbRsrFRKUfQj3c",
    authDomain: "flashquiz-6c799.firebaseapp.com",
    databaseURL: "https://flashquiz-6c799-default-rtdb.firebaseio.com",
    projectId: "flashquiz-6c799",
    storageBucket: "flashquiz-6c799.firebasestorage.app",
    messagingSenderId: "446881626634",
    appId: "1:446881626634:web:01abc69ae19d3cd3ccbdf3",
    measurementId: "G-8QJL263E5Y",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get DOM references
const loginForm = document.getElementById("loginForm");

// Function to handle login form submission
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        // Debugging: Log email and password values
        console.log("Email:", email);
        console.log("Password:", password);

        try {
            // Sign in the user with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful:", userCredential.user);
            // Optionally, redirect to a dashboard or other page
            alert('welcome back!' + userCredential.user)// Redirect after successful login
            checkUserLoginAndRole()
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed: " + error.message);
        }
    });
}

// Check user login status and role
window.onload = checkUserLoginAndRole();