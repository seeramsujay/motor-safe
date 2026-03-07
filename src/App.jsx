import { useEffect, useState, useRef } from "react";
import { Activity, Plus, Download, Server, AlertTriangle, X, CheckCircle2, LayoutDashboard, PieChart, Zap, Settings, Power } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse"; // Added PapaParse

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Updated Status Config for Confidence Ratings
const STATUS_CONFIG = {
  good: { color: "#10B981", label: "Optimal", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  moderate: { color: "#F59E0B", label: "Warning", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  critical: { color: "#EF4444", label: "Critical", bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-500" },
};

// Initial 5 Motors Data
const INITIAL_DATA = {
  system_status: "ACTIVE",
  timestamp: new Date().toISOString(),
  nodes: [
    { id: "MTR-01", location: "Conveyor Belt A", voltage: 230, current: 12.5, vibration: 0.02, confidence: 15, status: "good" },
    { id: "MTR-02", location: "Main Pump", voltage: 228, current: 14.1, vibration: 0.05, confidence: 75, status: "moderate" },
    { id: "MTR-03", location: "Cooling Fan", voltage: 231, current: 11.2, vibration: 0.01, confidence: 10, status: "good" },
    { id: "MTR-04", location: "Extruder Drive", voltage: 215, current: 28.5, vibration: 0.85, confidence: 94, status: "critical" },
    { id: "MTR-05", location: "Packaging Arm", voltage: 230, current: 13.0, vibration: 0.03, confidence: 22, status: "good" },
  ],
  recent_logs: [
    { id: 1, time: new Date().toLocaleTimeString(), type: "SUCCESS", message: "MotorSafe Edge-AI Initialized. Listening to Serial Port." }
  ],
};

function getMotorStatus(confidence) {
  if (confidence >= 90) return "critical";
  if (confidence >= 70) return "moderate";
  return "good";
}

const GlassCard = ({ children, className, hover = false }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={hover ? { scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" } : {}} className={cn("backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-5 shadow-xl transition-colors", className)}>{children}</motion.div>
);

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <GlassCard hover className="flex flex-col justify-between h-32 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 bg-gradient-to-br from-amber-500/20 to-transparent w-24 h-24 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all" />
    <div className="flex justify-between items-start z-10">
      <div><p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p><h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3></div>
      <div className="p-2 bg-white/5 rounded-lg text-amber-400"><Icon size={20} /></div>
    </div>
    {trend && <p className="text-xs text-slate-500 mt-2 font-mono">{trend}</p>}
  </GlassCard>
);
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float } from '@react-three/drei';

const FactorySimulation = ({ nodes }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 4, 3]} fov={50} />
        <OrbitControls
          makeDefault
          enableZoom={true}
          enablePan={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2} // Restrict camera to stay above floor
          target={[0, 0, 0]}
        />

        <Suspense fallback={null}>
          <group>
            {/* Flat Grid Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
              <planeGeometry args={[10, 10]} />
              <shadowMaterial opacity={0.3} />
            </mesh>
            <gridHelper args={[10, 10, "#444", "#222"]} rotation={[0, 0, 0]} />

            {/* Motor Representations - Arranged in a plan layout */}
            {nodes.slice(0, 5).map((node, i) => {
              // Defined plan positions for MTR-01 through MTR-05
              const positions = [
                [-1.5, 0, -1.2], // MTR-01 Top Left
                [0, 0, -1.2],    // MTR-02 Top Center
                [1.5, 0, -1.2],  // MTR-03 Top Right
                [-1.5, 0, 1.2],   // MTR-04 Bottom Left
                [1.5, 0, 1.2]    // MTR-05 Bottom Right
              ];
              const position = positions[i] || [0, 0, 0];
              const status = STATUS_CONFIG[node.status];
              const isCritical = node.status === 'critical';

              return (
                <Float
                  key={node.id}
                  position={position}
                  speed={isCritical ? 3 : 1.5}
                  rotationIntensity={isCritical ? 0.3 : 0.1}
                  floatIntensity={isCritical ? 0.2 : 0.1}
                >
                  <group>
                    {/* Simplified flat Motor Body for plan view */}
                    <mesh castShadow receiveShadow>
                      <boxGeometry args={[0.9, 0.4, 0.6]} />
                      <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.1} />
                    </mesh>

                    {/* Glowing status indicator at the top end of the box */}
                    <mesh position={[0, 0.21, -0.2]} castShadow>
                      <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
                      <meshStandardMaterial
                        color={status.color}
                        emissive={status.color}
                        emissiveIntensity={isCritical ? 10 : 1}
                      />
                    </mesh>

                    {/* Text Label above the node */}
                    <Text
                      position={[0, 0.6, 0]}
                      fontSize={0.2}
                      color="white"
                      anchorX="center"
                      anchorY="middle"
                      fontWeight="bold"
                    >
                      {node.id}
                    </Text>
                  </group>
                </Float>
              );
            })}
          </group>
          
          <ambientLight intensity={0.5} />
          <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
          <directionalLight position={[0, 5, -5]} intensity={0.5} castShadow />
        </Suspense>
      </Canvas>
      
      {/* Absolute Legend overlay positioned bottom left - updated to match visual design */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-3 p-5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 pointer-events-none text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">
        <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"/>
            <p>HEALTHY_NODE</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"/>
            <p>ANOMALY_DETECTED</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse"/>
            <p>CRITICAL_FAILURE</p>
        </div>
      </div>
    </div>
  );
};
export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [csvData, setCsvData] = useState([]); // CSV state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMotor, setNewMotor] = useState({ id: "", location: "" });
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const logsEndRef = useRef(null);

  // 1. Load CSV Data
  useEffect(() => {
    Papa.parse("/motor_parameters.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  }, []);

// 2. Automated CSV Data Integration
 // Add this state at the top of your App component with your other states
const [currentRow, setCurrentRow] = useState(0);

// Updated Status Helper for 50/70 thresholds
const getMotorStatus = (confidence) => {
  if (confidence >= 70) return "critical"; // New threshold
  if (confidence >= 50) return "moderate"; // New threshold
  return "good";
};

// 2. Automated CSV Step-Through Loop
useEffect(() => {
  if (csvData.length === 0) return;

  const interval = setInterval(() => {
    // 1. Move to the next row, loop back to start if at the end
    const nextRowIndex = (currentRow + 1) % csvData.length;
    setCurrentRow(nextRowIndex);

    setData((prev) => {
      let newLogs = [...prev.recent_logs];
      const latestRow = csvData[nextRowIndex]; // Use the moving row index
      
      const updatedNodes = prev.nodes.map((node, index) => {
        const motorIndex = index + 1;
        const prefix = `Motor_${motorIndex}`;
        
        // 2. Extract raw data from the current moving row
        const rawVolt = latestRow[`${prefix}_Voltage`];
        const rawCurr = latestRow[`${prefix}_Current`];
        const rawAnom = latestRow[`${prefix}_Voltage_Anomaly`];

        // 3. Scale and clean data
        const numericAnom = Math.abs(parseFloat(rawAnom) || 0);
        const displayConfidence = numericAnom <= 1 ? numericAnom * 100 : numericAnom;
        const newStatus = getMotorStatus(displayConfidence);

        // 4. Alert Logic
        if (newStatus === "critical" && node.status !== "critical") {
          newLogs.push({
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: "ALERT",
            message: `CRITICAL: ${node.id} hit ${displayConfidence.toFixed(1)}%`
          });
        }

        return {
          ...node,
          voltage: parseFloat(rawVolt || 0).toFixed(1),
          current: parseFloat(rawCurr || 0).toFixed(2),
          confidence: displayConfidence,
          status: newStatus
        };
      });

      if (newLogs.length > 50) newLogs.shift();
      return { ...prev, nodes: updatedNodes, recent_logs: newLogs };
    });
  }, 100); // 1000ms = 1 second refresh

  return () => clearInterval(interval);
}, [csvData, currentRow]); // Added currentRow as dependency

  const handleAddMotor = () => {
    if(!newMotor.id || !newMotor.location) return;
    setData((d) => ({
      ...d, nodes: [...d.nodes, { id: newMotor.id, location: newMotor.location, voltage: 230, current: 12, vibration: 0.01, confidence: 5, status: "good" }],
    }));
    setIsModalOpen(false); setNewMotor({ id: "", location: "" });
  };

  const activeAlerts = data.nodes.filter(n => n.status === 'moderate' || n.status === 'critical').length;
  const criticalMotors = data.nodes.filter(n => n.status === 'critical');
  const topBadMotors = [...data.nodes].sort((a, b) => b.confidence - a.confidence).filter(n => n.confidence >= 70);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-black/50 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20"><Power className="text-white" size={18} /></div>
            <h1 className="text-xl font-bold tracking-tight text-white">Motor<span className="text-amber-500">Safe</span></h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('dashboard')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'dashboard' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "hover:bg-white/5 text-slate-400 hover:text-white")}>
                <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab('analytics')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeTab === 'analytics' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "hover:bg-white/5 text-slate-400 hover:text-white")}>
                <PieChart size={18} /> Analytics & Data
            </button>
          </nav>
          
          <div className="mt-auto">
             <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95">
              <Plus size={18} /> Deploy Motor
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/30 backdrop-blur-sm">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    {activeTab === 'dashboard' ? "Factory Floor Overview" : "Raw Sensor Feeds"}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Edge-AI Model Active • Last Sync: {new Date().toLocaleTimeString()}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 text-sm transition-colors"><Download size={16} /> Export Logs</button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Active Motors" value={data.nodes.length} icon={Server} trend="Live Sensor Fusion" />
              <StatCard title="Active Alerts" value={activeAlerts} icon={AlertTriangle} trend="Moderate & Critical" />
              <StatCard title="Bad Motors (Last 1hr)" value={criticalMotors.length} icon={Zap} trend="Requires Immediate Action" />
            </div>

            {/* DASHBOARD TAB */}
            <div className={cn("grid grid-cols-12 gap-6 h-[500px]", activeTab === 'dashboard' ? "" : "hidden")}>
                <GlassCard className="col-span-8 flex flex-col p-0 overflow-hidden relative border border-white/5 bg-gradient-to-b from-slate-900/50 to-black">
                    <FactorySimulation nodes={data.nodes} />
                </GlassCard>

                <GlassCard className="col-span-4 flex flex-col overflow-hidden border-l border-amber-500/10">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-white">Emergency Attention</h3><span className="text-xs px-2 py-1 rounded-full bg-red-950/50 border border-red-500/20 text-red-400 font-bold">{topBadMotors.length} Warnings</span></div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {topBadMotors.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <CheckCircle2 size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">All motors operating optimally.</p>
                        </div>
                    ) : (
                        <AnimatePresence>{topBadMotors.map((node) => {
                            const status = STATUS_CONFIG[node.status];
                            return (
                                <motion.div key={node.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={cn("p-4 rounded-xl border transition-all relative overflow-hidden group", status.bg, status.border)}>
                                <div className="flex justify-between items-start relative z-10"><div className="flex items-start gap-3"><div className={cn("p-2 rounded-lg bg-black/40", status.text)}><AlertTriangle size={18} /></div><div><h4 className="font-bold text-white text-sm">{node.id}</h4><p className="text-xs text-slate-400">{node.location}</p></div></div></div>
                                <div className="mt-3 flex items-end justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Anomaly Confidence</p>
                                        <p className={cn("text-3xl font-black leading-none", status.text)}>{node.confidence.toFixed(1)}%</p>
                                    </div>
                                    <div className={cn("text-xs font-bold px-3 py-1.5 rounded-md border backdrop-blur-md", status.text, status.border, "bg-black/50")}>{status.label}</div>
                                </div>
                                </motion.div>
                            );
                        })}</AnimatePresence>
                    )}
                    </div>
                </GlassCard>
            </div>

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <GlassCard className="h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div><h3 className="text-lg font-semibold text-white">Multi-Modal Sensor Feed</h3><p className="text-sm text-slate-400">Real-time isolation forest inputs</p></div>
                    </div>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-semibold">Motor ID</th>
                                    <th className="p-4 font-semibold">Location</th>
                                    <th className="p-4 font-semibold text-right">Voltage (V)</th>
                                    <th className="p-4 font-semibold text-right">Current (A)</th>
                                    <th className="p-4 font-semibold text-right">Vibration (g)</th>
                                    <th className="p-4 font-semibold text-right">Confidence</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.nodes.map((node) => (
                                    <tr key={node.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{node.id}</td>
                                        <td className="p-4 text-slate-300">{node.location}</td>
                                        <td className="p-4 text-right font-mono text-slate-300">{node.voltage}</td>
                                        <td className="p-4 text-right font-mono text-slate-300">{node.current}</td>
                                        <td className="p-4 text-right font-mono text-slate-300">{node.vibration}</td>
                                        <td className="p-4 text-right font-mono font-bold text-white">{node.confidence.toFixed(1)}%</td>
                                        <td className="p-4 text-center">
                                            <span className={cn("px-2 py-1 rounded text-xs font-bold border", STATUS_CONFIG[node.status].text, STATUS_CONFIG[node.status].border, STATUS_CONFIG[node.status].bg)}>
                                                {STATUS_CONFIG[node.status].label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            {/* SYSTEM LOGS */}
            <GlassCard className="h-64 flex flex-col border border-white/5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Edge-AI Action Logs</h3>
                <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    <AnimatePresence>
                        {data.recent_logs.map((log) => (
                            <motion.div key={log.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
                                <span className="text-slate-500 min-w-[80px]">{log.time}</span>
                                <span className={cn("font-bold min-w-[60px]", 
                                    log.type === 'ALERT' ? 'text-red-400' : 
                                    log.type === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-400'
                                )}>{log.type}</span>
                                <span className="text-slate-300">{log.message}</span>
                            </motion.div>
                        ))}
                        <div ref={logsEndRef} />
                    </AnimatePresence>
                </div>
            </GlassCard>
          </div>
        </main>
      </div>

      {/* DEPLOY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Deploy New Motor Node</h3><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
                <div className="space-y-4">
                    <div><label className="block text-xs uppercase text-slate-500 font-bold mb-2">Motor Identifier</label><input value={newMotor.id} onChange={(e) => setNewMotor({...newMotor, id: e.target.value})} placeholder="e.g. MTR-06" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500/50 transition-colors" /></div>
                    <div><label className="block text-xs uppercase text-slate-500 font-bold mb-2">Factory Location</label><input value={newMotor.location} onChange={(e) => setNewMotor({...newMotor, location: e.target.value})} placeholder="e.g. Assembly Line B" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500/50 transition-colors" /></div>
                    <button onClick={handleAddMotor} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors">Activate Node</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}