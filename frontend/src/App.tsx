import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImage(null);

    try {
      const response = await axios.post("http://localhost:5000/generate", { prompt });

      if (response.data.image) {
        setImage(response.data.image);
      } else {
        console.error("No image received");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">AI Image Generator</h1>
      <input
        type="text"
        placeholder="Masukkan prompt..."
        className="w-full max-w-lg p-2 rounded border border-gray-700 text-black"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={generateImage}
        className="mt-4 px-6 py-2 bg-blue-600 rounded text-white"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {image && (
        <div className="mt-4">
          <img src={image} alt="Generated" className="rounded shadow-lg mb-2" />
          <a href={image} download="generated_image.jpeg" className="block px-4 py-2 bg-green-600 rounded text-white text-center">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
