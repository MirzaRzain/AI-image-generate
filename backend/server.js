const express = require("express");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const fs = require("fs");

app.post("/generate", async (req, res) => {
    console.log("Request received:", req.body);

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

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
            }
        );

        // Cek apakah response JSON atau langsung image buffer
        const contentType = response.headers["content-type"];
        if (contentType.includes("application/json")) {
            const jsonResponse = response.data;
            console.log("API Response JSON:", jsonResponse);

            if (!jsonResponse.image) {
                throw new Error("Invalid response format: No image data found.");
            }

            // Decode Base64
            const base64Data = jsonResponse.image.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Data, "base64");

            // Simpan sebagai file JPG
            const imagePath = "generated_image.jpg";
            fs.writeFileSync(imagePath, imageBuffer);
            console.log(`✅ Image saved as ${imagePath}`);

            res.json({ message: "Image generated successfully", file: imagePath });
            return;
        }

        // Jika API langsung mengembalikan binary image
        console.log("Received raw image data");
        const imagePath = "generated_image.jpeg";
        fs.writeFileSync(imagePath, response.data);
        console.log(`✅ Image saved as ${imagePath}`);

        res.json({ message: "Image generated successfully", file: imagePath });
    } catch (error) {
        console.error("Error generating image:", error.message);
        res.status(500).json({ error: error.message || "Failed to generate image" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
