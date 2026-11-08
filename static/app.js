async function loadMessages() {
  const r = await fetch('/api/messages');
  const xs = await r.json();
  document.querySelector('#messages').innerHTML = xs.map(x => `
    <article class="message">
      <b>${escapeHtml(x.name)}</b>
      <p>${escapeHtml(x.message)}</p>
      <div class="meta">#${x.id}
        <button type="button" class="like" data-id="${x.id}">♥ ${x.likes ?? 0}</button>
      </div>
    </article>`).join('');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// 文字数表示（第2回で index.html に #count を追加した場合だけ動く）
const count = document.querySelector('#count');
if (count) {
  document.querySelector('#message').addEventListener('input', e => {
    count.textContent = e.target.value.length + ' / 300';
  });
}

document.querySelector('#form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.querySelector('#name').value;
  const message = document.querySelector('#message').value;
  const r = await fetch('/api/messages', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, message})
  });
  document.querySelector('#status').textContent = r.ok ? '投稿しました' : '投稿に失敗しました';
  if (r.ok) {
    document.querySelector('#message').value = '';
    if (count) count.textContent = '0 / 300';
    await loadMessages();
  }
});

// いいねボタン：一覧は毎回作り直されるので、#messages でまとめてクリックを受け取る
document.querySelector('#messages').addEventListener('click', async e => {
  const btn = e.target.closest('.like');
  if (!btn) return;
  const r = await fetch(`/api/messages/${btn.dataset.id}/like`, {method: 'POST'});
  if (r.ok) await loadMessages();
});

loadMessages();