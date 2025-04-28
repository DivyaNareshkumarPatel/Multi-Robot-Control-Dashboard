document.querySelector('.auth-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    const email = event.target.querySelector('input[type="email"]').value.trim();
    const password = event.target.querySelector('input[type="password"]').value.trim();

    if (!email || !password) {
        alert("Both fields are required.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/chat/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Save the JWT token in localStorage and redirect
            localStorage.setItem("auth-token", data.token);
            window.location.href = "index.html"; // Redirect to chat page or wherever the user should go after logging in
        } else {
            alert(data.error || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});
