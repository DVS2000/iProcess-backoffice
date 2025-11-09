# Guia de Filtros no Frontend (iProcess Front)

Este guia mostra como aplicar filtros e paginação nas chamadas de API do frontend usando `useApi`, `$api` e `createUrl`. Os exemplos cobrem Documentos e Logs, alinhados com os endpoints disponíveis no backend.

## Convenções
- Base da API: `import.meta.env.VITE_API_BASE_URL` (ou `/api` por proxy).
- Autenticação: `useApi` e `$api` adicionam `Authorization: Bearer <token>` automaticamente a partir do cookie `accessToken` e redirecionam em `401`.
- Construção de URL com query: use `createUrl('/rota', { query: { ... } })`. Ele aceita `ref`s e valores reativos; quando alterados, refaz a chamada se `refetch: true` em `useApi`.
- Números e datas: passe números como `number` (não string) e datas em ISO (`new Date().toISOString()`).

## Documentos
Endpoint de listagem:
- `GET /document`: lista documentos com filtros e paginação.

Exemplo básico (documentos da empresa):

```js
// src/pages/document/listar.vue
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

const { data, execute: fetchDocuments, isFetching, error } = await useApi(createUrl('/document', {
  query: { page, limit: itemsPerPage, search },
}))

// Resposta paginada: data.value?.data?.data e data.value?.data?.pagination
const documents = computed(() => data.value?.data?.data || [])
const totalItems = computed(() => data.value?.data?.pagination?.total || 0)
```

Exemplo com filtros avançados em documentos:

```js
const page = ref(1)
const limit = ref(10)
const search = ref('contrato')
const sortBy = ref('createdAt')
const sortOrder = ref('desc') // 'asc' | 'desc'
const ownerId = ref(undefined) // opcional
const folderId = ref(undefined) // opcional
const workflowId = ref(undefined) // opcional
const createdAfter = ref(undefined) // new Date('2024-01-01').toISOString()
const createdBefore = ref(undefined) // new Date('2024-12-31').toISOString()

const url = createUrl('/document', {
  query: { page, limit, search, sortBy, sortOrder, ownerId, folderId, workflowId, createdAfter, createdBefore },
})

const { data, isFetching } = await useApi(url)
```

Observações:
- `sortBy` padrão é `createdAt` e `sortOrder` padrão é `desc` no backend.
- As datas devem ser strings ISO (ex.: `2025-01-01T00:00:00.000Z`).
- Para forçar o recarregamento manual, use `execute()` (ex.: após delete ou update).

## Logs (LogEntry)
Endpoints de listagem com filtros: `GET /log-entry`.

Parâmetros suportados: `limit`, `offset`, `sortBy`, `sortOrder`, `action`, `userId`, `target`, `search`.

Exemplo básico com paginação e ordenação:

```js
const limit = ref(10)
const offset = ref(0) // deslocamento (não é page)
const sortBy = ref('timestamp')
const sortOrder = ref('desc')

const url = createUrl('/log-entry', {
  query: { limit, offset, sortBy, sortOrder },
})

const { data, isFetching, error } = await useApi(url)
const logs = computed(() => data.value || [])
```

Exemplo com filtros avançados:

```js
const limit = ref(20)
const offset = ref(0)
const action = ref('DOCUMENT_CREATED') // ex.: valor livre conforme auditoria
const userId = ref('uuid-do-usuario')
const target = ref('document:123') // ex.: recurso de destino
const search = ref('erro')

const url = createUrl('/log-entry', {
  query: { limit, offset, sortBy: 'timestamp', sortOrder: 'desc', action, userId, target, search },
})

const { data } = await useApi(url)
```

Restrições de acesso:
- `LogEntryController` exige `Bearer` e papéis `ADMIN` ou `MANAGER` para listagem.

## Usando `$api` diretamente
Para chamadas imperativas sem reatividade de `useApi`:

```js
// GET com query simples
const resp = await $api('/document', { query: { page: 1, limit: 10, search: 'contrato' } })

// DELETE
await $api(`/document/${id}`, { method: 'DELETE' })

// POST
await $api('/document', { method: 'POST', body: payload })
```

## Dicas de uso
- Use `ref`s nos parâmetros de `createUrl` para refetch automático quando houver interação de UI.
- Em listas com VDataTableServer, vincule `page` e `items-per-page` aos `ref`s usados na query.
- Evite passar `undefined` explicitamente para filtros; se um filtro não for usado, deixe-o `undefined` ou remova do objeto.
- Em logs, lembre que a paginação é `offset/limit` (não `page/limit`). Em documentos, é `page/limit`.
- Após operações de escrita (POST/PUT/DELETE), chame `execute()` ou refaça a chamada para atualizar a lista.

Este guia está alinhado com os serviços e controladores atuais do backend (Document e LogEntry) e com os utilitários do frontend (`useApi`, `$api`, `createUrl`).