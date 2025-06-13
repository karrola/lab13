import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ukbinwwzanoliyqeroyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYmlud3d6YW5vbGl5cWVyb3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjcwNDUsImV4cCI6MjA2MzI0MzA0NX0.4OXhMdfidCS9hzCc_nUq6ypumTYwbxJ0lH48HCC29v8')

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
  } else {
    // np. przekierowanie po zalogowaniu
    window.location.href = '/';
  }
});
