const API_URL = "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  localStorage.setItem("auth-token", data.token);
  localStorage.setItem("username", data.username);
  return data;
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function logout() {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("username");
}

export async function getPersons() {
  const res = await fetch(`${API_URL}/persons`, {
    headers: getHeaders(),
  });
  if (res.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }
  return res.json();
}

export async function createPerson(person) {
  const res = await fetch(`${API_URL}/persons`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(person),
  });
  return res.json();
}

export async function updatePerson(id, person) {
  const res = await fetch(`${API_URL}/persons/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(person),
  });
  return res.json();
}

export async function deletePerson(id) {
  await fetch(`${API_URL}/persons/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}
