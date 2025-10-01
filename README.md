# 🌍 AirQuest - Monitoramento Ambiental Global

## 📁 Estrutura do Projeto

```
NasaPrototipo/
├── index.html                 # Página de redirecionamento
├── pages/                     # Páginas do aplicativo
│   ├── home.html             # Página inicial
│   ├── globe.html            # Globo 3D interativo
│   ├── importance.html       # Página "Por que Importa?"
│   └── quiz.html             # Quiz educativo
├── styles/                   # Arquivos CSS organizados
│   ├── base.css              # Estilos base compartilhados
│   ├── home.css              # Estilos da página inicial
│   ├── globe.css             # Estilos do globo 3D
│   ├── importance.css        # Estilos da página importance
│   └── quiz.css              # Estilos do quiz
├── scripts/                  # Scripts JavaScript
│   ├── globe-script.js       # Script do globo 3D
│   └── quiz-script.js        # Script do quiz
├── nasa-api.js              # Integração com APIs da NASA
├── package.json             # Configurações do projeto
└── README.md                # Este arquivo
```

## 🚀 Como Executar

1. **Inicie o servidor local:**
   ```bash
   python -m http.server 8000
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

## 📄 Páginas Disponíveis

### 🏠 **Home** (`pages/home.html`)
- Página inicial com apresentação do projeto
- Links para todas as funcionalidades
- Design moderno e responsivo

### 🌍 **Globo 3D** (`pages/globe.html`)
- Visualização interativa do globo terrestre
- Sistema de heatmap com dados ambientais
- Painéis flutuantes com controles
- Dados em tempo real

### 💡 **Por que Importa?** (`pages/importance.html`)
- Informações educativas sobre qualidade do ar
- Dados impactantes e estatísticas
- Soluções e ações práticas

### 🎓 **Quiz** (`pages/quiz.html`)
- Quiz educativo sobre meio ambiente
- Sistema de pontuação e medalhas
- Estatísticas persistentes

## 🎨 Sistema de Estilos

### **Base CSS** (`styles/base.css`)
- Estilos compartilhados entre todas as páginas
- Tipografia, botões, cards, utilitários
- Responsividade e animações

### **CSS Específicos**
- Cada página tem seu próprio arquivo CSS
- Estilos otimizados para cada funcionalidade
- Animações e efeitos visuais únicos

## 🔧 Scripts JavaScript

### **Globo 3D** (`scripts/globe-script.js`)
- Classe `GlobeApp` para gerenciar o globo
- Sistema de heatmap dinâmico
- Controles interativos
- Atualizações em tempo real

### **Quiz** (`scripts/quiz-script.js`)
- Classe `QuizApp` para gerenciar o quiz
- Sistema de perguntas e respostas
- Cálculo de pontuação
- Persistência de dados

## 🌟 Funcionalidades

### **Globo 3D Interativo**
- ✅ Visualização 3D do planeta Terra
- ✅ Países e continentes visíveis
- ✅ Sistema de heatmap com 5 tipos de dados
- ✅ Painéis flutuantes modernos
- ✅ Dados em tempo real
- ✅ Controles interativos

### **Sistema Educativo**
- ✅ Página informativa sobre qualidade do ar
- ✅ Dados científicos e estatísticas
- ✅ Quiz interativo com pontuação
- ✅ Sistema de medalhas e conquistas

### **Design Moderno**
- ✅ Interface clean e profissional
- ✅ Animações suaves
- ✅ Responsividade completa
- ✅ Tema espacial da NASA

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos e animações
- **JavaScript ES6+** - Lógica interativa
- **Canvas API** - Renderização 2D/3D
- **LocalStorage** - Persistência de dados
- **Google Fonts** - Tipografia

## 📱 Responsividade

- ✅ **Desktop** (1200px+)
- ✅ **Tablet** (768px - 1199px)
- ✅ **Mobile** (320px - 767px)

## 🎯 Navegação

- **Home** → Página inicial
- **Globo 3D** → Visualização interativa
- **Por que Importa?** → Educação
- **Quiz** → Teste de conhecimento

## 🔗 Links Internos

Todas as páginas estão interconectadas com navegação intuitiva:
- Botões "Voltar" em todas as páginas
- Links diretos entre funcionalidades
- Redirecionamento automático do index.html

## 📊 Dados Simulados

O projeto utiliza dados simulados realistas para demonstração:
- **AQI** (Índice de Qualidade do Ar)
- **Poluentes** (PM2.5, NO₂, O₃, CO)
- **Queimadas** (Focos ativos)
- **Temperatura** (Dados climáticos)
- **Umidade** (Dados ambientais)

## 🚀 Próximos Passos

1. **Integração com APIs reais da NASA**
2. **Sistema de usuários e perfis**
3. **Mais tipos de dados ambientais**
4. **Exportação de relatórios**
5. **Sistema de notificações**

---

**Desenvolvido para NASA Space Apps Challenge 2024** 🚀