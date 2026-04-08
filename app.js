import OnirixEmbedSDK from "https://cdn.jsdelivr.net/npm/@onirix/embed-sdk@1.18.1/+esm";

// URL directa obtenida desde Share > Insertar en Onirix Studio.
// Si pruebas desde un dominio o puerto local distinto, ese origen debe estar permitido en Onirix.
const ONIRIX_EMBED_URL =
  "https://player.onirix.com/projects/d5cc1c4c40fe47149ba37369779d3ccb/webar?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0MzEyLCJwcm9qZWN0SWQiOjEzOTg0OCwicm9sZSI6MywiaWF0IjoxNzc1NDg5MDMzfQ.ZM5IRmrtYW64-l6pWypLNUKSz60kohRl4bWyvEC9M6A&background=%23E3E1E5&preview=false&hide_controls=false&ar_button=false";

// Separacion de responsabilidades:
// - Onirix Studio: superficie AR, escena, player_root, robot_onirix, tuercas y audios.
// - Este proyecto web: registro, instrucciones, HUD, joystick, tiempo y puntaje.

const PLAYER_ROOT = "player_root";
const ROBOT_MODEL = "robot_onirix";
const ROBOT_YAW_OFFSET = Math.PI * 1.2 - Math.PI / 2;
const MUSIC_TRACK = "onir-ix-theme_v2";
const GOLD_SOUND = "golden-nut-catch";
const METAL_SOUND = "metal-nut-catch";
const SPAWN_INTERVAL_MS = 1400;
const MAX_ACTIVE_COINS = 1;
const QUIZ_TRIGGER_SCORE = 5;
const QUIZ_FEEDBACK_DELAY_MS = 900;
const QUIZ_REMINDER_DELAY_MS = 5000;
const COIN_PICKUP_RADIUS = 0.3;
const PLAYER_MOVE_SPEED = 0.035;
const ROBOT_COLLISION_OFFSETS = [
  { x: 0, z: 0 },
  { x: 0, z: 0.04 },
  { x: 0.035, z: 0 },
  { x: -0.035, z: 0 }
];
const SPAWN_BOUNDS = {
  x: 0.55,
  z: 0.85
};
const NUTS = [
  "onirix_nut_x",
  "onirix_nut_x1",
  "onirix_nut_x2",
  "onirix_nut_x3",
  "onirix_nut_x4",
  "onirix_nut_x5_GOLD"
];
const QUIZ_QUESTIONS = [
  {
    question: "¿Cuál es el nombre de la nueva fragancia Goddess?",
    options: ["Amber Vanilla EDP Intense", "Sunset Vanilla EDP Intense", "Amber Vanilla EDT Intense"],
    correctIndex: 0,
    reminder: "El nombre de la nueva fragancia Goddess es Amber Vanilla EDP Intense"
  },
  {
    question: "¿De cuántas vainillas se compone Goddess Amber Vanilla?",
    options: ["3", "4", "6"],
    correctIndex: 1,
    reminder: "La fragancia Goddess Amber Vanilla se compone de 4 vainillas"
  },
  {
    question: "¿Cuáles son los ingredientes principales de Goddess Amber Vanilla?",
    options: [
      "Esencia de lavanda y miel de maple, cuarteto de extracto de vainilla, acorde ambarado",
      "Esencia de lavanda, trio de vainilla, madera de cedro",
      "Acorde de frambuesa y lavanda, cuarteto de vainilla, sándalo"
    ],
    correctIndex: 0,
    reminder:
      "Los ingredientes principales de Goddess Amber Vanilla son Esencia de lavanda y miel de maple, cuarteto de extracto de vainilla, acorde ambarado"
  },
  {
    question: "¿Quién es la imagen de Burberry Goddess?",
    options: ["Emma Watson", "Emma Stone", "Emma Mackey"],
    correctIndex: 2,
    reminder: "La imagen de Goddess Amber Vanilla es Emma Mackey"
  },
  {
    question: "¿Cuál es la fragancia más intensa de la franquicia Goddess?",
    options: ["Goddess EDPI", "Goddess Parfum", "Goddess Amber Vanilla EDPI"],
    correctIndex: 1,
    reminder: "La fragancia más intensa de la franquicia Goddess es Goddess Parfum"
  },
  {
    question: "¿A qué familia olfativa pertenece Goddess Amber Vanilla?",
    options: ["Gourmand Aromático Ambarado", "Floral", "Frutal"],
    correctIndex: 0,
    reminder: "Goddess Amber Vanilla pertenece a la familia Gourmand Aromático Ambarado"
  },
  {
    question:
      "¿Cuáles son las características que describen la nueva personalidad de Goddess Amber Vanilla?",
    options: ["Sofisticada, Seductora, Indulgente", "Confianza, Fuerza, Bondad", "Asertividad, Poder, Bondad"],
    correctIndex: 0,
    reminder:
      "Las características de la nueva personalidad de Goddess Amber Vanilla son sofisticada, seductora e indulgente"
  },
  {
    question:
      "¿Cuál es la diferencia visual entre el frasco de Goddess Amber Vanilla y el de Goddess Parfum?",
    options: ["Forma del frasco", "El color del jugo", "El material del frasco"],
    correctIndex: 1,
    reminder: "La diferencia entre Goddess Amber Vanilla y Goddess Parfum es el color del jugo"
  },
  {
    question: "¿Cuál es el tipo de extracto de la cuarta vainilla de Goddess Amber Vanilla?",
    options: ["Infusión de Vainilla", "Caviar de Vainilla", "Vainilla Tostada"],
    correctIndex: 2,
    reminder: "El tipo de extracto de la cuarta vainilla de Goddess Amber Vanilla es Vainilla Tostada"
  },
  {
    question: "Menciona las características de la vainilla tostada",
    options: ["Dulce", "Adictiva", "Todas las anteriores"],
    correctIndex: 2,
    reminder: "Las características de la vainilla tostada es Dulce y Adictiva"
  }
];

