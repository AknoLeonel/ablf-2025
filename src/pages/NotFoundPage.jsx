import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Container } from '../components/common/ui';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader eyebrow="Erro 404" title="Página não encontrada" />
      <Container>
        <Link to="/" className="text-ablf-yellow font-bold uppercase tracking-wider hover:text-white">← Voltar para o início</Link>
      </Container>
    </>
  );
}
