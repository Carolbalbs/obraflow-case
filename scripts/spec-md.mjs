#!/usr/bin/env node
/**
 * Lê a SPEC quebrada em docs/spec/, valida a rastreabilidade e gera os documentos de leitura.
 *
 * Fonte de verdade: docs/spec/base.json (meta, agentes, modelos, árvore) e um
 * docs/spec/NN-<slug>.json por sprint. Nenhum arquivo gerado é editado à mão.
 *
 * Saída:
 *   docs/SPEC.md             — a spec inteira, o "SPEC.md" do ciclo coder–evaluator
 *   docs/sprints/sprint-NN.md — o recorte que o Coder recebe junto com PROGRESS.md
 *
 * Uso: npm run spec:md
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'docs/spec'
const base = JSON.parse(readFileSync(join(DIR, 'base.json'), 'utf8'))
const arquivos = readdirSync(DIR).filter((f) => /^\d{2}-.+\.json$/.test(f)).sort()
const sprints = arquivos.map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')))

/* ---------- validação: id órfão é trabalho que ninguém pediu ---------- */
const erros = []
const agentes = new Set(base.coder_agents.map((a) => a.id))
const modelos = new Set(base.data_models.map((m) => m.name))
const feats = new Map()
const sprintIds = new Set()

for (const { sprint: s } of sprints) {
  sprintIds.add(s.id)
  for (const f of s.features) {
    if (feats.has(f.id)) erros.push(`id de feature duplicado: ${f.id}`)
    feats.set(f.id, s.id)
  }
}
const vistos = []
for (const { sprint: s, contexto } of sprints) {
  if (!agentes.has(s.coder_agent_id)) erros.push(`${s.id}: agente inexistente ${s.coder_agent_id}`)
  if (contexto.agente.id !== s.coder_agent_id) erros.push(`${s.id}: contexto.agente diverge de coder_agent_id`)
  if (s.pre_requisito && !sprintIds.has(s.pre_requisito)) erros.push(`${s.id}: pré-requisito inexistente ${s.pre_requisito}`)
  if (s.pre_requisito && !vistos.includes(s.pre_requisito)) erros.push(`${s.id}: pré-requisito ${s.pre_requisito} vem depois dele`)
  if (!s.definition_of_done?.length) erros.push(`${s.id}: sem definition_of_done`)
  vistos.push(s.id)
  for (const f of s.features) {
    if (!f.acceptance_criteria.length) erros.push(`${f.id}: feature sem acceptance_criteria`)
    for (const m of f.models) if (!modelos.has(m)) erros.push(`${f.id}: modelo inexistente ${m}`)
    for (const d of f.depends_on) if (!feats.has(d)) erros.push(`${f.id}: depends_on órfão ${d}`)
    for (const e of f.api_spec) {
      if (!e.responses || !Object.keys(e.responses).length) erros.push(`${f.id}: endpoint sem responses`)
      if (e.timeout_ms == null) erros.push(`${f.id} ${e.path}: sem timeout_ms`)
      if (!e.payload_limit) erros.push(`${f.id} ${e.path}: sem payload_limit`)
    }
  }
}
const indexados = new Set(base.sprints_index.map((s) => s.id))
for (const id of sprintIds) if (!indexados.has(id)) erros.push(`${id}: ausente de base.sprints_index`)

/* Artboard é critério de aceite: apontar para uma sprint que não existe deixa a tela sem dono. */
const mockups = base.meta.mockups
const porSprint = new Map()
for (const a of mockups?.artboards ?? []) {
  for (const sid of a.sprints) {
    if (!indexados.has(sid)) erros.push(`artboard ${a.id}: sprint inexistente ${sid}`)
    if (!porSprint.has(sid)) porSprint.set(sid, [])
    porSprint.get(sid).push(a)
  }
}

if (erros.length) {
  console.error('FALHAS DE RASTREABILIDADE:')
  for (const e of erros) console.error('  -', e)
  process.exit(1)
}

