(function(){
    function formatDateTime(iso) {
      try {
        const d = new Date(iso || Date.now());
        const date = d.toLocaleDateString('pt-BR');
        const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${date} ${time}`; // exemplo: 06/12/2025 14:26
      } catch (_) {
        return iso || '';
      }
    }
  // UX toggles for composer open/close
  const composer = document.getElementById('new-thread');
  const openBtn = document.getElementById('openComposer');
  const cancelBtn = document.getElementById('cancelComposer');

  function showComposer(){ composer && composer.classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function hideComposer(){ composer && composer.classList.add('hidden'); }

  openBtn && openBtn.addEventListener('click', showComposer);
  cancelBtn && cancelBtn.addEventListener('click', hideComposer);

  const API_BASE = '';
  // json-server serves from the same origin; endpoints: /threads, /posts

  function currentUser() {
    try {
      const raw = localStorage.getItem('userLogado');
      if (!raw) return null;
      const user = JSON.parse(raw);
      // expected shape from existing login.js usage: { nome, email, login, id }
      return user || null;
    } catch (_) {
      return null;
    }
  }

  async function fetchJSON(url, opts) {
    const res = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' }}, opts || {}));
    if (!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }

  function userName(u) {
    return u?.nome || u?.login || 'Usuário';
  }

  // Local avatar images
  const MALE_AVATARS = [
    './assets/images/avatar/avatar-homem.jpg',
    './assets/images/avatar/avatar-homem0.jpg',
    './assets/images/avatar/avatar-homem1.jpg',
    './assets/images/avatar/avatar-homem2.jpg'
  ];
  const FEMALE_AVATARS = [
    './assets/images/avatar/avatar-mulher.jpg',
    './assets/images/avatar/avatar-mulher0.jpg',
    './assets/images/avatar/avatar-mulher1.jpg',
    './assets/images/avatar/avatar-mulher2.jpg'
  ];
  const NEUTRAL_AVATARS = [];
  function pickFrom(list, seed) {
    const arr = list.filter(Boolean);
    if (!arr.length) return null;
    const idx = Math.abs(seed) % arr.length;
    return arr[idx];
  }
  // Simple heuristic to infer gender from common PT-BR names when authorGender is missing
  function inferGenderFromName(name) {
    const n = String(name || '').trim().toLowerCase();
    if (!n) return null;
    const male = new Set(['rafael','joao','pedro','lucas','gabriel','mateus','diego','thiago','carlos','bruno','felipe','marcos','andre','roberto','paulo']);
    const female = new Set(['bianca','maria','ana','julia','beatriz','camila','larissa','patricia','carla','gabriela','mariana','vanessa','luana']);
    if (male.has(n)) return 'male';
    if (female.has(n)) return 'female';
    // fallback: names ending with 'a' more likely female
    if (n.endsWith('a')) return 'female';
    return 'male';
  }
  function pickAvatarByName(name) {
    const s = String(name || 'User');
    let hash = 0;
    for (let i=0; i<s.length; i++) hash = (hash*31 + s.charCodeAt(i)) >>> 0;
    // fallback neutral list if gender unknown
    return pickFrom(NEUTRAL_AVATARS.length ? NEUTRAL_AVATARS : MALE_AVATARS.concat(FEMALE_AVATARS), hash) || null;
  }
  function pickAvatarById(id) {
    const n = Number(id) || 0;
    return pickFrom(NEUTRAL_AVATARS.length ? NEUTRAL_AVATARS : MALE_AVATARS.concat(FEMALE_AVATARS), Math.abs(n)) || null;
  }
  function pickAvatarByGender(gender, seed) {
    const g = String(gender || '').toLowerCase();
    if (g === 'male' || g === 'm') return pickFrom(MALE_AVATARS, seed || 0);
    if (g === 'female' || g === 'f') return pickFrom(FEMALE_AVATARS, seed || 0);
    return pickFrom(NEUTRAL_AVATARS.length ? NEUTRAL_AVATARS : MALE_AVATARS.concat(FEMALE_AVATARS), seed || 0);
  }

  async function loadThreads() {
    const threadsEl = document.getElementById('threads');
    if (!threadsEl) return;

    // get threads sorted by id desc
    const threads = await fetchJSON('/threads?_sort=id&_order=desc');
    threadsEl.innerHTML = '';
    threads.forEach(t => {
      const tpl = document.getElementById('threadItemTpl');
      const node = tpl.content.cloneNode(true);
      node.querySelector('.thread-title').textContent = t.title;
      node.querySelector('.thread-body').textContent = t.content;
      const meta = `Por ${t.authorName || 'Usuário'} • ${formatDateTime(t.createdAt)}`;
      node.querySelector('.thread-meta').textContent = meta;
      // avatar image or initial
      const initial = (t.authorName || 'Usuário').trim().charAt(0).toUpperCase();
      const avatarInitial = node.querySelector('.avatar-initial');
      const avatarImg = node.querySelector('.avatar-img');
      // Prefer gender-specific avatar; else diversify by id/name
      const g = t.authorGender || inferGenderFromName(t.authorName);
      const imgUrl = pickAvatarByGender(g, t.id) || pickAvatarById(t.id) || pickAvatarByName(t.authorName);
      if (avatarImg && imgUrl) { avatarImg.src = imgUrl; avatarImg.style.display = 'block'; if (avatarInitial) avatarInitial.style.display = 'none'; }
      else { avatarInitial && (avatarInitial.textContent = initial || 'A'); }

      // category and tags
      const listRow = node.querySelector('.list-row');
      if (listRow) listRow.setAttribute('data-cat', t.category || 'geral');
      const tagsWrap = node.querySelector('.topic-tags');
      const normalizeTag = (x) => (x || '').replace(/^#/,'').trim().toLowerCase();
      if (tagsWrap && Array.isArray(t.tags)) {
        const tags = t.tags.map(normalizeTag);
        tagsWrap.innerHTML = tags.map(tag => `<span class="topic-tag">#${escapeHtml(tag)}</span>`).join('');
        const cardEl = node.querySelector('.topic-card');
        if (cardEl) cardEl.setAttribute('data-tags', tags.join(','));
      }

      // stats (placeholder: replies count from posts, views from t.views)
      const repliesCountEl = node.querySelector('.replies-count');
      const viewsCountEl = node.querySelector('.views-count');
      viewsCountEl && (viewsCountEl.textContent = t.views || 0);

      const postsDiv = node.querySelector('.posts');
      const postForm = node.querySelector('.postForm');
      const detailsEl = node.querySelector('.thread-posts');
      postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = currentUser();
        const postErr = node.querySelector('.post-error');
        if (!user) { if (postErr) postErr.style.display = 'block'; return; }
        const content = postForm.querySelector('.postContent').value.trim();
        if (!content) return;
        const payload = {
          threadId: t.id,
          content,
          authorId: user?.id || null,
          authorName: userName(user),
          authorEmail: user?.email || null,
          createdAt: new Date().toISOString()
        };
        await fetchJSON('/posts', { method: 'POST', body: JSON.stringify(payload) });
        postForm.reset();
        await renderPosts(t.id, postsDiv);
        // update replies count after posting
        const posts = await loadThreadPosts(t.id);
        repliesCountEl && (repliesCountEl.textContent = posts.length);
      });

      // initial posts render
      loadThreadPosts(t.id).then(posts => {
        repliesCountEl && (repliesCountEl.textContent = posts.length);
        renderPostsInto(posts, postsDiv);
      });

      // open replies when clicking the topic card
      const cardEl = node.querySelector('.thread-item');
      if (cardEl && detailsEl) {
        cardEl.addEventListener('click', (ev) => {
          // avoid toggling when clicking inside the reply form or inside details content
          const target = ev.target;
          if ((postForm && postForm.contains(target)) || detailsEl.contains(target)) return;
          detailsEl.open = !detailsEl.open;
        });
      }

      threadsEl.appendChild(node);
    });
  }

  async function loadThreadPosts(threadId) {
    return fetchJSON(`/posts?threadId=${encodeURIComponent(threadId)}&_sort=id&_order=asc`);
  }

  function renderPostsInto(posts, container) {
    // Use authorName-based hash as seed so different names map to different avatars
    function nameHash(s) {
      const str = String(s || 'User');
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return h;
    }
    container.innerHTML = posts.map(p => {
      const seed = nameHash(p.authorName);
      const g = p.authorGender || inferGenderFromName(p.authorName);
      const imgUrl = pickAvatarByGender(g, seed) || pickAvatarByName(p.authorName);
      const avatarImg = imgUrl ? `<img class="post-avatar" src="${imgUrl}" alt="Avatar" />` : '';
      return `
      <div class="post-item">
        <div class="post-meta">${avatarImg} ${p.authorName || 'Usuário'} • ${formatDateTime(p.createdAt)}</div>
        <div class="post-body">${escapeHtml(p.content)}</div>
      </div>`;
    }).join('');
  }

  async function renderPosts(threadId, container) {
    const posts = await loadThreadPosts(threadId);
    renderPostsInto(posts, container);
  }

  function escapeHtml(s) {
    return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function wireCreateThread() {
    const form = document.getElementById('threadForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = currentUser();
      const errEl = document.getElementById('threadError');
      if (!user) { if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Faça login para publicar.'; } return; }
      const title = document.getElementById('threadTitle').value.trim();
      const tagsRaw = (document.getElementById('threadTags')?.value || '').trim();
      const content = document.getElementById('threadContent').value.trim();
      // reuse errEl
      // parse tags: split by comma/space, normalize, remove empties
      const tags = tagsRaw.split(/[,\s]+/).map(t => t.replace(/^#/,'').trim()).filter(Boolean);
      if (!title || !content || tags.length < 1) {
        if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Adicione ao menos uma tag.'; }
        return;
      }
      if (errEl) errEl.style.display = 'none';
      const payload = {
        title,
        content,
        authorId: user?.id || null,
        authorName: userName(user),
        authorEmail: user?.email || null,
        tags,
        createdAt: new Date().toISOString()
      };
      await fetchJSON('/threads', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      await loadThreads();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // simple search filter
    const searchInput = document.getElementById('forumSearch');
    const clearBtn = document.getElementById('clearSearch');
    function filterThreads() {
      const q = (searchInput?.value || '').toLowerCase();
      const cards = document.querySelectorAll('#threads .topic-card');
      cards.forEach(card => {
        const title = card.querySelector('.thread-title')?.textContent.toLowerCase() || '';
        const body = card.querySelector('.thread-body')?.textContent.toLowerCase() || '';
        const match = title.includes(q) || body.includes(q);
        card.style.display = match ? '' : 'none';
      });
    }
    searchInput && searchInput.addEventListener('input', filterThreads);
    clearBtn && clearBtn.addEventListener('click', () => { if (searchInput) { searchInput.value = ''; filterThreads(); } });

    // category filter (basic client-side)
    document.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        const cards = document.querySelectorAll('#threads .topic-card');
        cards.forEach(card => {
          const c = card.getAttribute('data-cat') || 'geral';
          card.style.display = (cat === 'all' || c === cat) ? '' : 'none';
        });
      });
    });

    // tag filter (basic client-side)
    const tagBtns = document.querySelectorAll('.tag-pill');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // toggle active state like chips
        document.querySelectorAll('.tag-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const selected = (btn.dataset.tag || '').replace(/^#/,'').trim().toLowerCase();
        const cards = document.querySelectorAll('#threads .topic-card');
        cards.forEach(card => {
          const tagsStr = card.getAttribute('data-tags') || '';
          const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
          const show = selected === '' || tags.includes(selected) || btn.dataset.tag === 'all';
          card.style.display = show ? '' : 'none';
        });
      });
    });

    wireCreateThread();
    loadThreads().catch(err => {
      const el = document.getElementById('threads');
      if (el) el.innerHTML = `<p style="color:red;">Erro ao carregar tópicos: ${escapeHtml(err.message)}</p>`;
    });
  });
})();
