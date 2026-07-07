const audioInput = document.getElementById("audioInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("resultBox");

audioInput.addEventListener("change", () => {
  const file = audioInput.files[0];
  fileName.textContent = file ? file.name : "";
  resultBox.hidden = true;
});

analyzeBtn.addEventListener("click", () => {
  if (!audioInput.files[0]) {
    fileName.textContent = "먼저 오디오 파일을 선택해주세요.";
    return;
  }
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "분석 중...";

  setTimeout(() => {
    resultBox.hidden = false;
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "분석하기";
  }, 900);
});
