import React, { useRef, useEffect } from "react";

type Props = {
  analyser: React.MutableRefObject<AnalyserNode | null>;
  isRecording: boolean;
  height?: number;
};

const Waveform: React.FC<Props> = ({
  analyser,
  isRecording,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const envRef = useRef(0);

  useEffect(() => {
    if (!isRecording || !analyser.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const buffer = new Uint8Array(analyser.current.fftSize);

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const cssWidth = canvas.offsetWidth;
      canvas.width = cssWidth * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#ffffff"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const attack = 0.3;
    const release = 0.1;

    const draw = () => {
      analyser.current!.getByteTimeDomainData(buffer);

      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buffer.length);

      if (rms > envRef.current) envRef.current += (rms - envRef.current) * attack;
      else envRef.current += (rms - envRef.current) * release;

      const w = canvas.width / dpr;
      const h = height;
      const centerY = h / 2;

      const imageData = ctx.getImageData(1 * dpr, 0, (w - 1) * dpr, h * dpr);
      ctx.putImageData(imageData, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(w - 2, 0, 2, h);


      ctx.strokeStyle = "#cccccc";
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();

      // spike amplitude
      const spike = envRef.current * (h / 2 - 4);

      // draw spike (light green vertical line)
      ctx.strokeStyle = "#00cc66";
      ctx.beginPath();
      ctx.moveTo(w - 1, centerY - spike);
      ctx.lineTo(w - 1, centerY + spike);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isRecording, analyser, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: `${height}px`,
        background: "#ffffff",
      }}
    />
  );
};
export default Waveform;



 
