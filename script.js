const videoElement = document.getElementById("video");
const captureButton = document.getElementById("captureButton");
const imageContainer = document.getElementById("imageContainer");
const downloadSelectedButton = document.getElementById("downloadSelected");
const deleteSelectedButton = document.getElementById("deleteSelected");
const countdownDisplay = document.getElementById("countdownDisplay"); // Thêm phần tử hiển thị đếm ngược

let capturedImages = [];
const maxCapturedImages = 10;
const countdownTime = 3; // Thời gian đếm ngược trước khi chụp (giây)

// Khởi động camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      videoElement.srcObject = stream;
      videoElement.style.transform = "scaleX(-1)"; // Lật video theo chiều gương ngay khi bắt đầu
    })
    .catch(function (error) {
      console.error("Lỗi khi truy cập camera:", error);
    });
} else {
  alert("Trình duyệt không hỗ trợ truy cập camera.");
}

// Hàm đếm ngược và chụp ảnh
function startCountdownAndCapture() {
  let timeLeft = countdownTime;
  countdownDisplay.textContent = timeLeft;
  countdownDisplay.style.display = "block";

  const countdownInterval = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownDisplay.style.display = "none";
      captureImage();
    }
  }, 1000);
}

// Hàm chụp ảnh
function captureImage() {
  if (capturedImages.length >= maxCapturedImages) {
    capturedImages.shift();
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  ctx.save();
  ctx.scale(-1, 1); // Lật ảnh theo chiều ngang
  ctx.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  const dataURL = canvas.toDataURL("image/png");
  capturedImages.unshift(dataURL); // Thêm ảnh mới vào đầu danh sách

  displayCapturedImages();
}

// Cập nhật danh sách ảnh đã chụp
function displayCapturedImages() {
  imageContainer.innerHTML = "";
  capturedImages.forEach((imageData, index) => {
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("imageWrapper");

    const img = document.createElement("img");
    img.src = imageData;
    img.classList.add("capturedImage");

    img.addEventListener("click", function () {
      img.classList.toggle("selected");
    });

    imageDiv.appendChild(img);
    imageContainer.appendChild(imageDiv);
  });
}

// Xử lý sự kiện khi nhấn nút chụp
captureButton.addEventListener("click", startCountdownAndCapture);

// Tải ảnh đã chọn
downloadSelectedButton.addEventListener("click", () => {
  const selectedImages = document.querySelectorAll(".capturedImage.selected");
  selectedImages.forEach((img, index) => {
    const imageData = img.src;
    downloadImage(imageData, index);
  });
});

// Xóa ảnh đã chọn
deleteSelectedButton.addEventListener("click", () => {
  const selectedImages = document.querySelectorAll(".capturedImage.selected");
  selectedImages.forEach((img) => {
    const index = Array.from(img.parentElement.parentElement.children).indexOf(img.parentElement);
    deleteImage(index);
  });
});

// Hàm tải ảnh xuống
function downloadImage(imageData, index) {
  const link = document.createElement("a");
  link.href = imageData;
  link.download = `screenshot_${index + 1}.png`;
  link.click();
}

// Hàm xóa ảnh
function deleteImage(index) {
  capturedImages.splice(index, 1);
  displayCapturedImages();
}