import React, { useRef, useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { DrawingPoint } from "../types";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket, roomCode, currentUser } = useGame();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const isDrawer = currentUser?.isDrawer || false;

  console.log("Canvas component state:", {
    currentUser,
    isDrawer,
    roomCode,
    socketConnected: !!socket,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas settings
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#333";

    // Listen for drawing data from other players
    const handleDrawingData = (points: DrawingPoint[]) => {
      points.forEach((point) => {
        drawPoint(ctx, point);
      });
    };

    // Listen for clear canvas events
    const handleClearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket?.on("drawing_data", handleDrawingData);
    socket?.on("clear_canvas", handleClearCanvas);

    return () => {
      socket?.off("drawing_data", handleDrawingData);
      socket?.off("clear_canvas", handleClearCanvas);
    };
  }, [socket]);

  const drawPoint = (ctx: CanvasRenderingContext2D, point: DrawingPoint) => {
    if (point.type === "start") {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    } else if (point.type === "move") {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (point.type === "end") {
      ctx.closePath();
    }
  };

  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ("touches" in e) {
      // Touch event
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawer) return;

    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);
    setLastPoint(point);

    const drawingPoint: DrawingPoint = {
      x: point.x,
      y: point.y,
      type: "start",
    };

    // Draw locally
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      drawPoint(ctx, drawingPoint);
    }

    // Send to server
    socket?.emit("drawing_data", { roomCode, points: [drawingPoint] });
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !isDrawer) return;

    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point || !lastPoint) return;

    const drawingPoint: DrawingPoint = {
      x: point.x,
      y: point.y,
      type: "move",
    };

    // Draw locally
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      drawPoint(ctx, drawingPoint);
    }

    // Send to server
    socket?.emit("drawing_data", { roomCode, points: [drawingPoint] });
    setLastPoint(point);
  };

  const stopDrawing = () => {
    if (!isDrawing || !isDrawer) return;

    setIsDrawing(false);
    setLastPoint(null);

    const drawingPoint: DrawingPoint = {
      x: 0,
      y: 0,
      type: "end",
    };

    // Send end signal to server
    socket?.emit("drawing_data", { roomCode, points: [drawingPoint] });
  };

  const clearCanvas = () => {
    if (!isDrawer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Emit clear event to other users
    socket?.emit("clear_canvas", { roomCode });
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="bg-gray-100 p-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Drawing Area</h3>
          {isDrawer && (
            <button
              onClick={clearCanvas}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto bg-white cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: "none" }}
        />

        {!isDrawer && (
          <div className="absolute inset-0 bg-transparent cursor-not-allowed" />
        )}
      </div>
    </div>
  );
};

export default Canvas;
