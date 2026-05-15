import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Settings, Activity, Aperture, Layers, Maximize, MousePointer2 } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ wavelength: 632.8, pixel_size: 6.4, distance: 0.25 });
  const [hoverData, setHoverData] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const runSimulation = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('wavelength', params.wavelength);
    formData.append('pixel_size', params.pixel_size);
    formData.append('distance', params.distance);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await axios.post(apiUrl + '/simulate', formData);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      alert('Simulation failed. Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>
      <header className="flex justify-between items-center mb-8 glass-panel p-4">
        <h1 className="text-3xl font-bold text-cyan-400 neon-text flex items-center gap-3">
          <Aperture className="animate-spin-slow text-cyan-400" />
          Computational Holography Simulator
        </h1>
        <div className="flex gap-4">
          <label className="cursor-pointer bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 px-6 py-2 rounded-lg border border-cyan-500/30 transition-all flex items-center gap-2">
            <Upload size={18} />
            Upload Object Image
            <input type="file" hidden accept="image/*" onChange={handleFile} />
          </label>
          <button onClick={runSimulation} disabled={!file || loading}
            className={"px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all " + (!file ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : loading ? 'bg-cyan-700 animate-pulse' : 'bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-[0_0_15px_rgba(0,255,255,0.4)]')}>
            {loading ? <Activity className="animate-spin" /> : <Maximize size={18} />}
            {loading ? 'SIMULATING...' : 'RUN SIMULATION'}
          </button>
        </div>
      </header>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-300 border-b border-blue-900/50 pb-4">
              <Settings size={20} /> Optical Parameters
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Wavelength (λ)</span><span className="text-cyan-400">{params.wavelength} nm</span>
                </label>
                <input type="range" min="400" max="700" step="0.1" value={params.wavelength}
                  onChange={e => setParams({...params, wavelength: e.target.value})} className="w-full" />
              </div>
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Propagation Distance (z)</span><span className="text-cyan-400">{params.distance} m</span>
                </label>
                <input type="range" min="0.01" max="1" step="0.01" value={params.distance}
                  onChange={e => setParams({...params, distance: e.target.value})} className="w-full" />
              </div>
              <div>
                <label className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Pixel Size</span><span className="text-cyan-400">{params.pixel_size} µm</span>
                </label>
                <input type="range" min="1" max="20" step="0.1" value={params.pixel_size}
                  onChange={e => setParams({...params, pixel_size: e.target.value})} className="w-full" />
              </div>
            </div>
          </div>
          <AnimatePresence>
            {results && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-300 border-b border-green-900/50 pb-4">
                  <Activity size={20} /> Numerical Analysis
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block text-xs uppercase mb-1">Image Quality</span>
                    <strong className="text-cyan-400 text-lg">{results.metrics.psnr}</strong>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block text-xs uppercase mb-1">Similarity</span>
                    <strong className="text-green-400 text-lg">{results.metrics.ssim}</strong>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block text-xs uppercase mb-1">Error Rate</span>
                    <strong className="text-red-400 text-lg">{results.metrics.mse}</strong>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block text-xs uppercase mb-1">Processing Time</span>
                    <strong className="text-purple-400 text-lg">{results.metrics.calc_time}</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-300 border-b border-purple-900/50 pb-4">
              <MousePointer2 size={20} /> Pixel Inspector
            </h2>
            {hoverData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Source Panel:</span>
                  <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded border border-cyan-800">{hoverData.panel}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Spatial X</span>
                    <strong className="text-white font-mono">{hoverData.x} px</strong>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Spatial Y</span>
                    <strong className="text-white font-mono">{hoverData.y} px</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-8 border border-dashed border-gray-700 rounded-lg bg-black/20">
                <MousePointer2 className="mx-auto mb-2 opacity-20" size={24} />
                Hover over any generated image to inspect pixel data
              </div>
            )}
          </div>
        </div>
        <div className="col-span-9">
          <div className="grid grid-cols-2 gap-6">
            <Panel title="01 Original Object" img={preview} delay={0.1} onHover={setHoverData} />
            <Panel title="02 Fourier Spectrum" img={results && results.images && results.images.spectrum} delay={0.2} loading={loading} onHover={setHoverData} />
            <Panel title="03 Digital Hologram" img={results && results.images && results.images.hologram} delay={0.3} loading={loading} onHover={setHoverData} />
            <Panel title="04 Reconstruction" img={results && results.images && results.images.reconstruction} delay={0.4} loading={loading} onHover={setHoverData} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Panel = ({ title, img, delay = 0, loading = false, onHover }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (img && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = img;
      image.onload = () => { canvas.width = image.width; canvas.height = image.height; ctx.drawImage(image, 0, 0); };
    }
  }, [img]);
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !onHover) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      onHover({ panel: title.substring(3), x, y, r: pixel[0], g: pixel[1], b: pixel[2] });
    }
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}
      className="glass-panel flex flex-col glow-hover transition-all duration-300 overflow-hidden aspect-square">
      <div className="bg-black/40 p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-cyan-500" />
          <h3 className="text-sm font-medium tracking-wide text-gray-300">{title}</h3>
        </div>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center bg-black/20 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <Aperture className="animate-spin-slow text-cyan-500 opacity-50" size={48} />
          </div>
        ) : img ? (
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onMouseLeave={() => onHover && onHover(null)}
            className="max-w-full max-h-full object-contain rounded drop-shadow-[0_0_15px_rgba(0,255,255,0.2)] cursor-crosshair" />
        ) : (
          <div className="text-gray-600 flex flex-col items-center gap-2">
            <Aperture size={32} className="opacity-20" />
            <span className="text-xs uppercase tracking-widest">Awaiting Simulation</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default App;
