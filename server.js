import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// ===============================
// FILE PATH SETUP
// ===============================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const csvPath = path.join(dataDir, "recruitment-applications.csv");

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// ===============================
// GEMINI AI SETUP
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ===============================
// EMAIL SETUP — FORCE SMTP IPV4
// ===============================

const mailerReady =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

let transporter = null;
let transporterPromise = null;

async function getEmailTransporter() {
    if (!mailerReady) {
        console.warn("Email is not configured. Check SMTP environment variables.");
        return null;
    }

    if (transporter) {
        return transporter;
    }

    if (transporterPromise) {
        return transporterPromise;
    }

    transporterPromise = (async () => {
        const smtpHostname = process.env.SMTP_HOST;

        console.log("Resolving SMTP IPv4 for:", smtpHostname);

        const ipv4Addresses = await dns.promises.resolve4(smtpHostname);

        if (!ipv4Addresses || ipv4Addresses.length === 0) {
            throw new Error("No IPv4 address found for SMTP host.");
        }

        const smtpIPv4 = ipv4Addresses[0];

        console.log("Using SMTP IPv4:", smtpIPv4);

        transporter = nodemailer.createTransport({
            host: smtpIPv4,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            requireTLS: true,
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                servername: smtpHostname,
                minVersion: "TLSv1.2"
            }
        });

        return transporter;
    })();

    return transporterPromise;
}

console.log("Email config loaded:", {
    mailerReady: Boolean(mailerReady),
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    MEMBERSHIP_EMAIL: process.env.MEMBERSHIP_EMAIL
});

// ===============================
// HELPER FUNCTIONS
// ===============================

