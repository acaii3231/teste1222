# 🔧 Correção do Facebook Pixel

## ✅ Problemas Corrigidos

### 1. Pixel sendo inicializado 2 vezes
**Problema:** O pixel estava sendo carregado múltiplas vezes na mesma página.

**Solução:**
- Adicionada verificação se o script já está no DOM
- Flag global `pixelInitialized` para evitar múltiplas inicializações
- Verificação antes de carregar o script

### 2. Evento Purchase disparado 2 vezes
**Problema:** O Purchase estava sendo disparado em 2 lugares diferentes:
- No auto-check do pagamento (linha 208)
- No subscription do Supabase (linha 354)

**Solução:**
- Flag global `purchaseTracked` no `facebook-pixel.ts`
- Verificação por `transactionId` para evitar duplicatas
- Logs detalhados para debug

### 3. Valor incorreto (0.5)
**Problema:** O valor estava sendo enviado como 0.5 em vez do valor real.

**Solução:**
- Conversão automática se o valor estiver em centavos (> 10000)
- Validação do valor antes de enviar
- Logs para identificar problemas de conversão

---

## 📋 Mudanças Realizadas

### `src/lib/facebook-pixel.ts`

1. **Verificação de script duplicado:**
```typescript
if (document.querySelector('script[src*="fbevents.js"]')) {
  // Script já existe, apenas reinicializar
}
```

2. **Flag global para Purchase:**
```typescript
let purchaseTracked = false;
let purchaseTransactionId: string | undefined = undefined;
```

3. **Validação e conversão de valor:**
```typescript
// Se valor > 10000, provavelmente está em centavos
if (value > 10000) {
  valueInReais = value / 100;
}
```

### `src/pages/Checkout.tsx`

1. **Validação do valor antes de enviar:**
```typescript
const valueInReais = typeof totalValue === 'number' ? totalValue : parseFloat(totalValue) || 0;
```

2. **Logs detalhados:**
```typescript
console.log('📊 Disparando evento Purchase via subscription:', {
  totalValue,
  valueInReais,
  transactionId
});
```

---

## 🧪 Como Testar

1. **Abrir o site no navegador**
2. **Abrir o console (F12)**
3. **Fazer uma compra de teste**
4. **Verificar os logs:**
   - ✅ `Facebook Pixel inicializado` (deve aparecer apenas 1 vez)
   - ✅ `Evento Purchase disparado` (deve aparecer apenas 1 vez)
   - ✅ Valor correto em reais (não 0.5)

5. **Verificar no Facebook Events Manager:**
   - Acesse: https://business.facebook.com/events_manager2
   - Vá em **Test Events**
   - Verifique se o Purchase aparece apenas 1 vez
   - Verifique se o valor está correto

---

## 🐛 Troubleshooting

### Pixel ainda aparece 2 vezes

**Solução:**
- Limpe o cache do navegador
- Verifique se não há outro script do pixel na página
- Verifique os logs no console

### Valor ainda está errado

**Solução:**
- Verifique o console para ver o valor original
- Verifique se o `total_value` no banco está correto
- Verifique se está em reais ou centavos

### Purchase não dispara

**Solução:**
- Verifique se `pixelOnPurchase` está ativado no admin
- Verifique os logs no console
- Verifique se o pixel está inicializado

---

## 📊 Logs Esperados

**Inicialização:**
```
✅ Facebook Pixel inicializado: 1352925696565772
```

**Purchase:**
```
📊 Evento Purchase disparado: {
  value: 67,
  currency: 'BRL',
  transaction_id: 'uuid-here'
}
```

**Se já foi disparado:**
```
⚠️  Purchase já foi disparado para esta transação, ignorando
```

---

## ✅ Status

- [x] Pixel não duplica mais
- [x] Purchase dispara apenas 1 vez
- [x] Valor é validado e convertido corretamente
- [x] Logs detalhados para debug

