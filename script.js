const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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";

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
  "A fantasy tavern filled with elves, dwarves, and glowing potions",
  "A neon-lit street in a futuristic Tokyo with holograms everywhere",
  "A surreal dreamscape with floating clocks and melting buildings",
  "An enchanted meadow with unicorns and rainbow-colored skies",
  "A time-travel machine workshop built inside an ancient pyramid"
];

// Initialize theme
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
  return { width: calculatedWidth, height: calculatedHeight };
};

const generateImages = async (model, imageCount, aspectRatio, prompt) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${model}`;
  const { width, height } = getImageDimensions(aspectRatio);
  const cards = document.querySelectorAll(".img-card");

  for (let i = 0; i < imageCount; i++) {
    const card = cards[i];
    const statusText = card.querySelector(".status-text");

    try {
      const res = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height,
            seed: Math.floor(Math.random() * 100000) // <-- make each image different
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      card.classList.remove("loading");
      card.innerHTML = `
        <img src="${imageUrl}" alt="AI Image">
        <div class="img-overlay">
          <a href="${imageUrl}" download class="img-download-btn">
            <i class="fa-solid fa-download"></i>
          </a>
        </div>
      `;
    } catch (err) {
      console.error("Image error:", err.message);
      card.classList.remove("loading");
      card.classList.add("error");
      statusText.textContent = "❌ Failed to generate image";
    }
  }
};

const createImageCards = (model, imageCount, aspectRatio, prompt) => {
  gridGallery.innerHTML = "";
  for (let i = 0; i < imageCount; i++) {
    const card = document.createElement("div");
    card.className = "img-card loading";
    card.style.aspectRatio = aspectRatio;
    card.innerHTML = `
      <div class="status-container">
        <div class="spinner"></div>
        <p class="status-text">Generating...</p>
      </div>
    `;
    gridGallery.appendChild(card);
  }

  generateImages(model, imageCount, aspectRatio, prompt);
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();
  if (!selectedModel || !prompt) return alert("Please select model and enter a prompt.");
  createImageCards(selectedModel, imageCount, aspectRatio, prompt);
};

promptBtn.addEventListener("click", () => {
  const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = randomPrompt;
  promptInput.focus();
});

themeToggle.addEventListener("click", toggleTheme);
promptForm.addEventListener("submit", handleFormSubmit);