function escapeCSV(value) {
    if (value === undefined || value === null) return "";
    return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeHTML(value) {
    if (value === undefined || value === null) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function saveApplicationToCSV(application) {
    const fileExists = fs.existsSync(csvPath);

    const headers = [
        "Submitted At",
        "Name",
        "Student ID",
        "UTP Email",
        "Phone",
        "Programme",
        "Year Semester",
        "Internship Semester",
        "First Department",
        "Second Department",
        "Experience",
        "Reason",
        "Skills"
    ];

    const submittedAt = new Date().toLocaleString("en-MY", {
        timeZone: "Asia/Kuala_Lumpur"
    });

    const row = [
        submittedAt,
        application.name,
        application.studentId,
        application.email,
        application.phone,
        application.programme,
        application.yearSemester,
        application.internshipSemester || "-",
        application.firstDepartment,
        application.secondDepartment,
        application.experience,
        application.reason,
        application.skills || "-"
    ].map(escapeCSV).join(",");

    if (!fileExists) {
        fs.writeFileSync(csvPath, headers.map(escapeCSV).join(",") + "\n");
    }

    fs.appendFileSync(csvPath, row + "\n");
}

// ===============================
// EMAIL SENDING FUNCTION
// ===============================

async function sendConfirmationEmail(application) {
    const emailTransporter = await getEmailTransporter();

    if (!emailTransporter) {
        console.warn("Email is not configured. Application saved without email.");
        return false;
    }

    const safeName = escapeHTML(application.name);
    const safeStudentId = escapeHTML(application.studentId);
    const safeEmail = escapeHTML(application.email);
    const safePhone = escapeHTML(application.phone);
    const safeProgramme = escapeHTML(application.programme);
    const safeYearSemester = escapeHTML(application.yearSemester);
    const safeInternshipSemester = escapeHTML(application.internshipSemester || "-");
    const safeFirstDepartment = escapeHTML(application.firstDepartment);
    const safeSecondDepartment = escapeHTML(application.secondDepartment);
    const safeExperience = escapeHTML(application.experience);
    const safeReason = escapeHTML(application.reason);
    const safeSkills = escapeHTML(application.skills || "-");

    await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: application.email,
        subject: "UTP Stellar Recruitment Application Received",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
                <h2>Application Received ✨</h2>

                <p>Hi ${safeName},</p>

                <p>
                    Thank you for applying to join <strong>UTP Stellar Astronomy Club 2026</strong>.
                    We have received your committee application.
                </p>

                <p>
                    Our Recruitment Drive team will review your submission and get back to you soon.
                </p>

                <h3>Recruitment Drive Session</h3>
                <ul>
                    <li><strong>Date:</strong> 3 June 2026</li>
                    <li><strong>Time:</strong> 9:00 PM - 11:00 PM</li>
                    <li><strong>Venue:</strong> V4 Cafe</li>
                </ul>

                <h3>Your Department Choices</h3>
                <ul>
                    <li><strong>First Choice:</strong> ${safeFirstDepartment}</li>
                    <li><strong>Second Choice:</strong> ${safeSecondDepartment}</li>
                </ul>

                <p>
                    See you soon, and thank you for your interest in becoming part of UTP Stellar!
                </p>

                <p>
                    Regards,<br>
                    <strong>UTP Stellar Astronomy Club</strong>
                </p>
            </div>
        `
    });

    if (process.env.MEMBERSHIP_EMAIL) {
        await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.MEMBERSHIP_EMAIL,
            subject: `New UTP Stellar Recruitment Application - ${safeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
                    <h2>New Recruitment Application</h2>

                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Student ID:</strong> ${safeStudentId}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Phone:</strong> ${safePhone}</p>
                    <p><strong>Programme:</strong> ${safeProgramme}</p>
                    <p><strong>Year/Semester:</strong> ${safeYearSemester}</p>
                    <p><strong>Internship Semester:</strong> ${safeInternshipSemester}</p>
                    <p><strong>First Choice Department:</strong> ${safeFirstDepartment}</p>
                    <p><strong>Second Choice Department:</strong> ${safeSecondDepartment}</p>

                    <h3>Experience</h3>
                    <p>${safeExperience}</p>

                    <h3>Reason for Joining</h3>
                    <p>${safeReason}</p>

                    <h3>Skills / Strengths</h3>
                    <p>${safeSkills}</p>
                </div>
            `
        });
    }

    return true;
}

// ===============================
// STELLAR AI SYSTEM
// ===============================

function buildPrompt(message) {
    return `
You are Stellar AI, the official AI assistant for UTP Stellar Astronomy Club.

Important identity:
- "Stellar" refers to UTP Stellar Astronomy Club.
- UTP Stellar Astronomy Club is a student astronomy club at Universiti Teknologi PETRONAS.
- The club focuses on astronomy, stargazing, space education, workshops, outreach, leadership, events, and student engagement.
- Do not answer as if "Stellar" is a general word unless the user clearly asks for the meaning of the word.

Website sections:
- Who We Are
- Our Mission
- Leadership Team
- Upcoming Events
- Past Activities
- AI Space Assistant
- Shop Catalogue
- Recruitment Drive
- Stellar Defender Booth Challenge

Leadership team:
- President: Ziyad
- Vice President: Farisha Nabilah
- Secretary I: Eiman Darwisy
- Secretary II: Putri Nur Farisha
- Treasurer I: Waizzuddin
- Treasurer II: Zeti Nadia
- Advisor: Miss Farahani
- Co-Advisor: Madam Adriena

Departments:
- Stargazing
- Media & Marketing
- Academic & Outreach
- Membership & Engagement
- Business & Sponsorship

Recruitment Drive:
- Date: 3 June 2026
- Time: 9:00 PM - 11:00 PM
- Venue: V4 Cafe
- Students must use their UTP email ending with @utp.edu.my.

Booth Game:
- Stellar Defender is a 3-level mini game.
- Students who complete all 3 levels can show the Mission Complete screen to claim a souvenir.

Response style:
- Be friendly, simple, and student-friendly.
- Keep answers clear and not too long.
- If the user asks about official details that may change, tell them to check UTP Stellar official announcements.

User question:
${message}
`;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(prompt) {
    const models = [
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash"
    ];

    for (const model of models) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt
                });

                return response.text || "Sorry, I could not generate a response.";
            } catch (error) {
                const status = error?.status || error?.code;

                console.log(`Model ${model}, attempt ${attempt} failed. Status:`, status);

                if (status === 503 || status === 429) {
                    await wait(1000 * attempt);
                    continue;
                }

                throw error;
            }
        }
    }

    return "Sorry, Stellar AI is busy right now. Please try again in a few minutes.";
}

// ===============================
// AI CHAT API
// ===============================

app.post("/api/stellar-ai", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.json({
                reply: "Please type your question first."
            });
        }

        const prompt = buildPrompt(message);
        const reply = await generateWithRetry(prompt);

        res.json({ reply });

    } catch (error) {
        console.error("Gemini AI error:", error);

        res.status(500).json({
            reply: "Sorry, Stellar AI is having trouble right now. Please try again later."
        });
    }
});

// ===============================
// RECRUITMENT FORM API
// ===============================

app.post("/api/recruitment", async (req, res) => {
    try {
        const application = req.body;

        const requiredFields = [
            "name",
            "studentId",
            "email",
            "phone",
            "programme",
            "yearSemester",
            "firstDepartment",
            "secondDepartment",
            "experience",
            "reason"
        ];

        for (const field of requiredFields) {
            if (!application[field] || application[field].trim() === "") {
                return res.status(400).json({
                    message: "Please complete all required fields."
                });
            }
        }

        application.email = application.email.trim().toLowerCase();

        const utpEmailRegex = /^[^\s@]+@utp\.edu\.my$/i;

        if (!utpEmailRegex.test(application.email)) {
            return res.status(400).json({
                message: "Please use your official UTP email address ending with @utp.edu.my."
            });
        }

        if (application.firstDepartment === application.secondDepartment) {
            return res.status(400).json({
                message: "Please choose a different second choice department."
            });
        }

        try {
            saveApplicationToCSV(application);
        } catch (fileError) {
            console.error("CSV saving failed:", fileError);

            if (fileError.code === "EBUSY") {
                return res.status(500).json({
                    message: "The recruitment CSV file is currently open. Please close it and submit again."
                });
            }

            return res.status(500).json({
                message: "Unable to save the application data. Please try again."
            });
        }

        let emailSent = false;

        try {
            emailSent = await sendConfirmationEmail(application);
            console.log("Confirmation email sent to:", application.email);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.json({
            message: emailSent
                ? "Your application has been received. A confirmation email has been sent to your UTP email."
                : "Your application has been received. The Recruitment Drive team will get back to you soon."
        });

    } catch (error) {
        console.error("Recruitment submission error:", error);

        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
});

// ===============================
// DOWNLOAD CSV
// ===============================

app.get("/api/recruitment/download", (req, res) => {
    const key = req.query.key;

    if (key !== process.env.ADMIN_DOWNLOAD_KEY) {
        return res.status(401).send("Unauthorised");
    }

    if (!fs.existsSync(csvPath)) {
        return res.status(404).send("No recruitment data found yet.");
    }

    res.download(csvPath, "utp-stellar-recruitment-applications.csv");
});

// ===============================
// TEST EMAIL ROUTE
// ===============================

app.get("/api/test-email", async (req, res) => {
    try {
        const key = req.query.key;
        const to = req.query.to;

        if (key !== process.env.ADMIN_DOWNLOAD_KEY) {
            return res.status(401).send("Unauthorised");
        }

        if (!to) {
            return res.status(400).send("Please provide ?to=email@utp.edu.my");
        }

        const emailTransporter = await getEmailTransporter();

        if (!emailTransporter) {
            return res.status(500).send(`
                <h2>Email transporter is not configured.</h2>
                <p>Check Render environment variables:</p>
                <ul>
                    <li>SMTP_HOST</li>
                    <li>SMTP_PORT</li>
                    <li>SMTP_USER</li>
                    <li>SMTP_PASS</li>
                    <li>SMTP_FROM</li>
                </ul>
            `);
        }

        console.log("Testing email from Render...");
        console.log("SMTP user:", process.env.SMTP_USER);
        console.log("Sending test email to:", to);

        await emailTransporter.verify();

        await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: "UTP Stellar Email Test",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>UTP Stellar Email Test ✨</h2>
                    <p>If you received this, the deployed website email system is working.</p>
                </div>
            `
        });

        res.send("Test email sent successfully.");

    } catch (error) {
        console.error("Test email failed:", error);

        res.status(500).send(`
            <h2>Test email failed</h2>
            <p><strong>Error code:</strong> ${error.code || "N/A"}</p>
            <p><strong>Response code:</strong> ${error.responseCode || "N/A"}</p>
            <p><strong>Command:</strong> ${error.command || "N/A"}</p>
            <p><strong>Message:</strong> ${error.response || error.message}</p>
        `);
    }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`UTP Stellar website running at http://localhost:${PORT}`);
});