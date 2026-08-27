'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export interface CanvasElement {
  id: string;
  type: 'TEXT' | 'VARIABLE' | 'IMAGE' | 'QRCODE' | 'SHAPE' | 'LINE';
  text?: string;
  variableKey?: string;
  imageUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  opacity?: number;
  rotation?: number;
  borderWidth?: number;
  shapeType?: 'BORDER_GOLD' | 'BORDER_NEON' | 'BORDER_MINIMAL' | 'BORDER_PURPLE' | 'SEAL_GOLD' | 'DIVIDER';
}

export interface CertificateTemplateData {
  backgroundTheme: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: CanvasElement[];
}

interface CertificateDesignerProps {
  initialData?: CertificateTemplateData | null;
  courseTitle?: string;
  courseCode?: string;
  onSave?: (data: CertificateTemplateData) => Promise<void> | void;
  isSaving?: boolean;
}

const FONTS = [
  { name: 'Cinzel (Classical Diploma)', value: "'Cinzel', serif" },
  { name: 'Playfair Display (Academic)', value: "'Playfair Display', serif" },
  { name: 'Alex Brush (Calligraphy Signature)', value: "'Alex Brush', cursive" },
  { name: 'Inter (Clean Modern)', value: "'Inter', sans-serif" },
  { name: 'Montserrat (Geometric)', value: "'Montserrat', sans-serif" },
  { name: 'Orbitron (Web3 Futuristic)', value: "'Orbitron', sans-serif" },
  { name: 'Roboto Mono (Technical)', value: "'Roboto Mono', monospace" },
];

const VARIABLE_TAGS = [
  { key: 'student_name', label: '{{ Student Name }}', sample: 'Alice Doe' },
  { key: 'course_title', label: '{{ Course Title }}', sample: 'Advanced Smart Contract Engineering' },
  { key: 'course_code', label: '{{ Course Code }}', sample: 'ARB-401' },
  { key: 'issue_date', label: '{{ Issue Date }}', sample: new Date().toLocaleDateString() },
  { key: 'grade', label: '{{ Grade / Honor }}', sample: 'Distinction' },
  { key: 'score', label: '{{ Score % }}', sample: '98.5%' },
  { key: 'certificate_id', label: '{{ Certificate ID }}', sample: 'XERTY-2026-A49F1B' },
  { key: 'issuer_name', label: '{{ Issuer Name }}', sample: 'Xerty Global Academy' },
];

const CANVAS_SIZE_PRESETS = [
  { name: '16:9 Landscape HD', width: 1200, height: 675 },
  { name: 'A4 Landscape', width: 1240, height: 877 },
  { name: 'A4 Portrait', width: 877, height: 1240 },
  { name: 'US Letter Landscape', width: 1100, height: 850 },
  { name: 'Square Credential', width: 900, height: 900 },
];

const BACKGROUND_PRESETS = [
  {
    name: 'Obsidian Gold',
    value: 'linear-gradient(135deg, #090d16 0%, #151208 50%, #090d16 100%)',
    preview: '#151208',
  },
  {
    name: 'Royal Navy Cyber',
    value: 'linear-gradient(135deg, #020617 0%, #0c4a6e 50%, #020617 100%)',
    preview: '#0c4a6e',
  },
  {
    name: 'Solana Purple',
    value: 'linear-gradient(135deg, #090314 0%, #2e1065 50%, #090314 100%)',
    preview: '#2e1065',
  },
  {
    name: 'Emerald Prestige',
    value: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
    preview: '#064e3b',
  },
  {
    name: 'Burgundy Velvet',
    value: 'linear-gradient(135deg, #450a0a 0%, #1f0404 50%, #450a0a 100%)',
    preview: '#450a0a',
  },
  {
    name: 'Classic Ivory Parchment',
    value: 'linear-gradient(135deg, #fdfbf7 0%, #fef3c7 50%, #fdfbf7 100%)',
    preview: '#fef3c7',
  },
  {
    name: 'Pure White Clean',
    value: '#ffffff',
    preview: '#ffffff',
  },
  {
    name: 'Matte Charcoal Black',
    value: '#090a0f',
    preview: '#090a0f',
  },
];

