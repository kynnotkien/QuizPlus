// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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

// Add user function
// Add user function without logging them in
async function addUser(event) {
    event.preventDefault(); 
  
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
  
    // Basic validation
    if (!username || !email || !password || !role) {
      return alert("Please fill out all fields.");
    }
  
    try {
      // Create the user with email and password (this won't log the user in)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); 
      console.log('User created successfully', userCredential.user);
  
      // Get the new user's ID (UID)
      const userId = userCredential.user.uid;
  
      // Store the user's data in Firebase Realtime Database
      await set(ref(database, `users/${userId}`), {
        username,
        email,
        role,
        createdAt: new Date().toISOString(),
      });
  
      // Sign the user out immediately after creation
      await signOut(auth); 
  
      // Notify the admin that the user has been added
      alert("User added successfully! The new user is not logged in.");
  
      // Debugging output
      console.log("User data has been saved in Realtime Database for UID:", userId);
  
    } catch (error) {
      // Handle any errors
      console.error("Error creating or saving user:", error);
      alert("Error creating user. Please try again.");
    }
  }



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
    const userManagerTable = document.querySelector(".user-manager");
    if (!userManagerTable) return;

    userManagerTable.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Create Date</th>
            <th>Actions</th>
        </tr>
    `;

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
                        <td><button class="edit-user">Edit</button></td>
                    </tr>
                `;
            });
        } else {
            userManagerTable.innerHTML += `<tr><td colspan="6">No users available.</td></tr>`;
        }
    } catch (error) {
        console.error("Error retrieving users:", error);
    }
}

// Log out the user
function logout() {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

// Event listeners
document.addEventListener("DOMContentLoaded", checkUserLoginAndRole);
document.getElementById("addUserForm").addEventListener("submit", addUser);
