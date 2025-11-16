# ✅ Código Correto do Supabase

## ❌ Código INCORRETO (que você mostrou):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpzutdlkeegwiqkphqkj.supabase.co'

const supabaseKey = process.env.sbp_00e09d9b0ae42f6023fc0ca3107d58b341c24525 

const supabase = createClient(supabaseUrl, supabaseKey)
```

### Problemas deste código:

1. ❌ **`process.env.sbp_...`** - Isso não funciona! Variáveis de ambiente não podem ter esse formato
2. ❌ **Token `sbp_...`** - Esse token não é a chave anon correta (já testamos e não funciona)
3. ❌ **`process.env`** - No frontend (Vite), use `import.meta.env`, não `process.env`
4. ❌ **Falta configuração de auth** - Não tem storage, persistSession, etc.

---

## ✅ Código CORRETO (já está no projeto):

O código correto já está em: `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ✅ Usa import.meta.env (Vite), não process.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qpzutdlkeegwiqkphqkj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// ✅ Verifica se as variáveis estão configuradas
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('⚠️ Variáveis do Supabase não configuradas.');
}

// ✅ Cria o cliente com configurações corretas
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

---

## 🔧 Como Usar no Projeto:

### 1. Importar o cliente (já configurado):

```typescript
import { supabase } from "@/integrations/supabase/client";

// Usar diretamente
const { data, error } = await supabase.from('transactions').select('*');
```

### 2. Configurar Variáveis de Ambiente:

No Netlify, configure:

```
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[sua_chave_anon_correta]
```

**⚠️ IMPORTANTE:** A chave deve ser a **anon key** do Supabase Dashboard (começa com `eyJ...`), não o token `sbp_...`

---

## 📝 Diferenças Importantes:

| ❌ Incorreto | ✅ Correto |
|-------------|-----------|
| `process.env.sbp_...` | `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` |
| Token `sbp_...` | Chave anon `eyJ...` |
| Sem configuração de auth | Com `storage`, `persistSession`, etc. |
| Sem verificação de erros | Com verificação e logs |

---

## 🎯 Resumo:

1. ✅ **O código correto já está no projeto** em `src/integrations/supabase/client.ts`
2. ✅ **Não precisa criar novo arquivo** - use o que já existe
3. ✅ **Configure as variáveis no Netlify** com a chave anon correta
4. ✅ **Importe assim:** `import { supabase } from "@/integrations/supabase/client"`

---

## 🐛 Se ainda não funcionar:

1. Verifique se obteve a chave **anon** correta do Supabase Dashboard
2. Verifique se configurou as variáveis no Netlify
3. Verifique se fez redeploy após configurar
4. Abra o console do navegador (F12) e veja os logs

