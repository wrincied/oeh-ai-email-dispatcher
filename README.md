# ÖH AI Email Dispatcher — Automated Student Query Handler

An AI-powered automation system for handling and routing student inquiries at ÖH Leoben using Google Gemini API and SMTP integration.

## 🎯 Problem

As a Sachbearbeiter at ÖH Leoben, I noticed:
- 60% of student queries are highly repetitive (exam registration, timetable, contact info).
- Staff spend 10+ hours/week manually sorting and answering the same questions.
- Response time varies from 2 to 24 hours depending on staff availability.

## 💡 Solution: Intelligent Email Dispatcher

An automated triage and response system designed for "Digital Enablement" within the university environment:
1. **Low-Complex Queries:** Instantly answered with approved university procedures directly via email.
2. **High-Complex / Technical Errors:** The system flags the email, sends an automated receipt to the student, and immediately routes an escalation ticket to the responsible staff member with automated priority tagging.

## 🛠️ Tech Stack

- **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
- **Protocol Integration:** NodeMailer (SMTP)
- **Runtime:** Node.js (ES Modules)
- **Data Validation:** Native Structured JSON Output via `responseSchema`

## ✨ Key Features

### 1. Intelligent Classification
Categorizes inbound emails into 4 distinct areas (`Prüfungsanmeldung`, `Stundenplan`, `Kontakt`, `Allgemein`) with dynamic priority levels.

### 2. Human-in-the-Loop Escalation
AI evaluates the context (e.g., system crash bugs vs. general questions). If a critical system error is detected, auto-reply is bypassed, and the issue is forwarded to human agents.

### 3. Structured Outputs
Uses Gemini's native schema enforcement to guarantee type-safe JSON objects, preventing background runtime parsing failures.

### 4. Performance Monitoring
Tracks execution latency in milliseconds to evaluate production readiness and responsiveness.

## 📊 Demo Output

```text
Initialisere ÖH Mail-Automation Pipeline...


╔═══════════════════════════════════════╗
║     ÖH Email Automation Pipeline      ║
╚═══════════════════════════════════════╝

Incoming email from : youremail@gmail.com
Category (AI)       : Prüfungsanmeldung
Urgency (AI)        : high
Need a real person? : Yes
Processing time     : 2419ms

Generated Reply:
"Sehr geehrte/r Studierende/r, vielen Dank für Ihre Nachricht. Es tut uns leid zu hören, dass Sie Probleme bei der Anmeldung zur Ergänzungsprüfung Mathematik über MU Online haben und einen Fehler (Code 500) erhalten. Technische Probleme dieser Art erfordern eine genauere Untersuchung. Wir werden Ihr Anliegen umgehend an die zuständige Abteilung weiterleiten, damit diese den Fehler prüfen und beheben kann. Bitte haben Sie etwas Geduld, während wir uns darum kümmern. Wir werden Sie informieren, sobald wir Neuigkeiten haben oder eine Lösung gefunden wurde. Mit freundlichen Grüßen, Ihre ÖH Leoben"

Scenario: A complex case. Initiating the escalation process...
An escalation notification has been sent to the employee.
```

## 🚀 Quick Start
Clone the repository: ```https://github.com/wrincied/oeh-ai-email-dispatcher.git```

**Install dependencies**:

``` npm install ```

Create a ```.env``` file in the root directory:

```
  GEMINI_API_KEY=your_gemini_api_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   STUDENT_EMAIL=student@example.com
   STAFF_EMAIL=staff@example.com
```

```
node server.js
```
