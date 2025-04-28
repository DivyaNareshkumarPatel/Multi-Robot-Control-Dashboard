document.querySelector('.auth-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    const fullName = event.target.querySelector('input[type="text"]').value.trim();
    const email = event.target.querySelector('input[type="email"]').value.trim();
    const password = event.target.querySelector('input[type="password"]').value.trim();

    if (!fullName || !email || !password) {
        alert("All fields are required.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/chat/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullName, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful! You can now log in.");
            window.location.href = "login.html"; // Redirect to the login page
        } else {
            alert(data.error || "Signup failed. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