const ui = {
  arShell: document.getElementById("ar-shell"),
  onirixFrame: document.getElementById("visor"),
  registerScreen: document.getElementById("registerScreen"),
  instructionsScreen: document.getElementById("instructionsScreen"),
  instructionsCarousel: document.getElementById("instructionsCarousel"),
  instructionsTrack: document.getElementById("instructionsTrack"),
  waitingScreen: document.getElementById("waitingScreen"),
  waitingVideo: document.getElementById("waitingVideo"),
  placementGuide: document.getElementById("placementGuide"),
  hud: document.getElementById("hud"),
  joystick: document.getElementById("joystick"),
  quizScreen: document.getElementById("quizScreen"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  debugPanel: document.getElementById("debugPanel"),
  debugText: document.getElementById("debugText"),
  debugHideBtn: document.getElementById("debugHideBtn"),
  debugSpawnBtn: document.getElementById("debugSpawnBtn"),
  end: document.getElementById("end"),
  score: document.getElementById("score"),
  time: document.getElementById("time"),
  endTitle: document.getElementById("endTitle"),
  endPlayerId: document.getElementById("endPlayerId"),
  status: document.getElementById("statusText"),
  configStatus: document.getElementById("configStatus"),
  registerBtn: document.getElementById("registerBtn"),
  continueBtn: document.getElementById("continueBtn"),
  startExperienceBtn: document.getElementById("startExperienceBtn"),
  restartBtn: document.getElementById("restartBtn"),
  registerError: document.getElementById("registerError"),
  firstNameInput: document.getElementById("firstNameInput"),
  lastNameInput: document.getElementById("lastNameInput"),
  base: document.getElementById("joyBase"),
  knob: document.getElementById("joyKnob")
};

const state = {
  sdk: null,
  sdkReady: false,
  sceneReady: false,
  canPlace: false,
  running: false,
  playerName: "",
  score: 0,
  time: 0,
  timer: null,
  loop: null,
  spawnTimer: null,
  input: { x: 0, y: 0 },
  playerInitialPos: { x: 0, y: 0, z: 0 },
  playerInitialRot: { x: 0, y: 0, z: 0 },
  playerRootOid: null,
  playerPos: { x: 0, y: 0, z: 0 },
  playerYaw: 0,
  robotVisualOffset: { x: 0, z: 0 },
  robotAnim: null,
  animPlaying: false,
  quizActive: false,
  quizAnswered: false,
  quizTriggeredAtScore: null,
  currentQuestion: null,
  collectedCount: 0,
  nuts: [],
  activeNut: null,
  configValid: Boolean(ONIRIX_EMBED_URL),
  lastEvent: "BOOT",
  iframeLoaded: false,
  sdkConnectResolved: false,
  onirixMessages: 0,
  flowStage: "register",
  collisionDebug: "Esperando colision...",
  debugActionLog: []
};

setupFrame();
setupUI();
setupJoystick();
setupSdk();
setupDiagnostics();
updateAppHeight();
window.addEventListener("resize", updateAppHeight);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateAppHeight);
}

function setupFrame() {
  if (state.configValid) {
    ui.onirixFrame.addEventListener("load", () => {
      state.iframeLoaded = true;
      setDebug("IFRAME_LOAD");
    });
    ui.onirixFrame.src = ONIRIX_EMBED_URL;
    return;
  }

  ui.configStatus.textContent =
    "Falta pegar el src de Share > Embed de Onirix Studio en ONIRIX_EMBED_URL dentro de app.js.";
  ui.configStatus.classList.remove("hidden");
  setStatus(
    "Configura ONIRIX_EMBED_URL con el iframe src de Onirix y luego vuelve a cargar la página."
  );
  setDebug("CONFIG_INVALID");
}

async function setupSdk() {
  if (!state.configValid) {
    return;
  }

  try {
    state.sdk = new OnirixEmbedSDK(ui.onirixFrame);
    setDebug("SDK_INSTANCE_CREATED");
    subscribeSdkEvents();
    await Promise.race([
      state.sdk.connect(),
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("SDK_CONNECT_TIMEOUT")), 10000);
      })
    ]);
    state.sdkConnectResolved = true;
    state.sdkReady = true;
    ui.continueBtn.disabled = false;
    ui.continueBtn.textContent = "Continuar";
    if (ui.configStatus) {
      ui.configStatus.classList.add("hidden");
    }
    setDebug("SDK_CONNECT_RESOLVED");
  } catch (error) {
    console.error(error);
    setDebug(`SDK_CONNECT_ERROR: ${error?.message || "UNKNOWN"}`);
    setStatus(
      `No se pudo conectar con Onirix Embed SDK. ${error?.message || "Revisa el iframe src y permisos del proyecto."}`
    );
    ui.configStatus.textContent =
      "No se pudo conectar al iframe de Onirix. Revisa que el src venga de Share > Embed y que el proyecto permita embebido.";
    ui.configStatus.classList.remove("hidden");
  }
}

