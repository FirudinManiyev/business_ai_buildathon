# SuperTraders — Business AI Buildathon

AI-destekli ticarət platforması: məhsul tövsiyəsi, iş elanları, CV analizi və maliyyə analitikası.

---

## Tələblər

- **Python** 3.10+
- **Node.js** 18+
- **Groq API açarı** → [console.groq.com](https://console.groq.com)

---

## Quraşdırma və İşə Salma

### 1. Layihəni klonla

```bash
git clone https://github.com/FirudinManiyev/business_ai_buildathon.git
cd business_ai_buildathon
```

### 2. Python virtual mühiti yarat və aktivləşdir

```bash
# Virtual mühit yarat
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
.\venv\Scripts\activate.bat

# macOS / Linux
source venv/bin/activate
```

### 3. Backend asılılıqlarını yüklə

```bash
pip install -r requirements.txt
```

### 4. Groq API açarını əlavə et

`backend/.env` faylı yarat (əgər yoxdursa):

```bash
# Windows PowerShell
[System.IO.File]::WriteAllText("backend\.env", "GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx`n", [System.Text.Encoding]::UTF8)
```

Sonra `backend/.env` faylını aç və öz açarını yaz:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

### 5. Backend-i işlət

**Əsas qovluqdan** (`business_ai_buildathon/`) işlət:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

> ✅ Backend: http://localhost:8000  
> ✅ API Docs: http://localhost:8000/docs

---

### 6. Frontend asılılıqlarını yüklə

```bash
cd frontend/buildathon
npm install
```

### 7. Frontend-i işlət

```bash
npm run dev
```

> ✅ Frontend: http://localhost:5173

---

## İstifadə

Hər iki server işlədikdən sonra brauzerdə **http://localhost:5173** aç.

### Demo Hesablar

| Rol | Email | Şifrə |
|-----|-------|-------|
| Admin | admin@supertraders.az | admin123 |
| İstifadəçi | user@test.az | user123 |

### İstifadəçi (User) imkanları
- **Məhsullar** — məhsul kataloqu, satın al, AI tövsiyə al
- **İş Elanları** — vakansiYalar, CV daxil et, AI uyğunluq analizi

### Admin imkanları
- **Elan İdarəsi** — yeni vakansiya yerləşdir, mövcud elanları idarə et
- **Maliyyə** — maliyyə analizi agenti, mənfəət/zərər hesabatı

---

## Texnologiyalar

| Hissə | Stack |
|-------|-------|
| Backend | Python, FastAPI, Groq LLM |
| Frontend | React 19, TypeScript, Vite |
| Stil | Tailwind CSS 4, Framer Motion |
| Auth | Frontend RBAC (localStorage) |
| Brend | SuperTraders |

---

## Qeyd

Backend olmadan da frontend işləyir — məhsullar və iş elanları üçün **mock data** mövcuddur. AI tövsiyələri backend olmadıqda local alqoritm ilə hesablanır.