// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { logout } from "./account-status.js";

// Firebase configuration
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

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Check if the user is logged in and has admin role
async function checkUserLoginAndRole() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const snapshot = await get(ref(database, `users/${user.uid}/role`));
                if (snapshot.exists() && snapshot.val() === "admin") {
                    displayUsers();
                    getLoggedInUsername();
                } else {
                    window.location.href = "unauthorized.html";
                }
            } catch (error) {
                console.error("Error fetching role:", error);
            }
        } else {
            window.location.href = "login.html";
        }
    });
}

// Display logged-in user's username
async function getLoggedInUsername() {
    const usernameDisplay = document.getElementById("usernameDisplay");
    const user = auth.currentUser;

    if (user) {
        try {
            const snapshot = await get(ref(database, `users/${user.uid}`));
            if (snapshot.exists()) {
                usernameDisplay.innerText = `Welcome, ${snapshot.val().username}`;
            }
        } catch (error) {
            console.error("Error fetching username:", error);
        }
    }
}

// Display all users
async function displayUsers() {
    const userManagerTable = document.querySelector("#user-manager tbody");
    if (!userManagerTable) return;

    userManagerTable.innerHTML = ``;

    try {
        const snapshot = await get(ref(database, "users"));
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const { username, email, role, createdAt } = childSnapshot.val();
                userManagerTable.innerHTML += `
                    <tr>
                        <td>${childSnapshot.key}</td>
                        <td>${username}</td>
                        <td>${email}</td>
                        <td>${role}</td>
                        <td>${createdAt}</td>
                        <td><button class="btn btn-warning btn-sm">Edit</button></td>
                    </tr>
                `;
            });
        } else {
            userManagerTable.innerHTML += `<tr><td colspan="6" class="text-center">No users available.</td></tr>`;
        }
    } catch (error) {
        console.error("Error retrieving users:", error);
    }
}



// Event listeners
document.addEventListener("DOMContentLoaded", checkUserLoginAndRole);
document.getElementById("logoutButton").addEventListener("click", logout);