function setupDiagnostics() {
  window.addEventListener("message", (event) => {
    if (typeof event.origin === "string" && event.origin.includes("onirix")) {
      state.onirixMessages += 1;
      if (state.flowStage !== "game") {
        setDebug(`POSTMESSAGE_ONIRIX_${state.onirixMessages}`);
      } else if (ui.debugText) {
        renderDebugText();
      }
    }
  });
}

function logDebugAction(message) {
  const stamped = `${new Date().toLocaleTimeString("es-MX", {
    hour12: false
  })} ${message}`;
  state.debugActionLog = [stamped, ...state.debugActionLog].slice(0, 4);
}

function subscribeSdkEvents() {
  const sdk = state.sdk;
  if (!sdk || sdk.__subscriptionsReady) return;
  sdk.__subscriptionsReady = true;

  sdk.subscribe(OnirixEmbedSDK.Events.READY, () => {
    setDebug("EVENT_READY");
    state.sdkReady = true;
    updateAppHeight();
    setAddButtonVisible(false);
    ui.continueBtn.disabled = false;
    ui.continueBtn.textContent = "Continuar";
    if (state.flowStage === "register") {
      showScreen(ui.registerScreen);
    }
    if (ui.configStatus) {
      ui.configStatus.classList.add("hidden");
    }
  });

  sdk.subscribe(OnirixEmbedSDK.Events.SCENE_LOAD_START, () => {
    setDebug("EVENT_SCENE_LOAD_START");
    setStatus("Colocando escena...");
  });

  sdk.subscribe(OnirixEmbedSDK.Events.SCENE_LOAD_END, (params) => {
    setDebug(`EVENT_SCENE_LOAD_END: ${params?.elements?.length || 0} elements`);
    stopAll();

    const elements = {};
    params.elements.forEach((element) => {
      elements[element.name] = element;
    });

    const playerRoot = elements[PLAYER_ROOT];
    const robotModel = elements[ROBOT_MODEL];

    if (!playerRoot || !robotModel) {
      setDebug("SCENE_LOAD_END_MISSING_REQUIRED_NODES");
      setStatus("No encontré player_root o robot_onirix en la escena.");
      return;
    }

    state.playerInitialPos = {
      x: playerRoot.tx || 0,
      y: playerRoot.ty || 0,
      z: playerRoot.tz || 0
    };
    state.playerRootOid = playerRoot.oid || null;

    state.playerInitialRot = {
      x: playerRoot.rx || 0,
      y: playerRoot.ry || 0,
      z: playerRoot.rz || 0
    };

    state.playerPos = { ...state.playerInitialPos };
    state.playerYaw = state.playerInitialRot.y || 0;
    state.robotVisualOffset = {
      x: (robotModel.tx || 0) - state.playerInitialPos.x,
      z: (robotModel.tz || 0) - state.playerInitialPos.z
    };
    state.robotAnim = robotModel.asset?.metadata?.animations?.[0]?.name || null;

    state.nuts = NUTS.map((name) => {
      const element = elements[name];
      if (!element) return null;

      return {
        name,
        oid: element.oid,
        assetOid: element.asset?.oid || null,
        x: element.tx || 0,
        y: element.ty || 0,
        z: element.tz || 0,
        origin: {
          x: element.tx || 0,
          y: element.ty || 0,
          z: element.tz || 0
        },
        scale: {
          x: element.sx || 1,
          y: element.sy || 1,
          z: element.sz || 1
        },
        parentOid: element.parentOid || null,
        value: name.includes("GOLD") ? 5 : 1,
        taken: false,
        active: false
      };
    }).filter(Boolean);

    const nutsAttachedToPlayer = state.nuts.some(
      (nut) => nut.parentOid && nut.parentOid === state.playerRootOid
    );
    if (nutsAttachedToPlayer) {
      setStatus(
        "Las tuercas parecen estar dentro de player_root en Onirix Studio. Eso hace que se muevan con el robot y rompe la colision."
      );
      setDebug("NUTS_PARENTED_TO_PLAYER_ROOT");
    }

    state.sceneReady = true;
    setDebug(`SCENE_READY: nuts=${state.nuts.length} canPlace=${state.canPlace}`);
    setAddButtonVisible(false);

    if (state.canPlace) {
      setDebug("SCENE_READY_CALLING_START_GAME");
      startGame();
    }
  });

  sdk.subscribe(OnirixEmbedSDK.Events.SCENE_LOST, () => {
    if (state.flowStage === "end") {
      return;
    }
    setDebug("EVENT_SCENE_LOST");
    stopAll();
    state.sceneReady = false;

    if (state.canPlace) {
      showScreen(ui.placementGuide);
      setAddButtonVisible(true);
      setStatus("Se perdió la escena. Vuelve a apuntar y toca +.");
    }
  });
}

