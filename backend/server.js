require("dotenv").config();
console.log("API Key:", process.env.STABILITY_API_KEY ? "Loaded" : "Missing");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
    console.log('Request received');
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
            console.log("Image Buffer Length:", response.data.length);
            const base64Image = Buffer.from(response.data, "binary").toString("base64");
            res.json({ image: `data:image/jpeg;base64,${base64Image}`})


        // res.setHeader("Content-Type", "image/jpeg");
        // res.setHeader("Content-Disposition", "attachment; filename=generated_image.jpeg")
        // res.send(response.data);
    } catch (error) {
        console.error("Error generating image:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
