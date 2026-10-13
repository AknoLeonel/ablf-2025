import React from 'react';
import { Badge } from '../ui';
import { PERIODOS, STATUS_JOGO } from '../../lib/format';

export default function JogoStatus({ jogo }) {
  switch (jogo.status) {
    case 'ao_vivo':
      return <Badge tone="live">Ao vivo{jogo.periodo_atual ? ` · ${PERIODOS[jogo.periodo_atual]}` : ''}</Badge>;
    case 'encerrado':
      return <Badge>Encerrado</Badge>;
    case 'adiado':
      return <Badge tone="warn">{STATUS_JOGO.adiado}</Badge>;
    case 'cancelado':
      return <Badge tone="danger">{STATUS_JOGO.cancelado}</Badge>;
    default:
      return <Badge tone="success">{STATUS_JOGO.agendado}</Badge>;
  }
}