function setupUI() {
  showScreen(ui.registerScreen);
  ui.continueBtn.disabled = true;
  ui.continueBtn.textContent = "Cargando visor...";
  prepareWaitingVideo();
  setupInstructionsCarousel();
  ui.firstNameInput?.addEventListener("input", () => {
    ui.registerError.classList.add("hidden");
  });
  ui.lastNameInput?.addEventListener("input", () => {
    ui.registerError.classList.add("hidden");
  });

  activateButton(ui.registerBtn, () => {
    const firstName = ui.firstNameInput?.value.trim() || "";
    const lastName = ui.lastNameInput?.value.trim() || "";

    if (!firstName || !lastName) {
      ui.registerError.classList.remove("hidden");
      return;
    }

    ui.registerError.classList.add("hidden");
    state.playerName = `${firstName} ${lastName}`;
    state.flowStage = "instructions";
    setDebug(`REGISTER_OK: playerName=${state.playerName}`);
    setAddButtonVisible(false);
    showScreen(ui.instructionsScreen);
  });

  activateButton(ui.continueBtn, () => {
    setDebug(`CONTINUE_CLICK: sdkReady=${state.sdkReady} sceneReady=${state.sceneReady}`);
    state.flowStage = "waiting";
    showScreen(ui.waitingScreen);
    return;
    if (!state.sdkReady) {
      setStatus(
        "Onirix todavía no está listo. Revisa ONIRIX_EMBED_URL o espera a que cargue el visor."
      );
      showScreen(ui.placementGuide);
      return;
    }

    state.canPlace = true;
    state.flowStage = "placement";
    setDebug("CAN_PLACE_TRUE");
    showScreen(ui.placementGuide);
    setAddButtonVisible(true);

    if (state.sceneReady) {
      setDebug("CONTINUE_CALLING_START_GAME");
      startGame();
    } else {
      setStatus("Apunta a una superficie plana y toca el botón + para colocar el juego.");
    }
  });

  activateButton(ui.startExperienceBtn, () => {
    setDebug(`START_EXPERIENCE_CLICK: sdkReady=${state.sdkReady} sceneReady=${state.sceneReady}`);
    if (!state.sdkReady) {
      setStatus(
        "Onirix todavÃ­a no estÃ¡ listo. Revisa ONIRIX_EMBED_URL o espera a que cargue el visor."
      );
      showScreen(ui.placementGuide);
      return;
    }

    state.canPlace = true;
    state.flowStage = "placement";
    setDebug("START_EXPERIENCE_CAN_PLACE_TRUE");
    showScreen(ui.placementGuide);
    setAddButtonVisible(true);

    if (state.sceneReady) {
      setDebug("START_EXPERIENCE_CALLING_START_GAME");
      startGame();
    } else {
      setStatus("Apunta a una superficie plana y toca el botÃ³n + para colocar el juego.");
    }
  });

  activateButton(ui.restartBtn, () => {
    location.reload();
  });

  if (ui.debugHideBtn) {
    activateButton(ui.debugHideBtn, () => {
      hideAllNutsForDebug();
    });
  }

  if (ui.debugSpawnBtn) {
    activateButton(ui.debugSpawnBtn, () => {
      spawnRandomCoin(true);
    });
  }
}

function setupJoystick() {
  const radius = 40;
  let active = false;
  let pointerId = null;

  function move(event) {
    if (!active || event.pointerId !== pointerId) return;

    const rect = ui.base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = event.clientX - centerX;
    let deltaY = event.clientY - centerY;

    const length = Math.hypot(deltaX, deltaY);
    if (length > radius) {
      deltaX = (deltaX / length) * radius;
      deltaY = (deltaY / length) * radius;
    }

    ui.knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    state.input.x = deltaX / radius;
    state.input.y = deltaY / radius;
  }

  function release(event) {
    if (event.pointerId !== pointerId) return;

    active = false;
    pointerId = null;
    state.input = { x: 0, y: 0 };
    ui.knob.style.transform = "translate(-50%, -50%)";
  }

  ui.base.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    active = true;
    pointerId = event.pointerId;
    move(event);
  });

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
}

function prepareWaitingVideo() {
  const video = ui.waitingVideo;
  if (!video) return;
  video.preload = "auto";
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
  try {
    video.load();
  } catch {}
}

function activateButton(element, handler) {
  let locked = false;

  const run = (event) => {
    if (element.disabled) return;
    event.preventDefault();
    event.stopPropagation();

    if (locked) return;
    locked = true;

    try {
      handler();
    } finally {
      window.setTimeout(() => {
        locked = false;
      }, 180);
    }
  };

  element.addEventListener("click", run, { passive: false });
  element.addEventListener("touchend", run, { passive: false });
  element.addEventListener("pointerup", run, { passive: false });
}

