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
  "A futuristic samurai standing on a neon-lit rooftop in Tokyo during a rainy night",
  "A floating castle made of crystal hovering above a waterfall in a fantasy world",
  "A cozy cabin in the middle of a glowing enchanted forest under northern lights",
  "A cybernetic owl perched on a tree made of circuits in a digital jungle",
  "A peaceful alien village on a lavender-colored moon with twin suns in the sky",
  "A giant whale flying through a cloudy sky with lanterns hanging from its fins",
  "A post-apocalyptic desert city with rusted towers and glowing mushrooms",
  "A steampunk dragon soaring through the clouds near a clocktower city",
  "A deep-sea diver discovering an ancient temple surrounded by glowing jellyfish",
  "A magical library with floating books and staircases leading into the stars",
  "A snow-covered village during Christmas with warm glowing lights and carolers",
  "A Viking ship sailing through the aurora borealis above icy mountains",
  "A retro diner floating in space orbiting a colorful gas planet",
  "A warrior cat in armor riding a fire-breathing lizard through a canyon",
  "A painter robot on Mars creating a canvas of Earth in the red sunset sky"
];

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

const getImageDimensions = (aspectRatio) => {
  const [w, h] = aspectRatio.split("/").map(Number);
  const scale = 512 / Math.sqrt(w * h);
  const width = Math.floor((w * scale) / 8) * 8;
  const height = Math.floor((h * scale) / 8) * 8;
  return { width, height };
};

const generateImages = async (model, imageCount, aspectRatio, prompt) => {
  const { width, height } = getImageDimensions(aspectRatio);
  const cards = document.querySelectorAll(".img-card");

  for (let i = 0; i < imageCount; i++) {
    const card = cards[i];
    const statusText = card.querySelector(".status-text");

    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height
          },
          options: {
            wait_for_model: true
          }
        })
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      card.classList.remove("loading");
      card.innerHTML = `
        <img src="${imageUrl}" alt="AI Image" />
        <div class="img-overlay">
          <a href="${imageUrl}" download class="img-download-btn">
            <i class="fa-solid fa-download"></i>
          </a>
        </div>
      `;
    } catch (err) {
      card.classList.remove("loading");
      card.classList.add("error");
      statusText.textContent = "❌ Failed to generate image";
      console.error(err);
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
  const model = modelSelect.value;
  const count = parseInt(countSelect.value) || 1;
  const ratio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();
  if (!model || !prompt) return alert("Please select model and enter a prompt.");
  createImageCards(model, count, ratio, prompt);
};

promptBtn.addEventListener("click", () => {
  const random = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = random;
  promptInput.focus();
});

themeToggle.addEventListener("click", toggleTheme);
promptForm.addEventListener("submit", handleFormSubmit);
