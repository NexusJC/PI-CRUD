       document.getElementById("resetForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirmPassword").value;

            if (password !== confirm) {
                alert("Las contraseñas no coinciden");
                return;
            }

            const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password })
            });

            const data = await res.json();
            alert(data.message);
        });