const STARTER_PRESETS: Record<string, { name: string; bg: string; border: string; elements: CanvasElement[] }> = {
  GOLD_CLASSIC: {
    name: 'Gold Classic Diploma',
    bg: 'linear-gradient(135deg, #090d16 0%, #151208 50%, #090d16 100%)',
    border: '#d97706',
    elements: [
      {
        id: 'border-1',
        type: 'SHAPE',
        shapeType: 'BORDER_GOLD',
        x: 600,
        y: 337.5,
        width: 1160,
        height: 635,
        color: '#d97706',
        borderWidth: 4,
        opacity: 0.9,
      },
      {
        id: 'header-1',
        type: 'TEXT',
        text: 'CERTIFICATE OF COMPLETION',
        x: 600,
        y: 90,
        width: 800,
        height: 40,
        fontSize: 26,
        fontFamily: "'Cinzel', serif",
        fontWeight: 'bold',
        color: '#f59e0b',
        align: 'center',
        letterSpacing: 4,
      },
      {
        id: 'sub-1',
        type: 'TEXT',
        text: 'THIS IS PROUDLY PRESENTED TO',
        x: 600,
        y: 155,
        width: 600,
        height: 25,
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
        color: '#94a3b8',
        align: 'center',
        letterSpacing: 2,
      },
      {
        id: 'var-student',
        type: 'VARIABLE',
        variableKey: 'student_name',
        x: 600,
        y: 215,
        width: 800,
        height: 60,
        fontSize: 42,
        fontFamily: "'Playfair Display', serif",
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'center',
      },
      {
        id: 'sub-2',
        type: 'TEXT',
        text: 'for successfully completing all rigorous curriculum requirements of',
        x: 600,
        y: 290,
        width: 800,
        height: 25,
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
        color: '#94a3b8',
        align: 'center',
      },
      {
        id: 'var-course',
        type: 'VARIABLE',
        variableKey: 'course_title',
        x: 600,
        y: 340,
        width: 900,
        height: 45,
        fontSize: 24,
        fontFamily: "'Cinzel', serif",
        fontWeight: 'bold',
        color: '#60a5fa',
        align: 'center',
      },
      {
        id: 'div-1',
        type: 'SHAPE',
        shapeType: 'DIVIDER',
        x: 600,
        y: 400,
        width: 300,
        height: 2,
        color: '#f59e0b',
        opacity: 0.4,
      },
      {
        id: 'sig-title',
        type: 'TEXT',
        text: 'Authorized Signatory',
        x: 200,
        y: 530,
        width: 250,
        height: 45,
        fontSize: 30,
        fontFamily: "'Alex Brush', cursive",
        color: '#e2e8f0',
        align: 'center',
      },
      {
        id: 'sig-sub',
        type: 'TEXT',
        text: 'Program Dean / Faculty Director',
        x: 200,
        y: 580,
        width: 250,
        height: 20,
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
        color: '#64748b',
        align: 'center',
      },
      {
        id: 'qr-1',
        type: 'QRCODE',
        x: 600,
        y: 530,
        width: 95,
        height: 95,
      },
      {
        id: 'var-date',
        type: 'VARIABLE',
        variableKey: 'issue_date',
        x: 1000,
        y: 540,
        width: 220,
        height: 25,
        fontSize: 14,
        fontFamily: "'Roboto Mono', monospace",
        color: '#f8fafc',
        align: 'center',
      },
      {
        id: 'date-sub',
        type: 'TEXT',
        text: 'Date of Issuance',
        x: 1000,
        y: 580,
        width: 220,
        height: 20,
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
        color: '#64748b',
        align: 'center',
      },
    ],
  },
  MODERN_NEON: {
    name: 'Modern Web3 Neon',
    bg: 'linear-gradient(135deg, #030712 0%, #082f49 50%, #030712 100%)',
    border: '#0ea5e9',
    elements: [
      {
        id: 'border-neon',
        type: 'SHAPE',
        shapeType: 'BORDER_NEON',
        x: 600,
        y: 337.5,
        width: 1160,
        height: 635,
        color: '#0ea5e9',
        borderWidth: 2,
        opacity: 0.9,
      },
      {
        id: 'header-neon',
        type: 'TEXT',
        text: 'DECENTRALIZED CREDENTIAL RECORD',
        x: 600,
        y: 85,
        width: 800,
        height: 40,
        fontSize: 22,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 'bold',
        color: '#38bdf8',
        align: 'center',
        letterSpacing: 4,
      },
      {
        id: 'var-student-neon',
        type: 'VARIABLE',
        variableKey: 'student_name',
        x: 600,
        y: 200,
        width: 800,
        height: 60,
        fontSize: 38,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'center',
      },
      {
        id: 'var-course-neon',
        type: 'VARIABLE',
        variableKey: 'course_title',
        x: 600,
        y: 310,
        width: 850,
        height: 45,
        fontSize: 22,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 'bold',
        color: '#38bdf8',
        align: 'center',
      },
      {
        id: 'qr-neon',
        type: 'QRCODE',
        x: 600,
        y: 470,
        width: 100,
        height: 100,
      },
    ],
  },
  SOLANA_CYBER: {
    name: 'Solana High-Throughput Cyber',
    bg: 'linear-gradient(135deg, #090314 0%, #2e1065 50%, #090314 100%)',
    border: '#a855f7',
    elements: [
      {
        id: 'border-purple',
        type: 'SHAPE',
        shapeType: 'BORDER_PURPLE',
        x: 600,
        y: 337.5,
        width: 1160,
        height: 635,
        color: '#a855f7',
        borderWidth: 2,
        opacity: 0.9,
      },
      {
        id: 'header-sol',
        type: 'TEXT',
        text: 'SOLANA ON-CHAIN SOULBOUND PROOF',
        x: 600,
        y: 90,
        width: 800,
        height: 40,
        fontSize: 22,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 'bold',
        color: '#c084fc',
        align: 'center',
        letterSpacing: 3,
      },
      {
        id: 'var-student-sol',
        type: 'VARIABLE',
        variableKey: 'student_name',
        x: 600,
        y: 210,
        width: 800,
        height: 60,
        fontSize: 40,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'center',
      },
      {
        id: 'var-course-sol',
        type: 'VARIABLE',
        variableKey: 'course_title',
        x: 600,
        y: 320,
        width: 850,
        height: 45,
        fontSize: 24,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 'bold',
        color: '#e879f9',
        align: 'center',
      },
      {
        id: 'qr-sol',
        type: 'QRCODE',
        x: 600,
        y: 480,
        width: 100,
        height: 100,
      },
    ],
  },
};

