import Navbar from './Navbar';

// Layout reutilizable que envuelve todas las pantallas autenticadas
// Aplica fondo dark, navbar y container para el contenido
export default function Layout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap" 
        rel="stylesheet" 
      />

      <div className="min-h-screen bg-[#08080f] text-[#e8e8f0]"
           style={{
             backgroundImage: `radial-gradient(ellipse at 20% 0%, rgba(220, 38, 38, 0.12) 0, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(255, 90, 110, 0.08) 0, transparent 55%)`,
             fontFamily: "'DM Sans', sans-serif"
           }}>
        
        <Navbar />

        <main className="max-w-[1280px] mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="max-w-[1280px] mx-auto px-6 pb-8">
          <div className="pt-8 border-t border-[#1e1e2e] text-center">
            <p className="text-[#52526a] text-xs">
              🩸 DonaVida © 2026 · Cada gota cuenta, cada donante salva
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}