import { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  getRectOfNodes,
  getTransformForBounds
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { toPng } from 'html-to-image';
import download from 'downloadjs';

import FamilyForm from "./components/FamilyForm";
import FamilyTree from "./components/FamilyTree";
import Auth from "./components/Auth";
import { getPersons, createPerson, updatePerson, deletePerson, logout } from "./services/api";

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    if (!node.position || (node.position.x === 0 && node.position.y === 0)) {
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }
  });

  return { nodes, edges };
};

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("auth-token"));
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const savedPositions = useMemo(() => {
    const item = localStorage.getItem("rf-positions");
    return item ? JSON.parse(item) : {};
  }, []);

  const construirArbol = useCallback((personas) => {
    const nuevosNodos = [];
    const nuevasEdges = [];
    const parejas = {};

    personas.forEach((p) => {
      nuevosNodos.push({
        id: p.id,
        data: {
          label: `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
          ...p
        },
        position: savedPositions[p.id] || { x: 0, y: 0 },
      });
    });

    personas.forEach((p) => {
      if (p.padreId && p.madreId) {
        const ids = [p.padreId, p.madreId].sort();
        const key = ids.join("-");
        let parejaId = parejas[key];

        if (!parejaId) {
          parejaId = `pareja-${key}`;
          parejas[key] = parejaId;

          nuevosNodos.push({
            id: parejaId,
            data: { label: "" },
            position: savedPositions[parejaId] || { x: 0, y: 0 },
            style: { width: 10, height: 10, background: "#666", borderRadius: "50%" }
          });

          nuevasEdges.push(
            { id: `e-${ids[0]}-${parejaId}`, source: ids[0], target: parejaId, type: 'smoothstep' },
            { id: `e-${ids[1]}-${parejaId}`, source: ids[1], target: parejaId, type: 'smoothstep' }
          );
        }

        nuevasEdges.push({
          id: `e-${parejaId}-${p.id}`,
          source: parejaId,
          target: p.id,
          type: 'smoothstep'
        });
      } else if (p.padreId || p.madreId) {
        const parentId = p.padreId || p.madreId;
        nuevasEdges.push({
          id: `e-${parentId}-${p.id}`,
          source: parentId,
          target: p.id,
          type: 'smoothstep'
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nuevosNodos,
      nuevasEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [savedPositions, setNodes, setEdges]);

  const loadData = useCallback(async () => {
    try {
      const data = await getPersons();
      construirArbol(data);
    } catch (error) {
      if (error.message === "Unauthorized") setIsAuth(false);
    }
  }, [construirArbol]);

  useEffect(() => {
    if (isAuth) loadData();
  }, [isAuth, loadData]);

  const onNodeDragStop = useCallback((event, node) => {
    const currentPositions = JSON.parse(localStorage.getItem("rf-positions") || "{}");
    const updatedPositions = {
      ...currentPositions,
      ...Object.fromEntries(nodes.map(n => [n.id, n.position]))
    };
    localStorage.setItem("rf-positions", JSON.stringify(updatedPositions));
  }, [nodes]);

  const onNodeClick = useCallback((event, node) => {
    if (node.id.startsWith("pareja")) {
      setSelectedPerson(null);
    } else {
      setSelectedPerson(node.data);
    }
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAgregarPersona = async (formData) => {
    try {
      await createPerson(formData);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePerson = async (id, formData) => {
    try {
      await updatePerson(id, formData);
      setSelectedPerson(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePerson = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar a esta persona?")) {
      try {
        await deletePerson(id);
        setSelectedPerson(null);
        loadData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
  };

  const onExport = () => {
    const element = document.querySelector('.react-flow__viewport');
    if (!element) return;

    // We capture the view
    toPng(document.querySelector('.react-flow'), {
      filter: (node) => {
        // Exclude controls and attribution for cleaner export if desired
        if (
          node?.classList?.contains('react-flow__controls') ||
          node?.classList?.contains('react-flow__attribution')
        ) {
          return false;
        }
        return true;
      },
      backgroundColor: '#121212',
    }).then(dataUrl => {
      download(dataUrl, 'family-tree.png');
    });
  };

  if (!isAuth) {
    return <Auth onLoginSuccess={() => setIsAuth(true)} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", background: "#121212", position: "relative" }}>
      <div style={topToolbarStyle}>
        <span style={{ marginRight: '20px', color: '#888' }}>Usuario: <b>{localStorage.getItem("username")}</b></span>
        <button onClick={onExport} style={secondaryButtonStyle}>Exportar PNG</button>
        <button onClick={handleLogout} style={dangerButtonStyle}>Cerrar sesión</button>
      </div>

      <FamilyForm
        nodes={nodes}
        agregarPersona={handleAgregarPersona}
        selectedPerson={selectedPerson}
        onCancelEdit={() => setSelectedPerson(null)}
        onUpdatePerson={handleUpdatePerson}
        onDeletePerson={handleDeletePerson}
      />
      <FamilyTree
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
      />
    </div>
  );
}

const topToolbarStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "rgba(30, 30, 30, 0.8)",
  padding: "8px 16px",
  borderRadius: "8px",
  backdropFilter: "blur(4px)",
  border: "1px solid #333"
};

const secondaryButtonStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#2d2d2d",
  color: "#eee",
  cursor: "pointer",
  fontSize: "0.85rem"
};

const dangerButtonStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#e11d48",
  color: "white",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600"
};