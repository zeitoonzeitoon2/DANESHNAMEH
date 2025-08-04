// src/FlowEditor.jsx
import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import { setDoc } from "firebase/firestore";
import CustomNode from "./CustomNode";
import Flashcard from "./Flashcard";

const nodeTypes = { custom: CustomNode };

function FlowEditor({ initialNodes, initialEdges, onNavigateToArticle, onCreateArticle, graphDocRef }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await setDoc(graphDocRef, { nodes, edges });
      console.log("Graph saved!");
    } catch (error) {
      console.error("Error saving graph: ", error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, graphDocRef]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const updateNodeData = useCallback((id, newData) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n)));
    setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data: { ...prev.data, ...newData } } : prev));
  }, [setNodes]);

  const addNode = useCallback(() => {
    const id = String(Date.now());
    setNodes((nds) => [
      ...nds,
      {
        id, type: 'custom', position: { x: Math.random() * 400, y: Math.random() * 300 },
        data: { label: "گره جدید", descriptions: [], linkedNodes: [] },
      },
    ]);
  }, [setNodes]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="top-bar-controls">
        <button onClick={addNode} className="control-button add-node">افزودن گره</button>
        <button onClick={handleSave} className="control-button save" disabled={isSaving}>
          {isSaving ? 'در حال ذخیره...' : 'ذخیره نمودار'}
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
      {selectedNode && (
        <div className="flashcard-panel">
          <Flashcard
            key={selectedNode.id}
            data={selectedNode.data}
            onChange={(data) => updateNodeData(selectedNode.id, data)}
            onClose={onPaneClick}
            allNodes={nodes}
            currentNodeId={selectedNode.id}
            onNavigateToArticle={onNavigateToArticle}
            onCreateArticle={onCreateArticle}
          />
        </div>
      )}
    </div>
  );
}

export default FlowEditor;
