import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, PerspectiveCamera, MeshReflectorMaterial, 
  Float, Text, ContactShadows, Environment, Html 
} from '@react-three/drei';
import Papa from 'papaparse';
import { 
  Activity, ShieldCheck, AlertTriangle, Settings, Factory, 
  Layout, Box, Bell, ChevronRight, Thermometer, Gauge, Zap, 
  Search, Cpu, Database, Radio, RefreshCw, BarChart3, HardDrive,
  User, logOut, Info, ShieldAlert
} from 'lucide-react';

// --- 1. THE 3D MOTOR COMPONENT ---
// This handles the individual 3D units on the floor
function MotorUnit({ position, status, name, isSelected, onClick }) {
  const meshRef = useRef();
  const color = status === 'error' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  
  useFrame(() => {
    if (meshRef.current && status !== 'error') {
      meshRef.current.rotation.y += 0.03; // Real-time rotation
    }
  });

  return (
    <group position={position} onClick={onClick} cursor="pointer">
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Machine Housing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.9, 1.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Spinning Rotor / Status Light */}
        <mesh ref={meshRef} position={[0, 0, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={isSelected ? 4 : 0.8} 
          />
        </mesh>
        <Text 
          position={[0, 1.1, 0]} 
          fontSize={0.22} 
          color="white" 
          fontWeight="bold"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

// --- 2. THE COMPLETE DASHBOARD ---
export default function App() {
  const [selectedMotor, setSelectedMotor] = useState("UNIT_01");
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState(4);
  const [systemStatus] = useState("Nominal");

  // DATA INITIALIZATION
  useEffect(() => {
    const fetchData = async () => {
      Papa.parse("/motor_parameters.csv", {
        download: true,
        header: true,
        complete: (results) => {
          setCsvData(results.data);
          // Small timeout to show the "Boot" sequence
          setTimeout(() => setLoading(false), 2000);
        },
      });
    };
    fetchData();
  }, []);

  // Find data for the selected motor
  const liveData = csvData.find(m => m.MotorID === selectedMotor) || {
    Temperature: "64.2", Vibration: "0.021", Current: "12.8", Efficiency: "94"
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center font-mono">
      <div className="w-48 h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-amber-500 animate-[loading_2s_linear_infinite]" style={{width: '60%'}} />
      </div>
      <p className="text-amber-500 text-[10px] tracking-[0.4em] uppercase animate-pulse">
        Establishing Secure Link // Sector 7G
      </p>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-300 font-sans overflow-hidden">
      
      {/* --- LEFT SIDEBAR (EXTENDED DETAIL) --- */}
      <aside className="w-20 flex flex-col items-center py-8 bg-[#0B0F1A] border-r border-white/5 z-30 shadow-2xl">
        <div className="p-3 bg-amber-500 rounded-2xl mb-12 shadow-xl shadow-amber-500/20 group cursor-pointer transition-transform hover:scale-105">
          <Factory className="text-slate-950 group-hover:rotate-12 transition-transform" size={26} />
        </div>
        
        <nav className="flex-1 flex flex-col gap-9">
          <div className="relative group">
            <Layout className="text-amber-500 cursor-pointer" size={22} />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(245,158,11,1)]" />
          </div>
          <Activity className="text-slate-600 hover:text-white transition-colors cursor-pointer" size={22} />
          <Database className="text-slate-600 hover:text-white transition-colors cursor-pointer" size={22} />
          <BarChart3 className="text-slate-600 hover:text-white transition-colors cursor-pointer" size={22} />
          <Cpu className="text-slate-600 hover:text-white transition-colors cursor-pointer" size={22} />
          <Radio className="text-slate-600 hover:text-white transition-colors cursor-pointer" size={22} />
        </nav>

        <div className="flex flex-col gap-8 mb-4 pt-8 border-t border-white/5">
          <div className="relative cursor-pointer">
            <Bell className="text-slate-600 hover:text-white transition-colors" size={20} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-[8px] flex items-center justify-center rounded-full text-white font-bold border-2 border-[#0B0F1A]">
              {notifications}
            </span>
          </div>
          <Settings className="text-slate-600 hover:text-white transition-colors animate-[spin_10s_linear_infinite]" size={20} />
        </div>
      </aside>

      {/* --- MAIN INTERFACE HUB --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* COMPREHENSIVE HEADER */}
        <header className="h-20 flex items-center justify-between px-10 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">
                Motor<span className="text-amber-500">Safe</span> <span className="text-xs font-mono text-slate-500 not-italic ml-2 uppercase tracking-widest">AI_Surveillance</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                Connection Status: <span className="text-emerald-500">Encrypted</span> // Latency: 4ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-slate-900/40 rounded-full border border-white/5">
              <Search size={14} className="text-slate-500" />
              <input type="text" placeholder="Search Industrial Units..." className="bg-transparent border-none text-[11px] focus:outline-none w-48 text-slate-300" />
            </div>
            
            <div className="flex items-center gap-4 pl-8 border-l border-white/10">
              <div className="flex flex-col items-end">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Lochan_Admin</p>
                <p className="text-[9px] text-amber-500 font-mono">Level 4 Access</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-amber-500 shadow-inner group cursor-pointer hover:bg-slate-700 transition-colors">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* --- CENTRAL VIEWPORT (3D FLOOR PLAN + DATA) --- */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 3D ENGINE VIEW */}
          <section className="flex-1 relative bg-black shadow-inner">
            <Canvas shadows dpr={[1, 2]}>
              <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={38} />
              <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
              
              <Suspense fallback={<Html center><div className="text-amber-500 font-mono tracking-widest animate-pulse">MAP_RECONSTRUCTION...</div></Html>}>
                {/* Metallic Factory Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
                  <planeGeometry args={[60, 60]} />
                  <MeshReflectorMaterial
                    blur={[400, 100]} resolution={1024} mixBlur={1} mixStrength={60}
                    roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4}
                    color="#0a0a0c" metalness={0.7}
                  />
                </mesh>

                {/* Motor Units - Interactive Group */}
                <MotorUnit position={[-4, 0, -3]} name="UNIT_01" status="healthy" isSelected={selectedMotor === "UNIT_01"} onClick={() => setSelectedMotor("UNIT_01")} />
                <MotorUnit position={[0, 0, -3]} name="UNIT_02" status="warning" isSelected={selectedMotor === "UNIT_02"} onClick={() => setSelectedMotor("UNIT_02")} />
                <MotorUnit position={[4, 0, -3]} name="UNIT_03" status="healthy" isSelected={selectedMotor === "UNIT_03"} onClick={() => setSelectedMotor("UNIT_03")} />
                <MotorUnit position={[-2, 0, 3]} name="UNIT_04" status="error" isSelected={selectedMotor === "UNIT_04"} onClick={() => setSelectedMotor("UNIT_04")} />
                <MotorUnit position={[2, 0, 3]} name="UNIT_05" status="healthy" isSelected={selectedMotor === "UNIT_05"} onClick={() => setSelectedMotor("UNIT_05")} />

                <ambientLight intensity={0.4} />
                <spotLight position={[20, 20, 10]} angle={0.25} penumbra={1} intensity={2.5} castShadow />
                <ContactShadows resolution={1024} scale={20} blur={3} opacity={0.5} far={10} color="#000000" />
                <Environment preset="night" />
              </Suspense>
            </Canvas>

            {/* Bottom Scene Legend */}
            <div className="absolute bottom-10 left-10 p-5 bg-[#0B0F1A]/60 backdrop-blur-xl rounded-2xl border border-white/5 pointer-events-none space-y-2">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" /> HEALTHY UNIT
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" /> ANOMALY DETECTED
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" /> CRITICAL_FAILURE
              </div>
            </div>
          </section>

          {/* TELEMETRY & ANALYTICS SIDEBAR (400px Detail) */}
          <aside className="w-[420px] bg-[#0B0F1A] border-l border-white/5 flex flex-col shadow-2xl z-20 overflow-y-auto">
            
            <div className="p-10 flex-1">
              <header className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-amber-500 tracking-[0.4em] uppercase font-black italic">Live Telemetry</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400">ACTIVE</span>
                  </div>
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">{selectedMotor}</h2>
                <div className="flex gap-4 mt-8">
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Health Score</p>
                    <p className="text-2xl font-bold text-emerald-500 tracking-tighter font-mono">{liveData.Efficiency}%</p>
                  </div>
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Vibration</p>
                    <p className="text-2xl font-bold text-white tracking-tighter font-mono">{liveData.Vibration}g</p>
                  </div>
                </div>
              </header>

              {/* DYNAMIC SENSOR FEED */}
              <div className="space-y-10">
                {/* Temperature Gauge */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 text-blue-400">
                      <Thermometer size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heat Profile</span>
                    </div>
                    <span className="text-3xl font-mono font-bold text-white">{liveData.Temperature}°C</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-400 h-full shadow-[0_0_15px_rgba(96,165,250,0.6)] transition-all duration-1000" 
                      style={{width: `${(liveData.Temperature/100)*100}%`}}
                    />
                  </div>
                </div>

                {/* Power Gauge */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 text-amber-500">
                      <Zap size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Load</span>
                    </div>
                    <span className="text-3xl font-mono font-bold text-white">{liveData.Current}A</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full shadow-[0_0_15px_rgba(245,158,11,0.6)] transition-all duration-1000" 
                      style={{width: `${(liveData.Current/30)*100}%`}}
                    />
                  </div>
                </div>

                {/* Predicted Failure Bar Chart */}
                <div className="pt-8 mt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Failure Probability (24H)</p>
                    <ShieldAlert size={14} className="text-red-500" />
                  </div>
                  <div className="h-28 flex items-end gap-1.5 px-2">
                    {[40, 55, 30, 45, 65, 50, 40, 80, 45, 30, 20, 15].map((h, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm transition-all duration-500 ${h > 70 ? 'bg-red-500' : 'bg-amber-500/30 hover:bg-amber-500'}`} 
                        style={{height: `${h}%`}} 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[8px] font-mono text-slate-700">-24H</span>
                    <span className="text-[8px] font-mono text-slate-500">ML_PROJECTION</span>
                    <span className="text-[8px] font-mono text-slate-700 italic">NOW</span>
                  </div>
                </div>
              </div>

              {/* CONTROL ACTIONS */}
              <div className="mt-12 space-y-4 pb-10">
                <button className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-amber-500/20 active:scale-[0.98]">
                  INITIATE DIAGNOSTIC PROTOCOL <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl border border-white/5 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw size={14} /> Reset Sensors
                  </button>
                  <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl border border-white/5 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    <logOut size={14} /> Secure Exit
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}