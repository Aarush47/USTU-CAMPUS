import { useRef, useState, useEffect } from "react";
import { Eraser, Pen, Download, Trash2, Palette } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const colors = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
];

const brushSizes = [2, 4, 6, 8, 10];

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Set white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold text-foreground">Digital Whiteboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadCanvas}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={clearCanvas}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Toolbar */}
        <Card className="p-4 w-full sm:w-20 flex sm:flex-col gap-4 overflow-x-auto sm:overflow-x-visible">
          {/* Tools */}
          <div className="flex sm:flex-col gap-2">
            <Button
              variant={tool === "pen" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("pen")}
              className="shrink-0"
            >
              <Pen className="w-5 h-5" />
            </Button>
            <Button
              variant={tool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("eraser")}
              className="shrink-0"
            >
              <Eraser className="w-5 h-5" />
            </Button>
          </div>

          <div className="w-px sm:h-px sm:w-full bg-border" />

          {/* Colors */}
          <div className="flex sm:flex-col gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setColor(c.value);
                  setTool("pen");
                }}
                className={`w-8 h-8 rounded-lg shrink-0 border-2 transition-all ${
                  color === c.value && tool === "pen"
                    ? "border-primary scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          <div className="w-px sm:h-px sm:w-full bg-border" />

          {/* Brush Sizes */}
          <div className="flex sm:flex-col gap-2">
            {brushSizes.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  brushSize === size
                    ? "bg-primary"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                title={`Size ${size}`}
              >
                <div
                  className={`rounded-full ${
                    brushSize === size ? "bg-primary-foreground" : "bg-secondary-foreground"
                  }`}
                  style={{ width: size + 2, height: size + 2 }}
                />
              </button>
            ))}
          </div>
        </Card>

        {/* Canvas */}
        <Card className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair touch-none"
            style={{ width: "100%", height: "100%" }}
          />
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-4 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="w-4 h-4" />
          <span>Use the toolbar to select colors, brush sizes, or switch between pen and eraser. Draw on the canvas to take notes!</span>
        </div>
      </Card>
    </div>
  );
}
