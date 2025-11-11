  const token = localStorage.getItem("token");

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const file = e.target.profile.files[0];
    formData.append("profile", file);

    const response = await fetch("/api/profile/upload-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById("preview").src = `/uploads/${result.image}`;
  });