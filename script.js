document.addEventListener("DOMContentLoaded", () => {
 
  const loginPage = document.getElementById("loginPage");
  const appPage   = document.getElementById("appPage");
  const loginForm = document.getElementById("loginForm");
  const togglePwdBtn = document.getElementById("togglePwd");
  const themeToggle = document.getElementById("themeToggle");
  const unitToggle  = document.getElementById("unitToggle");

  const calcType = document.getElementById("calcType");
  const forms = {
    bmi:  document.getElementById("form-bmi"),
    bmr:  document.getElementById("form-bmr"),
    tdee: document.getElementById("form-tdee"),
    water:document.getElementById("form-water"),
    whr:  document.getElementById("form-whr")
  };
  const bmiChart = document.getElementById("bmiChart");
  const resultDiv = document.getElementById("result");
  const adviceDiv = document.getElementById("advice");

  
  function showWithAnimation(hideEl, showEl) {
    hideEl.classList.remove("fade-slide-enter-active");
    hideEl.classList.add("fade-exit");
    void hideEl.offsetWidth; 
    hideEl.classList.add("fade-exit-active");

    hideEl.addEventListener("transitionend", function onExit() {
      hideEl.removeEventListener("transitionend", onExit);
      hideEl.style.display = "none";
      hideEl.classList.remove("fade-exit", "fade-exit-active");

      showEl.style.display = "flex";
      showEl.classList.add("fade-slide-enter");
      requestAnimationFrame(() => {
        showEl.classList.add("fade-slide-enter-active");
        showEl.classList.remove("is-hidden");
      });
    });
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showWithAnimation(loginPage, appPage);
  });

  /* ========== Show/Hide password ========== */
  if (togglePwdBtn) {
    togglePwdBtn.addEventListener("click", () => {
      const pwd = document.getElementById("psw");
      if (!pwd) return;
      const toText = pwd.type === "password";
      pwd.type = toText ? "text" : "password";
      togglePwdBtn.textContent = toText ? "Hide" : "Show";
      togglePwdBtn.setAttribute("aria-pressed", String(toText));
    });
  }

  /* ========== Theme & unit toggles ========== */
  let useMetric = true; 
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark")
      ? "☀️ Light Mode" : "🌙 Dark Mode";
  });

  unitToggle.addEventListener("click", () => {
    useMetric = !useMetric;
    unitToggle.textContent = useMetric ? "Switch to ft/lbs" : "Switch to cm/kg";
    updateAllUnitLabels();
    clearOutputs();
  });

  function labelFor(id) { return document.querySelector(`label[for="${id}"]`); }
  function updateAllUnitLabels() {
    // BMI
    labelFor("height-bmi").textContent = useMetric ? "Height (cm)" : "Height (ft)";
    labelFor("weight-bmi").textContent = useMetric ? "Weight (kg)" : "Weight (lbs)";
    // BMR
    labelFor("height-bmr").textContent = useMetric ? "Height (cm)" : "Height (ft)";
    labelFor("weight-bmr").textContent = useMetric ? "Weight (kg)" : "Weight (lbs)";
    // TDEE
    labelFor("height-tdee").textContent = useMetric ? "Height (cm)" : "Height (ft)";
    labelFor("weight-tdee").textContent = useMetric ? "Weight (kg)" : "Weight (lbs)";
    // Water
    labelFor("weight-water").textContent = useMetric ? "Weight (kg)" : "Weight (lbs)";
    
  }

  /* ========== Calculator selection ========== */
  calcType.addEventListener("change", () => {
    showForm(calcType.value);
    clearOutputs();
  });
  function showForm(which) {
    Object.keys(forms).forEach(k => {
      forms[k].classList.toggle("hidden", k !== which);
    });
    bmiChart.classList.toggle("hidden", which !== "bmi");
  }
  showForm("bmi"); 

  
  function clearOutputs() {
    resultDiv.textContent = "";
    adviceDiv.textContent = "";
    document.querySelectorAll(".chart li").forEach(li => li.style.fontWeight = "400");
  }
  function validPos(n) { return !(isNaN(n) || n <= 0); }
  function showError(msg) {
    resultDiv.style.color = "#f44336";
    resultDiv.textContent = msg;
    adviceDiv.textContent = "";
  }

  
  const toKG = v => (useMetric ? v : v * 0.453592);      // lbs → kg if needed
  const toM  = v => (useMetric ? v / 100 : v * 0.3048);  // cm → m or ft → m

  /* ========== BMI ========== */
  forms.bmi.addEventListener("submit", (e) => {
    e.preventDefault();
    const h = parseFloat(document.getElementById("height-bmi").value);
    const w = parseFloat(document.getElementById("weight-bmi").value);
    if (!validPos(h) || !validPos(w)) return showError("Enter valid positive numbers.");

    const bmi = +(toKG(w) / (toM(h) ** 2)).toFixed(2);
    resultDiv.style.color = getBMIColor(bmi);
    resultDiv.textContent = `BMI: ${bmi}`;
    adviceDiv.textContent = getBMIAdvice(bmi);
    highlightBMICategory(bmi);
  });

  function getBMIColor(bmi) {
    if (bmi < 18.5) return "#ff9800";
    if (bmi < 25)   return "#4caf50";
    if (bmi < 30)   return "#ff5722";
    return "#f44336";
  }
  function getBMIAdvice(bmi) {
    if (bmi < 18.5) return "You're underweight. Try energy-dense, nutrient-rich meals and strength training.";
    if (bmi < 25)   return "Great! Maintain balanced diet, sleep, and regular activity.";
    if (bmi < 30)   return "Consider a small calorie deficit and consistent exercise (mix cardio + strength).";
    return "Focus on sustainable weight loss: diet quality, portion control, and professional guidance if needed.";
  }
  function highlightBMICategory(bmi) {
    const items = document.querySelectorAll(".chart li");
    items.forEach(li => li.style.fontWeight = "400");
    if (bmi < 18.5) items[0].style.fontWeight = "700";
    else if (bmi < 25) items[1].style.fontWeight = "700";
    else if (bmi < 30) items[2].style.fontWeight = "700";
    else items[3].style.fontWeight = "700";
  }

  /* ========== BMR (Mifflin–St Jeor) ========== */
  forms.bmr.addEventListener("submit", (e) => {
    e.preventDefault();
    const age = parseFloat(document.getElementById("age-bmr").value);
    const gender = document.getElementById("gender-bmr").value;
    const h = parseFloat(document.getElementById("height-bmr").value);
    const w = parseFloat(document.getElementById("weight-bmr").value);
    if (!validPos(age) || !validPos(h) || !validPos(w)) return showError("Enter valid positive numbers.");

    const heightCm = useMetric ? h : h * 30.48; 
    const weightKg = toKG(w);
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
    bmr = Math.round(bmr);

    resultDiv.style.color = "";
    resultDiv.textContent = `BMR: ${bmr} kcal/day`;
    adviceDiv.textContent = "BMR is rest energy use. For weight loss: modest deficit; for gain: small surplus. Pair with protein & resistance training.";
  });

  /* ========== TDEE ========== */
  forms.tdee.addEventListener("submit", (e) => {
    e.preventDefault();
    const age = parseFloat(document.getElementById("age-tdee").value);
    const gender = document.getElementById("gender-tdee").value;
    const h = parseFloat(document.getElementById("height-tdee").value);
    const w = parseFloat(document.getElementById("weight-tdee").value);
    const act = parseFloat(document.getElementById("activity-tdee").value);
    if (!validPos(age) || !validPos(h) || !validPos(w) || !validPos(act)) return showError("Enter valid positive numbers.");

    const heightCm = useMetric ? h : h * 30.48;
    const weightKg = toKG(w);
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "male" ? 5 : -161);
    const tdee = Math.round(bmr * act);

    resultDiv.style.color = "";
    resultDiv.textContent = `Estimated TDEE: ${tdee} kcal/day`;
    adviceDiv.textContent = "Use TDEE to plan calories: ~300–500 kcal/day deficit to lose fat slowly, or a small surplus to gain. Prioritize whole foods, protein, sleep, and consistency.";
  });

  /* ========== WATER INTAKE ========== */
  forms.water.addEventListener("submit", (e) => {
    e.preventDefault();
    const w = parseFloat(document.getElementById("weight-water").value);
    if (!validPos(w)) return showError("Enter a valid positive weight.");

    const ml = Math.round(toKG(w) * 35);
    const liters = (ml / 1000).toFixed(2);

    resultDiv.style.color = "";
    resultDiv.textContent = `Suggested water: ${liters} L/day (≈ ${ml} ml)`;
    adviceDiv.textContent = "Sip across the day; more in heat/exercise. Include water-rich foods; pale yellow urine is a good sign.";
  });

  /* ========== WHR ========== */
  forms.whr.addEventListener("submit", (e) => {
    e.preventDefault();
    const waist = parseFloat(document.getElementById("waist-whr").value);
    const hip = parseFloat(document.getElementById("hip-whr").value);
    if (!validPos(waist) || !validPos(hip)) return showError("Enter valid positive measurements.");

    const whr = +(waist / hip).toFixed(2);
    resultDiv.style.color = "";
    resultDiv.textContent = `WHR: ${whr}`;
    adviceDiv.textContent = "Aim to reduce central fat & build hips/core: mix cardio, strength, fiber-rich diet, and good sleep.";
  });

  
  document.querySelectorAll(".resetBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest("form").reset();
      clearOutputs();
    });
  });
  
  document.querySelectorAll(".calc-form input, .calc-form select").forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.closest("form").dispatchEvent(new Event("submit"));
      }
    });
  });
});