function updateAppHeight() {
  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

function setAddButtonVisible(visible) {
  document.body.classList.toggle("show-add-button", visible);
}

function setArExperienceVisible(visible) {
  if (ui.arShell) {
    ui.arShell.style.display = visible ? "block" : "none";
  }
}

function setStatus(message) {
  if (ui.status) ui.status.textContent = message;
}

function playWaitingVideo() {
  const video = ui.waitingVideo;
  if (!video) return;
  if (video.readyState < 2) {
    try {
      video.load();
    } catch {}
  }
  video.currentTime = 0;
  video.playbackRate = 1;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function stopWaitingVideo() {
  const video = ui.waitingVideo;
  if (!video) return;
  try {
    video.pause();
  } catch {}
}

function stopAll() {
  clearInterval(state.timer);
  clearInterval(state.loop);
  clearInterval(state.spawnTimer);
  state.timer = null;
  state.loop = null;
  state.spawnTimer = null;
  state.running = false;
  state.animPlaying = false;

  if (!state.sdk) return;

  try {
    state.sdk.stop(MUSIC_TRACK);
  } catch {}

  try {
    state.sdk.stopAnimation(ROBOT_MODEL);
  } catch {}
}

function hideAllScreens() {
  stopWaitingVideo();
  ui.registerScreen.classList.add("hidden");
  ui.instructionsScreen.classList.add("hidden");
  ui.waitingScreen.classList.add("hidden");
  ui.placementGuide.classList.add("hidden");
  ui.quizScreen.classList.add("hidden");
  ui.end.classList.add("hidden");
}

function showScreen(screen) {
  hideAllScreens();
  if (screen) screen.classList.remove("hidden");
  if (screen === ui.instructionsScreen) {
    resetInstructionsCarousel();
  }
  if (screen === ui.waitingScreen) {
    playWaitingVideo();
  }
  ui.hud.classList.add("hidden");
  ui.joystick.classList.add("hidden");
  if (ui.debugPanel) {
    ui.debugPanel.classList.add("hidden");
    ui.debugPanel.classList.remove("debug-panel-game");
  }
}

function setupInstructionsCarousel() {
  if (!ui.instructionsCarousel || !ui.instructionsTrack || !ui.continueBtn) return;

  const track = ui.instructionsTrack;
  let pendingFrame = null;
  let startX = 0;
  let startScrollLeft = 0;
  let pointerActive = false;

  const updateButtonState = () => {
    const width = track.clientWidth || 1;
    const index = Math.round(track.scrollLeft / width);
    const unlocked = index >= 2;
    ui.continueBtn.disabled = !unlocked;
    ui.continueBtn.classList.toggle("is-disabled", !unlocked);
    ui.continueBtn.setAttribute("aria-disabled", unlocked ? "false" : "true");
  };

  const onScroll = () => {
    if (pendingFrame) return;
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = null;
      updateButtonState();
    });
  };

  const snapToIndex = (index) => {
    const width = track.clientWidth || 1;
    const clamped = Math.max(0, Math.min(2, index));
    track.scrollTo({ left: clamped * width, behavior: "smooth" });
  };

  const onPointerDown = (event) => {
    event.preventDefault();
    pointerActive = true;
    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
    track.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!pointerActive) return;
    event.preventDefault();
    const delta = startX - event.clientX;
    track.scrollLeft = startScrollLeft + delta;
  };

  const onPointerUp = (event) => {
    if (!pointerActive) return;
    event.preventDefault();
    pointerActive = false;
    track.releasePointerCapture?.(event.pointerId);
    const width = track.clientWidth || 1;
    const delta = startX - event.clientX;
    const threshold = Math.min(80, width * 0.18);
    let targetIndex = Math.round(startScrollLeft / width);
    if (Math.abs(delta) > threshold) {
      targetIndex += delta > 0 ? 1 : -1;
    } else {
      targetIndex = Math.round(track.scrollLeft / width);
    }
    snapToIndex(targetIndex);
  };

  const onTouchStart = (event) => {
    if (!event.touches || event.touches.length === 0) return;
    pointerActive = true;
    startX = event.touches[0].clientX;
    startScrollLeft = track.scrollLeft;
  };

  const onTouchMove = (event) => {
    if (!pointerActive || !event.touches || event.touches.length === 0) return;
    const delta = startX - event.touches[0].clientX;
    track.scrollLeft = startScrollLeft + delta;
  };

  const onTouchEnd = (event) => {
    if (!pointerActive) return;
    pointerActive = false;
    const width = track.clientWidth || 1;
    const endX = event.changedTouches && event.changedTouches[0]
      ? event.changedTouches[0].clientX
      : startX;
    const delta = startX - endX;
    const threshold = Math.min(80, width * 0.18);
    let targetIndex = Math.round(startScrollLeft / width);
    if (Math.abs(delta) > threshold) {
      targetIndex += delta > 0 ? 1 : -1;
    } else {
      targetIndex = Math.round(track.scrollLeft / width);
    }
    snapToIndex(targetIndex);
  };

  ui.instructionsCarousel.addEventListener("pointerdown", onPointerDown);
  ui.instructionsCarousel.addEventListener("pointermove", onPointerMove);
  ui.instructionsCarousel.addEventListener("pointerup", onPointerUp);
  ui.instructionsCarousel.addEventListener("pointercancel", onPointerUp);
  ui.instructionsCarousel.addEventListener("touchstart", onTouchStart, { passive: true });
  ui.instructionsCarousel.addEventListener("touchmove", onTouchMove, { passive: true });
  ui.instructionsCarousel.addEventListener("touchend", onTouchEnd);
  ui.instructionsCarousel.addEventListener("touchcancel", onTouchEnd);

  track.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    const width = track.clientWidth || 1;
    const index = Math.round(track.scrollLeft / width);
    snapToIndex(index);
    updateButtonState();
  });
  updateButtonState();
}

function resetInstructionsCarousel() {
  if (!ui.instructionsTrack || !ui.continueBtn) return;
  ui.instructionsTrack.scrollLeft = 0;
  ui.continueBtn.disabled = true;
  ui.continueBtn.classList.add("is-disabled");
  ui.continueBtn.setAttribute("aria-disabled", "true");
}

