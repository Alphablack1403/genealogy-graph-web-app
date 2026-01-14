import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState
} from "reactflow";
import "reactflow/dist/style.css";
import FamilyForm from "./components/FamilyForm";
import FamilyTree from "./components/FamilyTree";
import { getPersons, createPerson } from "./services/api";
import { useEffect } from "react";



export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Formulario
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [padreId, setPadreId] = useState("");
  const [madreId, setMadreId] = useState("");

useEffect(() => {
  getPersons().then((data) => {
    const loadedNodes = data.map((p) => ({
      id: p.id,
      data: {
        label: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        ...p,
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }));

    setNodes(loadedNodes);
  });
}, []);


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const crearNodoPareja = (padre, madre) => {
    const parejaId = `pareja-${padre}-${madre}`;
    if (nodes.find((n) => n.id === parejaId)) return parejaId;

    const parejaNode = {
      id: parejaId,
      data: { label: "" },
      position: { x: 300, y: 180 },
      style: { width: 10, height: 10, background: "#555", borderRadius: "50%" }
    };

    setNodes((nds) => [...nds, parejaNode]);
    setEdges((eds) => [
      ...eds,
      { id: `e-${padre}-${parejaId}`, source: padre, target: parejaId },
      { id: `e-${madre}-${parejaId}`, source: madre, target: parejaId }
    ]);

    return parejaId;
  };

const agregarPersona = ({
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  padreId,
  madreId
}) => {
  if (!nombres) return;

  let apP = apellidoPaterno;
  let apM = apellidoMaterno;

  if (padreId && madreId && padreId === madreId) {
    alert("El padre y la madre no pueden ser la misma persona");
    return;
  }

  if (padreId) {
    const padre = nodes.find((n) => n.id === padreId);
    apP = padre?.data.apellidoPaterno || apP;
  }

  if (madreId) {
    const madre = nodes.find((n) => n.id === madreId);
    apM = madre?.data.apellidoPaterno || apM;
  }

  if (!apP && apM) apP = apM;
  if (!apM && apP) apM = apP;

  if (!apP && !apM) {
    alert("Debe existir al menos un apellido");
    return;
  }

  const idPersona = crypto.randomUUID();

const nuevaPersona = {
  nombres,
  apellidoPaterno: apP,
  apellidoMaterno: apM,
  padreId,
  madreId
};

createPerson(nuevaPersona).then((saved) => {
  const personaNode = {
    id: saved.id,
    data: {
      label: `${saved.nombres} ${saved.apellidoPaterno} ${saved.apellidoMaterno}`,
      ...saved
    },
    position: {
      x: Math.random() * 400 + 100,
      y: Math.random() * 200 + 300
    }
  };

  setNodes((nds) => [...nds, personaNode]);
});


  if (padreId && madreId) {
  const parejaId = crearNodoPareja(padreId, madreId);

  setEdges((eds) => [
    ...eds,
    {
      id: `e-${parejaId}-${idPersona}`,
      source: parejaId,
      target: idPersona
    }
  ]);
}
};


  const personas = nodes.filter((n) => !n.id.startsWith("pareja"));

useEffect(() => {
  fetch("http://localhost:3000/persons")
    .then((res) => res.json())
    .then((data) => {
      construirArbol(data);
    });
}, []);

  
const construirArbol = (personas) => {
  const nuevosNodos = [];
  const nuevasEdges = [];

  const mapa = {};

  // 1. Crear nodos persona
  personas.forEach((p, index) => {
    mapa[p.id] = p;

    nuevosNodos.push({
      id: p.id,
      data: {
        label: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
        ...p
      },
      position: {
        x: 200 + index * 120,
        y: 100
      }
    });
  });

  const parejas = {};

personas.forEach((p) => {
  if (p.padreId && p.madreId) {
    const parejaKey = `${p.padreId}-${p.madreId}`;

    if (!parejas[parejaKey]) {
      const parejaId = `pareja-${parejaKey}`;
      parejas[parejaKey] = parejaId;

      nuevosNodos.push({
        id: parejaId,
        data: { label: "" },
        position: { x: 300, y: 250 },
        style: {
          width: 10,
          height: 10,
          background: "#666",
          borderRadius: "50%"
        }
      });

      nuevasEdges.push(
        { id: `e-${p.padreId}-${parejaId}`, source: p.padreId, target: parejaId },
        { id: `e-${p.madreId}-${parejaId}`, source: p.madreId, target: parejaId }
      );
    }

    nuevasEdges.push({
      id: `e-${parejas[parejaKey]}-${p.id}`,
      source: parejas[parejaKey],
      target: p.id
    });
  }
});


  setNodes(nuevosNodos);
  setEdges(nuevasEdges);
};





  return (
  <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
    <FamilyForm nodes={nodes} agregarPersona={agregarPersona} />
    <FamilyTree
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  </div>
);

}