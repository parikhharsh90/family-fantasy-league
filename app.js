let selected = [];
let playerCredits = {};
let usedCredits = 0;
const totalCredits = 100;

const API_KEY = "YOUR_CRICAPI_KEY";

const matches = [
  { id: "69832134", name: "PBKS vs GT" },
  { id: "69832136", name: "LSG vs DC" },
  { id: "69832138", name: "KKR vs SRH" }
];

function loadMatches() {
  const div = document.getElementById("matches");
  div.innerHTML = "";

  matches.forEach(m => {
    const btn = document.createElement("button");
    btn.innerText = m.name;

    btn.onclick = () => {
      localStorage.setItem("matchId", m.id);
      loadPlayers();
    };

    div.appendChild(btn);
  });
}

loadMatches();

async function fetchPlayers() {
  const matchId = localStorage.getItem("matchId") || matches[0].id;

  const res = await fetch(
    `https://api.cricapi.com/v1/match_info?apikey=${API_KEY}&id=${matchId}`
  );

  const data = await res.json();
  return data.teamInfo;
}

function getPlayers(teamInfo) {
  let players = [];

  teamInfo.forEach(team => {
    team.players.forEach(p => {
      if (p.playing11 || true) {
        players.push(p.name);
      }
    });
  });

  return players;
}

function assignCredits(players) {
  players.forEach(p => {
    playerCredits[p] = (Math.random() * 3 + 7).toFixed(1);
  });
}

async function loadPlayers() {
  selected = [];
  usedCredits = 0;

  const teamInfo = await fetchPlayers();
  const players = getPlayers(teamInfo);

  assignCredits(players);

  document.getElementById("matchTitle").innerText =
    `${teamInfo[0].name} vs ${teamInfo[1].name}`;

  const div = document.getElementById("players");
  div.innerHTML = "";

  players.forEach(p => {
    const el = document.createElement("div");
    el.innerText = `${p} (${playerCredits[p]})`;
    el.className = "player";

    el.onclick = () => togglePlayer(p, el);

    div.appendChild(el);
  });

  updateCreditDisplay();
}

function togglePlayer(player, el) {
  const credit = parseFloat(playerCredits[player]);

  if (selected.includes(player)) {
    selected = selected.filter(p => p !== player);
    usedCredits -= credit;
    el.classList.remove("selected");
  } else {
    if (selected.length >= 11) return alert("Max 11 players");

    if (usedCredits + credit > totalCredits)
      return alert("Credit limit exceeded");

    selected.push(player);
    usedCredits += credit;
    el.classList.add("selected");
  }

  updateCaptainOptions();
  updateCreditDisplay();
}

function updateCreditDisplay() {
  document.getElementById("creditsLeft").innerText =
    (totalCredits - usedCredits).toFixed(1);
}

function updateCaptainOptions() {
  const cap = document.getElementById("captain");
  const vc = document.getElementById("viceCaptain");

  cap.innerHTML = "";
  vc.innerHTML = "";

  selected.forEach(p => {
    cap.innerHTML += `<option value="${p}">${p}</option>`;
    vc.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

function createLeague() {
  const code = Math.random().toString(36).substring(2, 8);

  db.collection("leagues").doc(code).set({
    createdAt: new Date()
  });

  alert("League Code: " + code);
}

function joinLeague() {
  const code = document.getElementById("leagueCode").value;
  const user = document.getElementById("username").value;

  db.collection("leagues").doc(code)
    .collection("members")
    .doc(user)
    .set({ name: user });

  localStorage.setItem("leagueCode", code);

  loadLeaderboard();
}

function saveTeam() {
  const name = document.getElementById("username").value;
  const leagueCode = localStorage.getItem("leagueCode");

  const captain = document.getElementById("captain").value;
  const viceCaptain = document.getElementById("viceCaptain").value;

  const matchStart = new Date("2026-03-31T19:30:00");

  if (new Date() > matchStart)
    return alert("Team locked after toss");

  db.collection("leagues")
    .doc(leagueCode)
    .collection("teams")
    .doc(name)
    .set({
      players: selected,
      captain,
      viceCaptain,
      points: 0
    });

  alert("Team Saved!");
}

function calculatePoints(team, playerPoints) {
  let total = 0;

  team.players.forEach(p => {
    let pts = playerPoints[p] || 0;

    if (p === team.captain) pts *= 2;
    else if (p === team.viceCaptain) pts *= 1.5;

    total += pts;
  });

  return total;
}

async function fetchLiveScores() {
  const matchId = localStorage.getItem("matchId") || matches[0].id;

  const res = await fetch(
    `https://api.cricapi.com/v1/match_score?apikey=${API_KEY}&id=${matchId}`
  );

  return await res.json();
}

function generatePoints(data) {
  let pts = {};

  data.scorecard?.forEach(p => {
    pts[p.name] =
      (p.runs || 0) +
      (p.fours || 0) +
      (p.sixes || 0) * 2 +
      (p.wickets || 0) * 25;
  });

  return pts;
}

async function updatePoints() {
  const leagueCode = localStorage.getItem("leagueCode");
  if (!leagueCode) return;

  const data = await fetchLiveScores();
  const playerPoints = generatePoints(data);

  const snapshot = await db.collection("leagues")
    .doc(leagueCode)
    .collection("teams")
    .get();

  snapshot.forEach(doc => {
    const team = doc.data();
    const total = calculatePoints(team, playerPoints);

    db.collection("leagues")
      .doc(leagueCode)
      .collection("teams")
      .doc(doc.id)
      .update({ points: total });
  });
}

function loadLeaderboard() {
  const leagueCode = localStorage.getItem("leagueCode");

  db.collection("leagues")
    .doc(leagueCode)
    .collection("teams")
    .onSnapshot(snapshot => {

      let data = [];

      snapshot.forEach(doc => {
        data.push({ name: doc.id, ...doc.data() });
      });

      data.sort((a, b) => b.points - a.points);

      const board = document.getElementById("leaderboard");
      board.innerHTML = "";

      data.forEach((t, i) => {
        board.innerHTML += `<p>#${i+1} ${t.name} - ${t.points}</p>`;
      });
    });
}

setInterval(updatePoints, 5000);

// initial load
loadPlayers();
