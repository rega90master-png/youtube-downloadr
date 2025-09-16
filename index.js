const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());
app.use(express.static("public"));

// ✅ API لجلب معلومات الفيديو (العنوان + الصورة)
app.get("/info", async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: "❌ رابط غير صالح" });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

    res.json({ title, thumbnail });
  } catch (err) {
    res.status(500).json({ error: "⚠️ فشل في جلب بيانات الفيديو" });
  }
});

// ✅ API لتحميل الفيديو
app.get("/download", async (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "highest";

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).send("❌ رابط غير صالح");
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    if (quality === "audioonly") {
      res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
      ytdl(videoURL, { filter: "audioonly" }).pipe(res);
    } else if (quality === "480p") {
      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
      ytdl(videoURL, { quality: "18" }).pipe(res); // 18 = 480p
    } else {
      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
      ytdl(videoURL, { quality: "highestvideo" }).pipe(res);
    }
  } catch (err) {
    res.status(500).send("⚠️ حصل خطأ في التحميل");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
