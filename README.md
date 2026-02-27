# JARVIS HUD 🤖

Interface HUD estilo JARVIS com backend FastAPI e frontend React + Vite + Tailwind.

```
jarvis-hud/
├── backend/
│   ├── core/         # config, security (JWT)
│   ├── api/          # routes, websocket
│   ├── services/     # lógica de negócio
│   ├── schemas/      # modelos Pydantic
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/      # Login, Dashboard
    │   ├── components/ # Radar, HUDCards, Transcript
    │   └── lib/        # api.ts (axios + interceptors)
    ├── index.html
    └── package.json
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Python 3.10+**
- **Node.js 18+**

---

### Backend

```bash
cd jarvis-hud/backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Linux/macOS)
source venv/bin/activate

# Ativar (Windows)
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env conforme necessário

# Rodar o servidor
python main.py
```

Backend disponível em: **http://localhost:8000**
Swagger UI: **http://localhost:8000/docs**

---

### Frontend

```bash
cd jarvis-hud/frontend

# Instalar dependências
npm install

# Rodar o servidor de desenvolvimento
npm run dev
```

Frontend disponível em: **http://localhost:5173**

---

## 🔑 Login Padrão

| Campo    | Valor      |
|----------|------------|
| Username | `admin`    |
| Password | `jarvis123`|

> Mude as credenciais no arquivo `.env` antes de ir para produção.

---

## 🔌 API Reference

| Método | Rota                  | Auth | Descrição                          |
|--------|-----------------------|------|------------------------------------|
| GET    | `/health`             | —    | Status do servidor                 |
| POST   | `/auth/login`         | —    | Retorna JWT                        |
| POST   | `/assistant/chat`     | ✅   | Chat com JARVIS                    |
| GET    | `/tools/weather`      | ✅   | Dados meteorológicos (fake MVP)    |
| GET    | `/tools/system`       | ✅   | CPU/RAM/Uptime (fake MVP)          |
| WS     | `/assistant/events`   | —    | Stream de eventos em tempo real    |

---

## ⚙️ Variáveis de Ambiente (`.env`)

```env
SECRET_KEY=your-super-secret-key-change-in-production
ADMIN_USER=admin
ADMIN_PASS=jarvis123
OPENAI_API_KEY=sk-your-openai-key-here   # Futuro: integração real com IA
```

---

## 🗺️ Roadmap

- [ ] Integração com OpenAI GPT-4o via `/assistant/chat`
- [ ] Webcam real via WebRTC no card de câmera
- [ ] Dados reais de CPU/RAM com `psutil`
- [ ] Dados reais de clima via OpenWeatherMap API
- [ ] Autenticação com múltiplos usuários e banco de dados
- [ ] Deploy com Docker Compose

---

## 🛠️ Stack

| Camada     | Tecnologia                        |
|------------|-----------------------------------|
| Backend    | FastAPI, Uvicorn, python-jose     |
| Frontend   | React 18, Vite, Tailwind CSS      |
| Auth       | JWT (HS256)                       |
| Real-time  | WebSocket nativo                  |
| HTTP       | Axios com interceptors            |
| Fonts      | Orbitron + Share Tech Mono        |

---

## 🎨 Design

HUD inspirado no sistema JARVIS do Universo Marvel. Paleta ciano sobre fundo quase-preto com:
- Scanlines via CSS pseudo-element
- Radar SVG animado com sweep rotacional
- Cards com decorações de canto estilo HUD
- Tipografia Orbitron para títulos, Share Tech Mono para dados
- Efeito flicker e glow nos elementos
