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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Reference to the form
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
        // Create a new user using Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save additional user information to the Realtime Database
        await database.ref(`users/${user.uid}`).set({
            email: email,
            username: username,
            role: 'user',
            createdAt: new Date().toISOString()
        });

        alert("Account created successfully!");
        // Optionally redirect the user to another page
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error creating account:", error);
        alert(error.message);
    }
});
