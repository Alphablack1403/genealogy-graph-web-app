const API_URL = "http://localhost:3000";

export async function getPersons() {
  const res = await fetch(`${API_URL}/persons`);
  return res.json();
}

export async function createPerson(person) {
  const res = await fetch(`${API_URL}/persons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });
  return res.json();
}
