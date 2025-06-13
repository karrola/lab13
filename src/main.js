import { createClient } from '@supabase/supabase-js'
import './style.css';

const supabase = createClient('https://ukbinwwzanoliyqeroyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYmlud3d6YW5vbGl5cWVyb3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjcwNDUsImV4cCI6MjA2MzI0MzA0NX0.4OXhMdfidCS9hzCc_nUq6ypumTYwbxJ0lH48HCC29v8')


main();

async function main() {
  const { data: { user } } = await supabase.auth.getUser();
  const articlesContainer = document.getElementById('articles');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addArticleBtn = document.getElementById('add-article-btn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('close-modal');
  const articleForm = document.getElementById('add-article-form');
  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-form');

  if (user) {
    logoutBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }

  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Błąd przy wylogowywaniu: ' + error.message);
    } else {
      location.reload();
    }
  });

  async function loadArticles() {
    const { data, error } = await supabase.from('article').select('*');

    if (error) {
      articlesContainer.innerHTML = `<p>Błąd: ${error.message}</p>`;
      return;
    }

    articlesContainer.innerHTML = '';

    data.forEach((article) => {
      const el = document.createElement('article');
      el.classList.add('article');

      el.innerHTML = `
        <h2>${article.title}</h2>
        <h3>${article.subtitle || ''}</h3>
        <p><address>Autor: ${article.author}</address></p>
        <p>Data: <time datetime="${article.created_at}">${new Date(article.created_at).toLocaleString()}</time></p>
        <p>${article.content}</p>
        ${
          user
            ? `<button class="delete" data-id="${article.id}">Usuń artykuł</button>
               <button class="edit" data-id="${article.id}">Edytuj artykuł</button>`
            : ''
        }
        <hr/>
      `;

      articlesContainer.appendChild(el);
    });
  }

  if (user) {
    addArticleBtn.classList.remove('hidden');
  } else {
    addArticleBtn.classList.add('hidden');
  }

  await loadArticles();

  addArticleBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(articleForm);
    const title = formData.get('title');
    const subtitle = formData.get('subtitle') || '';
    const author = formData.get('author');
    const content = formData.get('content');
    const created_at = new Date().toISOString();

    const { error } = await supabase.from('article').insert([
      { title, subtitle, author, content, created_at }
    ]);

    if (error) {
      alert('Błąd podczas dodawania artykułu: ' + error.message);
      return;
    }

    modal.classList.add('hidden');
    articleForm.reset();
    await loadArticles();
  });

  articlesContainer.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('edit')) {
      const { data: article, error } = await supabase
        .from('article')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Nie udało się załadować artykułu: ' + error.message);
        return;
      }

      document.getElementById('edit-article-id').value = article.id;
      document.getElementById('edit-title').value = article.title;
      document.getElementById('edit-subtitle').value = article.subtitle || '';
      document.getElementById('edit-author').value = article.author;
      document.getElementById('edit-content').value = article.content;

      editModal.classList.remove('hidden');
    }

    if (e.target.classList.contains('delete')) {
      const id = e.target.dataset.id;

      const { error } = await supabase
        .from('article')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Błąd przy usuwaniu: ' + error.message);
        return;
      }

      await loadArticles();
    }
  });

  document.getElementById('edit-cancel').addEventListener('click', () => {
    editModal.classList.add('hidden');
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-article-id').value;
    const title = document.getElementById('edit-title').value;
    const subtitle = document.getElementById('edit-subtitle').value;
    const author = document.getElementById('edit-author').value;
    const content = document.getElementById('edit-content').value;
    const created_at = new Date().toISOString();

    const { error } = await supabase
      .from('article')
      .update({ title, subtitle, author, content, created_at })
      .eq('id', id);

    if (error) {
      alert('Błąd przy zapisie: ' + error.message);
      return;
    }

    editModal.classList.add('hidden');
    await loadArticles();
  });
}