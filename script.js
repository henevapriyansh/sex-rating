document.getElementById("sexForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = new FormData(e.target);
  const data = Object.fromEntries(form.entries());

  // Convert numbers
  for (let key in data) {
    if (!isNaN(data[key]) && data[key] !== '') {
      data[key] = parseFloat(data[key]);
    } else if (data[key] === '') {
      data[key] = 0; // Default empty numbers to 0
    }
  }

  // Input validation
  if (data.maleAge < 16 || data.femaleAge < 16) {
    alert("Ages must be 16 or older.");
    return;
  }
  if (data.maleWeight <= 0 || data.femaleWeight <= 0) {
    alert("Weights must be positive.");
    return;
  }
  if (data.maleHeight <= 0 || data.femaleHeight <= 0) {
    alert("Heights must be positive.");
    return;
  }
  if (data.penisLength < 0 || data.penisGirth < 0) {
    alert("Penis measurements must be non-negative.");
    return;
  }
  if (data.duration < 0 || data.foreplay < 0) {
    alert("Durations must be non-negative.");
    return;
  }

  // Calculate derived metrics
  data.maleBMI = data.maleWeight / ((data.maleHeight / 100) ** 2);
  data.femaleBMI = data.femaleWeight / ((data.femaleHeight / 100) ** 2);
  if (isNaN(data.thrustSpeed) || data.thrustSpeed === 0) {
    data.thrustSpeed = 2; // Default 2 thrusts/sec (120/min, within 100-150 range)
  }
  data.thrusts = data.thrustSpeed * data.duration * 60;
  data.avgHeartRate = data.avgHeartRate || (70 + (data.duration > 10 ? 50 : 30)); // Estimate
  data.calories = data.calories || ((data.maleWeight + data.femaleWeight) / 2) * 3.5 * (data.duration / 60); // MET ~3.5

  // --- Enhanced AI Scoring System ---
  // Each category max 20 points, total 100, normalized to scientific averages
  let sizeScore = 0;
  // Penis size: avg length 5.2 in, girth 4.6 in (studies like Veale et al., 2015)
  const lengthDiff = Math.abs(data.penisLength - 5.2);
  sizeScore += Math.max(0, 10 * (1 - lengthDiff / 2)); // Linear drop-off within 2 inches
  const girthDiff = Math.abs(data.penisGirth - 4.6);
  sizeScore += Math.max(0, 10 * (1 - girthDiff / 1.5)); // Girth range ~3-6 in
  if (data.vaginalDepth && data.penisLength > data.vaginalDepth) sizeScore -= Math.min((data.penisLength - data.vaginalDepth) * 2, 5); // Mismatch penalty
  if (data.maleEthnicity === "african") sizeScore += 1; // Slight avg size increase
  if (data.maleEthnicity === "asian") sizeScore -= 0.5; // Slight avg size decrease
  sizeScore = Math.max(0, Math.min(20, Math.round(sizeScore)));

  let durationScore = 0;
  // Ideal intercourse 7-13 min, foreplay 10-20 min (Corty & Guardiani, 2008)
  const idealDurationMin = 7, idealDurationMax = 13;
  const durationCenter = (idealDurationMin + idealDurationMax) / 2;
  durationScore += Math.max(0, 10 * (1 - Math.abs(data.duration - durationCenter) / ((idealDurationMax - idealDurationMin) / 2)));
  const idealForeplayMin = 10, idealForeplayMax = 20;
  const foreplayCenter = (idealForeplayMin + idealForeplayMax) / 2;
  durationScore += Math.max(0, 10 * (1 - Math.abs(data.foreplay - foreplayCenter) / ((idealForeplayMax - idealForeplayMin) / 2)));
  if (data.foreplay < 5 && data.femaleOrgasms === 0) durationScore -= 3; // Penalty for insufficient foreplay
  durationScore = Math.max(0, Math.min(20, Math.round(durationScore)));

  let orgasmScore = 0;
  orgasmScore += Math.min(data.maleOrgasms * 4, 8); // Max 2 reasonable
  orgasmScore += Math.min(data.femaleOrgasms * 6, 12); // Female emphasis (only ~25% women orgasm from penetration alone)
  if (data.femaleOrgasms === 0 && data.foreplay < 10) orgasmScore -= 3; // Lack of foreplay impacts female orgasm
  if (data.maleOrgasms > 2 && data.refractoryTime > 20) orgasmScore -= 2; // Multiple male orgasms with long refractory less ideal
  orgasmScore = Math.max(0, Math.min(20, Math.round(orgasmScore)));

  let intensityScore = 0;
  intensityScore += Math.min(data.positions / 5 * 5, 5); // 3-5+ ideal
  const thrustsPerMin = data.thrusts / data.duration;
  intensityScore += Math.max(0, 5 * (1 - Math.abs(thrustsPerMin - 125) / 75)); // Center at 125/min
  intensityScore += Math.min(data.ejaculationVolume / 5 * 4, 4); // Avg 3-5 ml
  intensityScore += Math.min((data.penetrationDepth || 0) / 12 * 3, 3); // Avg vaginal depth 9-10 cm
  if (data.vaginalDepth && data.penetrationDepth > data.vaginalDepth * 2.54) intensityScore -= 3; // Discomfort if too deep
  if (data.lubricantUsed > 20) intensityScore -= 2; // Excess lube may indicate arousal issues
  intensityScore = Math.max(0, Math.min(20, Math.round(intensityScore)));

  let healthScore = 0;
  healthScore += Math.min((data.avgHeartRate - 80) / 50 * 5, 5); // Cardio benefit
  healthScore += Math.min(data.calories / 300 * 5, 5); // ~200-300 kcal ideal
  if (data.refractoryTime < 15) healthScore += 4; // Quick recovery
  else if (data.refractoryTime < 25) healthScore += 2;
  if (data.roomTemp > 18 && data.roomTemp < 24) healthScore += 3; // Comfort zone
  if (data.condomUsed === 1) healthScore += 3; // Safety bonus
  // BMI: ideal 18.5-24.9, penalties for extremes
  if (data.maleBMI < 18.5 || data.maleBMI > 30) healthScore -= Math.min(Math.abs(data.maleBMI - 21.7) / 5, 3);
  if (data.femaleBMI < 18.5 || data.femaleBMI > 30) healthScore -= Math.min(Math.abs(data.femaleBMI - 21.7) / 5, 3);
  healthScore = Math.max(0, Math.min(20, Math.round(healthScore)));

  let compatScore = 20;
  // Weight ratio: ideal 1.1-1.4; large diffs affect comfort
  const weightRatio = data.maleWeight / data.femaleWeight;
  const idealWeightRatio = 1.25;
  if (weightRatio < 1.0 || weightRatio > 1.6) compatScore -= Math.min(Math.abs(weightRatio - idealWeightRatio) * 5, 5);
  if (weightRatio > 1.8) compatScore -= 4; // Male too heavy
  if (weightRatio < 0.9) compatScore -= 3; // Female significantly heavier
  // Height ratio: ideal 1.05-1.25
  const heightRatio = data.maleHeight / data.femaleHeight;
  const idealHeightRatio = 1.15;
  if (heightRatio < 1.05 || heightRatio > 1.25) compatScore -= Math.min(Math.abs(heightRatio - idealHeightRatio) * 6, 4);
  // Age difference
  const ageDiff = Math.abs(data.maleAge - data.femaleAge);
  if (ageDiff > 5) compatScore -= Math.min((ageDiff / 5) * 1.5, 4);
  // BMI compatibility
  const bmiDiff = Math.abs(data.maleBMI - data.femaleBMI);
  if (bmiDiff > 5) compatScore -= Math.min((bmiDiff / 5) * 1.5, 3);
  // Ethnicity compatibility (light, based on small physiological/cultural diffs)
  if (data.maleEthnicity === "african" && data.femaleEthnicity !== "african") compatScore += 1; // Slight size advantage
  if (data.maleEthnicity === "asian" && data.femaleEthnicity !== "asian") compatScore -= 0.5;
  if (data.femaleEthnicity === "latina") compatScore += 1.5; // Cultural preference for passion
  if (data.femaleEthnicity === "indian") compatScore += 1; // Emotional connection emphasis
  compatScore = Math.max(0, Math.min(20, Math.round(compatScore)));

  // Total score
  const totalScore = sizeScore + durationScore + orgasmScore + intensityScore + healthScore + compatScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  // --- Comprehensive Suggestions ---
  let tips = [];
  // Duration and foreplay
  if (data.foreplay < 5) tips.push("Foreplay under 5 minutes is too short; aim for 10-20 minutes with kissing, touching, or oral to boost arousal and natural lubrication.");
  else if (data.foreplay < 10) tips.push("Foreplay of 5-10 minutes is decent, but 10-20 minutes enhances emotional and physical connection, especially for female arousal.");
  if (data.duration < 3) tips.push("Intercourse under 3 minutes may feel rushed; practice Kegel exercises, breathing techniques, or edging to extend to 7-13 minutes.");
  else if (data.duration < 7) tips.push("Aim for 7-13 minutes of intercourse, considered ideal by studies; cardio and stamina training can help.");
  else if (data.duration > 13) tips.push("Over 13 minutes is great for stamina but check for partner comfort; prolonged sessions may cause irritation without sufficient lube.");
  if (data.duration > 20) tips.push("Intercourse over 20 minutes is exceptional but risks fatigue; vary intensity and ensure adequate hydration.");

  // Orgasms
  if (data.femaleOrgasms === 0) tips.push("No female orgasms? Only ~25% women orgasm from penetration alone; focus on clitoral stimulation, oral sex, or positions like cowgirl where she controls pace.");
  if (data.femaleOrgasms === 1) tips.push("One female orgasm is good; aim for multiple by extending foreplay and incorporating manual or toy stimulation.");
  if (data.maleOrgasms === 0) tips.push("No male orgasm? Stress or fatigue may be factors; ensure relaxation and try varying stimulation techniques.");
  if (data.maleOrgasms > 2 && data.refractoryTime > 20) tips.push("Multiple male orgasms with long refractory time may indicate overexertion; pace sessions to maintain energy.");

  // Intensity
  if (data.positions < 2) tips.push("Fewer than 2 positions limits variety; try missionary, doggy, or cowgirl to adapt to body differences and enhance stimulation.");
  else if (data.positions < 4) tips.push("2-3 positions are solid; aim for 4-5 (e.g., spooning, reverse cowgirl) to target varied sensations and accommodate height/weight gaps.");
  if (thrustsPerMin < 80) tips.push("Thrusting below 80/min is slow; increase to 100-150/min for intensity, varying speed for partner preference.");
  else if (thrustsPerMin > 200) tips.push("Thrusting over 200/min is intense but may overwhelm; balance with slower, deeper thrusts for control.");
  if (data.ejaculationVolume < 2) tips.push("Ejaculation below 2 ml is low; hydrate well, consume zinc-rich foods (oysters, pumpkin seeds), and space sessions to reach 3-5 ml average.");
  if (data.penetrationDepth > (data.vaginalDepth * 2.54 || 12)) tips.push("Penetration depth exceeds average vaginal depth (~9-10 cm); use shallower thrusts or positions like spooning to avoid discomfort.");
  if (data.lubricantUsed > 20) tips.push("Over 20 ml lube suggests low natural arousal; extend foreplay with sensual touch or try water-based lubes for comfort.");

  // Health
  if (data.refractoryTime > 25) tips.push("Refractory time over 25 minutes is long, especially if under 30 years old; improve with cardio, diet (zinc, L-arginine), or consult a doctor.");
  else if (data.refractoryTime > 15) tips.push("Refractory time of 15-25 minutes is average; reduce with pelvic floor exercises or better hydration.");
  if (data.roomTemp < 18) tips.push("Room below 18°C may feel chilly; aim for 18-24°C to keep muscles relaxed and enhance comfort.");
  else if (data.roomTemp > 24) tips.push("Room above 24°C may cause overheating; maintain 18-24°C and stay hydrated.");
  if (data.condomUsed === 1) tips.push("Condom use promotes safety and prevents STIs/pregnancy; try ultra-thin condoms or add lube inside for better sensation.");
  if (data.condomUsed === 0) tips.push("No condom? Ensure mutual STI testing and contraception; unprotected sex increases risks.");
  if (data.maleBMI < 18.5) tips.push("Male BMI below 18.5 suggests underweight; a balanced diet with protein and healthy fats boosts energy and performance.");
  if (data.maleBMI > 30) tips.push("Male BMI over 30 indicates obesity; weight management through diet and exercise improves stamina and reduces fatigue.");
  if (data.femaleBMI < 18.5) tips.push("Female BMI below 18.5 may reduce energy; ensure adequate nutrition to support physical exertion.");
  if (data.femaleBMI > 30) tips.push("Female BMI over 30 can affect comfort; focus on low-impact positions and consider fitness goals.");

  // Compatibility
  if (weightRatio > 1.8) tips.push("Male significantly heavier (ratio >1.8)? Opt for female-on-top or side-lying positions to ensure comfort and reduce strain.");
  else if (weightRatio > 1.4) tips.push("Moderate weight difference (ratio >1.4)? Use positions like cowgirl or seated to balance physical dynamics.");
  if (weightRatio < 0.9) tips.push("Female heavier? Missionary or side-by-side positions help balance weight distribution.");
  if (heightRatio < 1.05) tips.push("Similar heights? Spooning, seated, or face-to-face positions align bodies comfortably.");
  else if (heightRatio > 1.25) tips.push("Large height gap? Use pillows under hips or try standing positions (e.g., against a wall) to align bodies.");
  if (ageDiff > 10) tips.push("Age gap over 10 years? Discuss energy levels; younger partner may prefer faster pace, older may need slower, deeper focus.");
  if (ageDiff > 20) tips.push("Age gap over 20 years? Prioritize communication to align stamina and preferences; consider breaks if needed.");
  if (bmiDiff > 7) tips.push("BMI difference over 7? Adjust positions (e.g., missionary with pillows) to accommodate physical disparities.");
  if (bmiDiff > 10) tips.push("Large BMI gap? Focus on low-exertion positions and ensure open dialogue about comfort.");

  // Ethnicity-specific tips (detailed, culturally/physiologically informed)
  if (data.femaleEthnicity === "indian") tips.push("Indian women may prioritize emotional intimacy; incorporate extended foreplay with sensual massage, eye contact, and verbal affirmations to deepen connection.");
  if (data.femaleEthnicity === "asian") tips.push("Asian women often respond to smooth, rhythmic thrusting and gentle touch; maintain a steady pace, incorporate light caresses, and check in for feedback.");
  if (data.femaleEthnicity === "african") tips.push("African women may prefer bold, confident movements; emphasize strong, rhythmic thrusting and a commanding physical presence, balanced with partner comfort.");
  if (data.femaleEthnicity === "caucasian") tips.push("Caucasian women often enjoy a blend of passion and tenderness; combine deep, varied thrusts with romantic gestures like kissing or holding hands.");
  if (data.femaleEthnicity === "latina") tips.push("Latina women may favor high-energy, expressive sessions; use dynamic positions (e.g., standing, reverse cowgirl) and show enthusiasm through vocal or physical engagement.");
  if (data.femaleEthnicity === "other") tips.push("Uncertain of partner’s preferences? Openly discuss desires for pace, intensity, and emotional connection to tailor the experience.");

  if (data.maleEthnicity === "indian") tips.push("Indian men: leverage cultural emphasis on sensuality; use prolonged foreplay with oils, tantric-inspired touch, or verbal intimacy to enhance partner satisfaction.");
  if (data.maleEthnicity === "asian") tips.push("Asian men: focus on controlled, precise thrusting; maintain a consistent rhythm and respond to partner cues for optimal mutual pleasure.");
  if (data.maleEthnicity === "african") tips.push("African men: capitalize on physical confidence; strong, rhythmic thrusting and assertive positioning can align with partner expectations, but check for comfort.");
  if (data.maleEthnicity === "caucasian") tips.push("Caucasian men: balance intensity with intimacy; alternate fast thrusts with slower, deeper ones and maintain eye contact or gentle touch.");
  if (data.maleEthnicity === "latina") tips.push("Latino men: embrace passionate, energetic style; use dynamic, expressive positions and vocal engagement to amplify mutual excitement.");
  if (data.maleEthnicity === "other") tips.push("Unsure of your style? Experiment with varied paces and intensities, and ask your partner for feedback to align on preferences.");

  // Output
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
    <h2>Performance Rating: ${finalScore}/100</h2>
    <h3>Score Breakdown (Each /20):</h3>
    <ul>
      <li>Size Metrics (avg ~5.2L/4.6G in): ${sizeScore}/20</li>
      <li>Duration & Foreplay (ideal 7-13/10-20 min): ${durationScore}/20</li>
      <li>Orgasms (female emphasis): ${orgasmScore}/20</li>
      <li>Intensity & Variety (thrusts, positions): ${intensityScore}/20</li>
      <li>Health & Cardio (BMI, recovery): ${healthScore}/20</li>
      <li>Compatibility (height/weight/age): ${compatScore}/20</li>
    </ul>
    <h3>Personalized Recommendations:</h3>
    <ul>${tips.map(t => `<li>${t}</li>`).join("")}</ul>
    <h3>Detailed Insights:</h3>
    <ul>
      <li>Total Thrusts: ${Math.round(data.thrusts)}, Per Minute: ${Math.round(thrustsPerMin)} (ideal 100-150)</li>
      <li>Estimated Calories Burned: ${Math.round(data.calories)} kcal (based on MET ~3.5)</li>
      <li>Male BMI: ${data.maleBMI.toFixed(1)} (ideal 18.5-24.9), Female BMI: ${data.femaleBMI.toFixed(1)}</li>
      <li>Height Ratio (M/F): ${heightRatio.toFixed(2)} (ideal 1.05-1.25), Weight Ratio: ${weightRatio.toFixed(2)} (ideal 1.1-1.4)</li>
      <li>Age Difference: ${ageDiff} years (smaller gaps often enhance compatibility)</li>
      <li>Penetration Compatibility: ${data.vaginalDepth ? `Depth ${data.penetrationDepth} cm vs vaginal ${data.vaginalDepth} in (~${(data.vaginalDepth * 2.54).toFixed(1)} cm)` : 'Vaginal depth not provided'}</li>
      <li>Physical Exertion: Estimated heart rate ${Math.round(data.avgHeartRate)} bpm, indicating ${data.avgHeartRate > 100 ? 'moderate to high' : 'low to moderate'} cardiovascular effort</li>
    </ul>
  `;
});
