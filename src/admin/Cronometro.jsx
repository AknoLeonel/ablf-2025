import React, { useImperativeHandle, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button, Sheet } from '../components/ui';
import { useCronometro } from './useCronometro';

// Relógio isolado: só ele re-renderiza a cada meio segundo (a Mesa inteira não).
// A Mesa fala com ele por `ref`: minuto(), temTempo(), pausar(), zerar().
export default function Cronometro({ ref, jogoId }) {
  const r = useCronometro(jogoId);
  const [confirmaZerar, setConfirmaZerar] = useState(false);
  useImperativeHandle(ref, () => ({ minuto: r.minuto, temTempo: r.temTempo, pausar: r.pausar, zerar: r.zerar }));

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-4xl font-bold text-white tabular-nums" aria-label={`Tempo de jogo ${r.texto}`}>{r.texto}</div>
        <div className="flex gap-2">
          {r.rodando
            ? <Button variant="secondary" onClick={r.pausar}><Pause size={18} />Pausar</Button>
            : <Button variant="success" onClick={r.iniciar}><Play size={18} />{r.ms ? 'Continuar' : 'Iniciar'}</Button>}
          <Button variant="ghost" onClick={() => setConfirmaZerar(true)} aria-label="Zerar cronômetro"><RotateCcw size={18} /></Button>
        </div>
      </div>
      <Sheet open={confirmaZerar} onClose={() => setConfirmaZerar(false)} title="Zerar o cronômetro?"
        footer={<div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setConfirmaZerar(false)}>Voltar</Button><Button variant="danger" className="flex-1" onClick={() => { r.zerar(); setConfirmaZerar(false); }}>Zerar</Button></div>}>
        <p className="text-gray-300">O tempo marcado ({r.texto}) será apagado. Os lances já registrados não mudam.</p>
      </Sheet>
    </>
  );
}
