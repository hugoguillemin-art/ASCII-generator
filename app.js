"use strict";

const imageInput = document.querySelector("#image-input");
const dropzone = document.querySelector("#dropzone");
const uploadPrompt = document.querySelector("#upload-prompt");
const sourcePreview = document.querySelector("#source-preview");
const errorMessage = document.querySelector("#error-message");
const changeImageButton = document.querySelector("#change-image");
const asciiOutput = document.querySelector("#ascii-output");
const artboard = document.querySelector("#artboard");
const emptyState = document.querySelector("#empty-state");
const outputResolution = document.querySelector("#output-resolution");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const liveIndicator = document.querySelector("#live-indicator");
const exportFormat = document.querySelector("#export-format");
const frameScope = document.querySelector("#frame-scope");
const frameScopeLabel = document.querySelector("#frame-scope-label");
const transparencyOption = document.querySelector("#transparency-option");
const transparentBackground = document.querySelector("#transparent-background");
const characterColor = document.querySelector("#character-color");
const backgroundColor = document.querySelector("#background-color");
const randomizeColorsButton = document.querySelector("#randomize-colors");
const asciiStyle = document.querySelector("#ascii-style");
const fontVariantControl = document.querySelector("#font-variant-control");
const fontVariant = document.querySelector("#font-variant");
const customRampControl = document.querySelector("#custom-ramp-control");
const customRamp = document.querySelector("#custom-ramp");
const alignCharacters = document.querySelector("#align-characters");
const removeColor = document.querySelector("#remove-color");
const removeColorSettings = document.querySelector("#remove-color-settings");
const removedColor = document.querySelector("#removed-color");
const colorTolerance = document.querySelector("#color-tolerance");
const colorToleranceValue = document.querySelector("#color-tolerance-value");
const characterDensity = document.querySelector("#character-density");
const densityValue = document.querySelector("#density-value");
const brightnessLevel = document.querySelector("#brightness-level");
const brightnessValue = document.querySelector("#brightness-value");
const contrastLevel = document.querySelector("#contrast-level");
const contrastValue = document.querySelector("#contrast-value");
const invertTones = document.querySelector("#invert-tones");
const rotateLeftButton = document.querySelector("#rotate-left");
const rotateRightButton = document.querySelector("#rotate-right");
const playbackToggle = document.querySelector("#playback-toggle");
const videoTimeline = document.querySelector("#video-timeline");
const timelineSlider = document.querySelector("#timeline-slider");
const currentTimeOutput = document.querySelector("#current-time");
const videoDurationOutput = document.querySelector("#video-duration");
const videoPosterize = document.querySelector("#video-posterize");
const posterizeVideo = document.querySelector("#posterize-video");
const posterizeRateControl = document.querySelector("#posterize-rate-control");
const posterizeFrameRate = document.querySelector("#posterize-frame-rate");
const posterizeFrameRateValue = document.querySelector("#posterize-frame-rate-value");
const exportResolution = document.querySelector("#export-resolution");
const videoCompression = document.querySelector("#video-compression");
const videoExportStats = document.querySelector("#video-export-stats");
const randomFrameColors = document.querySelector("#random-frame-colors");
const randomColorHueControl = document.querySelector("#random-color-hue-control");
const randomColorHue = document.querySelector("#random-color-hue");
const exportProgressScreen = document.querySelector("#export-progress-screen");
const exportProgressMessage = document.querySelector("#export-progress-message");
const exportDimensions = document.querySelector("#export-dimensions");
const exportBitrate = document.querySelector("#export-bitrate");
const exportProgressFill = document.querySelector("#export-progress-fill");
const exportProgressStatus = document.querySelector("#export-progress-status");
const exportProgressPercent = document.querySelector("#export-progress-percent");
const exportProgressBar = document.querySelector("#export-progress-bar");

const videoCompressionPresets = {
  high: { label: "High compression", megabitsPerSecond: 4 },
  medium: { label: "Medium compression", megabitsPerSecond: 12 },
  low: { label: "Low compression", megabitsPerSecond: 24 }
};

const characterStyles = {
  classic: "@%#*+=-:. ",
  dense: "@#$%W&8B*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,^`. ",
  simple: "#*:. ",
  binary: "# ",
  bitmap: "• ",
  geometric: "█▓▦▩▣■◆●◈▨▧▤▥▒░▏▪▫□◇◌· ",
  shading: "█▓▒░ ",
  japanese: Array.from("龘鬱龍響警露藤麗愛夢森海空花文人 "),
  braille: Array.from({ length: 256 }, (_, value) => ({
    character: String.fromCodePoint(0x2800 + value),
    density: value.toString(2).replace(/0/g, "").length
  })).sort((left, right) => right.density - left.density).map(({ character }) => character),
  emoji: Array.from("🌑🌒🌓🌔🌕")
};
const fontStyles = {
  "font:angel-wish": [{ label: "Regular", family: "ASCII Angel Wish" }],
  "font:hexcd": [
    { label: "Regular", family: "ASCII HEXCD Regular" },
    { label: "ExtraLight", family: "ASCII HEXCD ExtraLight" },
    { label: "ExtraBlack", family: "ASCII HEXCD ExtraBlack" },
    { label: "Bold", family: "ASCII HEXCD Bold" },
    { label: "Black", family: "ASCII HEXCD Black" }
  ],
  "font:nokiafc22": [{ label: "Regular", family: "ASCII Nokia FC22" }],
  "font:parafuse": [
    { label: "Regular", family: "ASCII Parafuse Regular" },
    { label: "Outline", family: "ASCII Parafuse Outline" },
    { label: "Shadow", family: "ASCII Parafuse Shadow" }
  ],
  "font:remain3kroyals": [{ label: "Regular", family: "ASCII Remain 3K Royals" }],
  "font:spaceship2100": [{ label: "Regular", family: "ASCII Spaceship 2100" }]
};
const maximumImageSize = 20 * 1024 * 1024;
const maximumVideoSize = 200 * 1024 * 1024;
const bitmapThresholds = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];
const conversionCanvas = document.createElement("canvas");
const conversionContext = conversionCanvas.getContext("2d", { willReadFrequently: true });
const textMeasureContext = document.createElement("canvas").getContext("2d");
const characterMetricsCache = new Map();
let currentSource = null;
let animationFrame = 0;
let loadGeneration = 0;
let rotation = 0;
let randomFrameColorSeed = 0;
const framesPerSecond = 24;

