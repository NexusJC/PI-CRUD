const form = document.getElementById('dish-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch('/api/dishes', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Dish added successfully!');
      form.reset();
    } else {
      alert(result.message || 'Failed to add dish.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while adding the dish.');
  }
});
