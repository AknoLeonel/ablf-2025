// Propriedades de acessibilidade do painel da aba ativa (usar junto com <Tabs>).
export const painelProps = (tabs, value) => ({
  role: 'tabpanel',
  tabIndex: 0,
  'aria-label': tabs.find((t) => t.id === value)?.label,
});
