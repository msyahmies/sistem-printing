/* Logik laman: pilih design, jenis sticker, kira harga & hantar ke WhatsApp. */
(function () {
  const $ = (id) => document.getElementById(id);
  const rm = (n) => "RM" + n.toFixed(2);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

  /* ---------- Template design (SVG) ---------- */
  const FONT = "font-family='Poppins, sans-serif' text-anchor='middle'";
  const TEMPLATES = [
    {
      id: "bulat", nama: "Bulat Klasik", bentuk: "bulat",
      lalai: { t1: "Nama Kedai", t2: "Sedap & Berkualiti", c1: "#e63946", c2: "#ffffff" },
      svg: (d) => `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="96" fill="${d.c2}" stroke="${d.c1}" stroke-width="8"/>
          <circle cx="100" cy="100" r="80" fill="none" stroke="${d.c1}" stroke-width="2" stroke-dasharray="4 4"/>
          <text x="100" y="105" ${FONT} font-size="${fit(d.t1, 26, 140)}" font-weight="800" fill="${d.c1}">${esc(d.t1)}</text>
          <text x="100" y="132" ${FONT} font-size="${fit(d.t2, 13, 130)}" fill="${d.c1}">${esc(d.t2)}</text>
        </svg>`,
    },
    {
      id: "label", nama: "Label Produk", bentuk: "bucu",
      lalai: { t1: "Kuih Raya", t2: "Berat bersih: 500g", c1: "#264653", c2: "#f4f1de" },
      svg: (d) => `
        <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="232" height="152" rx="18" fill="${d.c2}" stroke="${d.c1}" stroke-width="6"/>
          <rect x="4" y="4" width="232" height="40" rx="18" fill="${d.c1}"/>
          <rect x="4" y="26" width="232" height="18" fill="${d.c1}"/>
          <text x="120" y="31" ${FONT} font-size="14" font-weight="600" fill="${d.c2}">★ HOMEMADE ★</text>
          <text x="120" y="98" ${FONT} font-size="${fit(d.t1, 30, 200)}" font-weight="800" fill="${d.c1}">${esc(d.t1)}</text>
          <text x="120" y="130" ${FONT} font-size="${fit(d.t2, 14, 200)}" fill="${d.c1}">${esc(d.t2)}</text>
        </svg>`,
    },
    {
      id: "terimakasih", nama: "Terima Kasih", bentuk: "bulat",
      lalai: { t1: "Terima Kasih", t2: "@namakedai", c1: "#ff6b9a", c2: "#ffffff" },
      svg: (d) => `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="96" fill="${d.c1}"/>
          <path d="M100 58c-8-14-32-12-32 6 0 16 32 30 32 30s32-14 32-30c0-18-24-20-32-6z" fill="${d.c2}"/>
          <text x="100" y="128" ${FONT} font-size="${fit(d.t1, 24, 160)}" font-weight="800" fill="${d.c2}">${esc(d.t1)}</text>
          <text x="100" y="152" ${FONT} font-size="${fit(d.t2, 13, 140)}" fill="${d.c2}">${esc(d.t2)}</text>
        </svg>`,
    },
    {
      id: "lencana", nama: "Lencana", bentuk: "diecut",
      lalai: { t1: "PREMIUM", t2: "Kualiti Terjamin", c1: "#f4a261", c2: "#1d3557" },
      svg: (d) => `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <polygon points="${starburst(100, 100, 96, 86, 24)}" fill="${d.c1}"/>
          <circle cx="100" cy="100" r="72" fill="${d.c2}"/>
          <text x="100" y="104" ${FONT} font-size="${fit(d.t1, 26, 120)}" font-weight="800" fill="${d.c1}">${esc(d.t1)}</text>
          <text x="100" y="128" ${FONT} font-size="${fit(d.t2, 12, 110)}" fill="#fff">${esc(d.t2)}</text>
        </svg>`,
    },
    {
      id: "doorgift", nama: "Doorgift Kahwin", bentuk: "bulat",
      lalai: { t1: "Aiman & Sofia", t2: "12 . 12 . 2026", c1: "#8d6e63", c2: "#fff8f0" },
      svg: (d) => `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="96" fill="${d.c2}" stroke="${d.c1}" stroke-width="3"/>
          <circle cx="100" cy="100" r="88" fill="none" stroke="${d.c1}" stroke-width="1"/>
          <text x="100" y="62" ${FONT} font-size="12" letter-spacing="3" fill="${d.c1}">TERIMA KASIH</text>
          <text x="100" y="108" ${FONT} font-size="${fit(d.t1, 22, 150)}" font-style="italic" font-weight="600" fill="${d.c1}">${esc(d.t1)}</text>
          <line x1="60" y1="122" x2="140" y2="122" stroke="${d.c1}" stroke-width="1"/>
          <text x="100" y="142" ${FONT} font-size="${fit(d.t2, 12, 130)}" fill="${d.c1}">${esc(d.t2)}</text>
        </svg>`,
    },
    {
      id: "botol", nama: "Label Botol", bentuk: "segi",
      lalai: { t1: "Air Balang", t2: "Segar • Tanpa Pengawet", c1: "#2a9d8f", c2: "#ffffff" },
      svg: (d) => `
        <svg viewBox="0 0 260 140" xmlns="http://www.w3.org/2000/svg">
          <rect width="260" height="140" fill="${d.c2}"/>
          <rect width="260" height="14" fill="${d.c1}"/>
          <rect y="126" width="260" height="14" fill="${d.c1}"/>
          <text x="130" y="78" ${FONT} font-size="${fit(d.t1, 32, 220)}" font-weight="800" fill="${d.c1}">${esc(d.t1)}</text>
          <text x="130" y="106" ${FONT} font-size="${fit(d.t2, 14, 220)}" fill="${d.c1}">${esc(d.t2)}</text>
        </svg>`,
    },
  ];

  // Kecilkan saiz font jika teks terlalu panjang untuk ruang
  function fit(text, max, width) {
    const anggaran = String(text).length * max * 0.6;
    return anggaran > width ? Math.max(8, Math.floor(width / (String(text).length * 0.6))) : max;
  }

  function starburst(cx, cy, r1, r2, n) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1;
      const a = (Math.PI * i) / n;
      pts.push((cx + r * Math.sin(a)).toFixed(1) + "," + (cy - r * Math.cos(a)).toFixed(1));
    }
    return pts.join(" ");
  }

  const SAMPEL_JENIS = {
    mirrorkote: "linear-gradient(135deg,#fff,#eee)",
    vinyl: "linear-gradient(135deg,#fff,#dfe7ef)",
    transparent: "repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px",
    kraft: "linear-gradient(135deg,#c9a27a,#a67c52)",
    hologram: "linear-gradient(120deg,#ff9ff3,#feca57,#48dbfb,#1dd1a1,#ff9ff3)",
  };

  /* ---------- State ---------- */
  const state = {
    template: TEMPLATES[0].id,
    upload: null, // dataURL gambar pelanggan
    namaFail: "",
    jenis: CONFIG.jenisSticker[1].id,
    bentuk: TEMPLATES[0].bentuk,
    laminasi: CONFIG.laminasi[0].id,
    lebar: 5,
    tinggi: 5,
    kuantiti: 100,
  };

  const cari = (senarai, id) => senarai.find((x) => x.id === id);

  /* ---------- Render: design ---------- */
  function dataDesign() {
    return { t1: $("teks1").value, t2: $("teks2").value, c1: $("warna1").value, c2: $("warna2").value };
  }

  function renderSenaraiTemplate() {
    const el = $("senaraiTemplate");
    el.innerHTML = TEMPLATES.map((t) => `
      <button type="button" class="template" data-id="${t.id}">
        ${t.svg(t.lalai)}<span>${t.nama}</span>
      </button>`).join("") + `
      <button type="button" class="template" data-id="upload">
        <div class="ikon-upload">⬆️</div><span>Design Sendiri</span>
      </button>`;
    el.querySelectorAll(".template").forEach((b) => b.addEventListener("click", () => pilihTemplate(b.dataset.id)));
  }

  function pilihTemplate(id) {
    state.template = id;
    const t = cari(TEMPLATES, id);
    if (t) {
      $("teks1").value = t.lalai.t1;
      $("teks2").value = t.lalai.t2;
      $("warna1").value = t.lalai.c1;
      $("warna2").value = t.lalai.c2;
      state.bentuk = t.bentuk;
      renderPil();
    }
    $("kawalanTemplate").hidden = !t;
    $("kawalanUpload").hidden = !!t;
    document.querySelectorAll(".template").forEach((b) => b.classList.toggle("aktif", b.dataset.id === id));
    renderPratonton();
    kira();
  }

  function renderPratonton() {
    const t = cari(TEMPLATES, state.template);
    const el = $("pratonton");
    if (t) {
      el.innerHTML = t.svg(dataDesign());
      $("labelPratonton").textContent = "Pratonton: " + t.nama;
    } else if (state.upload) {
      el.innerHTML = `<img src="${state.upload}" alt="Design anda">`;
      $("labelPratonton").textContent = state.namaFail;
    } else {
      el.innerHTML = `<span class="kecil">Tiada fail lagi</span>`;
      $("labelPratonton").textContent = "Pratonton";
    }
  }

  /* ---------- Render: jenis, bentuk, laminasi, saiz, kuantiti ---------- */
  function renderJenis() {
    const el = $("senaraiJenis");
    el.innerHTML = CONFIG.jenisSticker.map((j) => `
      <button type="button" class="pilihan ${j.id === state.jenis ? "aktif" : ""}" data-id="${j.id}">
        <div class="sampel" style="background:${SAMPEL_JENIS[j.id] || "#eee"}"></div>
        <strong>${j.nama}</strong>
        <small>${j.info}</small>
      </button>`).join("");
    el.querySelectorAll(".pilihan").forEach((b) => b.addEventListener("click", () => {
      state.jenis = b.dataset.id;
      renderJenis();
      kira();
    }));
  }

  function renderPilBiasa(elId, senarai, kunci) {
    const el = $(elId);
    el.innerHTML = senarai.map((x) =>
      `<button type="button" data-id="${x.id}" class="${x.id === state[kunci] ? "aktif" : ""}">${x.nama}</button>`).join("");
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      state[kunci] = b.dataset.id;
      renderPil();
      kira();
    }));
  }

  function renderSaiz() {
    const el = $("senaraiSaiz");
    el.innerHTML = CONFIG.saizPreset.map((s, i) => {
      const aktif = s.w === state.lebar && s.h === state.tinggi;
      return `<button type="button" data-i="${i}" class="${aktif ? "aktif" : ""}">${s.w} × ${s.h}</button>`;
    }).join("");
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const s = CONFIG.saizPreset[b.dataset.i];
      state.lebar = s.w; state.tinggi = s.h;
      $("lebar").value = s.w; $("tinggi").value = s.h;
      renderSaiz();
      kira();
    }));
  }

  function renderKuantiti() {
    const el = $("senaraiKuantiti");
    el.innerHTML = CONFIG.kuantitiPreset.map((q) =>
      `<button type="button" data-q="${q}" class="${q === state.kuantiti ? "aktif" : ""}">${q} pcs</button>`).join("");
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      state.kuantiti = Number(b.dataset.q);
      $("kuantiti").value = state.kuantiti;
      renderKuantiti();
      kira();
    }));
  }

  function renderPil() {
    renderPilBiasa("senaraiBentuk", CONFIG.bentuk, "bentuk");
    renderPilBiasa("senaraiLaminasi", CONFIG.laminasi, "laminasi");
  }

  /* ---------- Pengiraan harga ---------- */
  function hitung() {
    const jenis = cari(CONFIG.jenisSticker, state.jenis);
    const bentuk = cari(CONFIG.bentuk, state.bentuk);
    const lam = cari(CONFIG.laminasi, state.laminasi);
    const luas = state.lebar * state.tinggi;
    const q = state.kuantiti;

    const sekeping = luas * (jenis.kadar + lam.kadar) * bentuk.faktor;
    const subtotal = sekeping * q;

    const tier = CONFIG.diskaunKuantiti.find((d) => q >= d.min);
    const kadarDiskaun = tier ? tier.diskaun : 0;
    const diskaun = subtotal * kadarDiskaun;
    const selepasDiskaun = subtotal - diskaun;
    const kenaMinimum = selepasDiskaun < CONFIG.hargaMinimum;
    const cetak = Math.max(selepasDiskaun, CONFIG.hargaMinimum);
    const design = $("mintaDesign").checked ? CONFIG.cajDesign : 0;
    const jumlah = cetak + design;

    // Cadangan tier diskaun seterusnya
    const tierNaik = [...CONFIG.diskaunKuantiti].reverse().find((d) => d.min > q && d.diskaun > kadarDiskaun);

    return { jenis, bentuk, lam, luas, q, sekeping, subtotal, kadarDiskaun, diskaun, kenaMinimum, cetak, design, jumlah, tierNaik };
  }

  function kira() {
    if (!(state.lebar > 0 && state.tinggi > 0 && state.kuantiti > 0)) {
      $("ringkasan").innerHTML = `<p class="kecil">Sila masukkan saiz dan kuantiti yang sah.</p>`;
      return;
    }
    const h = hitung();
    $("ringkasan").innerHTML = `
      <table>
        <tr><td>${h.jenis.nama} · ${h.bentuk.nama}</td><td></td></tr>
        <tr><td>Saiz ${state.lebar} × ${state.tinggi} cm · Laminasi ${h.lam.nama}</td><td></td></tr>
        <tr><td>${h.q} keping × ${rm(h.sekeping)}</td><td>${rm(h.subtotal)}</td></tr>
        ${h.diskaun > 0 ? `<tr class="diskaun"><td>Diskaun kuantiti (${Math.round(h.kadarDiskaun * 100)}%)</td><td>−${rm(h.diskaun)}</td></tr>` : ""}
        ${h.kenaMinimum ? `<tr><td>Dikenakan caj minimum tempahan</td><td>${rm(CONFIG.hargaMinimum)}</td></tr>` : ""}
        ${h.design ? `<tr><td>Caj design</td><td>${rm(h.design)}</td></tr>` : ""}
        <tr class="jumlah"><td>Anggaran Jumlah</td><td>${rm(h.jumlah)}</td></tr>
      </table>
      <div class="sekeping">≈ ${rm(h.cetak / h.q)} sekeping</div>
      ${h.tierNaik ? `<div class="petua">💡 Tambah ${h.tierNaik.min - h.q} keping lagi untuk diskaun ${Math.round(h.tierNaik.diskaun * 100)}%!</div>` : ""}`;
  }

  /* ---------- WhatsApp ---------- */
  function linkWA(mesej) {
    return `https://wa.me/${CONFIG.noWhatsApp}?text=${encodeURIComponent(mesej)}`;
  }

  function mesejTempahan() {
    const h = hitung();
    const t = cari(TEMPLATES, state.template);
    const d = dataDesign();
    const baris = [
      `Salam ${CONFIG.namaKedai}, saya nak tempah sticker:`,
      ``,
      `*Design:* ${t ? `${t.nama} — "${d.t1}" / "${d.t2}" (warna ${d.c1}, latar ${d.c2})` : `Design sendiri${state.namaFail ? ` (${state.namaFail})` : ""} — fail akan dihantar dalam chat ini`}`,
      `*Jenis:* ${h.jenis.nama}`,
      `*Bentuk:* ${h.bentuk.nama}`,
      `*Laminasi:* ${h.lam.nama}`,
      `*Saiz:* ${state.lebar} x ${state.tinggi} cm`,
      `*Kuantiti:* ${h.q} keping`,
      $("mintaDesign").checked ? `*Perlu bantuan design:* Ya` : null,
      `*Anggaran harga:* ${rm(h.jumlah)}`,
      $("nota").value.trim() ? `*Nota:* ${$("nota").value.trim()}` : null,
      ``,
      `Mohon sahkan harga & tarikh siap. Terima kasih!`,
    ];
    return baris.filter((b) => b !== null).join("\n");
  }

  /* ---------- Mula ---------- */
  function mula() {
    document.title = `Tempah Sticker | ${CONFIG.namaKedai}`;
    $("namaKedai").textContent = CONFIG.namaKedai;
    $("slogan").textContent = CONFIG.slogan;
    $("cajDesign").textContent = CONFIG.cajDesign;
    $("footer").textContent = `© ${new Date().getFullYear()} ${CONFIG.namaKedai}. Semua harga adalah anggaran.`;
    $("waTerapung").href = linkWA(`Salam ${CONFIG.namaKedai}, saya ada pertanyaan tentang sticker.`);

    renderSenaraiTemplate();
    renderJenis();
    renderPil();
    renderSaiz();
    renderKuantiti();

    ["teks1", "teks2", "warna1", "warna2"].forEach((id) => $(id).addEventListener("input", renderPratonton));

    $("failDesign").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      state.namaFail = f.name;
      const r = new FileReader();
      r.onload = () => { state.upload = r.result; renderPratonton(); };
      r.readAsDataURL(f);
    });

    const saizBerubah = () => {
      state.lebar = parseFloat($("lebar").value) || 0;
      state.tinggi = parseFloat($("tinggi").value) || 0;
      renderSaiz();
      kira();
    };
    $("lebar").addEventListener("input", saizBerubah);
    $("tinggi").addEventListener("input", saizBerubah);

    $("kuantiti").addEventListener("input", () => {
      state.kuantiti = parseInt($("kuantiti").value, 10) || 0;
      renderKuantiti();
      kira();
    });
    $("mintaDesign").addEventListener("change", kira);

    $("btnTempah").addEventListener("click", () => {
      if (!(state.lebar > 0 && state.tinggi > 0 && state.kuantiti > 0)) {
        alert("Sila masukkan saiz dan kuantiti yang sah.");
        return;
      }
      window.open(linkWA(mesejTempahan()), "_blank", "noopener");
    });

    pilihTemplate(state.template);
  }

  mula();
})();
