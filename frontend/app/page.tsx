import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MomcarLogo } from "@/components/ui/Logo";
import { FaCarSide, FaShieldHeart, FaMapLocationDot, FaUserCheck, FaMapPin, FaRegHandshake } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-foreground/5 shadow-sm">
        <div className="flex flex-1 justify-between items-center max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center">
            <span className="sr-only">Momcar</span>
            <Image src="/LogoHome.png" alt="Momcar Logo" width={140} height={50} className="h-12 w-auto object-contain drop-shadow-sm hover:opacity-90 transition-opacity" priority />
          </Link>
          <nav className="flex items-center gap-6">
            <Link className="text-sm font-semibold text-secondary hover:text-primary transition-colors" href="#como-funciona">
              A Missão
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-secondary hover:text-primary hover:bg-primary/10">Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section: Vibrant & Premium */}
        <section className="w-full relative overflow-hidden bg-gradient-to-br from-white via-background to-background py-20 lg:py-32">
          {/* Decorative Gradients for Color Injection */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side: Typography & Call to Action */}
            <div className="flex flex-col space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Rede exclusiva para mães
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-secondary leading-[1.1]">
                A rede de <span className="font-display text-primary font-normal tracking-wide text-6xl md:text-7xl lg:text-8xl">confiança</span> para caronas escolares.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Momcar conecta mães do mesmo colégio. Compartilhe trajetos, economize tempo e construa uma rotina mais tranquila, com 100% de segurança de ponta a ponta.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register" className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-1">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/login" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-secondary/20 text-secondary hover:bg-secondary/5 transition-all">
                    Já sou membro
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side: Visual Representation */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:pr-10">
              {/* Dynamic Connected Network Illustration */}
              <div className="aspect-square relative w-full h-[450px] sm:h-[550px]">

                {/* Central Glowing Shield */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center z-20 border-8 border-primary/10 animate-[pulse_4s_ease-in-out_infinite]">
                  <FaShieldHeart className="w-20 h-20 text-primary drop-shadow-md" />
                </div>

                {/* Pulse Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] z-0"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-secondary/20 rounded-full z-0"></div>

                {/* Floating Element 1: Car on Route (Mãe) */}
                <div className="absolute top-[10%] left-[15%] w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(53,92,125,0.3)] flex flex-col items-center justify-center z-30 transform -rotate-3 animate-[bounce_6s_infinite] transition-transform hover:scale-110">
                  <FaCarSide className="w-8 h-8 text-secondary drop-shadow-sm mb-1" />
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Mãe</span>
                </div>

                {/* Floating Element 2: Map Pin (Escola) */}
                <div className="absolute bottom-[10%] left-[5%] w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(108,91,123,0.3)] flex flex-col items-center justify-center z-30 transform rotate-6 animate-[bounce_7s_infinite_0.5s] transition-transform hover:scale-110">
                  <FaMapLocationDot className="w-8 h-8 text-accent drop-shadow-sm mb-1" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Escola</span>
                </div>

                {/* Floating Element 3: Verification Check (100% Seguro) */}
                <div className="absolute top-[30%] right-[0%] w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center z-30 transform rotate-3 animate-[bounce_5s_infinite_1s] transition-transform hover:scale-110">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                    <FaUserCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verificado</span>
                </div>

                {/* Dotted Connections lines (SVG overlay) */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none opacity-40">
                  <path d="M 120 100 Q 250 150 250 250" fill="transparent" stroke="currentColor" className="text-secondary" strokeWidth="4" strokeDasharray="8 8" />
                  <path d="M 100 400 Q 200 350 250 250" fill="transparent" stroke="currentColor" className="text-accent" strokeWidth="4" strokeDasharray="8 8" />
                  <path d="M 400 180 Q 350 200 250 250" fill="transparent" stroke="currentColor" className="text-emerald-500" strokeWidth="4" strokeDasharray="8 8" />
                </svg>

              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona: Soft Cards */}
        <section id="como-funciona" className="w-full py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase">Mecânica da Confiança</h2>
              <h3 className="text-3xl md:text-5xl font-heading font-bold text-secondary">
                Simples, seguro e pensado para você
              </h3>
              <p className="text-lg text-muted-foreground">
                Um processo rigoroso garante que nossa rede seja formada exclusivamente por mães verificadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary/30">
                  <FaUserCheck />
                </div>
                <h4 className="text-xl font-bold text-secondary mb-3 relative z-10">Verificação Segura</h4>
                <p className="text-muted-foreground relative z-10">
                  Envie seus documentos obrigatórios. Cada perfil é auditado por nossa equipe para garantir uma rede de confiança restrita para mães.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="w-14 h-14 rounded-2xl bg-secondary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-secondary/30">
                  <FaMapPin />
                </div>
                <h4 className="text-xl font-bold text-secondary mb-3 relative z-10">Mapeamento</h4>
                <p className="text-muted-foreground relative z-10">
                  Cadastre o trajeto exato da sua residência até o colégio, cruzando os horários de entrada e saída da rotina escolar da criança.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-accent/30">
                  <FaRegHandshake />
                </div>
                <h4 className="text-xl font-bold text-secondary mb-3 relative z-10">Conexão</h4>
                <p className="text-muted-foreground relative z-10">
                  Nosso algoritmo realiza o cruzamento geográfico inteligente, unindo Mãetoristas e Passageiras num raio seguro.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 lg:px-12 border-t border-foreground/5 bg-white text-center">
        <Link href="/" className="flex justify-center">
          <span className="sr-only">Momcar</span>
          <Image src="/LogoHome.png" alt="Momcar Logo" width={120} height={50} className="object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
        </Link>
        <p className="text-sm font-medium text-muted-foreground mt-2">
          © 2026 Operação MVP. Rede de apoio colaborativa.
        </p>
      </footer>
    </div>
  );
}