export function CertificateDesigner({
  initialData,
  courseTitle,
  courseCode,
  onSave,
  isSaving = false,
}: CertificateDesignerProps) {
  const [canvasWidth, setCanvasWidth] = useState<number>(initialData?.canvasWidth || 1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(initialData?.canvasHeight || 675);

  const [elements, setElements] = useState<CanvasElement[]>(
    initialData?.elements || STARTER_PRESETS.GOLD_CLASSIC.elements,
  );
  const [backgroundTheme, setBackgroundTheme] = useState<string>(
    initialData?.backgroundTheme || STARTER_PRESETS.GOLD_CLASSIC.bg,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<CanvasElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dragging / Resizing State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(0.7);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update history on element change
  const pushHistory = (newElements: CanvasElement[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newElements);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Selected Element
  const selectedElement = elements.find((el) => el.id === selectedId);

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    const newElements = elements.map((el) =>
      el.id === selectedId ? { ...el, ...updates } : el,
    );
    setElements(newElements);
    pushHistory(newElements);
  };

  // Add Element Handlers
  const addTextElement = (text = 'Click to edit text', isHeading = false) => {
    const newEl: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'TEXT',
      text,
      x: Math.round(canvasWidth / 2),
      y: Math.round(canvasHeight / 2),
      width: isHeading ? Math.min(600, canvasWidth - 100) : Math.min(400, canvasWidth - 100),
      height: isHeading ? 40 : 30,
      fontSize: isHeading ? 24 : 16,
      fontFamily: isHeading ? "'Cinzel', serif" : "'Inter', sans-serif",
      fontWeight: isHeading ? 'bold' : 'normal',
      color: isHeading ? '#f59e0b' : '#ffffff',
      align: 'center',
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedId(newEl.id);
    pushHistory(newElements);
  };

  const addVariableElement = (key: string) => {
    const tag = VARIABLE_TAGS.find((t) => t.key === key);
    const newEl: CanvasElement = {
      id: `var-${Date.now()}`,
      type: 'VARIABLE',
      variableKey: key,
      x: Math.round(canvasWidth / 2),
      y: Math.round(canvasHeight / 2),
      width: Math.min(500, canvasWidth - 100),
      height: 40,
      fontSize: 20,
      fontFamily: "'Playfair Display', serif",
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedId(newEl.id);
    pushHistory(newElements);
  };

  const addQrCodeElement = () => {
    const newEl: CanvasElement = {
      id: `qr-${Date.now()}`,
      type: 'QRCODE',
      x: Math.round(canvasWidth / 2),
      y: Math.round(canvasHeight - 120),
      width: 90,
      height: 90,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedId(newEl.id);
    pushHistory(newElements);
  };

  const addBorderElement = (shapeType: 'BORDER_GOLD' | 'BORDER_NEON' | 'BORDER_PURPLE' = 'BORDER_GOLD') => {
    const newEl: CanvasElement = {
      id: `border-${Date.now()}`,
      type: 'SHAPE',
      shapeType,
      x: Math.round(canvasWidth / 2),
      y: Math.round(canvasHeight / 2),
      width: canvasWidth - 40,
      height: canvasHeight - 40,
      borderWidth: 4,
      color: shapeType === 'BORDER_GOLD' ? '#d97706' : shapeType === 'BORDER_NEON' ? '#0ea5e9' : '#a855f7',
      opacity: 0.9,
    };
    const newElements = [newEl, ...elements]; // Place border at back
    setElements(newElements);
    setSelectedId(newEl.id);
    pushHistory(newElements);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newEl: CanvasElement = {
          id: `img-${Date.now()}`,
          type: 'IMAGE',
          imageUrl,
          x: Math.round(canvasWidth / 2),
          y: 120,
          width: 120,
          height: 120,
          opacity: 1,
        };
        const newElements = [...elements, newEl];
        setElements(newElements);
        setSelectedId(newEl.id);
        pushHistory(newElements);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newElements = elements.filter((el) => el.id !== selectedId);
    setElements(newElements);
    setSelectedId(null);
    pushHistory(newElements);
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;
    const newEl: CanvasElement = {
      ...selectedElement,
      id: `${selectedElement.type.toLowerCase()}-${Date.now()}`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedId(newEl.id);
    pushHistory(newElements);
  };

  const fitSelectedToCanvas = () => {
    if (!selectedElement) return;
    updateSelectedElement({
      x: Math.round(canvasWidth / 2),
      y: Math.round(canvasHeight / 2),
      width: canvasWidth - 40,
      height: canvasHeight - 40,
    });
  };

  const loadPreset = (presetKey: string) => {
    const preset = STARTER_PRESETS[presetKey];
    if (preset) {
      setElements(preset.elements);
      setBackgroundTheme(preset.bg);
      setSelectedId(null);
      pushHistory(preset.elements);
    }
  };

  // Keyboard shortcut listener: Delete or Backspace to remove selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          deleteSelected();
        }
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, historyIndex, history]);

  // Drag & Move Handler
  const handleMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedId(element.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedId(element.id);
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement) return;

    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      const newX = Math.round(elementStart.x + deltaX);
      const newY = Math.round(elementStart.y + deltaY);

      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, x: newX, y: newY } : el)),
      );
    } else if (isResizing) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      const newWidth = Math.max(30, Math.round(elementStart.width + deltaX * 2));
      const newHeight = Math.max(20, Math.round(elementStart.height + deltaY * 2));

      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, width: newWidth, height: newHeight } : el)),
      );
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      pushHistory(elements);
    }
  };

  const handleSaveClick = async () => {
    if (onSave) {
      await onSave({
        backgroundTheme,
        canvasWidth,
        canvasHeight,
        elements,
      });
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3500);
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-full">
      {/* Top Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card/70 backdrop-blur">
        {/* Left: Element Inserters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => addTextElement('Custom Header Text', true)}
          >
            + Heading
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => addTextElement('Add descriptive text or subtitle here...', false)}
          >
            + Paragraph
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => addBorderElement('BORDER_GOLD')}
          >
            + Border
          </Button>

          {/* Upload Logo / Signature Button */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Logo / Signature
          </Button>

          <Button size="sm" variant="outline" className="text-xs h-8" onClick={addQrCodeElement}>
            + QR Block
          </Button>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 border-l pl-2 ml-1">
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">Preset:</span>
            <select
              className="text-xs rounded border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e) => loadPreset(e.target.value)}
              defaultValue="GOLD_CLASSIC"
            >
              <option value="GOLD_CLASSIC">Gold Classic Diploma</option>
              <option value="MODERN_NEON">Modern Web3 Neon</option>
              <option value="SOLANA_CYBER">Solana Cyber Purple</option>
            </select>
          </div>
        </div>

        {/* Right: Zoom, History & Save Action */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded-md px-1 py-0.5 bg-muted/40 text-xs font-mono">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-xs"
              onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.1).toFixed(2))))}
              title="Zoom Out"
            >
              -
            </Button>
            <span className="px-1 text-[11px] min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-xs"
              onClick={() => setZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
              title="Zoom In"
            >
              +
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-1.5"
              onClick={() => setZoom(0.65)}
              title="Fit to Screen"
            >
              Fit
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            Redo
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Button size="sm" onClick={handleSaveClick} disabled={isSaving} className="text-xs h-8 font-semibold">
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-2.5 text-xs text-green-400 flex items-center gap-2">
          <span>Certificate template layout successfully saved to MongoDB Atlas!</span>
        </div>
      )}

      {/* Dynamic Token Quick Tray */}
      <div className="p-2.5 rounded-lg border bg-muted/30 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold uppercase text-muted-foreground shrink-0 font-mono">
          Dynamic Tokens:
        </span>
        {VARIABLE_TAGS.map((tag) => (
          <button
            key={tag.key}
            type="button"
            onClick={() => addVariableElement(tag.key)}
            className="px-2.5 py-1 rounded bg-background border hover:border-primary text-[11px] font-mono text-foreground shrink-0 transition-colors cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Workspace Grid: Canvas + Properties Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Canvas Artboard Container */}
        <div className="lg:col-span-8 rounded-xl border bg-slate-950/90 p-4 flex flex-col items-center justify-center overflow-auto min-h-[520px]">
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              background: backgroundTheme,
            }}
            className="relative shadow-2xl rounded-lg border border-border select-none shrink-0 transition-transform my-2"
            onClick={(e) => {
              // ONLY deselect if clicking directly on the empty canvas backdrop
              if (e.target === e.currentTarget) {
                setSelectedId(null);
              }
            }}
          >
            {/* Render Canvas Elements */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${el.x - el.width / 2}px`,
                    top: `${el.y - el.height / 2}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    fontFamily: el.fontFamily || "'Inter', sans-serif",
                    fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    color: el.color || '#ffffff',
                    textAlign: el.align || 'center',
                    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                    opacity: el.opacity ?? 1,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center',
                    cursor: isDragging && isSelected ? 'grabbing' : 'grab',
                  }}
                  className={`transition-shadow ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-900' : 'hover:ring-1 hover:ring-primary/40'
                  }`}
                >
                  {/* Floating Action Badge on Selected Element */}
                  {isSelected && (
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/95 border border-border px-2 py-0.5 rounded-md shadow-lg z-50 pointer-events-auto text-[10px] font-semibold font-mono"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSelected();
                        }}
                        className="px-1.5 py-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      >
                        Duplicate
                      </button>
                      <span className="text-border">|</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSelected();
                        }}
                        className="px-1.5 py-0.5 hover:bg-destructive/20 rounded text-destructive hover:text-red-400 font-bold"
                      >
                        DELETE
                      </button>
                    </div>
                  )}

                  {/* TEXT ELEMENT */}
                  {el.type === 'TEXT' && (
                    <span className="w-full pointer-events-none select-none leading-tight">{el.text}</span>
                  )}

                  {/* VARIABLE TOKEN */}
                  {el.type === 'VARIABLE' && (
                    <span className="w-full pointer-events-none select-none leading-tight drop-shadow-sm font-semibold">
                      {VARIABLE_TAGS.find((v) => v.key === el.variableKey)?.sample || `{{ ${el.variableKey} }}`}
                    </span>
                  )}

                  {/* IMAGE / LOGO / SIGNATURE */}
                  {el.type === 'IMAGE' && el.imageUrl && (
                    <img
                      src={el.imageUrl}
                      alt="Element"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* QR CODE BLOCK */}
                  {el.type === 'QRCODE' && (
                    <div className="w-full h-full p-2 bg-white rounded-lg flex flex-col items-center justify-center text-black pointer-events-none">
                      <div className="w-full h-full border border-black/20 flex items-center justify-center font-mono font-bold text-xs">
                        QR
                      </div>
                      <span className="text-[7px] font-mono font-bold text-center mt-0.5">XERTY VERIFIED</span>
                    </div>
                  )}

                  {/* SHAPES & BORDERS */}
                  {el.type === 'SHAPE' && el.shapeType === 'BORDER_GOLD' && (
                    <div
                      style={{
                        borderColor: el.color || '#d97706',
                        borderWidth: `${el.borderWidth || 4}px`,
                      }}
                      className="w-full h-full rounded-lg pointer-events-none relative border-solid"
                    >
                      <div
                        style={{ borderColor: el.color || '#f59e0b' }}
                        className="absolute inset-1.5 border border-dashed rounded opacity-50"
                      />
                    </div>
                  )}

                  {el.type === 'SHAPE' && el.shapeType === 'BORDER_NEON' && (
                    <div
                      style={{
                        borderColor: el.color || '#0ea5e9',
                        borderWidth: `${el.borderWidth || 3}px`,
                        boxShadow: `0 0 15px ${el.color || '#0ea5e9'}40`,
                      }}
                      className="w-full h-full rounded-xl pointer-events-none"
                    />
                  )}

                  {el.type === 'SHAPE' && el.shapeType === 'BORDER_PURPLE' && (
                    <div
                      style={{
                        borderColor: el.color || '#a855f7',
                        borderWidth: `${el.borderWidth || 3}px`,
                        boxShadow: `0 0 15px ${el.color || '#a855f7'}40`,
                      }}
                      className="w-full h-full rounded-xl pointer-events-none"
                    />
                  )}

                  {el.type === 'SHAPE' && el.shapeType === 'DIVIDER' && (
                    <div
                      style={{ backgroundColor: el.color || '#f59e0b', height: `${el.borderWidth || 2}px` }}
                      className="w-full pointer-events-none opacity-50"
                    />
                  )}

                  {/* Resize Handles on Selected Element */}
                  {isSelected && (
                    <>
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, el)}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize border-2 border-background shadow-md"
                        title="Drag to resize Width & Height"
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, el)}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nw-resize border-2 border-background shadow-md"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector & Formatting Panel */}
        <div
          className="lg:col-span-4 space-y-4"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {selectedElement ? (
            <Card className="border-primary/50 shadow-lg">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase font-mono text-primary">
                    Inspector ({selectedElement.type})
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={duplicateSelected}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedId(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* 1. Dimensions (Width & Height) */}
                <div className="space-y-1.5 p-2.5 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-primary font-mono">
                      Dimensions & Bounds
                    </span>
                    {selectedElement.type === 'SHAPE' && (
                      <button
                        type="button"
                        onClick={fitSelectedToCanvas}
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Fit Border to Canvas
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Width (px):</label>
                      <input
                        type="number"
                        min="20"
                        max="2400"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={selectedElement.width}
                        onChange={(e) =>
                          updateSelectedElement({ width: Math.max(20, parseInt(e.target.value) || 20) })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Height (px):</label>
                      <input
                        type="number"
                        min="2"
                        max="2000"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={selectedElement.height}
                        onChange={(e) =>
                          updateSelectedElement({ height: Math.max(2, parseInt(e.target.value) || 2) })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Position Coordinates (X, Y) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Center Coordinates (X, Y)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">X (Center):</span>
                      <input
                        type="number"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Y (Center):</span>
                      <input
                        type="number"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Shape / Border Specific Controls */}
                {selectedElement.type === 'SHAPE' && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Border Color
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="h-7 w-7 rounded cursor-pointer border bg-transparent p-0"
                            value={selectedElement.color || '#d97706'}
                            onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          />
                          <span className="font-mono text-[10px] uppercase">{selectedElement.color}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Thickness (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-full rounded border bg-background px-2 py-1 text-xs font-mono"
                          value={selectedElement.borderWidth || 4}
                          onChange={(e) =>
                            updateSelectedElement({ borderWidth: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Text Content (if Text Element) */}
                {selectedElement.type === 'TEXT' && (
                  <div className="space-y-1 pt-2 border-t">
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">Text String</label>
                    <textarea
                      rows={2}
                      className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    />
                  </div>
                )}

                {/* 5. Typography Controls (if Text or Variable) */}
                {(selectedElement.type === 'TEXT' || selectedElement.type === 'VARIABLE') && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Font Family</label>
                      <select
                        className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        value={selectedElement.fontFamily}
                        onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                      >
                        {FONTS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Font Size (px)</label>
                        <input
                          type="number"
                          className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 12 })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="h-7 w-7 rounded cursor-pointer border bg-transparent p-0"
                            value={selectedElement.color || '#ffffff'}
                            onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          />
                          <span className="font-mono text-[10px] uppercase">{selectedElement.color}</span>
                        </div>
                      </div>
                    </div>

                    {/* Alignment & Weight */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 border rounded p-0.5 bg-muted/40">
                        <Button
                          size="sm"
                          variant={selectedElement.align === 'left' ? 'secondary' : 'ghost'}
                          className="h-6 px-2 text-[10px] font-mono"
                          onClick={() => updateSelectedElement({ align: 'left' })}
                        >
                          Left
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedElement.align === 'center' ? 'secondary' : 'ghost'}
                          className="h-6 px-2 text-[10px] font-mono"
                          onClick={() => updateSelectedElement({ align: 'center' })}
                        >
                          Center
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedElement.align === 'right' ? 'secondary' : 'ghost'}
                          className="h-6 px-2 text-[10px] font-mono"
                          onClick={() => updateSelectedElement({ align: 'right' })}
                        >
                          Right
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 border rounded p-0.5 bg-muted/40">
                        <Button
                          size="sm"
                          variant={selectedElement.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                          className="h-6 w-6 p-0 text-xs font-bold font-mono"
                          onClick={() =>
                            updateSelectedElement({
                              fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold',
                            })
                          }
                        >
                          B
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedElement.fontStyle === 'italic' ? 'secondary' : 'ghost'}
                          className="h-6 w-6 p-0 text-xs italic font-mono"
                          onClick={() =>
                            updateSelectedElement({
                              fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                            })
                          }
                        >
                          I
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* EXACT "DELETE" BUTTON (No icons, no extra words) */}
                <div className="pt-3 border-t">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs h-9 font-bold tracking-wider uppercase"
                    onClick={deleteSelected}
                  >
                    DELETE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Canvas & Background Settings (When no element is selected) */
            <Card className="border-border">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs uppercase font-mono text-primary">
                  Canvas & Background Size
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* 1. Certificate Canvas Size (Width & Height) */}
                <div className="space-y-2 p-2.5 rounded-lg border bg-muted/20">
                  <label className="text-[10px] font-semibold uppercase text-primary font-mono block">
                    Certificate Dimensions (Size)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Width (px):</label>
                      <input
                        type="number"
                        min="600"
                        max="2400"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={canvasWidth}
                        onChange={(e) => setCanvasWidth(Math.max(400, parseInt(e.target.value) || 1200))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Height (px):</label>
                      <input
                        type="number"
                        min="400"
                        max="2000"
                        className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={canvasHeight}
                        onChange={(e) => setCanvasHeight(Math.max(300, parseInt(e.target.value) || 675))}
                      />
                    </div>
                  </div>

                  {/* Size Presets */}
                  <div className="pt-1.5">
                    <span className="text-[10px] text-muted-foreground block mb-1">Standard Size Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {CANVAS_SIZE_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setCanvasWidth(p.width);
                            setCanvasHeight(p.height);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                            canvasWidth === p.width && canvasHeight === p.height
                              ? 'border-primary bg-primary/10 font-bold text-primary'
                              : 'bg-background hover:border-primary/50 text-muted-foreground'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Custom Solid Color */}
                <div className="space-y-1.5 p-2.5 rounded-lg border bg-muted/20">
                  <label className="text-[10px] font-semibold uppercase text-muted-foreground block">
                    Custom Solid Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-8 w-10 rounded cursor-pointer border bg-transparent p-0"
                      value={backgroundTheme.startsWith('#') ? backgroundTheme : '#090d16'}
                      onChange={(e) => setBackgroundTheme(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full rounded border bg-background px-2 py-1 text-xs font-mono"
                      value={backgroundTheme}
                      placeholder="e.g. #090d16 or linear-gradient(...)"
                      onChange={(e) => setBackgroundTheme(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Curated Background Themes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-muted-foreground block font-mono">
                    Curated Gradient & Color Themes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKGROUND_PRESETS.map((preset) => {
                      const isActive = backgroundTheme === preset.value;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setBackgroundTheme(preset.value)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isActive
                              ? 'border-primary ring-1 ring-primary bg-primary/10 font-semibold'
                              : 'hover:border-primary/50 bg-background'
                          }`}
                        >
                          <div
                            style={{ background: preset.value }}
                            className="w-5 h-5 rounded-full border shrink-0 shadow-sm"
                          />
                          <span className="text-[11px] truncate leading-tight">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    Tip:
                  </p>
                  <p>
                    Click on any text, border, or token on the diploma to inspect and modify its dimensions and styling. Click on the background canvas to return to background and canvas size settings!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
