import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-white">
        <div className="flex flex-1 justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600">
            Momcar
          </h1>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#como-funciona">
              Como Funciona
            </Link>
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar Rota</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-[800px]">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-800">
                  A rede de confiança para <span className="text-blue-600">caronas escolares</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl pt-4">
                  Momcar conecta mães que fazem o mesmo trajeto escolar. Encontre parcerias
                  seguras perto de você e compartilhe a rotina com quem entende.
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <Link href="/register">
                  <Button className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-[1000px]">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Como funciona a Momcar?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Verificação Segura</h3>
                <p className="text-slate-600">Cadastre-se e envie seus documentos. Nossa equipe analisa os perfis para garantir uma rede de confiança apenas para mães.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Cadastre sua Rota</h3>
                <p className="text-slate-600">Informe seu trajeto de casa até a escola da criança e os horários que você costuma fazer esse caminho.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Encontre Matches</h3>
                <p className="text-slate-600">Nosso algoritmo encontra outras mães (Mãetoristas) na sua região com horários e trajetos compatíveis.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-slate-500">
          © 2026 Momcar MVP. Rede de apoio colaborativa.
        </p>
      </footer>
    </div>
  );
}
