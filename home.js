const audioInput = document.getElementById("audioInput");
const fileLabel = document.getElementById("fileLabel");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultArea = document.getElementById("resultArea");

audioInput.addEventListener("change", () => {
  const file = audioInput.files[0];
  fileLabel.textContent = file ? file.name : "Upload audio or paste a link";
  resultArea.hidden = true;
});

analyzeBtn.addEventListener("click", () => {
  if (!audioInput.files[0]) {
    fileLabel.textContent = "먼저 오디오 파일을 선택해주세요";
    return;
  }
  analyzeBtn.disabled = true;
  setTimeout(() => {
    resultArea.hidden = false;
    analyzeBtn.disabled = false;
  }, 800);
});
