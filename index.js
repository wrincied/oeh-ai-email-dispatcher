import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// test mail
const testEmails = {
    technicalError: {
        sender: process.env.STUDENT_EMAIL,
        subject: "Problem mit der Ergänzungsprüfung",
        body: "Hallo ÖH Team! Ich versuche mich für die Ergänzungsprüfung Mathematik anzumelden, aber das System in MU Online wirft immer einen unbekannten Fehler (Code 500) aus. Könnt ihr das manuell prüfen?"
    },
    standardInquiry: {
        sender: process.env.STUDENT_EMAIL,
        subject: "Wo ist der Stundenplan?",
        body: "Hi, ich habe gerade mein Studium in Industrial Data Science angefangen. Wo kann ich meinen aktuellen Stundenplan für diese Woche sehen? Danke!"
    }
};

//scenario (technicalError or standardInquiry)
const currentEmailToProcess = testEmails.technicalError;

// helper
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: `"ÖH Leoben AI Assistant" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            text: text
        });
        return true;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.message);
        return false;
    }
}

// main function of pipelime
async function processIncomingEmail(email) {
    const startTime = Date.now();
    
    // promt Instructions for AI
    const systemInstruction = `
    Du bist ein E-Mail-Automatisierungssystem für die ÖH Leoben (Studierendenvertretung). 
    Analysiere den Inhalt der eingehenden E-Mail und klassifiziere sie präzise.
    
    Regeln für das Feld 'reply_de':
    - Formuliere eine professionelle E-Mail-Antwort auf Deutsch.
    - Verwende eine höfliche Anrede.
    - Wenn die Anfrage technische Fehler (z.B. Systemabsturz in MU Online) oder hochgradig individuelle Probleme enthält, setze 'requires_human' auf true.
    `;

    // Structured Output
    const jsonSchema = {
        type: Type.OBJECT,
        properties: {
            category: { 
                type: Type.STRING, 
                enum: ["Prüfungsanmeldung", "Stundenplan", "Kontakt", "Allgemein"] 
            },
            reply_de: { type: Type.STRING },
            priority: { 
                type: Type.STRING, 
                enum: ["low", "medium", "high"] 
            },
            requires_human: { type: Type.BOOLEAN }
        },
        required: ["category", "reply_de", "priority", "requires_human"],
    };

    try {
        //  gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Betreff: ${email.subject}\n\nInhalt:\n${email.body}`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1, 
                responseMimeType: 'application/json',
                responseSchema: jsonSchema,
            }
        });

        const result = JSON.parse(response.text);
        const responseTime = Date.now() - startTime;

        // metrics of effe.
        console.log("\n╔═══════════════════════════════════════╗");
        console.log("║    ÖH Email Automation Pipeline       ║");
        console.log("╚═══════════════════════════════════════╝\n");
        
        console.log(`Incoming email from : ${email.sender}`);
        console.log(`Category (AI)       : ${result.category}`);
        console.log(`Urgency (AI)        : ${result.priority}`);
        console.log(`Need a real person? : ${result.requires_human ? 'Yes' : 'No'}`);
        console.log(`Processing time     : ${responseTime}ms`);
        console.log(`\nGenerated Reply:\n"${result.reply_de}"\n`);

        // Routing logic based on AI solutions
        if (!result.requires_human) {
            console.log("Scenario: Standard enquiry. Sending an automated reply to a student...");
            const success = await sendEmail(
                email.sender, 
                `Re: ${email.subject} (Automatische Antwort)`, 
                result.reply_de
            );
            if (success) console.log("The auto-reply has been successfully delivered.");
        } else {
            console.log("Scenario: A complex case. Initiating the escalation process...");
            
            // send a message to student, that ur problem, was sent to real person
            const studentNotice = `Liebe/r Studierende/r,\n\nvielen Dank für deine Nachricht. Da dein Anliegen eine manuelle Überprüfung unseres IT-Teams erfordert, wurde deine Anfrage an das ÖH-Team eskaliert. Ein Mitarbeiter wird sich in Kürze direkt bei dir melden.\n\nMit freundlichen Grüßen,\nDeine ÖH Leoben`;
            await sendEmail(email.sender, `Re: ${email.subject} (Eingangsbestätigung)`, studentNotice);
            
            // Resend original messange to employee + metadata
            const staffNotification = `ACHTUNG: Neue manuelle Bearbeitung erforderlich.\n\nKategorie: ${result.category}\nPriorität: ${result.priority}\nAbsender: ${email.sender}\n\nOriginalnachricht:\n${email.body}`;
            const successStaff = await sendEmail(
                process.env.STAFF_EMAIL, 
                `[ESKALATION] ${result.priority.toUpperCase()}: ${email.subject}`, 
                staffNotification
            );
            if (successStaff) console.log("An escalation notification has been sent to the employee.");
        }

    } catch (error) {
        console.error("\nCritical error in the automation pipeline:", error.message);
    }
}

// Start
console.log("Initialisation ÖH Mail-Automation Pipeline...\n");
processIncomingEmail(currentEmailToProcess);