const express = require("express");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs"); // Tambahkan modul fs
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
    console.log("Request received");
    const { prompt } = req.body;

    try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("output_format", "jpeg");

        const response = await axios.post(
            "https://api.stability.ai/v2beta/stable-image/generate/sd3",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
                    ...formData.getHeaders(),
                },
                responseType: "arraybuffer",
            }
        );

        console.log("Response Headers:", response.headers);
        console.log("Response Data Sample:", response.data.slice(0, 100).toString("hex"));

        // Cek apakah API Stability AI mengembalikan data valid
        console.log("Response Data Length:", response.data.length);
        if (response.data.length < 1000) {
            throw new Error("Invalid image data received from Stability AI");
        }

        // Simpan gambar ke file untuk debugging
        fs.writeFileSync("test_image.jpeg", response.data);
        console.log("Image saved as test_image.jpeg");

        // Konversi ke Base64 agar frontend bisa menggunakannya
        const base64Image = Buffer.from(response.data, "binary").toString("base64");

        res.json({ image: `data:image/jpeg;base64,${base64Image}` });
    } catch (error) {
        console.error("Error generating image:", error.message);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