function setError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = !message;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds - minutes * 60;
  const wholeSeconds = Math.floor(remainingSeconds);
  const centiseconds = Math.floor((remainingSeconds - wholeSeconds) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function updateExportProgress(progress, message, status) {
  const percentage = Math.max(0, Math.min(100, Math.round(progress)));
  exportProgressFill.style.width = `${percentage}%`;
  exportProgressPercent.value = `${percentage}%`;
  exportProgressPercent.textContent = `${percentage}%`;
  exportProgressStatus.textContent = status;
  exportProgressMessage.textContent = message;
  exportProgressBar.setAttribute("aria-valuenow", String(percentage));
}

function getVideoCompressionPreset() {
  const presetName = videoCompression.querySelector('input[name="video-compression"]:checked').value;
  return videoCompressionPresets[presetName];
}

function getVideoResolutionLabel() {
  return exportResolution.options[exportResolution.selectedIndex].text;
}

async function showExportProgress() {
  const { width, height } = exportFormat.value === "txt"
    ? getSourceDimensions()
    : getExportDimensions();
  exportDimensions.textContent = `${width} × ${height} px`;
  exportBitrate.textContent = exportFormat.value === "mp4"
    ? `${getVideoCompressionPreset().label} · ${getVideoCompressionPreset().megabitsPerSecond} Mbps target`
    : "Not applicable";
  exportProgressScreen.hidden = false;
  exportProgressScreen.focus();
  updateExportProgress(0, "Starting export…", "Preparing");
  await new Promise((resolve) => window.setTimeout(resolve, 30));
}

async function finishExportProgress(success, message) {
  if (success) {
    updateExportProgress(100, message ?? "Your file is ready to download.", "Complete");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
  }
  exportProgressScreen.hidden = true;
}

function formatFileSize(bytes) {
  return bytes >= 1000000
    ? `${(bytes / 1000000).toFixed(2)} MB`
    : `${(bytes / 1000).toFixed(1)} kB`;
}

function getRandomColor() {
  return `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0")}`;
}

function getRelativeLuminance(hexColor) {
  const channels = hexColor.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255);
  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrastRatio(firstColor, secondColor) {
  const luminances = [getRelativeLuminance(firstColor), getRelativeLuminance(secondColor)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

function getColorHue(hexColor) {
  const [red, green, blue] = hexColor.slice(1).match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;
  if (difference === 0) return null;
  const hue = maximum === red
    ? 60 * (((green - blue) / difference) % 6)
    : maximum === green
      ? 60 * ((blue - red) / difference + 2)
      : 60 * ((red - green) / difference + 4);
  return Math.round((hue + 360) % 360);
}

function getVideoFrameRate() {
  return posterizeVideo.checked ? Number(posterizeFrameRate.value) : framesPerSecond;
}

function createFrameColorPair(frameIndex) {
  let state = (randomFrameColorSeed ^ Math.imul(frameIndex + 1, 0x9e3779b9)) >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  const selectedHue = getColorHue(randomColorHue.value);
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
  const randomMutedColor = () => {
    const hue = selectedHue === null
      ? Math.floor(random() * 360)
      : (selectedHue + Math.floor(random() * 91) - 45 + 360) % 360;
    const saturation = Math.floor(18 + random() * 17);
    const lightness = Math.floor(random() * 101);
    const chroma = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const hueSection = hue / 60;
    const second = chroma * (1 - Math.abs(hueSection % 2 - 1));
    const channels = hueSection < 1 ? [chroma, second, 0]
      : hueSection < 2 ? [second, chroma, 0]
        : hueSection < 3 ? [0, chroma, second]
          : hueSection < 4 ? [0, second, chroma]
            : hueSection < 5 ? [second, 0, chroma]
              : [chroma, 0, second];
    const offset = lightness / 100 - chroma / 2;
    return `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
  };
  const background = randomMutedColor();
  let character = "";
  for (let attempt = 0; attempt < 512; attempt += 1) {
    character = randomMutedColor();
    if (getContrastRatio(character, background) >= 4.5) return { character, background };
  }
  const blackContrast = getContrastRatio("#000000", background);
  const whiteContrast = getContrastRatio("#ffffff", background);
  return {
    character: blackContrast > whiteContrast ? "#000000" : "#ffffff",
    background
  };
}

function getFrameColors(time) {
  if (!currentSource || currentSource.kind !== "video" || !randomFrameColors.checked) {
    return { character: characterColor.value, background: backgroundColor.value };
  }
  const frameTime = Number.isFinite(time) ? time : currentSource.media.currentTime;
  const frameIndex = Math.max(0, Math.floor(frameTime * getVideoFrameRate() + 1e-6));
  return createFrameColorPair(frameIndex);
}

function getPosterizedTime(time, duration) {
  if (!posterizeVideo.checked) return time;
  return Math.min(Math.round(time * getVideoFrameRate()) / getVideoFrameRate(), Math.max(0, duration - 0.001));
}

function randomizeColors() {
  let character = "";
  let background = "";
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    character = getRandomColor();
    background = getRandomColor();
    if (getContrastRatio(character, background) >= 4.5) break;
  }
  if (getContrastRatio(character, background) < 4.5) {
    character = "#ffffff";
    background = "#000000";
  }
  characterColor.value = character;
  backgroundColor.value = background;
  updateExportControls();
  updateMediaPreview();
  renderAscii();
}

function replaceSource(source) {
  if (currentSource && currentSource.objectUrl) URL.revokeObjectURL(currentSource.objectUrl);
  currentSource = source;
  sourcePreview.hidden = false;
  uploadPrompt.hidden = true;
  changeImageButton.hidden = false;
  rotateLeftButton.disabled = false;
  rotateRightButton.disabled = false;
  videoTimeline.hidden = source.kind !== "video";
  playbackToggle.disabled = source.kind !== "video";
  playbackToggle.classList.remove("is-playing");
  videoPosterize.hidden = source.kind !== "video";
  posterizeVideo.checked = false;
  posterizeRateControl.hidden = true;
  posterizeFrameRate.value = "12";
  posterizeFrameRateValue.value = "12 fps";
  videoCompression.querySelector('input[value="medium"]').checked = true;
  exportResolution.value = "original";
  randomFrameColors.checked = false;
  randomColorHueControl.hidden = true;
  rotation = 0;
  configureExportOptions(source.kind);
  updateMediaPreview();
}

function configureExportOptions(kind) {
  const formats = kind === "video"
    ? [["txt", "Plain text (.txt)"], ["png", "PNG frames (ZIP)"], ["jpeg", "JPEG frames (ZIP)"], ["mp4", "MP4 video"]]
    : [["txt", "Plain text (.txt)"], ["png", "PNG image (.png)"], ["jpeg", "JPEG image (.jpeg)"]];
  exportFormat.replaceChildren(...formats.map(([value, label]) => new Option(label, value)));
  exportFormat.value = kind === "video" ? "mp4" : "jpeg";
  exportFormat.disabled = false;
  updateExportControls();
}

function updateExportControls() {
  const isVideo = currentSource && currentSource.kind === "video";
  const usesFrameScope = isVideo && ["png", "jpeg"].includes(exportFormat.value);
  transparencyOption.hidden = exportFormat.value !== "png";
  frameScope.hidden = !usesFrameScope;
  frameScopeLabel.hidden = !usesFrameScope;
  if (exportFormat.value === "mp4") frameScope.value = "all";
  const hasValidCharacterRamp = asciiStyle.value !== "custom" || Array.from(customRamp.value).length >= 2;
  downloadButton.disabled = !currentSource || asciiOutput.hidden || !hasValidCharacterRamp;
  copyButton.disabled = !currentSource || asciiOutput.hidden || !hasValidCharacterRamp;
  outputResolution.hidden = !currentSource || exportFormat.value === "txt";
  if (!outputResolution.hidden) {
    const { width, height } = getExportDimensions();
    outputResolution.textContent = `${width} × ${height}`;
  }
  downloadButton.querySelector("span").textContent = `Export ${exportFormat.value ? `.${exportFormat.value}` : "file"}`;
  if (usesFrameScope && frameScope.value === "all") {
    downloadButton.querySelector("span").textContent = `Export .${exportFormat.value} ZIP`;
  } else if (exportFormat.value === "mp4") {
    downloadButton.querySelector("span").textContent = `Export video (${getVideoCompressionPreset().label})`;
  }
  const colors = getFrameColors();
  asciiOutput.style.color = colors.character;
  asciiOutput.style.backgroundColor = exportFormat.value === "png" && transparentBackground.checked
    ? "transparent"
    : colors.background;
}

function handleFile(file) {
  if (!file) return;
  const isMp4 = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
  const isImage = file.type.startsWith("image/");
  if (!isImage && !isMp4) {
    setError("Choose an image or an MP4 video.");
    return;
  }
  const maximumSize = isMp4 ? maximumVideoSize : maximumImageSize;
  if (file.size > maximumSize) {
    setError(`This ${isMp4 ? "video" : "image"} is too large. Maximum size is ${isMp4 ? "200" : "20"} MB.`);
    return;
  }

  setError("");
  const generation = ++loadGeneration;
  const objectUrl = URL.createObjectURL(file);
  if (isMp4) {
    loadVideo(objectUrl, generation);
  } else {
    loadImage(objectUrl, generation);
  }
}

function loadImage(objectUrl, generation) {
  const image = new Image();
  image.onload = () => {
    if (generation !== loadGeneration) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    replaceSource({ kind: "image", media: image, objectUrl });
    renderAscii();
    setError("");
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (generation === loadGeneration) setError("This image could not be opened. Try a different file.");
  };
  image.src = objectUrl;
}

function loadVideo(objectUrl, generation) {
  const video = document.createElement("video");
  video.controls = false;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.addEventListener("play", () => {
    playbackToggle.classList.add("is-playing");
    playbackToggle.setAttribute("aria-label", "Pause video");
    playbackToggle.title = "Pause video";
    updatePlaybackPreview(video, generation);
  });
  video.addEventListener("pause", () => {
    playbackToggle.classList.remove("is-playing");
    playbackToggle.setAttribute("aria-label", "Play video");
    playbackToggle.title = "Play video";
    currentTimeOutput.value = formatTime(video.currentTime);
    timelineSlider.value = String(video.currentTime);
    updateMediaPreview();
    renderAscii();
  });
  video.addEventListener("loadedmetadata", () => {
    if (generation !== loadGeneration) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      URL.revokeObjectURL(objectUrl);
      setError("This MP4 video has no usable timeline.");
      return;
    }
    if (!video.videoWidth || !video.videoHeight) {
      URL.revokeObjectURL(objectUrl);
      setError("This MP4 does not contain a video track.");
      return;
    }
    video.pause();
    timelineSlider.min = "0";
    timelineSlider.max = String(video.duration);
    timelineSlider.step = String(Math.max(0.01, video.duration / 1000));
    timelineSlider.value = "0";
    currentTimeOutput.value = formatTime(0);
    videoDurationOutput.value = formatTime(video.duration);
    replaceSource({ kind: "video", media: video, objectUrl });
    updateMediaPreview();
    setError("");
  });
  video.addEventListener("loadeddata", () => {
    if (generation !== loadGeneration) return;
    video.pause();
    updateMediaPreview();
    renderAscii();
  });
  video.addEventListener("seeked", () => {
    if (generation !== loadGeneration || !currentSource || currentSource.media !== video) return;
    currentTimeOutput.value = formatTime(video.currentTime);
    timelineSlider.value = String(video.currentTime);
    updateMediaPreview();
    renderAscii();
  });
  video.addEventListener("error", () => {
    URL.revokeObjectURL(objectUrl);
    if (generation === loadGeneration) {
      setError("This MP4 could not be decoded. Try an MP4 encoded with a browser-supported video codec.");
    }
  });
  video.src = objectUrl;
  video.load();
}

function updateMediaPreview() {
  if (!currentSource) return;
  const media = currentSource.media;
  if (currentSource.kind === "video" && media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  const dimensions = getSourceDimensions();
  const scale = Math.min(1, 640 / dimensions.width, 360 / dimensions.height);
  sourcePreview.width = Math.max(1, Math.round(dimensions.width * scale));
  sourcePreview.height = Math.max(1, Math.round(dimensions.height * scale));
  sourcePreview.style.backgroundColor = getFrameColors().background;
  const context = sourcePreview.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Your browser could not render the source preview.");
  context.clearRect(0, 0, sourcePreview.width, sourcePreview.height);
  drawSource(context, media, currentSource.kind, sourcePreview.width, sourcePreview.height);
  applyPreviewAdjustments(context, sourcePreview.width, sourcePreview.height);
}

function rotateMedia(degrees) {
  if (!currentSource) return;
  rotation = (rotation + degrees + 360) % 360;
  updateMediaPreview();
  renderAscii();
}

function updatePlaybackPreview(video, generation) {
  const frameInterval = 1000 / Math.min(getVideoFrameRate(), 24);
  let lastRenderedAt = -Infinity;
  const renderFrame = (now) => {
    if (generation !== loadGeneration || !currentSource || currentSource.media !== video || video.paused) return;
    if (now - lastRenderedAt >= frameInterval) {
      lastRenderedAt = now;
      currentTimeOutput.value = formatTime(video.currentTime);
      timelineSlider.value = String(video.currentTime);
      updateMediaPreview();
      renderAscii();
    }
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback((timestamp) => renderFrame(timestamp));
    } else {
      window.requestAnimationFrame(renderFrame);
    }
  };
  if (typeof video.requestVideoFrameCallback === "function") {
    video.requestVideoFrameCallback((timestamp) => renderFrame(timestamp));
  } else {
    window.requestAnimationFrame(renderFrame);
  }
}

function drawSource(context, media, kind, width, height) {
  context.save();
  if (rotation === 90 || rotation === 270) {
    context.translate(width / 2, height / 2);
    context.rotate(rotation * Math.PI / 180);
    context.drawImage(media, -height / 2, -width / 2, height, width);
  } else if (rotation === 180) {
    context.translate(width / 2, height / 2);
    context.rotate(Math.PI);
    context.drawImage(media, -width / 2, -height / 2, width, height);
  } else {
    context.drawImage(media, 0, 0, width, height);
  }
  context.restore();
}

function applyPreviewAdjustments(context, width, height) {
  const brightness = Number(brightnessLevel.value) * 1.275;
  const contrast = Number(contrastLevel.value) / 100;
  const shouldRemoveColor = removeColor.checked;
  const shouldInvert = invertTones.checked;
  if (brightness === 0 && contrast === 1 && !shouldRemoveColor && !shouldInvert) return;

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const keyColor = shouldRemoveColor
    ? [1, 3, 5].map((offset) => Number.parseInt(removedColor.value.slice(offset, offset + 2), 16))
    : null;
  const tolerance = Number(colorTolerance.value) * Math.sqrt(3) * 2.55;
  const toleranceSquared = tolerance ** 2;

  for (let pixel = 0; pixel < data.length; pixel += 4) {
    if (keyColor) {
      const redDifference = data[pixel] - keyColor[0];
      const greenDifference = data[pixel + 1] - keyColor[1];
      const blueDifference = data[pixel + 2] - keyColor[2];
      if (redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2 <= toleranceSquared) {
        data[pixel + 3] = 0;
        continue;
      }
    }

    for (let channel = 0; channel < 3; channel += 1) {
      const adjusted = Math.max(0, Math.min(255, (data[pixel + channel] + brightness - 128) * contrast + 128));
      data[pixel + channel] = shouldInvert ? 255 - adjusted : adjusted;
    }
  }

  context.putImageData(imageData, 0, 0);
}

function getActiveCharacterRamp() {
  if (asciiStyle.value === "custom") return Array.from(customRamp.value);
  return Array.from(characterStyles[asciiStyle.value] || characterStyles.classic);
}

function getSelectedFont() {
  const variants = fontStyles[asciiStyle.value];
  if (!variants) return null;
  return variants.find(({ family }) => family === fontVariant.value) || variants[0];
}

async function updateAsciiStyle() {
  const variants = fontStyles[asciiStyle.value];
  customRampControl.hidden = asciiStyle.value !== "custom";
  fontVariantControl.hidden = !variants || variants.length < 2;

  if (!variants) {
    asciiOutput.style.fontFamily = "var(--mono)";
    fontVariant.replaceChildren();
    renderAscii();
    return;
  }

  const previousFamily = fontVariant.value;
  fontVariant.replaceChildren(...variants.map(({ label, family }) => new Option(label, family)));
  if (variants.some(({ family }) => family === previousFamily)) fontVariant.value = previousFamily;
  const selectedFont = getSelectedFont();
  asciiOutput.style.fontFamily = `"${selectedFont.family}", var(--mono)`;
  const loadedFaces = await document.fonts.load(`100px "${selectedFont.family}"`);
  if (!loadedFaces.length) throw new Error(`The ${selectedFont.family} font could not be loaded.`);
  renderAscii();
}

function getCharacterWidthMetrics(characters) {
  if (!textMeasureContext) throw new Error("Your browser could not measure the selected characters.");
  const fontFamily = getComputedStyle(asciiOutput).fontFamily;
  const cacheKey = `${fontFamily}\n${characters.join("")}`;
  const cached = characterMetricsCache.get(cacheKey);
  if (cached) return cached;
  textMeasureContext.font = `100px ${fontFamily}`;
  const widths = new Map(characters.map((character) => [character, textMeasureContext.measureText(character).width]));
  const totalWidth = characters.reduce((sum, character) => sum + widths.get(character), 0);
  const metrics = {
    widths,
    averageWidth: totalWidth / characters.length / 100
  };
  if (characterMetricsCache.size >= 24) characterMetricsCache.delete(characterMetricsCache.keys().next().value);
  characterMetricsCache.set(cacheKey, metrics);
  return metrics;
}

function convertToAscii(media, kind) {
  const outputWidth = Number(characterDensity.value);
  const dimensions = getExportDimensions();
  const characters = getActiveCharacterRamp();
  if (characters.length < 2) {
    throw new Error("A custom character ramp must contain at least two characters.");
  }
  const { widths: characterWidths, averageWidth } = getCharacterWidthMetrics(characters);
  let outputHeight = Math.max(1, Math.round(outputWidth * dimensions.height / dimensions.width * averageWidth / 1.25));
  if (!conversionContext) throw new Error("Your browser could not process this media.");
  const lastIndex = characters.length - 1;
  const brightness = Number(brightnessLevel.value) * 1.275;
  const contrast = Number(contrastLevel.value) / 100;
  let result = "";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    conversionCanvas.width = outputWidth;
    conversionCanvas.height = outputHeight;
    conversionContext.clearRect(0, 0, outputWidth, outputHeight);
    drawSource(conversionContext, media, kind, outputWidth, outputHeight);

    const { data } = conversionContext.getImageData(0, 0, outputWidth, outputHeight);
    let characterWidthTotal = 0;
    result = "";
    const keyColor = removeColor.checked
      ? [1, 3, 5].map((offset) => Number.parseInt(removedColor.value.slice(offset, offset + 2), 16))
      : null;
    const tolerance = Number(colorTolerance.value) * Math.sqrt(3) * 2.55;
    const toleranceSquared = tolerance ** 2;

    for (let y = 0; y < outputHeight; y += 1) {
      for (let x = 0; x < outputWidth; x += 1) {
        const pixel = (y * outputWidth + x) * 4;
        if (keyColor) {
          const redDifference = data[pixel] - keyColor[0];
          const greenDifference = data[pixel + 1] - keyColor[1];
          const blueDifference = data[pixel + 2] - keyColor[2];
          const colorDistanceSquared = redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2;
          if (colorDistanceSquared <= toleranceSquared) {
            result += " ";
            characterWidthTotal += characterWidths.get(" ") ?? 60;
            continue;
          }
        }
        const alpha = data[pixel + 3] / 255;
        const sourceLuminance = (0.2126 * data[pixel] + 0.7152 * data[pixel + 1] + 0.0722 * data[pixel + 2]) * alpha
          + 255 * (1 - alpha);
        const brightenedLuminance = Math.max(0, Math.min(255, sourceLuminance + brightness));
        const adjustedLuminance = Math.max(0, Math.min(255, (brightenedLuminance - 128) * contrast + 128));
        const luminance = invertTones.checked ? 255 - adjustedLuminance : adjustedLuminance;
        const bitmapThreshold = (bitmapThresholds[y % 4][x % 4] + 0.5) / 16;
        let character;
        if (asciiStyle.value === "bitmap") {
          character = characters[luminance / 255 < bitmapThreshold ? 0 : 1];
        } else {
          let characterIndex = Math.round((luminance / 255) * lastIndex);
          if (asciiStyle.value === "geometric") {
            const texture = ((x * 7 + y * 13 + x * y * 3) % 3) - 1;
            characterIndex = Math.max(0, Math.min(lastIndex, characterIndex + texture));
          }
          character = characters[characterIndex];
        }
        result += character;
        characterWidthTotal += characterWidths.get(character);
      }
      if (y < outputHeight - 1) result += "\n";
    }

    const actualWidth = characterWidthTotal / (outputWidth * outputHeight) / 100;
    const adjustedHeight = Math.max(1, Math.round(outputWidth * dimensions.height / dimensions.width * actualWidth / 1.25));
    if (adjustedHeight === outputHeight) break;
    outputHeight = adjustedHeight;
  }
  return result;
}

function setAsciiOutputText(text) {
  const lines = text.split("\n");
  const columnCount = Math.max(1, ...lines.map((line) => [...line].length));
  const fragment = document.createDocumentFragment();
  lines.forEach((line) => {
    const row = document.createElement("span");
    row.className = "ascii-row";
    if (alignCharacters.checked) {
      row.classList.add("horizontal-align");
      row.style.setProperty("--ascii-columns", String(columnCount));
      const characters = [...line];
      for (let column = 0; column < columnCount; column += 1) {
        const cell = document.createElement("span");
        cell.textContent = characters[column] ?? "";
        row.append(cell);
      }
    } else {
      row.textContent = line;
    }
    fragment.append(row);
  });
  asciiOutput.replaceChildren(fragment);
}

function getEditableAscii() {
  const rows = asciiOutput.querySelectorAll(":scope > .ascii-row");
  if (rows.length) {
    return [...rows].map((row) => (
      row.querySelector("br, div, p") ? row.innerText : row.textContent
    )).join("\n").replace(/\r\n?/g, "\n");
  }
  return asciiOutput.innerText.replace(/\r\n?/g, "\n");
}

function renderAscii() {
  if (!currentSource) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    if (currentSource.kind === "video" && currentSource.media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    try {
      setAsciiOutputText(convertToAscii(currentSource.media, currentSource.kind));
      updateMediaPreview();
      asciiOutput.hidden = false;
      emptyState.hidden = true;
      updateAsciiDisplaySize();
      liveIndicator.textContent = currentSource.kind === "video" ? "FRAME" : "LIVE";
      liveIndicator.hidden = false;
      updateExportControls();
      setError("");
    } catch (error) {
      updateExportControls();
      setError(error.message);
    }
  });
}

timelineSlider.addEventListener("input", () => {
  if (!currentSource || currentSource.kind !== "video") return;
  const video = currentSource.media;
  const time = getPosterizedTime(Number(timelineSlider.value), video.duration);
  timelineSlider.value = String(time);
  currentTimeOutput.value = formatTime(time);
  if (Math.abs(video.currentTime - time) < 0.001) {
    updateMediaPreview();
    renderAscii();
    return;
  }
  video.pause();
  video.currentTime = time;
});
posterizeVideo.addEventListener("change", () => {
  posterizeRateControl.hidden = !posterizeVideo.checked;
  if (!currentSource || currentSource.kind !== "video") return;
  const video = currentSource.media;
  const time = getPosterizedTime(video.currentTime, video.duration);
  timelineSlider.value = String(time);
  currentTimeOutput.value = formatTime(time);
  if (Math.abs(video.currentTime - time) < 0.001) {
    updateMediaPreview();
    renderAscii();
  } else {
    video.pause();
    video.currentTime = time;
  }
  updateExportControls();
});
posterizeFrameRate.addEventListener("input", () => {
  posterizeFrameRateValue.value = `${posterizeFrameRate.value} fps`;
  if (!currentSource || currentSource.kind !== "video" || !posterizeVideo.checked) return;
  const video = currentSource.media;
  const time = getPosterizedTime(video.currentTime, video.duration);
  timelineSlider.value = String(time);
  currentTimeOutput.value = formatTime(time);
  if (Math.abs(video.currentTime - time) < 0.001) {
    updateMediaPreview();
    renderAscii();
  } else {
    video.pause();
    video.currentTime = time;
  }
  updateExportControls();
});
videoCompression.addEventListener("change", () => {
  updateExportControls();
});
exportResolution.addEventListener("change", () => {
  updateExportControls();
  updateAsciiDisplaySize();
});
randomFrameColors.addEventListener("change", () => {
  randomColorHueControl.hidden = !randomFrameColors.checked;
  if (randomFrameColors.checked) {
    const seed = new Uint32Array(1);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(seed);
      randomFrameColorSeed = seed[0];
    } else {
      randomFrameColorSeed = Math.floor(Math.random() * 0x100000000);
    }
  }
  updateExportControls();
  updateMediaPreview();
  renderAscii();
});
randomColorHue.addEventListener("input", () => {
  updateMediaPreview();
  renderAscii();
});
rotateLeftButton.addEventListener("click", () => rotateMedia(-90));
rotateRightButton.addEventListener("click", () => rotateMedia(90));
playbackToggle.addEventListener("click", async () => {
  if (!currentSource || currentSource.kind !== "video") return;
  const video = currentSource.media;
  if (video.paused) {
    try {
      if (video.ended) video.currentTime = 0;
      await video.play();
    } catch (error) {
      setError(`Video playback could not start: ${error.message}`);
    }
  } else {
    video.pause();
  }
});
window.addEventListener("resize", updateMediaPreview);
window.addEventListener("resize", updateAsciiDisplaySize);

function getSourceDimensions() {
  const width = currentSource.kind === "video" ? currentSource.media.videoWidth : currentSource.media.naturalWidth;
  const height = currentSource.kind === "video" ? currentSource.media.videoHeight : currentSource.media.naturalHeight;
  return rotation % 180 === 0 ? { width, height } : { width: height, height: width };
}

function getExportDimensions() {
  const source = getSourceDimensions();
  const longestEdge = exportResolution.value === "hd" ? 1920 : exportResolution.value === "4k" ? 3840 : 0;
  if (!longestEdge) return source;

  const scale = longestEdge / Math.max(source.width, source.height);
  return {
    width: Math.max(2, Math.round(source.width * scale / 2) * 2),
    height: Math.max(2, Math.round(source.height * scale / 2) * 2)
  };
}

function updateAsciiDisplaySize() {
  if (!currentSource || asciiOutput.hidden) return;
  const { width, height } = getExportDimensions();
  const scale = Math.min(artboard.clientWidth / width, artboard.clientHeight / height);
  const displayWidth = width * scale;
  const displayHeight = height * scale;
  const rows = [...asciiOutput.querySelectorAll(":scope > .ascii-row")];
  const lines = rows.length ? rows.map((row) => row.textContent) : getEditableAscii().split("\n");
  if (!textMeasureContext) throw new Error("Your browser could not measure the ASCII preview.");
  textMeasureContext.font = `100px ${getComputedStyle(asciiOutput).fontFamily}`;
  const lineWidths = lines.map((line) => textMeasureContext.measureText(line).width / 100);
  const longestLineWidth = Math.max(1, ...lineWidths);
  const characters = lines.map((line) => [...line]);
  const columnCount = Math.max(1, ...characters.map((line) => line.length));
  let widestCharacterWidth = 1;
  for (const line of characters) {
    for (const character of line) {
      widestCharacterWidth = Math.max(
        widestCharacterWidth,
        textMeasureContext.measureText(character).width / 100
      );
    }
  }
  const lineHeight = 1.25;
  const fontSize = alignCharacters.checked
    ? Math.min(displayWidth / (columnCount * widestCharacterWidth), displayHeight / (lines.length * lineHeight))
    : Math.min(displayWidth / longestLineWidth, displayHeight / (lines.length * lineHeight));

  asciiOutput.style.width = `${displayWidth}px`;
  asciiOutput.style.height = `${displayHeight}px`;
  asciiOutput.style.fontSize = `${fontSize}px`;
  asciiOutput.style.lineHeight = String(lineHeight);
  asciiOutput.classList.toggle("vertical-align", alignCharacters.checked);
  rows.forEach((row, index) => {
    if (alignCharacters.checked) {
      row.classList.add("horizontal-align");
      row.style.setProperty("--ascii-columns", String(columnCount));
      row.style.letterSpacing = "0px";
      row.style.textAlign = "";
      return;
    }
    row.classList.remove("horizontal-align");
    row.style.removeProperty("--ascii-columns");
    const characterCount = [...lines[index]].length;
    const extraSpacing = characterCount > 1
      ? Math.max(0, (displayWidth - lineWidths[index] * fontSize) / (characterCount - 1))
      : 0;
    row.style.letterSpacing = `${extraSpacing}px`;
    row.style.textAlign = characterCount > 1 ? "left" : "center";
  });
}

function paintAscii(context, text, width, height, fillBackground, colors = getFrameColors()) {
  const lines = text.split("\n");
  const padding = Math.round(Math.min(width, height) * 0.02);
  const fontFamily = getComputedStyle(asciiOutput).fontFamily;
  context.font = `100px ${fontFamily}`;
  const longestLineWidth = Math.max(1, ...lines.map((line) => context.measureText(line).width / 100));
  const targetLineWidth = width - padding * 2;
  const charactersByLine = lines.map((line) => [...line]);
  const columnCount = Math.max(1, ...charactersByLine.map((line) => line.length));
  let widestCharacterWidth = 1;
  for (const line of charactersByLine) {
    for (const character of line) {
      widestCharacterWidth = Math.max(widestCharacterWidth, context.measureText(character).width / 100);
    }
  }
  const fontSize = Math.max(0.1, alignCharacters.checked
    ? targetLineWidth / (columnCount * widestCharacterWidth)
    : targetLineWidth / longestLineWidth);
  const lineHeight = fontSize * 1.25;
  if (fillBackground) {
    context.fillStyle = colors.background;
    context.fillRect(0, 0, width, height);
  } else {
    context.clearRect(0, 0, width, height);
  }
  context.fillStyle = colors.character;
  context.font = `${fontSize}px ${fontFamily}`;
  context.textBaseline = "top";
  context.textAlign = "left";
  const textHeight = lines.length * lineHeight;
  const startY = alignCharacters.checked
    ? (lines.length > 1 ? padding : (height - lineHeight) / 2)
    : Math.max(padding, (height - textHeight) / 2);
  lines.forEach((line, index) => {
    const lineWidth = context.measureText(line).width;
    if (lineWidth === 0) return;
    const rowY = alignCharacters.checked && lines.length > 1
      ? padding + index * Math.max(0, height - padding * 2 - lineHeight) / (lines.length - 1)
      : startY + index * lineHeight;
    if (alignCharacters.checked) {
      const cellWidth = targetLineWidth / columnCount;
      charactersByLine[index].forEach((character, column) => {
        if (!character.trim()) return;
        const characterWidth = context.measureText(character).width;
        const x = padding + column * cellWidth + (cellWidth - characterWidth) / 2;
        context.fillText(character, x, rowY);
      });
      return;
    }
    context.save();
    context.translate(padding, rowY);
    context.scale(targetLineWidth / lineWidth, 1);
    context.fillText(line, 0, 0);
    context.restore();
  });
}

function canvasFromAscii(text, format, useTransparentBackground = transparentBackground.checked, dimensions = getExportDimensions(), colors = getFrameColors()) {
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
    throw new Error("This media resolution exceeds the maximum canvas size supported by your browser.");
  }
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not render the exported artwork at the source resolution.");

  const fillBackground = format === "jpeg" || (format === "png" && !useTransparentBackground);
  paintAscii(context, text, canvas.width, canvas.height, fillBackground, colors);
  return canvas;
}

function canvasBlob(canvas, format) {
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`The browser could not create a ${format.toUpperCase()} file.`));
    }, mimeType, 0.92);
  });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function makeZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data);
    if (data.length > 0xffffffff || offset + 30 + name.length + data.length > 0xffffffff) {
      throw new Error("These frames exceed the maximum size supported by a ZIP archive.");
    }
    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

function seekVideo(video, time) {
  if (Math.abs(video.currentTime - time) < 0.001) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while reading a video frame."));
    }, 10000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The video frame could not be decoded."));
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.pause();
    video.currentTime = time;
  });
}

async function exportFrameArchive(format) {
  const video = currentSource.media;
  const originalTime = video.currentTime;
  const frameRate = getVideoFrameRate();
  const frameCount = Math.max(1, Math.ceil(video.duration * frameRate));
  if (frameCount > 65535) {
    throw new Error("This video is too long for a single frame ZIP archive. Use MP4 export instead.");
  }
  const files = [];

  try {
    for (let frame = 0; frame < frameCount; frame += 1) {
      const time = Math.min(frame / frameRate, Math.max(0, video.duration - 0.001));
      downloadButton.querySelector("span").textContent = `Frame ${frame + 1}/${frameCount}`;
      await seekVideo(video, time);
      const art = convertToAscii(video, "video");
      const canvas = canvasFromAscii(art, format, transparentBackground.checked, getExportDimensions(), getFrameColors(time));
      const blob = await canvasBlob(canvas, format);
      files.push({
        name: `frame-${String(frame + 1).padStart(5, "0")}.${format}`,
        blob
      });
      updateExportProgress(
        ((frame + 1) / frameCount) * 95,
        `Rendering frame ${frame + 1} of ${frameCount}…`,
        "Rendering frames"
      );
      if (frame % 8 === 0) await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
    updateExportProgress(97, "Packing rendered frames into a ZIP file…", "Creating archive");
    saveBlob(await makeZip(files), `ascii-frames-${format}.zip`);
    updateExportProgress(100, "Your frame archive is ready.", "Complete");
  } finally {
    await seekVideo(video, originalTime);
    timelineSlider.value = String(originalTime);
    currentTimeOutput.value = formatTime(originalTime);
    updateMediaPreview();
    renderAscii();
  }
}

function waitForRecorderStop(recorder, chunks) {
  return new Promise((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: recorder.mimeType })), { once: true });
    recorder.addEventListener("error", () => reject(new Error("MP4 encoding failed in this browser.")), { once: true });
  });
}

async function exportVideo() {
  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported("video/mp4")) {
    throw new Error("MP4 export is not supported by this browser. Try a browser with MP4 MediaRecorder support.");
  }
  const video = currentSource.media;
  const originalTime = video.currentTime;
  const frameRate = getVideoFrameRate();
  const { width, height } = getExportDimensions();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  if (canvas.width !== width || canvas.height !== height) {
    throw new Error("This video resolution exceeds the maximum canvas size supported by your browser.");
  }
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create the MP4 video canvas.");
  const stream = canvas.captureStream(0);
  const [track] = stream.getVideoTracks();
  if (!track || typeof track.requestFrame !== "function") {
    stream.getTracks().forEach((streamTrack) => streamTrack.stop());
    throw new Error("This browser cannot encode frame-by-frame MP4 video.");
  }
  const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.640028")
    ? "video/mp4;codecs=avc1.640028"
    : MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E")
      ? "video/mp4;codecs=avc1.42E01E"
      : "video/mp4";
  const videoBitsPerSecond = getVideoCompressionPreset().megabitsPerSecond * 1000000;
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond });
  const chunks = [];
  const recording = waitForRecorderStop(recorder, chunks);
  recording.catch(() => {});
  const frameCount = Math.max(1, Math.ceil(video.duration * frameRate));
  let started = false;

  try {
    recorder.start();
    started = true;
    const recordingStartedAt = performance.now();
    for (let frame = 0; frame < frameCount; frame += 1) {
      const time = Math.min(frame / frameRate, Math.max(0, video.duration - 0.001));
      downloadButton.querySelector("span").textContent = `Encoding ${frame + 1}/${frameCount}`;
      updateExportProgress(
        (frame / frameCount) * 98,
        randomFrameColors.checked
          ? `Encoding frame ${frame + 1} of ${frameCount} with reduced compression…`
          : `Encoding frame ${frame + 1} of ${frameCount}…`,
        "Encoding MP4"
      );
      await seekVideo(video, time);
      const art = convertToAscii(video, "video");
      paintAscii(context, art, canvas.width, canvas.height, true, getFrameColors(time));
      track.requestFrame();
      const nextFrameDeadline = ((frame + 1) / frameRate) * 1000;
      const remainingFrameTime = nextFrameDeadline - (performance.now() - recordingStartedAt);
      if (remainingFrameTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingFrameTime));
      }
    }
    const recordingDurationSeconds = (performance.now() - recordingStartedAt) / 1000;
    recorder.stop();
    updateExportProgress(99, "Finalizing the MP4 file…", "Finalizing");
    const blob = await recording;
    if (!blob.size || !blob.type.includes("mp4")) {
      throw new Error("The browser did not produce a valid MP4 file.");
    }
    saveBlob(blob, "ascii-art.mp4");
    updateExportProgress(100, "Your MP4 is ready to download.", "Complete");
    const averageFileRate = recordingDurationSeconds > 0
      ? (blob.size * 8) / recordingDurationSeconds / 1000000
      : 0;
    const preset = getVideoCompressionPreset();
    const summary = `Last export: ${getVideoResolutionLabel()} (${width} × ${height}) · ${preset.label} · ${preset.megabitsPerSecond} Mbps target · approx. ${averageFileRate.toFixed(2)} Mbps average · ${formatFileSize(blob.size)}.`;
    videoExportStats.textContent = summary;
    videoExportStats.hidden = false;
    return `MP4 ready · ${summary} Actual rate depends on content.`;
  } catch (error) {
    if (started && recorder.state !== "inactive") recorder.stop();
    if (started) await recording.catch(() => {});
    throw error;
  } finally {
    stream.getTracks().forEach((streamTrack) => streamTrack.stop());
    await seekVideo(video, originalTime);
    timelineSlider.value = String(originalTime);
    currentTimeOutput.value = formatTime(originalTime);
    updateMediaPreview();
    renderAscii();
  }
}

async function exportCurrent() {
  if (!currentSource || asciiOutput.hidden) return;
  const format = exportFormat.value;
  if (format === "txt") {
    saveBlob(new Blob([getEditableAscii()], { type: "text/plain;charset=utf-8" }), "ascii-art.txt");
    updateExportProgress(100, "Your text file is ready to download.", "Complete");
    return;
  }
  if (format === "mp4") {
    return await exportVideo();
  }
  if (currentSource.kind === "video" && frameScope.value === "all") {
    await exportFrameArchive(format);
    return;
  }
  const canvas = canvasFromAscii(getEditableAscii(), format);
  saveBlob(await canvasBlob(canvas, format), `ascii-art.${format}`);
  updateExportProgress(100, "Your image is ready to download.", "Complete");
}

dropzone.addEventListener("click", (event) => {
  if (event.target !== changeImageButton) imageInput.click();
});
dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    imageInput.click();
  }
});
imageInput.addEventListener("change", () => {
  handleFile(imageInput.files[0]);
  imageInput.value = "";
});
changeImageButton.addEventListener("click", (event) => {
  event.stopPropagation();
  imageInput.click();
});

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
  });
}
dropzone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(getEditableAscii());
    copyButton.setAttribute("aria-label", "Copied ASCII art");
    copyButton.title = "Copied!";
    window.setTimeout(() => {
      copyButton.setAttribute("aria-label", "Copy ASCII art");
      copyButton.title = "Copy to clipboard";
    }, 1500);
  } catch (error) {
    setError("Clipboard access was blocked. You can select and copy the art directly.");
  }
});

asciiOutput.addEventListener("input", () => {
  liveIndicator.textContent = "EDITED";
  updateAsciiDisplaySize();
});
alignCharacters.addEventListener("change", () => {
  if (asciiOutput.hidden) return;
  setAsciiOutputText(getEditableAscii());
  updateAsciiDisplaySize();
});
exportFormat.addEventListener("change", updateExportControls);
frameScope.addEventListener("change", updateExportControls);
transparentBackground.addEventListener("change", updateExportControls);
characterColor.addEventListener("input", updateExportControls);
backgroundColor.addEventListener("input", () => {
  updateExportControls();
  updateMediaPreview();
});
randomizeColorsButton.addEventListener("click", randomizeColors);
characterDensity.addEventListener("input", () => {
  densityValue.value = characterDensity.value;
  renderAscii();
});
brightnessLevel.addEventListener("input", () => {
  const value = Number(brightnessLevel.value);
  brightnessValue.value = value > 0 ? `+${value}` : String(value);
  updateMediaPreview();
  renderAscii();
});
contrastLevel.addEventListener("input", () => {
  contrastValue.value = `${contrastLevel.value}%`;
  updateMediaPreview();
  renderAscii();
});
asciiStyle.addEventListener("change", async () => {
  try {
    await updateAsciiStyle();
    setError("");
  } catch (error) {
    setError(error.message);
  }
});
fontVariant.addEventListener("change", async () => {
  try {
    await updateAsciiStyle();
    setError("");
  } catch (error) {
    setError(error.message);
  }
});
customRamp.addEventListener("input", renderAscii);
removeColor.addEventListener("change", () => {
  removeColorSettings.hidden = !removeColor.checked;
  removedColor.disabled = !removeColor.checked;
  colorTolerance.disabled = !removeColor.checked;
  updateMediaPreview();
  renderAscii();
});
invertTones.addEventListener("change", () => {
  updateMediaPreview();
  renderAscii();
});
removedColor.addEventListener("input", () => {
  updateMediaPreview();
  renderAscii();
});
colorTolerance.addEventListener("input", () => {
  colorToleranceValue.value = colorTolerance.value;
  updateMediaPreview();
  renderAscii();
});

downloadButton.addEventListener("click", async () => {
  if (downloadButton.disabled) return;
  const previousLabel = downloadButton.querySelector("span").textContent;
  downloadButton.disabled = true;
  exportFormat.disabled = true;
  frameScope.disabled = true;
  transparentBackground.disabled = true;
  characterColor.disabled = true;
  backgroundColor.disabled = true;
  randomizeColorsButton.disabled = true;
  posterizeVideo.disabled = true;
  posterizeFrameRate.disabled = true;
  exportResolution.disabled = true;
  videoCompression.disabled = true;
  randomFrameColors.disabled = true;
  randomColorHue.disabled = true;
  asciiStyle.disabled = true;
  fontVariant.disabled = true;
  customRamp.disabled = true;
  removeColor.disabled = true;
  removedColor.disabled = true;
  colorTolerance.disabled = true;
  characterDensity.disabled = true;
  brightnessLevel.disabled = true;
  contrastLevel.disabled = true;
  invertTones.disabled = true;
  alignCharacters.disabled = true;
  timelineSlider.disabled = true;
  rotateLeftButton.disabled = true;
  rotateRightButton.disabled = true;
  playbackToggle.disabled = true;
  downloadButton.querySelector("span").textContent = "Preparing export…";
  setError("");
  let exportSucceeded = false;
  try {
    await showExportProgress();
    const completionMessage = await exportCurrent();
    exportSucceeded = true;
    await finishExportProgress(exportSucceeded, completionMessage);
  } catch (error) {
    setError(error.message);
  } finally {
    if (!exportSucceeded) await finishExportProgress(false);
    downloadButton.disabled = false;
    exportFormat.disabled = false;
    frameScope.disabled = false;
    transparentBackground.disabled = false;
    characterColor.disabled = false;
    backgroundColor.disabled = false;
    randomizeColorsButton.disabled = false;
    posterizeVideo.disabled = false;
    posterizeFrameRate.disabled = false;
    exportResolution.disabled = false;
    videoCompression.disabled = false;
    randomFrameColors.disabled = false;
    randomColorHue.disabled = false;
    asciiStyle.disabled = false;
    fontVariant.disabled = false;
    customRamp.disabled = false;
    removeColor.disabled = false;
    removedColor.disabled = !removeColor.checked;
    colorTolerance.disabled = !removeColor.checked;
    characterDensity.disabled = false;
    brightnessLevel.disabled = false;
    contrastLevel.disabled = false;
    invertTones.disabled = false;
    alignCharacters.disabled = false;
    timelineSlider.disabled = false;
    rotateLeftButton.disabled = false;
    rotateRightButton.disabled = false;
    playbackToggle.disabled = !currentSource || currentSource.kind !== "video";
    updateExportControls();
    if (!currentSource) downloadButton.querySelector("span").textContent = previousLabel;
    downloadButton.focus();
  }
});
