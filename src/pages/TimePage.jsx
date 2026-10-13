import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTime, getTimeClassificacao, listCompeticoes, listJogadores, listJogos } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Container, QueryState, Crest, BackLink, StatBox } from '../components/common/ui';
import { ShareButton, Tabs } from '../components/ui';
import { painelProps } from '../components/ui/tabsProps';
import PlayerCard from '../components/common/PlayerCard';
import JogoCard from '../components/common/JogoCard';
import Galeria from '../components/common/Galeria';
import { parseEntityId } from '../lib/format';

const TABS = [
  { id: 'elenco', label: 'Elenco' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'fotos', label: 'Fotos' },
];

export default function TimePage() {
  const id = parseEntityId(useParams().id);
  const [aba, setAba] = useState('elenco');
  const time = useQuery({ queryKey: ['time', id], queryFn: () => getTime(id), enabled: id != null });
  const elenco = useQuery({ queryKey: ['elenco', id], queryFn: () => listJogadores({ timeId: id }), enabled: id != null });
  const jogos = useQuery({ queryKey: ['jogos-time', id], queryFn: () => listJogos({ timeId: id }), enabled: id != null });
  const campanhas = useQuery({ queryKey: ['time-classificacao', id], queryFn: () => getTimeClassificacao(id), enabled: id != null });
  const competicoes = useQuery({ queryKey: ['competicoes'], queryFn: listCompeticoes });
  usePageTitle(time.data?.nome ?? 'Time', time.data && `Elenco, jogos e campanha de ${time.data.nome}.`);

  // campanha na competição mais relevante (em andamento > mais recente)
  const ordem = (competicoes.data ?? []).map((c) => c.id);
  const atual = [...(campanhas.data ?? [])].sort((a, b) => ordem.indexOf(a.competicao_id) - ordem.indexOf(b.competicao_id))
    .find((c) => competicoes.data?.find((x) => x.id === c.competicao_id)?.status === 'em_andamento') ?? campanhas.data?.[0];
  const compAtual = competicoes.data?.find((c) => c.id === atual?.competicao_id);

  return (
    <div className="pt-20">
      <Container className="max-w-5xl !pt-4">
        <QueryState query={time} emptyText="Time não encontrado.">
          {(t) => (
            <>
              <BackLink to="/times">Todos os times</BackLink>
              <section className="rounded-3xl border border-ablf-line bg-gradient-to-b from-ablf-raised to-ablf-surface p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
                <Crest src={t.escudo_url} nome={t.nome} size={104} />
                <div className="min-w-0 flex-1">
                  {t.liga?.nome && <div className="text-ablf-yellow font-display uppercase tracking-widest text-sm font-bold">{t.liga.nome}</div>}
                  <h1 className="text-white font-display text-4xl sm:text-5xl font-black italic uppercase leading-[0.95] break-words">{t.nome}</h1>
                  {(t.cidade || t.uf) && <p className="text-gray-400 mt-1">{[t.cidade, t.uf].filter(Boolean).join(' / ')}</p>}
                  <div className="mt-3"><ShareButton title={t.nome} /></div>
                </div>
              </section>

              {atual && (
                <section aria-label={`Campanha em ${compAtual?.nome ?? 'competição'}`} className="mt-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{compAtual?.nome} {compAtual ? `(${compAtual.ano})` : ''}{atual.grupo ? ` · Grupo ${atual.grupo}` : ''}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <StatBox label="Posição" value={`${atual.posicao}º`} destaque />
                    <StatBox label="Pontos" value={atual.pontos} />
                    <StatBox label="V-E-D" value={`${atual.vitorias}-${atual.empates}-${atual.derrotas}`} />
                    <StatBox label="Saldo" value={atual.saldo_gols > 0 ? `+${atual.saldo_gols}` : atual.saldo_gols} />
                  </div>
                </section>
              )}

              <Tabs tabs={TABS} value={aba} onChange={setAba} label="Seções do time" className="mt-6" />
              <div {...painelProps(TABS, aba)} className="mt-5">
                {aba === 'elenco' && (
                  <QueryState query={elenco} emptyText="Elenco ainda não cadastrado.">
                    {(jogadores) => (
                      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                        {jogadores.filter((j) => j.ativo).map((j) => <li key={j.id}><PlayerCard jogador={j} time={t} /></li>)}
                      </ul>
                    )}
                  </QueryState>
                )}
                {aba === 'jogos' && (
                  <QueryState query={jogos} emptyText="Nenhum jogo deste time ainda.">
                    {(lista) => <div className="grid gap-3 md:grid-cols-2">{lista.map((j) => <JogoCard key={j.id} jogo={j} mostrarCompeticao />)}</div>}
                  </QueryState>
                )}
                {aba === 'fotos' && <Galeria timeId={t.id} titulo="" mensagemVazio="Ainda não há fotos deste time." />}
              </div>
            </>
          )}
        </QueryState>
      </Container>
    </div>
  );
}
