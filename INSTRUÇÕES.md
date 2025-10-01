# 🚀 Instruções Rápidas - AirQuest

## ⚡ Execução Imediata

### Opção 1: Abrir Diretamente
1. **Clique duas vezes** no arquivo `demo.html`
2. **Clique em "Iniciar AirQuest"** na página de demonstração
3. **Explore** todas as funcionalidades!

### Opção 2: Servidor Local (Recomendado)
1. **Abra o terminal** na pasta do projeto
2. **Execute**: `python -m http.server 8000`
3. **Acesse**: `http://localhost:8000/demo.html`
4. **Clique em "Iniciar AirQuest"**

## 📁 Estrutura do Projeto

```
AirQuest/
├── demo.html          # Página de demonstração
├── index.html         # Aplicação principal
├── styles.css         # Estilos NASA
├── script.js          # Lógica principal
├── nasa-api.js        # Integração APIs NASA
├── README.md          # Documentação completa
├── package.json       # Configuração do projeto
└── INSTRUÇÕES.md      # Este arquivo
```

## 🎯 Funcionalidades Testáveis

### ✅ Tela Inicial
- [x] Animação de partículas
- [x] Pergunta impactante
- [x] Botões CTA funcionais

### ✅ Introdução
- [x] Storytelling visual
- [x] Animações sequenciais
- [x] Dados científicos

### ✅ Globo 3D
- [x] Rotação e zoom
- [x] Clique em cidades
- [x] Camadas de dados
- [x] Informações em tempo real

### ✅ Quiz
- [x] 5 perguntas científicas
- [x] Sistema de pontuação
- [x] Medalhas (Bronze/Prata/Ouro)
- [x] Ranking local

### ✅ APIs NASA
- [x] Dados TEMPO simulados
- [x] Dados GIBS simulados
- [x] Dados OpenAQ simulados
- [x] Sistema de cache

## 🔧 Personalização Rápida

### Alterar Perguntas do Quiz
Edite o arquivo `script.js`, método `loadQuizData()`:

```javascript
{
    question: "Sua pergunta aqui?",
    answers: ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    correct: 0,
    explanation: "Explicação científica."
}
```

### Modificar Cores
Edite o arquivo `styles.css`:

```css
:root {
    --primary-color: #0096ff;
    --secondary-color: #00d4ff;
    --accent-color: #ff6b35;
}
```

### Adicionar Novas Cidades
Edite o arquivo `script.js`, método `addAirQualityPoints()`:

```javascript
{ name: 'Sua Cidade', lat: -23.5505, lng: -46.6333, aqi: 85, status: 'moderate' }
```

## 🌐 Navegadores Suportados

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📱 Dispositivos Testados

- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## 🐛 Solução de Problemas

### Globo 3D não carrega
- Verifique se o Three.js está carregando
- Abra o console do navegador (F12)
- Verifique erros de JavaScript

### Animações lentas
- Feche outras abas do navegador
- Use hardware acceleration
- Teste em navegador diferente

### Dados não carregam
- Verifique conexão com internet
- APIs da NASA podem estar temporariamente indisponíveis
- Dados simulados são usados como fallback

## 🚀 Próximos Passos

1. **Teste todas as funcionalidades**
2. **Personalize conforme necessário**
3. **Adicione suas próprias perguntas**
4. **Integre com APIs reais da NASA**
5. **Deploy em servidor web**

## 📞 Suporte

- **Documentação**: `README.md`
- **Código**: Comentários em português
- **APIs**: `nasa-api.js` com exemplos

---

**🎯 Objetivo**: Demonstrar o potencial de combinar dados da NASA com gamificação para conscientização ambiental.

**💡 Inovação**: Interface inspirada em painéis de controle da NASA para máxima credibilidade científica.
