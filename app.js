const players = [
  "Virat", "Rohit", "Gill", "Hardik", "Dhoni",
  "Kohli", "Rahul", "Surya", "Jadeja", "Bumrah",
  "Shami", "Siraj", "Pant", "Iyer", "Axar",
  "Kuldeep", "Samson", "Rinku", "Chahal", "Arshdeep",
  "DK", "Washington"
];

let selected = [];

const playersDiv = document.getElementById("players");

players.forEach(p => {
  const div = document.createElement("div");
  div.innerText = p;
  div.className = "player";

  div.onclick = () => {
    if (selected.includes(p)) {
      selected = selected.filter(x => x !== p);
      div.classList.remove("selected");
    } else if (selected.length < 11) {
      selected.push(p);
      div.classList.add("selected");
    }
  };

  playersDiv.appendChild(div);
});

function saveTeam() {
  const name = document.getElementById("username").value;

  if (!name || selected.length !== 11) {
    alert("Enter name & select 11 players");
    return;
  }

  db.collection("teams").doc(name).set({
    players: selected,
    points: 0
  });

  alert("Team saved!");
}
