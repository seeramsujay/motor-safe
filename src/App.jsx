import { useEffect, useState, useRef, Suspense } from "react";
import { Activity, Plus, Download, Server, AlertTriangle, X, CheckCircle2, LayoutDashboard, PieChart, Zap, Power } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import Papa from "papaparse";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const STATUS_CONFIG = {
  good: { color: "#10B981", label: "Optimal", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  moderate: { color: "#F59E0B", label: "Warning", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  critical: { color: "#EF4444", label: "Critical", bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-500" },
};

const INITIAL_DATA = {
  system_status: "ACTIVE",
  timestamp: new Date().toISOString(),
  nodes: [
    { id: "MTR-01", location: "Conveyor Belt A", voltage: "0", current: "0", vibration: "0", confidence: 0, status: "good" },
    { id: "MTR-02", location: "Main Pump", voltage: "0", current: "0", vibration: "0", confidence: 0, status: "good" },
    { id: "MTR-03", location: "Cooling Fan", voltage: "0", current: "0", vibration: "0", confidence: 0, status: "good" },
    { id: "MTR-04", location: "Extruder Drive", voltage: "0", current: "0", vibration: "0", confidence: 0, status: "good" },
    { id: "MTR-05", location: "Packaging Arm", voltage: "0", current: "0", vibration: "0", confidence: 0, status: "good" },
  ],
  recent_logs: [
    { id: 1, time: new Date().toLocaleTimeString(), type: "SUCCESS", message: "MotorSafe Edge-AI Initialized. Syncing..." }
  ],
};

function getMotorStatus(confidence) {
  if (confidence >= 70) return "critical"; 
  if (confidence >= 50) return "moderate"; 
  return "good";                           
}

// 3D Spinning Motor Component
const SpinningMotor = ({ node, position }) => {
  const motorRef = useRef();
  const status = STATUS_CONFIG[node.status];
  const isCrit = node.status === 'critical';

  useFrame((state, delta) => {
    if (motorRef.current) {
      const speed = isCrit ? 12 : 3;
      motorRef.current.rotation.x += delta * speed;
    }
  });

  return (
    <group position={position}>
      <mesh ref={motorRef} castShadow receiveShadow position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color={status.color} 
          emissive={status.color} 
          emissiveIntensity={isCrit ? 4 : 1} 
        />
      </mesh>

      <Text position={[0, 1.0, 0]} fontSize={0.18} color="#0f172a" fontWeight="bold">
        {node.id}
      </Text>
    </group>
  );
};

// The Main Scene
const FactorySimulation = ({ nodes }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#ffffff']} />
        
        <PerspectiveCamera makeDefault position={[0, 4, 4]} fov={50} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} target={[0, 0, 0]} />
        
        <Suspense fallback={null}>
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
              <planeGeometry args={[15, 15]} />
              <shadowMaterial opacity={0.15} />
            </mesh>
            
            <gridHelper args={[15, 15, "#cccccc", "#eeeeee"]} />

            {nodes.slice(0, 5).map((node, i) => {
              const positions = [
                [-1.5, 0, -1.2], 
                [0, 0, -1.2], 
                [1.5, 0, -1.2], 
                [-1.5, 0, 1.2], 
                [1.5, 0, 1.2]
              ];
              return <SpinningMotor key={node.id} node={node} position={positions[i]} />;
            })}
          </group>
          
          <ambientLight intensity={0.6} />
          <spotLight position={[5, 10, 5]} intensity={2} castShadow penumbra={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};

const GlassCard = ({ children, className }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={cn("backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-5 shadow-xl transition-all", className)}>{children}</motion.div>
);

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <GlassCard className="flex flex-col justify-between h-32 relative overflow-hidden group">
    <div className="flex justify-between items-start z-10">
      <div><p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p><h3 className="text-3xl font-bold text-white mt-2 leading-none">{value}</h3></div>
      <div className="p-2 bg-white/5 rounded-lg text-amber-400"><Icon size={20} /></div>
    </div>
    <p className="text-[10px] text-slate-500 font-mono mt-auto uppercase">{trend}</p>
  </GlassCard>
);

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [csvData, setCsvData] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Papa.parse("/motor_parameters.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (res) => {
        setCsvData(res.data);
      },
    });
  }, []);

  useEffect(() => {
    if (csvData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentRow((prevRow) => {
        const nextIdx = (prevRow + 1) % csvData.length;
        
        setData((prevData) => {
          const row = csvData[nextIdx];
          const newLogs = [...prevData.recent_logs];
          
          const updatedNodes = prevData.nodes.map((node, i) => {
            const prefix = `Motor_${i + 1}`;
            
            const rawVolt = parseFloat(row[`${prefix}_Voltage`]) || 0;
            const rawCurr = parseFloat(row[`${prefix}_Current`]) || 0;
            const rawVib  = parseFloat(row[`${prefix}_Vibration`]) || 0;
            const rawAnom = parseFloat(row[`${prefix}_Confidence_Rating`]) || 0; 
            
            const confPercent = Math.abs(rawAnom) * 100;
            const status = getMotorStatus(confPercent);

            if (status === "critical" && node.status !== "critical") {
              newLogs.push({ 
                id: Date.now() + i, 
                time: new Date().toLocaleTimeString(), 
                type: "ALERT", 
                message: `${node.id} CRITICAL: ${confPercent.toFixed(1)}%` 
              });
            }
            
            return { 
              ...node, 
              voltage: rawVolt.toFixed(1),
              current: rawCurr.toFixed(2),
              vibration: rawVib.toFixed(4),
              confidence: confPercent, 
              status 
            };
          });

          return { ...prevData, nodes: updatedNodes, recent_logs: newLogs.slice(-20) };
        });

        return nextIdx;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [csvData]);

  const activeAlerts = data.nodes.filter(n => n.status !== 'good').length;
  const topBadMotors = [...data.nodes].filter(n => n.confidence >= 50).sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/5 flex flex-col p-6 gap-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Power className="text-black" size={18} /></div>
          <h1 className="text-xl font-bold text-white">Motor<span className="text-amber-500">Safe</span></h1>
        </div>
        <nav className="flex flex-col gap-2">
          {['dashboard', 'analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl capitalize", activeTab === tab ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-slate-400 hover:bg-white/5")}>
              {tab === 'dashboard' ? <LayoutDashboard size={18} /> : <PieChart size={18} />} {tab}
            </button>
          ))}
        </nav>
        <button onClick={() => setIsModalOpen(true)} className="mt-auto w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all"><Plus size={18} /> Deploy Node</button>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-semibold text-white">{activeTab === 'dashboard' ? "Factory Floor" : "Analytics"}</h2>
            <p className="text-[10px] text-slate-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> ROW {currentRow} ACTIVE</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"><Download size={14} /> EXPORT DATA</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Active Nodes" value={data.nodes.length} icon={Server} trend="Hardware Online" />
            <StatCard title="System Alerts" value={activeAlerts} icon={AlertTriangle} trend="Critical/Warning" />
            <StatCard title="Mean Anomaly" value={(data.nodes.reduce((acc, n) => acc + n.confidence, 0) / 5).toFixed(1) + "%"} icon={Activity} trend="Edge-AI Inference" />
          </div>

          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-12 gap-6 h-[500px]">
              <GlassCard className="col-span-8 p-0 overflow-hidden bg-slate-900/20 border-white/5"><FactorySimulation nodes={data.nodes} /></GlassCard>
              <GlassCard className="col-span-4 flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Emergency Attention</h3>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {topBadMotors.length === 0 ? <div className="text-center text-slate-600 mt-20 text-sm">All Systems Nominal</div> : 
                    topBadMotors.map(node => (
                      <div key={node.id} className={cn("p-4 rounded-xl border", STATUS_CONFIG[node.status].bg, STATUS_CONFIG[node.status].border)}>
                        <div className="flex justify-between text-white font-bold text-sm mb-1"><span>{node.id}</span><span>{node.confidence.toFixed(1)}%</span></div>
                        <div className={cn("text-[10px] uppercase font-black", STATUS_CONFIG[node.status].text)}>{STATUS_CONFIG[node.status].label}</div>
                      </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="overflow-hidden">
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/10 text-[10px] uppercase text-slate-500"><th className="p-4">Node</th><th className="p-4 text-right">Voltage</th><th className="p-4 text-right">Current</th><th className="p-4 text-right">Vibration</th><th className="p-4 text-right">Confidence</th><th className="p-4 text-center">Status</th></tr></thead>
                <tbody>{data.nodes.map(node => (
                  <tr key={node.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{node.id}</td>
                    <td className="p-4 text-right font-mono text-slate-400">{node.voltage}V</td>
                    <td className="p-4 text-right font-mono text-slate-400">{node.current}A</td>
                    <td className="p-4 text-right font-mono text-slate-400">{node.vibration}</td>
                    <td className={cn("p-4 text-right font-black", STATUS_CONFIG[node.status].text)}>{node.confidence.toFixed(1)}%</td>
                    <td className="p-4 text-center"><span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", STATUS_CONFIG[node.status].text, STATUS_CONFIG[node.status].border)}>{STATUS_CONFIG[node.status].label}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </GlassCard>
          )}

          <GlassCard className="h-48 flex flex-col">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Live Event Log</div>
            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1">
              {data.recent_logs.map(log => (
                <div key={log.id} className="flex gap-4 border-b border-white/5 pb-1"><span className="text-slate-600">{log.time}</span><span className={cn("font-bold", log.type === 'ALERT' ? 'text-red-500' : 'text-emerald-500')}>{log.type}</span><span className="text-slate-400">{log.message}</span></div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Deploy Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Deploy New Motor Node</h3>
              <div className="space-y-4">
                <div><label className="text-[10px] uppercase font-bold text-slate-500">Node ID</label><input className="w-full bg-black border border-white/10 p-3 rounded-lg mt-1 outline-none focus:border-amber-500/50" placeholder="MTR-06" /></div>
                <button onClick={() => setIsModalOpen(false)} className="w-full bg-amber-600 py-3 rounded-lg font-bold mt-4">Initialize Sensor</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}