/* ---------- helpers ---------- */
const bloco = () => { const L = []; return { w: (s = '') => L.push(s), txt: () => L.join('\n') } }

const escreverFeature = (w, f, { completo }) => {
  w(`### ${f.id} · ${f.name}`)
  w()
  w(`**Categoria:** \`${f.categoria}\``)
  w()
  w(f.description)
  w()
  if (f.user_story) { w(`> ${f.user_story}`); w() }
  w('**Steps:**')
  w()
  f.steps.forEach((x, i) => w(`${i + 1}. ${x}`))
  w()
  w('**Acceptance criteria:**')
  w()
  for (const c of f.acceptance_criteria) w(`- [ ] ${c}`)
  w()
  if (f.edge_cases.length) {
    w('**Edge cases:**')
    w()
    for (const c of f.edge_cases) w(`- ${c}`)
    w()
  }
  for (const e of f.api_spec) {
    w(`**\`${e.method} ${e.path}\`** — auth: ${e.auth} · timeout ${e.timeout_ms}ms · payload ${e.payload_limit}${e.idempotent ? ' · idempotente' : ''}`)
    w()
    const b = e.request?.body ?? {}
    if (Object.keys(b).length) { w('*Body:* ' + Object.entries(b).map(([k, v]) => `\`${k}\`: ${v}`).join(' · ')); w() }
    const q = e.request?.query ?? {}
    if (Object.keys(q).length) { w('*Query:* ' + Object.entries(q).map(([k, v]) => `\`${k}\`: ${v}`).join(' · ')); w() }
    w('| status | resposta |')
    w('|---|---|')
    for (const [k, v] of Object.entries(e.responses)) w(`| ${k} | ${v} |`)
    w()
    if (e.side_effects?.length) { w('*Efeitos:* ' + e.side_effects.join(' · ')); w() }
  }
  const meta = []
  if (f.models.length) meta.push(`**Modelos:** ${f.models.join(', ')}`)
  if (completo && f.files.length) meta.push(`**Arquivos:** ${f.files.map((x) => `\`${x}\``).join(', ')}`)
  if (f.depends_on.length) meta.push(`**Depende de:** ${f.depends_on.map((x) => `\`${x}\``).join(', ')}`)
  if (meta.length) { w(meta.join(' · ')); w() }
  if (f.out_of_scope.length) { w('**Fora de escopo:** ' + f.out_of_scope.join(' · ')); w() }
}

/* ---------- 1. SPEC.md inteira ---------- */
const S = bloco(); const w = S.w
const totalFeats = sprints.reduce((a, { sprint }) => a + sprint.features.length, 0)
const totalCrit = sprints.reduce((a, { sprint }) => a + sprint.features.reduce((b, f) => b + f.acceptance_criteria.length, 0), 0)
const totalEnd = sprints.reduce((a, { sprint }) => a + sprint.features.reduce((b, f) => b + f.api_spec.length, 0), 0)

w(`# SPEC — ${base.meta.project}`)
w()
w('> **Gerado por `npm run spec:md` a partir de [`docs/spec/`](spec/). Não edite este arquivo à mão.**')
w(`> Fonte: [\`spec/base.json\`](spec/base.json) + um JSON por sprint.`)
w(`> PRD: [\`PRD.md\`](PRD.md) · Glossário: [\`GLOSSARY.md\`](../GLOSSARY.md) · ADRs: [\`adr/\`](adr/)`)
w(`> Versão ${base.meta.version} · ${base.meta.status} · ${base.meta.updated_at} · prazo ${base.meta.prazo}`)
w()
w(`**${sprints.length} sprints · ${totalFeats} features · ${totalCrit} critérios de aceite · ${totalEnd} endpoints · ${base.data_models.length} modelos**`)
w()
w('## Notas')
w()
for (const n of base.meta.notas) w(`- ${n}`)
w()
w('## Decisões da revisão de SPEC')
w()
for (const d of base.meta.decisoes_da_revisao) w(`- ${d}`)
w()
if (mockups) {
  w('## Mockups')
  w()
  w(`Canvas com ${mockups.artboards.length} artboards: <${mockups.canvas}>`)
  w()
  w(mockups.regra)
  w()
  w(mockups.como_consultar)
  w()
  w(mockups.tokens)
  w()
  w('| artboard | tela | sprint |')
  w('|---|---|---|')
  for (const a of mockups.artboards) {
    const onde = a.sprints.length ? a.sprints.map((x) => `\`${x}\``).join(', ') : '—'
    w(`| \`${a.id}\` | ${a.titulo}${a.parcial ? ` — ${a.parcial}` : ''} | ${onde} |`)
  }
  w()
  w('### Divergências deliberadas do mockup')
  w()
  w('Lista fechada. O que não está aqui é para ser implementado como está desenhado.')
  w()
  for (const x of mockups.divergencias_deliberadas) w(`- ${x}`)
  w()
}
w('## Agentes')
w()
w('| id | papel | modelo |')
w('|---|---|---|')
for (const a of base.coder_agents) w(`| \`${a.id}\` | ${a.role} | ${a.model} |`)
w()
w('## Modelos de dados')
w()
for (const m of base.data_models) {
  w(`### ${m.name}`)
  w()
  w(m.description)
  w()
  w('| campo | tipo | obrig. | notas |')
  w('|---|---|---|---|')
  for (const f of m.fields) w(`| \`${f.name}\` | ${f.type}${f.pk ? ' · PK' : ''}${f.unique && !f.pk ? ' · único' : ''} | ${f.required ? 'sim' : 'não'} | ${f.notes || ''} |`)
  w()
  if (m.relations.length) { w('**Relações:** ' + m.relations.map((r) => `\`${r.field}\` ${r.type} → ${r.target} (${r.on_delete})`).join(' · ')); w() }
  if (m.indexes.length) { w('**Índices:** ' + m.indexes.map((i) => `\`${i}\``).join(' · ')); w() }
  if (m.invariants.length) { w('**Invariantes:**'); w(); for (const i of m.invariants) w(`- ${i}`); w() }
}
w('## Estrutura de arquivos')
w()
w('```')
const arvore = (obj, ident = '') => {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') w(`${ident}${k.padEnd(38)} ${v}`)
    else { w(`${ident}${k}`); arvore(v, ident + '  ') }
  }
}
arvore(base.file_structure)
w('```')
w()
w('## Sprints')
w()
w('| # | sprint | arquivo | entregável | risco | pré-req | agente |')
w('|---|---|---|---|---|---|---|')
for (const { sprint: s } of sprints) {
  const idx = base.sprints_index.find((i) => i.id === s.id)
  w(`| ${s.index} | **${s.name}**${s.tipo === 'extra' ? ' *(extra)*' : ''} | [\`${idx.arquivo.replace('docs/', '')}\`](${idx.arquivo.replace('docs/', '')}) · [sprint-${String(s.index).padStart(2, '0')}.md](sprints/sprint-${String(s.index).padStart(2, '0')}.md) | ${s.entregavel} | ${s.risco} | ${s.pre_requisito ? `\`${s.pre_requisito}\`` : '—'} | \`${s.coder_agent_id}\` |`)
}
w()
for (const { sprint: s } of sprints) {
  w('---')
  w()
  w(`## Sprint ${s.index} · ${s.name}${s.tipo === 'extra' ? ' *(extra)*' : ''}`)
  w()
  if (s.status) w(`**Estado:** ${s.status}`)
  w(`**Descrição:** ${s.description}`)
  w()
  w(`**Entregável:** ${s.entregavel}`)
  w()
  w(`**Risco:** ${s.risco} · **Pré-requisito:** ${s.pre_requisito ?? 'nenhum'} · **Agente:** \`${s.coder_agent_id}\` · **Stack:** ${s.stack.map((t) => `\`${t}\``).join(', ')}`)
  w()
  for (const f of s.features) escreverFeature(w, f, { completo: true })
  w('**Definition of done:**')
  w()
  for (const d of s.definition_of_done) w(`- [ ] ${d}`)
  w()
}
writeFileSync('docs/SPEC.md', S.txt())

/* ---------- 2. um SPRINT N por sprint ---------- */
mkdirSync('docs/sprints', { recursive: true })
for (const { sprint: s, contexto } of sprints) {
  const B = bloco(); const v = B.w
  const nn = String(s.index).padStart(2, '0')
  v(`# Sprint ${s.index} · ${s.name}${s.tipo === 'extra' ? ' *(extra)*' : ''}`)
  v()
  v('> **Gerado por `npm run spec:md`. Não edite à mão — a fonte é [`../spec/' + base.sprints_index.find((i) => i.id === s.id).arquivo.split('/').pop() + '`](../spec/' + base.sprints_index.find((i) => i.id === s.id).arquivo.split('/').pop() + ').**')
  v('>')
  v('> O Coder recebe **este arquivo**, a SPEC completa e o progresso — e nada além deles.')
  v(`> Contexto: [\`SPEC.md\`](../SPEC.md) · [\`PROGRESS.md\`](../PROGRESS.md) · agente \`${contexto.agente.id}\``)
  v()
  if (s.status) { v(`**Estado:** ${s.status}`); v() }
  v(`**Entregável:** ${s.entregavel}`)
  v()
  v(`**Risco:** ${s.risco} · **Pré-requisito:** ${s.pre_requisito ?? 'nenhum'} · **Stack permitida:** ${s.stack.map((t) => `\`${t}\``).join(', ')}`)
  v()
  v('## Escopo')
  v()
  v(s.description)
  v()
  for (const f of s.features) v(`- **${f.id}** — ${f.name}: ${f.description}`)
  v()
  const fora = [...new Set(s.features.flatMap((f) => f.out_of_scope))]
  if (fora.length) { v('## Fora do escopo'); v(); for (const o of fora) v(`- ${o}`); v() }
  const artboards = porSprint.get(s.id) ?? []
  if (artboards.length) {
    v('## Mockups desta sprint')
    v()
    v(`Fidelidade total ao desenho. Canvas: <${mockups.canvas}> — leia \`project/<Artboard>.dc.html\` antes de escrever tela.`)
    v()
    for (const a of artboards) v(`- **\`${a.id}\`** — ${a.titulo}${a.parcial ? `. ${a.parcial}` : ''}`)
    v()
    v('As divergências deliberadas estão na SPEC, em Mockups. A lista é fechada.')
    v()
  }
  v('## Regras do agente')
  v()
  for (const r of contexto.agente.rules) v(`- ${r}`)
  v()
  if (contexto.modelos_tocados.length) { v(`**Modelos tocados:** ${contexto.modelos_tocados.join(', ')}`); v() }
  v('## Features')
  v()
  for (const f of s.features) escreverFeature(v, f, { completo: true })
  v('## Critérios de aceite da sprint')
  v()
  let n = 0
  for (const f of s.features) for (const c of f.acceptance_criteria) v(`${++n}. [\`${f.id}\`] ${c}`)
  v()
  v('## Definition of done')
  v()
  for (const d of s.definition_of_done) v(`- [ ] ${d}`)
  v()
  v('## Verificações')
  v()
  v('```bash')
  for (const c of contexto.verificacoes) v(c)
  v('```')
  v()
  v('Erro de tipo, lint sujo ou teste quebrado nunca chegam ao Evaluator.')
  writeFileSync(`docs/sprints/sprint-${nn}.md`, B.txt())
}

console.log(`validação: ok, nenhum id órfão`)
console.log(`docs/SPEC.md + ${sprints.length} arquivos em docs/sprints/`)
