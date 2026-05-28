'use client';

import { useEffect, useRef } from 'react';

export default function TaskScopedGraph({ graphData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas sizing
    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 450;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const { nodes = [], edges = [] } = graphData;

    // Fast local Force-Directed simulation layout
    const width = canvas.width;
    const height = canvas.height;

    // Assign positions
    const simNodes = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0
      };
    });

    // Run simple force simulation layout steps
    const iterations = 100;
    const k = Math.sqrt((width * height) / (simNodes.length || 1)) * 0.7;

    for (let step = 0; step < iterations; step++) {
      // Repulsion between nodes
      for (let i = 0; i < simNodes.length; i++) {
        const n1 = simNodes[i];
        for (let j = i + 1; j < simNodes.length; j++) {
          const n2 = simNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (k * k) / dist;
          
          const fx = (dx / dist) * force * 0.15;
          const fy = (dy / dist) * force * 0.15;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }

      // Gravity towards center
      simNodes.forEach(n => {
        const dx = width / 2 - n.x;
        const dy = height / 2 - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        n.vx += dx * 0.05;
        n.vy += dy * 0.05;
      });

      // Attraction along edges
      edges.forEach(e => {
        const sourceNode = simNodes.find(n => n.id === e.source);
        const targetNode = simNodes.find(n => n.id === e.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist * dist) / k;

          const fx = (dx / dist) * force * 0.06;
          const fy = (dy / dist) * force * 0.06;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // Update positions
      simNodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        // Limit velocities
        n.vx *= 0.85;
        n.vy *= 0.85;

        // Keep inside canvas
        n.x = Math.max(25, Math.min(width - 25, n.x));
        n.y = Math.max(25, Math.min(height - 25, n.y));
      });
    }

    // Render loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Edges (Dependency Lines)
      edges.forEach(e => {
        const sourceNode = simNodes.find(n => n.id === e.source);
        const targetNode = simNodes.find(n => n.id === e.target);
        if (sourceNode && targetNode) {
          const isGlowing = sourceNode.isSelected && targetNode.isSelected;
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          if (isGlowing) {
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.lineWidth = 2.5;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
          }
          ctx.stroke();
        }
      });

      // Draw Nodes (Files)
      simNodes.forEach(n => {
        // Neon Glow effect for selected primary files
        if (n.isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 16, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();

          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = n.isDependency ? 'rgba(168, 85, 247, 0.6)' : 'rgba(156, 163, 175, 0.5)';
          ctx.fill();
        }

        // Draw Text labels
        ctx.font = n.isSelected ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.fillStyle = n.isSelected ? '#ffffff' : 'rgba(156, 163, 175, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y - (n.isSelected ? 16 : 10));
      });
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
