const slides = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const slideCounter = document.getElementById("slideCounter");
const progressBar = document.getElementById("progressBar");

let currentIndex = 0;

function updateSlide() {
  slides.forEach((slide, idx) => {
    slide.classList.toggle("active", idx === currentIndex);
  });

  slideCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
  const progress = ((currentIndex + 1) / slides.length) * 100;
  progressBar.style.width = `${progress}%`;

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
}

function nextSlide() {
  if (currentIndex < slides.length - 1) {
    currentIndex += 1;
    updateSlide();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    updateSlide();
  }
}

prevBtn.addEventListener("click", prevSlide);
nextBtn.addEventListener("click", nextSlide);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    nextSlide();
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    prevSlide();
  }
  if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  }
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "Exit Fullscreen";
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "Fullscreen";
  }
}

fullscreenBtn.addEventListener("click", toggleFullscreen);

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.textContent = "Fullscreen";
  }
});

updateSlide();
