# Otakudesu Scraping

Streaming dan download Anime subtitle Indonesia

# Sumber:

https://otakudesu.blog

# Instalasi

- Jalankan perintah di terminal

```sh
# clone repo
git clone https://github.com/MastayY/otakudesu-scraping.git

# masuk folder
cd otakudesu-scraping

# install dependensi
npm install

# jalankan server
npm start
```

- Server akan berjalan di http://localhost:3000

# Routes

| Endpoint              | Params          | Description                |
| --------------------- | --------------- | -------------------------- |
| /home                 | -               | Homepage                   |
| /schedule             | -               | Jadwal Tayang              |
| /ongoing              | page            | default page: 1            |
| /completed            | page            | default page: 1            |
| /genres               | -               | Genre List                 |
| /genre/:id/page/:page | :id, page       | Anime per genre, page 1    |
| /search               | query           | Search Anime               |
| /anime/:id            | :id             | Anime details              |
| /episode/:id          | :id             | Streaming + link download  |
| /batch/:id            | :id             | Batch download             |

Semua endpoint diprefix `/api`, contoh: `http://localhost:3000/api/home`.

## Mirror streaming

`GET /api/episode/:id` mengembalikan `mirror_list`, setiap item punya `data_content`
(base64 payload). Kirim payload itu untuk membuka stream mirror:

```sh
curl -X POST http://localhost:3000/api/episode/<episode-id>/mirror \
  -H "Content-Type: application/json" \
  -d '{"data_content":"<data_content>"}'
```

Response `stream_link` adalah iframe embed, `link_stream` adalah URL file video
langsung bila bisa diekstrak (`-` kalau tidak).
