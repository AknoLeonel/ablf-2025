import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { enviarFiliacao } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { PageHeader, Container } from '../components/common/ui';
import { Button } from '../components/ui';
import { Checkbox, Field, Select, TextInput, Textarea } from '../components/ui/forms';
import { whatsappLink } from '../constants';

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const VAZIO = { liga_nome: '', responsavel: '', email: '', telefone: '', cidade: '', uf: '', qtd_times: '', mensagem: '', aceite_lgpd: false, site: '' };

function validar(v) {
  const e = {};
  if (v.liga_nome.trim().length < 2) e.liga_nome = 'Informe o nome da liga.';
  if (v.responsavel.trim().length < 2) e.responsavel = 'Informe o nome do responsável.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = 'Informe um e-mail válido.';
  if (v.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone com DDD.';
  if (!v.aceite_lgpd) e.aceite_lgpd = 'É preciso concordar para enviar.';
  return e;
}

export default function FiliarPage() {
  usePageTitle('Filie sua liga', 'Peça a filiação da sua liga à Associação Brasileira de Ligas de Futsal.');
  const [v, setV] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [estado, setEstado] = useState('idle'); // idle | enviando | enviado | falhou
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    const err = validar(v);
    setErros(err);
    if (Object.keys(err).length) {
      document.getElementById('filiar-form')?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (v.site) { setEstado('enviado'); return; } // campo-isca preenchido: robô, finge sucesso
    setEstado('enviando');
    try {
      await enviarFiliacao({
        liga_nome: v.liga_nome.trim(), responsavel: v.responsavel.trim(), email: v.email.trim(), telefone: v.telefone.trim(),
        cidade: v.cidade.trim() || null, uf: v.uf || null, qtd_times: v.qtd_times === '' ? null : Number(v.qtd_times),
        mensagem: v.mensagem.trim() || null, aceite_lgpd: true,
      });
      setEstado('enviado');
    } catch {
      setEstado('falhou');
    }
  };

  if (estado === 'enviado') {
    return (
      <>
        <PageHeader eyebrow="Filiação" title="Pedido enviado" />
        <Container className="max-w-xl text-center">
          <CheckCircle2 size={56} className="mx-auto text-ablf-green" aria-hidden="true" />
          <p role="status" className="mt-4 text-lg text-white">Recebemos o pedido de filiação da <strong>{v.liga_nome || 'sua liga'}</strong>.</p>
          <p className="mt-2 text-gray-400">Nossa equipe entrará em contato pelo e-mail ou telefone informado.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button as={Link} to="/" variant="primary">Voltar ao início</Button>
            <Button as="a" href={whatsappLink(`Olá! Enviei o pedido de filiação da liga ${v.liga_nome}.`)} target="_blank" rel="noopener noreferrer" variant="secondary">Falar pelo WhatsApp</Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Filiação" title="Filie sua liga" subtitle="Preencha os dados abaixo e a equipe da ABLF entra em contato." />
      <Container className="max-w-xl">
        <form id="filiar-form" onSubmit={enviar} noValidate className="space-y-5">
          <Field label="Nome da liga" required error={erros.liga_nome}><TextInput value={v.liga_nome} onChange={set('liga_nome')} autoComplete="organization" maxLength={120} /></Field>
          <Field label="Responsável" required error={erros.responsavel}><TextInput value={v.responsavel} onChange={set('responsavel')} autoComplete="name" maxLength={120} /></Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="E-mail" required error={erros.email}><TextInput type="email" inputMode="email" value={v.email} onChange={set('email')} autoComplete="email" maxLength={160} /></Field>
            <Field label="Telefone / WhatsApp" required error={erros.telefone}><TextInput type="tel" inputMode="tel" value={v.telefone} onChange={set('telefone')} autoComplete="tel" maxLength={30} placeholder="(61) 99999-8888" /></Field>
          </div>
          <div className="grid grid-cols-[1fr_6rem] sm:grid-cols-[1fr_6rem_8rem] gap-5">
            <div className="col-span-2 sm:col-span-1"><Field label="Cidade"><TextInput value={v.cidade} onChange={set('cidade')} autoComplete="address-level2" maxLength={80} /></Field></div>
            <Field label="UF"><Select value={v.uf} onChange={set('uf')}><option value="">—</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}</Select></Field>
            <Field label="Nº de times"><TextInput type="number" inputMode="numeric" min="0" max="1000" value={v.qtd_times} onChange={set('qtd_times')} /></Field>
          </div>
          <Field label="Mensagem" hint="Conte um pouco sobre a liga (opcional)."><Textarea value={v.mensagem} onChange={set('mensagem')} maxLength={1500} /></Field>

          {/* campo-isca anti-robô: invisível para pessoas */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>Não preencha<input type="text" tabIndex={-1} autoComplete="off" value={v.site} onChange={set('site')} /></label>
          </div>

          <div>
            <Checkbox checked={v.aceite_lgpd} onChange={set('aceite_lgpd')} aria-invalid={erros.aceite_lgpd ? true : undefined}>
              Concordo que a ABLF use estes dados para entrar em contato sobre a filiação, conforme a LGPD.
            </Checkbox>
            {erros.aceite_lgpd && <p role="alert" className="mt-1 text-sm text-red-400">{erros.aceite_lgpd}</p>}
          </div>

          {estado === 'falhou' && <p role="alert" className="p-3 rounded-lg border border-red-900/60 bg-red-950/30 text-red-200 text-sm">Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.</p>}
          <Button type="submit" size="lg" className="w-full" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar pedido de filiação'}</Button>
        </form>
      </Container>
    </>
  );
}
