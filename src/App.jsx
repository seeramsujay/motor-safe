import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, MeshReflectorMaterial, Float, Text, ContactShadows, Environment } from '@react-three/drei';
import { Activity, ShieldCheck, AlertTriangle, Settings, Factory, Layout, Box } from 'lucide-react';

// --- 3D COMPONENTS ---
function MotorUnit({ position, status, name, isSelected, onClick }) {
  const color = status === 'warning' ? '#f59e0b' : status === 'error' ? '#ef4444' : '#10b981';
  const emissiveInt = isSelected ? 2 : 0.5;

  return (
    <group position={position} onClick={onClick} cursor="pointer">
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Main Chassis */}
        <mesh castShadow>
          <boxGeometry args={[1, 0.8, 1.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.1} />
        </mesh>
        {/* Glowing Rotor/Indicator */}
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveInt} />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" font="https://fonts.gstatic.com/s/raleway/v14/1Ptxg8zYS_SKggPN4iEgvnxyumZJW6Bdf7I.woff">
          {name}
        </Text>
      </Float>
    </group>
  );
}

// --- MAIN DASHBOARD UI ---
export default function App() {
  const [selectedMotor, setSelectedMotor] = useState("UNIT_01");

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-20 flex flex-col items-center py-8 bg-slate-900 border-r border-slate-800 z-20">
        <div className="p-3 bg-amber-500 rounded-xl mb-10 shadow-lg shadow-amber-500/20">
          <Factory className="text-slate-950" size={28} />
        </div>
        <div className="flex flex-col gap-8">
          <Layout className="text-amber-500 cursor-pointer" size={24} />
          <Activity className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={24} />
          <Box className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={24} />
          <Settings className="text-slate-500 hover:text-white transition-colors cursor-pointer" size={24} />
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md border-b border-white/5 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">FACTORY_FLOOR <span className="text-amber-500">B-04</span></h1>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">System Status: Nominal</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-mono">ENCRYPTED STREAM</span>
              <span className="text-sm font-bold text-emerald-500">LIVE CONNECTION</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ShieldCheck size={20} className="text-amber-500" />
            </div>
          </div>
        </header>

        {/* 3D SCENE CONTAINER (The "Inner Thing") */}
        <div className="flex-1 relative group">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={40} />
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
            
            <Suspense fallback={null}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <MeshReflectorMaterial
                  blur={[300, 100]} resolution={1024} mixBlur={1} mixStrength={60}
                  roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4}
                  color="#0f172a" metalness={0.5}
                />
              </mesh>

              {/* Physical Motors on Floor */}
              <MotorUnit position={[-4, 0, -2]} name="UNIT_01" status="healthy" isSelected={selectedMotor === "UNIT_01"} onClick={() => setSelectedMotor("UNIT_01")} />
              <MotorUnit position={[0, 0, -2]} name="UNIT_02" status="warning" isSelected={selectedMotor === "UNIT_02"} onClick={() => setSelectedMotor("UNIT_02")} />
              <MotorUnit position={[4, 0, -2]} name="UNIT_03" status="healthy" isSelected={selectedMotor === "UNIT_03"} onClick={() => setSelectedMotor("UNIT_03")} />
              
              <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.3} far={10} color="#000000" />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Floating Data Card Over 3D Scene */}
          <div className="absolute bottom-8 right-8 w-80 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">{selectedMotor}</h3>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] rounded font-bold">ACTIVE</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-xs uppercase">Vibration Index</span>
                <span className="text-xl font-mono text-amber-500 font-bold">0.42g</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[42%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Temp</p>
                  <p className="text-lg font-bold text-white">64.2°C</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Load</p>
                  <p className="text-lg font-bold text-white">88%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}