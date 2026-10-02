# Laman Tempahan Sticker

Laman web statik untuk pelanggan:

1. **Pilih design**: 6 template (boleh tukar teks & warna) atau muat naik design sendiri.
2. **Pilih jenis sticker**: Mirrorkote, Vinyl, Lutsinar, Kraft, Hologram, serta bentuk potongan & laminasi.
3. **Kira harga**: ikut saiz, kuantiti dan diskaun kuantiti, dengan caj minimum.
4. **Tempah via WhatsApp**: butang yang hantar ringkasan tempahan penuh, dan butang WhatsApp terapung untuk pertanyaan.

## Ubah tetapan

Semua tetapan ada dalam **`js/config.js`**:

- `noWhatsApp`: nombor WhatsApp kedai (contoh `60123456789`)
- `namaKedai`, `slogan`
- `jenisSticker[].kadar`: harga per cm² setiap jenis
- `bentuk[].faktor`, `laminasi[].kadar`
- `diskaunKuantiti`, `hargaMinimum`, `cajDesign`

### Cara harga dikira

```
harga sekeping = lebar × tinggi × (kadar jenis + kadar laminasi) × faktor bentuk
jumlah         = max(harga sekeping × kuantiti − diskaun, harga minimum) + caj design
```

## Cara buka / online

- Buka `index.html` terus dalam browser, **atau**
- GitHub Pages: Settings → Pages → pilih branch → `/ (root)`.