function resetRoundState() {
  if (!state.sdk) return;

  state.score = 0;
  state.time = 0;
  state.input = { x: 0, y: 0 };
  state.playerPos = { ...state.playerInitialPos };
  state.playerYaw = state.playerInitialRot.y || 0;
  state.robotVisualOffset = { ...state.robotVisualOffset };
  state.quizActive = false;
  state.quizAnswered = false;
  state.quizTriggeredAtScore = null;
  state.currentQuestion = null;
  state.collectedCount = 0;
  state.activeNut = null;
  state.debugActionLog = [];

  state.nuts = state.nuts.map((nut) => ({
    ...nut,
    taken: false,
    active: false,
    x: nut.origin.x,
    y: nut.origin.y,
    z: nut.origin.z
  }));
  state.nuts.forEach((nut, index) => hideNut(nut, index));

  state.sdk.translateToPosition(
    PLAYER_ROOT,
    state.playerInitialPos.x,
    state.playerInitialPos.y,
    state.playerInitialPos.z,
    0.01,
    false
  );

  state.sdk.rotateTo(
    PLAYER_ROOT,
    state.playerInitialRot.x || 0,
    state.playerInitialRot.y || 0,
    state.playerInitialRot.z || 0,
    0.01,
    false
  );

  ui.score.textContent = "0";
  ui.time.textContent = "0";
  ui.knob.style.transform = "translate(-50%, -50%)";
  ui.quizFeedback.textContent = "";
  ui.quizFeedback.classList.add("hidden");
  ui.quizOptions.innerHTML = "";
}

function startGame() {
  if (!state.sdk) return;

  state.flowStage = "game";
  setArExperienceVisible(true);
  setDebug("START_GAME");
  stopAll();
  resetRoundState();
  setAddButtonVisible(false);

  state.running = true;

  hideAllScreens();
  ui.hud.classList.remove("hidden");
  ui.joystick.classList.remove("hidden");
  ui.debugPanel?.classList.add("hidden");

  try {
    state.sdk.play(MUSIC_TRACK);
  } catch {}

  state.timer = window.setInterval(() => {
    if (!state.running) return;

    state.time += 1;
    ui.time.textContent = String(state.time);
  }, 1000);

  state.loop = window.setInterval(() => {
    if (!state.running) return;
    updateMovement();
    checkCollisions();
  }, 80);

  spawnRandomCoin();
  state.spawnTimer = window.setInterval(() => {
    if (!state.running || state.quizActive) return;
    const activeCoins = state.nuts.filter((nut) => nut.active && !nut.taken).length;
    if (activeCoins < MAX_ACTIVE_COINS) {
      spawnRandomCoin();
    }
  }, SPAWN_INTERVAL_MS);
}

function updateMovement() {
  if (!state.sdk) return;

  const moveX = state.input.x * PLAYER_MOVE_SPEED;
  const moveZ = state.input.y * PLAYER_MOVE_SPEED;
  const moving = Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001;

  if (!moving) {
    if (state.animPlaying) {
      try {
        state.sdk.stopAnimation(ROBOT_MODEL);
      } catch {}
      state.animPlaying = false;
    }
    return;
  }

  const targetYaw = Math.atan2(moveX, moveZ) + ROBOT_YAW_OFFSET;
  state.playerPos.x += moveX;
  state.playerPos.z += moveZ;
  state.playerYaw = targetYaw;

  state.sdk.translate(PLAYER_ROOT, moveX, 0, moveZ, 0.05, false);

  state.sdk.rotateTo(
    PLAYER_ROOT,
    state.playerInitialRot.x || 0,
    targetYaw,
    state.playerInitialRot.z || 0,
    0.08,
    false
  );

  if (state.robotAnim && !state.animPlaying) {
    try {
      state.sdk.playAnimation(ROBOT_MODEL, state.robotAnim, true, false);
    } catch {}
    state.animPlaying = true;
  }
}

function checkCollisions() {
  if (!state.sdk) return;

  const activeNut = state.activeNut;
  if (!activeNut) {
    state.collisionDebug = "Sin tuerca activa";
    setDebug("COLLISION_IDLE");
    return;
  }

  let minDistance = Number.POSITIVE_INFINITY;
  const captured = ROBOT_COLLISION_OFFSETS.some((offset) => {
    const sampleOffsetX = state.robotVisualOffset.x + offset.x;
    const sampleOffsetZ = state.robotVisualOffset.z + offset.z;
    const rotatedX =
      sampleOffsetX * Math.cos(state.playerYaw) - sampleOffsetZ * Math.sin(state.playerYaw);
    const rotatedZ =
      sampleOffsetX * Math.sin(state.playerYaw) + sampleOffsetZ * Math.cos(state.playerYaw);
    const sampleX = state.playerPos.x + rotatedX;
    const sampleZ = state.playerPos.z + rotatedZ;
    const dx = activeNut.x - sampleX;
    const dz = activeNut.z - sampleZ;
    const distance = Math.hypot(dx, dz);
    if (distance < minDistance) {
      minDistance = distance;
    }
    return distance < COIN_PICKUP_RADIUS;
  });

  state.collisionDebug =
    `nut=${activeNut.name} | robot=(${state.playerPos.x.toFixed(2)}, ${state.playerPos.z.toFixed(2)}) ` +
    `| visualOffset=(${state.robotVisualOffset.x.toFixed(2)}, ${state.robotVisualOffset.z.toFixed(2)}) ` +
    `| nut=(${activeNut.x.toFixed(2)}, ${activeNut.z.toFixed(2)}) | min=${minDistance.toFixed(2)} | r=${COIN_PICKUP_RADIUS.toFixed(2)}`;
  setDebug(captured ? "COLLISION_CAPTURE" : "COLLISION_TRACKING");

  if (captured) {
    try {
      activeNut.taken = true;
      hideNut(activeNut, 0);
      logDebugAction(`hide ${activeNut.name}`);
    } catch {}

    state.activeNut = null;
    state.score += activeNut.value;
    state.collectedCount += 1;
    ui.score.textContent = String(state.collectedCount);

    try {
      state.sdk.play(activeNut.value === 5 ? GOLD_SOUND : METAL_SOUND);
    } catch {}

    maybeTriggerQuiz();

    if (!state.quizActive && state.running) {
      window.setTimeout(() => {
        if (state.running && !state.quizActive) {
          spawnRandomCoin();
        }
      }, 250);
    }
  }
}

