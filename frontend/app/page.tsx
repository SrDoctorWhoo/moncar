import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MomcarLogo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-foreground/5 shadow-sm">
        <div className="flex flex-1 justify-between items-center max-w-7xl mx-auto w-full">
          <h1 className="flex items-center">
            <span className="sr-only">Momcar</span>
            <MomcarLogo className="h-16 w-32 sm:h-20 sm:w-40" />
          </h1>
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
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-square rounded-[2.5rem] bg-gradient-to-tr from-secondary via-accent to-primary p-1 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl group-hover:bg-transparent transition-all duration-700"></div>
                <div className="w-full h-full rounded-[2.25rem] bg-white p-8 flex flex-col justify-between relative z-10 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-2 w-12 bg-primary rounded-full"></div>
                      <div className="h-2 w-24 bg-muted rounded-full"></div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-secondary"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-16 w-full rounded-2xl bg-background border border-foreground/5 flex items-center px-4 gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">M1</div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-2 w-1/2 bg-foreground/20 rounded-full"></div>
                        <div className="h-2 w-1/3 bg-primary/20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-16 w-full rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center px-4 gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm">M2</div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-2 w-3/4 bg-secondary/40 rounded-full"></div>
                        <div className="h-2 w-1/2 bg-secondary/20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-16 w-full rounded-2xl bg-accent/5 border border-accent/10 flex items-center px-4 gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">M3</div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-2 w-2/3 bg-accent/40 rounded-full"></div>
                        <div className="h-2 w-1/4 bg-accent/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary/30">1</div>
                <h4 className="text-xl font-bold text-secondary mb-3 relative z-10">Verificação Segura</h4>
                <p className="text-muted-foreground relative z-10">
                  Envie seus documentos obrigatórios. Cada perfil é auditado por nossa equipe para garantir uma rede de confiança restrita para mães.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="w-14 h-14 rounded-2xl bg-secondary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-secondary/30">2</div>
                <h4 className="text-xl font-bold text-secondary mb-3 relative z-10">Mapeamento</h4>
                <p className="text-muted-foreground relative z-10">
                  Cadastre o trajeto exato da sua residência até o colégio, cruzando os horários de entrada e saída da rotina escolar da criança.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-background rounded-3xl p-8 border border-foreground/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-accent/30">3</div>
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
        <h2 className="flex items-center justify-center">
          <span className="sr-only">Momcar</span>
          <MomcarLogo className="h-12 w-24" />
        </h2>
        <p className="text-sm font-medium text-muted-foreground mt-2">
          © 2026 Operação MVP. Rede de apoio colaborativa.
        </p>
      </footer>
    </div>
  );
}
