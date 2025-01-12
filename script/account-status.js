// Import Firebase modules
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Get user role from the database
async function getUserRole(uid) {
    console.log(uid);
    const database = getDatabase();
    try {
        const userSnapshot = await get(ref(database, `users/${uid}`)); // Get the data from the database
        if (userSnapshot.exists()) {
            return userSnapshot.val().role;  // Assuming the role is stored as 'role'
        } else {
            throw new Error("User data not found");
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        throw error;
    }
}

// Check user login and role
async function checkUserLoginAndRole() {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
        if (user) {
            // Fetch user role and act accordingly
            getUserRole(user.uid)
                .then(role => {
                    console.log(role);
                    if (role === "admin") {
                        if (window.location.pathname == "/login.html" || window.location.pathname == "/signup.html") {
                            window.location.href = "admin.html";
                        }
                    } else if (role === "user") {
                        if (window.location.pathname == "/login.html" || window.location.pathname == "/signup.html") {
                            window.location.href = "manage-flashcard-sets.html";
                        }
                        if (window.location.pathname == "/admin-dashboard.html") {
                            console.log('Redirecting user from admin page...');
                            window.location.href = "user.html";
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching role:", error);
                });
        } else {
            if (window.location.pathname !== "/login") {
                // window.location.href = "login.html"; // Redirect if not logged in
                console.log('not yet')
            }
        }
    });
}

// Logout function
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

// Get logged-in username
async function getLoggedInUsername() {
    console.log('vo')
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
        if (user) {
            const uid = user.uid;
            const database = getDatabase();
            get(ref(database, `users/${uid}`)) // Correct path to `users/${uid}`
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const username = snapshot.val().username; // Get the username
                        console.log("Username:", username);
                        document.getElementById("usernameDisplay").innerText = username;
                        document.getElementById("usernameMain").innerText = `Welcome back, ${username}!`;
                    } else {
                        console.log("User data not found.");
                    }
                })
                .catch(error => {
                    console.error("Error fetching username:", error);
                });
        } else {
            console.log("No user is logged in.");
        }
    });
}

export { checkUserLoginAndRole, logout, getLoggedInUsername };
