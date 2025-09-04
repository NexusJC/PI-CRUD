const API = 'http://localhost:3000/api/auth/register';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const terms = document.getElementById('terms');
  if (!terms.checked) {
    alert('Debes aceptar los términos y condiciones para registrarte.');
    return;
  }

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar');

    alert('✅ ' + data.message);
    // Tras registro, redirige a login:
    window.location.href = './login.html';
  } catch (err) {
    alert('❌ ' + err.message);
  }
});