function endRound() {
  state.flowStage = "end";
  setDebug(`END_ROUND: score=${state.score}`);
  stopAll();
  state.canPlace = false;
  state.sceneReady = false;
  setAddButtonVisible(false);
  setArExperienceVisible(false);
  showScreen(ui.end);
  ui.debugPanel?.classList.add("hidden");
  ui.endTitle.textContent = `Puntaje: ${state.score}`;
  ui.endPlayerId.textContent = `Jugador: ${state.playerName}`;
}

async function enableElement(elementRef) {
  if (!state.sdk) return;

  const targets = [];
  if (typeof elementRef?.name === "string" && elementRef.name) {
    targets.push({ label: `name:${elementRef.name}`, value: elementRef.name });
  }
  if (typeof elementRef?.oid === "string" && elementRef.oid) {
    targets.push({ label: `oid:${elementRef.oid}`, value: elementRef.oid });
  }

  let lastError = null;
  for (const target of targets) {
    try {
      await state.sdk.enable(target.value);
      logDebugAction(`enable_ok ${target.label}`);
      return target.label;
    } catch (error) {
      lastError = error;
      logDebugAction(`enable_fail ${target.label}: ${error?.message || "UNKNOWN"}`);
    }
  }

  throw lastError || new Error("ENABLE_NO_VALID_TARGET");
}

function disableElement(elementRef) {
  if (!state.sdk) return;

  const targets = [];
  if (typeof elementRef?.name === "string" && elementRef.name) {
    targets.push({ label: `name:${elementRef.name}`, value: elementRef.name });
  }
  if (typeof elementRef?.oid === "string" && elementRef.oid) {
    targets.push({ label: `oid:${elementRef.oid}`, value: elementRef.oid });
  }

  let lastError = null;
  for (const target of targets) {
    try {
      state.sdk.disable(target.value);
      logDebugAction(`disable_ok ${target.label}`);
      return target.label;
    } catch (error) {
      lastError = error;
      logDebugAction(`disable_fail ${target.label}: ${error?.message || "UNKNOWN"}`);
    }
  }

  if (lastError) {
    throw lastError;
  }
}

