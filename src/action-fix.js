function giModal(title, body) {
  const old = document.querySelector('.gi-action-modal');
  if (old) old.remove();
  const wrap = document.createElement('div');
  wrap.className = 'modal gi-action-modal';
  wrap.innerHTML = `<article><button class="close" data-gi-close>×</button><h3>${title}</h3>${body}</article>`;
  document.body.appendChild(wrap);
}

function giNotice(text) {
  const old = document.querySelector('.gi-toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'notice gi-toast';
  el.textContent = text;
  el.style.position = 'fixed';
  el.style.left = '50%';
  el.style.bottom = '22px';
  el.style.transform = 'translateX(-50%)';
  el.style.zIndex = '120';
  el.style.maxWidth = 'min(720px, calc(100vw - 32px))';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function giActivate() {
  document.querySelectorAll('button:not([type])').forEach(button => button.type = 'button');
  document.querySelectorAll('[data-complaint] button').forEach(button => button.type = 'submit');
  document.querySelectorAll('[data-chat] button').forEach(button => button.type = 'submit');
}

window.addEventListener('click', event => {
  if (event.target.closest('[data-gi-close]')) {
    event.preventDefault();
    document.querySelector('.gi-action-modal')?.remove();
  }

  const link = event.target.closest('a[href="#"],button[disabled]');
  if (link) {
    event.preventDefault();
    giModal('Aktif Akış', '<p>Bu alan demo akışa bağlandı. Bir sonraki sürümde kayıtlı kullanıcı verisiyle çalışacak.</p>');
  }
}, true);

window.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();

  if (form.matches('[data-complaint]')) {
    giModal('Şikayet dosyan oluşturuldu', '<p><b>Dosya No:</b> GVN-2026-0001</p><p><b>Durum:</b> Moderasyon incelemesinde</p><p>Dosyan şikayet akışına eklendi. Marka yanıtı ve platform değerlendirmesi bu ekrandan takip edilecek.</p>');
    giNotice('GVN-2026-0001 dosyası oluşturuldu.');
    return;
  }

  if (form.matches('[data-chat]')) {
    giModal('AI Danışman', '<p>Mesaj alındı. AI danışman güvenlik, psikoloji ve şikayet analizi için demo yanıt üretti.</p>');
    return;
  }

  giModal('İşlem kaydedildi', '<p>Form verisi demo state üzerinde işlendi. Bu aksiyon artık boş bırakılmadı.</p>');
}, true);

const observer = new MutationObserver(giActivate);
observer.observe(document.documentElement, { childList: true, subtree: true });
giActivate();
