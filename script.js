// Huỳnh Ngọc Trâm portfolio — no trackers, no external requests.
// Contacts come from site.config.js (window.SITE); media lists from media/media.js (window.MEDIA),
// which scripts/build_site_media.py generates from approved assets only.
(function () {
  "use strict";
  const SITE = window.SITE || { contact: {} };
  const MEDIA = window.MEDIA || { looks: [], videos: [] };
  const c = SITE.contact || {};

  // ---- contacts -----------------------------------------------------------
  const fmtPhone = (n) => n.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
  const intlPhone = (n) => "+84" + n.replace(/^0/, "");
  const hrefs = {
    phone: c.phone ? "tel:" + intlPhone(c.phone) : "",
    zalo: c.zalo ? "https://zalo.me/" + c.zalo : "",
    tiktok: c.tiktok ? "https://www.tiktok.com/@" + c.tiktok : "",
    tiktokPersonal: c.tiktokPersonal ? "https://www.tiktok.com/@" + c.tiktokPersonal : "",
    email: c.email ? "mailto:" + c.email : "",
    whatsapp: c.whatsapp ? "https://wa.me/" + intlPhone(c.whatsapp).replace("+", "") : "",
  };
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const href = hrefs[el.dataset.contact];
    if (href) { el.href = href; el.hidden = false; } else { el.hidden = true; }
  });
  document.querySelectorAll("[data-contact-text='phone']").forEach((el) => {
    if (c.phone) el.textContent = fmtPhone(c.phone);
  });

  const status = document.querySelector(".copy-status");
  document.querySelectorAll("[data-copy='phone']").forEach((btn) => {
    if (!c.phone) { btn.hidden = true; return; }
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(c.phone);
        status.textContent = "Đã sao chép " + fmtPhone(c.phone) + ".";
      } catch (e) {
        status.textContent = "Không sao chép được. Số điện thoại: " + fmtPhone(c.phone) + ".";
      }
    });
  });

  // ---- live clips ---------------------------------------------------------
  const clips = document.getElementById("clips");
  if (clips && MEDIA.videos) {
    clips.innerHTML = MEDIA.videos.map((v) => `
      <figure class="clip">
        <video controls playsinline preload="none" poster="${v.poster}" width="${v.w}" height="${v.h}"
               aria-label="${v.title}">
          <source src="${v.src}" type="video/mp4">
        </video>
        <figcaption><h3>${v.title}</h3><p>${v.caption}</p></figcaption>
      </figure>`).join("");
    // only one clip plays at a time
    const vids = Array.from(clips.querySelectorAll("video"));
    vids.forEach((v) => v.addEventListener("play", () => vids.forEach((o) => { if (o !== v) o.pause(); })));
  }

  // ---- lookbook -----------------------------------------------------------
  const looksEl = document.getElementById("looks");
  const flat = []; // every photo in order, for the lightbox
  if (looksEl && MEDIA.looks) {
    looksEl.innerHTML = MEDIA.looks.map((look) => {
      const items = look.photos.map((p) => {
        const i = flat.push({ ...p, look: look.title }) - 1;
        const alt = p.alt || `${look.title}: Huỳnh Ngọc Trâm`;
        return `<button type="button" data-i="${i}" aria-label="Xem lớn ${alt}">
          <img src="${p.src}" srcset="${p.src} 720w, ${p.src2x} 1280w"
               sizes="(min-width: 720px) 40vw, 72vw" width="${p.w}" height="${p.h}" style="aspect-ratio: ${p.w} / ${p.h}"
               loading="lazy" decoding="async" alt="${alt}"></button>`;
      }).join("");
      return `<article class="look" id="look-${look.id}" aria-labelledby="t-${look.id}">
        <div class="look-head"><h3 id="t-${look.id}">${look.title}</h3><p>${look.caption}</p></div>
        <div class="look-grid n${look.photos.length}">${items}</div></article>`;
    }).join("");
  }

  // ---- lightbox -----------------------------------------------------------
  const lb = document.getElementById("lightbox");
  let cur = 0, opener = null;
  function show(i) {
    cur = (i + flat.length) % flat.length;
    const p = flat[cur];
    const img = lb.querySelector("img");
    img.hidden = false; img.src = p.src2x; img.width = p.w; img.height = p.h;
    img.alt = p.alt || `${p.look}: Huỳnh Ngọc Trâm`;
    lb.querySelector("figcaption").textContent = `${p.look}, ảnh ${cur + 1}/${flat.length}`;
  }
  if (lb && looksEl) {
    looksEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]"); if (!b) return;
      opener = b; show(+b.dataset.i); lb.showModal();
    });
    lb.querySelector(".lb-prev").addEventListener("click", () => show(cur - 1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(cur + 1));
    lb.querySelector(".lb-close").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") lb.close(); });
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    lb.addEventListener("close", () => { if (opener) opener.focus(); });
    // swipe on touch screens
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  }

  // ---- mobile dock hides while the booking section is on screen -----------
  const dock = document.querySelector(".dock");
  const booking = document.getElementById("dat-lich");
  if (dock && booking && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => dock.classList.toggle("is-hidden", en.isIntersecting), { threshold: 0.15 })
      .observe(booking);
  }
})();