function setElementOpacity(elementRef, opacity) {
  if (!state.sdk || typeof state.sdk.setOpacity !== "function") return "skip:no_method";

  const targets = [];
  if (typeof elementRef?.name === "string" && elementRef.name) {
    targets.push({ label: `name:${elementRef.name}`, value: elementRef.name });
  }
  if (typeof elementRef?.oid === "string" && elementRef.oid) {
    targets.push({ label: `oid:${elementRef.oid}`, value: elementRef.oid });
  }

  let lastError = null;
  for (const target of targets) {
    try {
      state.sdk.setOpacity(target.value, opacity, 0.01);
      logDebugAction(`opacity_ok ${target.label}=${opacity}`);
      return target.label;
    } catch (error) {
      lastError = error;
      logDebugAction(`opacity_fail ${target.label}: ${error?.message || "UNKNOWN"}`);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return "skip:no_target";
}

async function spawnRandomCoin(force = false) {
  if (!state.sdk) return;
  if (state.activeNut && !force) return;

  try {
    state.nuts.forEach((nut) => {
      nut.active = false;
    });

    const candidates = state.nuts.filter((nut) => nut.oid);
    if (!candidates.length) {
      state.collisionDebug = "No hay tuercas validas para spawnear";
      setDebug("SPAWN_NO_NUTS");
      return;
    }

    if (force && state.activeNut) {
      hideNut(state.activeNut, 0);
      state.activeNut = null;
    }

    const inactiveCandidates = candidates.filter((nut) => !nut.active);
    const template =
      inactiveCandidates[Math.floor(Math.random() * inactiveCandidates.length)] ||
      candidates[Math.floor(Math.random() * candidates.length)];
    const spawnX = template.origin.x;
    const spawnY = template.origin.y;
    const spawnZ = template.origin.z;
    logDebugAction(`spawn_try ${template.name}`);

    for (const nut of state.nuts) {
      if (nut.name === template.name) continue;
      nut.active = false;
      try {
        await hideNut(nut);
      } catch {}
    }

    try {
      await enableElement(template);
    } catch (error) {
      throw new Error(`enable:${error?.message || "UNKNOWN"}`);
    }

    try {
      setElementOpacity(template, 1);
    } catch (error) {
      throw new Error(`opacity:${error?.message || "UNKNOWN"}`);
    }

    template.active = true;
    template.taken = false;
    template.x = spawnX;
    template.y = spawnY;
    template.z = spawnZ;
    state.activeNut = template;
    state.collisionDebug =
      `spawn=${template.name} | pos=(${spawnX.toFixed(2)}, ${spawnZ.toFixed(2)})`;
    logDebugAction(`spawn_ok ${template.name} @ ${spawnX.toFixed(2)}, ${spawnZ.toFixed(2)}`);
    setDebug("SPAWN_READY");
  } catch (error) {
    state.nuts = state.nuts.map((nut) => ({
      ...nut,
      active: false
    }));
    state.activeNut = null;
    state.collisionDebug = `Error spawneando tuerca: ${error?.message || "UNKNOWN"}`;
    logDebugAction(`spawn_error ${error?.message || "UNKNOWN"}`);
    setDebug("SPAWN_ERROR");
  }
}

async function hideNut(nut, index) {
  if (!state.sdk) return;

  nut.active = false;
  nut.taken = false;
  nut.x = nut.origin.x;
  nut.y = nut.origin.y;
  nut.z = nut.origin.z;

  try {
    disableElement(nut);
    setElementOpacity(nut, 0);
    logDebugAction(`hide_ok ${nut.name}`);
  } catch (error) {
    logDebugAction(`hide_error ${nut.name}: ${error?.message || "UNKNOWN"}`);
  }
}

function hideAllNutsForDebug() {
  state.activeNut = null;
  state.nuts.forEach((nut, index) => {
    hideNut(nut, index);
  });
  state.collisionDebug = "Debug: todas las tuercas ocultas";
  setDebug("DEBUG_HIDE_ALL");
}

function maybeTriggerQuiz() {
  if (state.quizActive) return;
  if (state.collectedCount === 0) return;
  if (state.collectedCount % QUIZ_TRIGGER_SCORE !== 0) return;
  if (state.quizTriggeredAtScore === state.collectedCount) return;

  state.quizTriggeredAtScore = state.collectedCount;
  state.quizActive = true;
  state.running = false;
  state.input = { x: 0, y: 0 };
  ui.knob.style.transform = "translate(-50%, -50%)";
  showQuiz();
}

function showQuiz() {
  const question =
    QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
  state.currentQuestion = question;
  ui.quizQuestion.textContent = question.question;
  ui.quizOptions.innerHTML = "";
  ui.quizFeedback.textContent = "";
  ui.quizFeedback.classList.add("hidden");
  ui.quizOptions.classList.remove("hidden");

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option-btn";
    button.textContent = option;
    activateButton(button, () => answerQuiz(index, button));
    ui.quizOptions.appendChild(button);
  });

  ui.quizScreen.classList.remove("hidden");
  ui.hud.classList.remove("hidden");
  ui.joystick.classList.add("hidden");
}

function answerQuiz(index, clickedButton) {
  const question = state.currentQuestion;
  if (!question || !state.quizActive) return;

  const optionButtons = Array.from(ui.quizOptions.querySelectorAll(".quiz-option-btn"));
  optionButtons.forEach((button) => {
    button.disabled = true;
  });

  const correct = index === question.correctIndex;
  clickedButton.classList.add(correct ? "correct" : "wrong");
  if (!correct && optionButtons[question.correctIndex]) {
    optionButtons[question.correctIndex].classList.add("correct");
  }

  if (correct) {
    ui.quizFeedback.textContent = "";
    ui.quizFeedback.classList.add("hidden");
    window.setTimeout(() => {
      ui.quizScreen.classList.add("hidden");
      state.quizActive = false;
      state.running = true;
      ui.hud.classList.remove("hidden");
      ui.joystick.classList.remove("hidden");
      spawnRandomCoin(true);
      setDebug(`QUIZ_ANSWERED: correct=${correct}`);
    }, QUIZ_FEEDBACK_DELAY_MS);
    return;
  }

  ui.quizOptions.classList.add("hidden");
  ui.quizFeedback.textContent = question.reminder || "Recuerda la información correcta.";
  ui.quizFeedback.classList.remove("hidden");
  window.setTimeout(() => {
    ui.quizScreen.classList.add("hidden");
    ui.quizOptions.classList.remove("hidden");
    state.quizActive = false;
    state.running = true;
    ui.hud.classList.remove("hidden");
    ui.joystick.classList.remove("hidden");
    spawnRandomCoin(true);
    setDebug(`QUIZ_ANSWERED: correct=${correct}`);
  }, QUIZ_REMINDER_DELAY_MS);
}

function setDebug(message) {
  state.lastEvent = message;
  renderDebugText();
  if (ui.debugPanel) {
    ui.debugPanel.classList.add("hidden");
    ui.debugPanel.classList.remove("debug-panel-game");
  }
}

function renderDebugText() {
  if (ui.debugText) {
    const nutSummary = state.nuts
      .map((nut) => `${nut.name}:${nut.active ? "A" : "h"}/${nut.taken ? "T" : "f"}`)
      .join(" ");
    const actionSummary = state.debugActionLog.length
      ? `\nops=${state.debugActionLog.join(" || ")}`
      : "";
    ui.debugText.textContent =
      `event=${state.lastEvent} | stage=${state.flowStage} | points=${state.score} | collected=${state.collectedCount}\n` +
      `sdkReady=${state.sdkReady} | sceneReady=${state.sceneReady} | running=${state.running} | msgs=${state.onirixMessages}\n` +
      `${state.collisionDebug}\n` +
      `activeNut=${state.activeNut?.name || "none"} | ${nutSummary}${actionSummary}`;
  }
}
