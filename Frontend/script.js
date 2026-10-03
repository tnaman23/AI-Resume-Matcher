// ============================================================
// AI RESUME ASSISTANT
// MAIN JAVASCRIPT
// ============================================================


// ============================================================
// BACKEND URL
// ============================================================

const BACKEND_URL = "http://127.0.0.1:8000";


// ============================================================
// HOME PAGE NAVIGATION
// ============================================================

function buildResume() {
    window.location.href = "build.html";
}

function matchResume() {
    window.location.href = "match.html";
}

function goHome() {
    window.location.href = "index.html";
}


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let selectedResumeFile = null;
let selectedJobFile = null;
let uploadedJobDescription = "";
let verifiedSkills = [];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("AI Resume Assistant loaded successfully.");

    setupResumeFileInput();
    setupJobFileInput();
    loadVerifiedSkillsIntoBuilder();

});


// ============================================================
// RESUME FILE INPUT
// ============================================================

function setupResumeFileInput() {

    const resumeFile = document.getElementById("resumeFile");

    if (!resumeFile) {
        return;
    }

    resumeFile.addEventListener("change", function () {

        if (!this.files || this.files.length === 0) {
            return;
        }

        selectedResumeFile = this.files[0];

        const fileName = document.getElementById("resumeFileName");

        if (fileName) {
            fileName.textContent = selectedResumeFile.name;
            fileName.style.color = "#64748b";
        }

    });
}


// ============================================================
// JOB PDF FILE INPUT
// ============================================================

function setupJobFileInput() {

    const jobFile = document.getElementById("jobFile");

    if (!jobFile) {
        return;
    }

    jobFile.addEventListener("change", function () {

        if (!this.files || this.files.length === 0) {
            return;
        }

        selectedJobFile = this.files[0];

        const fileName = document.getElementById("jobFileName");

        if (fileName) {
            fileName.textContent = selectedJobFile.name;
            fileName.style.color = "#64748b";
        }

    });
}


// ============================================================
// UPLOAD RESUME
// ============================================================

async function uploadResume() {

    const fileInput = document.getElementById("resumeFile");
    const status = document.getElementById("uploadStatus");

    if (
        !fileInput ||
        !fileInput.files ||
        fileInput.files.length === 0
    ) {

        if (status) {
            status.textContent = "Please select a PDF resume first.";
            status.style.color = "#dc2626";
        }

        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith(".pdf")) {

        if (status) {
            status.textContent = "Only PDF files are allowed.";
            status.style.color = "#dc2626";
        }

        return;
    }

    if (status) {
        status.textContent = "Uploading resume...";
        status.style.color = "#2563eb";
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

        console.log("Uploading resume:", file.name);

        const response = await fetch(
            BACKEND_URL + "/upload-resume",
            {
                method: "POST",
                body: formData
            }
        );

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error("Backend returned an invalid response.");
        }

        if (!response.ok) {
            throw new Error(
                data.detail || "Resume upload failed."
            );
        }

        window.uploadedResumeData = data;

        if (status) {
            status.textContent = "✓ Resume uploaded successfully!";
            status.style.color = "#16a34a";
        }

        console.log("Resume uploaded successfully.");

    } catch (error) {

        console.error("Resume upload error:", error);

        if (status) {
            status.textContent = "❌ " + error.message;
            status.style.color = "#dc2626";
        }

    }
}


// Upload Job Pdf

async function uploadJobPDF() {

    const fileInput = document.getElementById("jobFile");
    const fileName = document.getElementById("jobFileName");

    if (
        !fileInput ||
        !fileInput.files ||
        fileInput.files.length === 0
    ) {
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.toLowerCase().endsWith(".pdf")) {

        if (fileName) {
            fileName.textContent = "Only PDF files are allowed.";
            fileName.style.color = "#dc2626";
        }

        fileInput.value = "";
        uploadedJobDescription = "";

        return;
    }

    if (fileName) {
        fileName.textContent = "Reading PDF...";
        fileName.style.color = "#68665f";
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

        console.log(
            "Reading job description PDF:",
            file.name
        );

        const response = await fetch(
            BACKEND_URL + "/upload-job-description",
            {
                method: "POST",
                body: formData
            }
        );

        const responseText =
            await response.text();

        let data;

        try {

            data = JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                "Backend returned an invalid response."
            );

        }

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to read the job description PDF."
            );
        }

        uploadedJobDescription =
            data.text || "";

        if (fileName) {

            fileName.textContent =
                "✓ " + (data.filename || file.name);

            fileName.style.color =
                "#16a34a";
        }

        console.log(
            "Job description PDF read successfully."
        );

    } catch (error) {

        console.warn(
            "Job PDF could not be read:",
            error.message
        );

        /*
         * IMPORTANT:
         * Do NOT delete the pasted job description.
         * The user can still analyze using pasted text.
         */

        uploadedJobDescription = "";

        if (fileName) {

            fileName.textContent =
                "⚠ PDF text could not be extracted";

            fileName.style.color =
                "#b45309";
        }

        /*
         * Only show a small warning if the user
         * has NOT pasted any job description.
         */

        const jobDescription =
            document.getElementById(
                "jobDescription"
            );

        const pastedText =
            jobDescription
                ? jobDescription.value.trim()
                : "";

        if (!pastedText) {

            alert(
                "This PDF appears to be scanned or image-based.\n\n" +
                "Please paste the job description text instead."
            );

        } else {

            // Pasted job description is available,
            // so continue without the PDF.
            console.log(
            "PDF could not be read. Using pasted job description instead."
        );

        }
    }
}


// ============================================================
// ANALYZE RESUME
// ============================================================

async function analyzeResume() {

    const jobDescription =
        document.getElementById("jobDescription");

    const status =
        document.getElementById("analyzeStatus");

    if (!status) {
        return;
    }

    status.textContent = "";

    if (!jobDescription) {

        status.textContent =
            "Job description field was not found.";

        status.style.color = "#dc2626";

        return;
    }

    const typedJobText =
        jobDescription.value.trim();

    // Combine:
    // 1. Pasted job description
    // 2. Uploaded PDF text

    const finalJobText = [
        typedJobText,
        uploadedJobDescription
    ]
        .filter(function (text) {
            return text && text.trim();
        })
        .join("\n\n");

    if (!finalJobText) {

        status.textContent =
            "Please enter or upload a job description.";

        status.style.color = "#dc2626";

        return;
    }

    if (!window.uploadedResumeData) {

        status.textContent =
            "Please upload your resume first.";

        status.style.color = "#dc2626";

        return;
    }

    status.textContent = "Analyzing resume...";
    status.style.color = "#2563eb";

    try {

        console.log("Starting resume analysis...");
        console.log(
            "Job description length:",
            finalJobText.length
        );

        const response = await fetch(
            BACKEND_URL + "/match",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: finalJobText
                })
            }
        );

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (error) {
            throw new Error(
                "Backend returned an invalid response."
            );
        }

        if (!response.ok) {

            throw new Error(
                data.detail || "Resume analysis failed."
            );
        }

        displayResults(data);

        status.textContent =
            "✓ Resume analyzed successfully.";

        status.style.color = "#16a34a";

    } catch (error) {

        console.error("Resume analysis error:", error);

        status.textContent =
            error.message || "Unable to analyze resume.";

        status.style.color = "#dc2626";
    }
}


// ============================================================
// DISPLAY MATCH RESULTS
// ============================================================

function displayResults(data) {

    const resultsSection =
        document.getElementById("resultsSection");

    const matchPercentage =
        document.getElementById("matchPercentage");

    const matchedSkills =
        document.getElementById("matchedSkills");

    const missingSkills =
        document.getElementById("missingSkills");

    if (!resultsSection) {
        return;
    }

    resultsSection.style.display = "block";

    // Match percentage

    if (matchPercentage) {

        const percentage =
            data.match_percentage || 0;

        matchPercentage.textContent =
            percentage + "%";
    }

    // Matched skills

    if (matchedSkills) {

        matchedSkills.innerHTML = "";

        if (
            data.matched_skills &&
            data.matched_skills.length > 0
        ) {

            data.matched_skills.forEach(function (skill) {

                const tag =
                    document.createElement("span");

                tag.className = "skill-tag";
                tag.textContent = skill;

                matchedSkills.appendChild(tag);

            });

        } else {

            matchedSkills.innerHTML =
                "<p>No matching skills found.</p>";
        }
    }

    // Missing skills

    if (missingSkills) {

        missingSkills.innerHTML = "";

        if (
            data.missing_skills &&
            data.missing_skills.length > 0
        ) {

            data.missing_skills.forEach(function (skill) {

                const tag =
                    document.createElement("span");

                tag.className =
                    "skill-tag missing-skill";

                tag.textContent = skill;

                missingSkills.appendChild(tag);

            });

        } else {

            missingSkills.innerHTML =
                "<p>No missing skills found.</p>";
        }
    }

    createSkillQuestions(
        data.missing_skills || []
    );

    resultsSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================================
// CREATE SKILL VERIFICATION QUESTIONS
// ============================================================

function createSkillQuestions(skills) {

    const container =
        document.getElementById("skillQuestions");

    const verificationSection =
        document.getElementById("verificationSection");

    const updateSection =
        document.getElementById("updateResumeSection");

    if (!container) {
        return;
    }

    verifiedSkills = [];

    container.innerHTML = "";

    if (updateSection) {
        updateSection.style.display = "none";
    }

    // No missing skills

    if (!skills || skills.length === 0) {

        if (verificationSection) {
            verificationSection.style.display = "none";
        }

        if (updateSection) {
            updateSection.style.display = "block";
        }

        return;
    }

    if (verificationSection) {
        verificationSection.style.display = "block";
    }

    skills.forEach(function (skill, index) {

        const question =
            document.createElement("div");

        question.className = "skill-question";

        question.dataset.index = index;
        question.dataset.status = "unanswered";

        question.innerHTML = `

            <div class="skill-question-header">

                <h3>
                    ${escapeHTML(skill)}
                </h3>

                <p>
                    Do you have this skill?
                </p>

            </div>

            <div class="skill-answer-buttons">

                <button
                    type="button"
                    class="skill-yes-button"
                    onclick="showSkillDetails(${index})"
                >
                    Yes
                </button>

                <button
                    type="button"
                    class="skill-no-button"
                    onclick="removeSkillQuestion(${index})"
                >
                    No
                </button>

            </div>

            <div
                class="skill-details"
                id="skillDetails-${index}"
                style="display: none;"
            >

                <label>
                    Where or how did you use
                    ${escapeHTML(skill)}?
                </label>

                <textarea
                    id="skillDescription-${index}"
                    rows="4"
                    placeholder="Example: I used Python in my AI Resume Matcher project to build the backend and process resume data."
                ></textarea>

                <button
                    type="button"
                    class="save-skill-button"
                    onclick="saveSkill(${index}, '${escapeJavaScriptString(skill)}')"
                >
                    Save Skill
                </button>

            </div>

        `;

        container.appendChild(question);

    });

    checkVerificationComplete();
}


// ============================================================
// SHOW SKILL DETAILS
// ============================================================

function showSkillDetails(index) {

    const questions =
        document.querySelectorAll(".skill-question");

    const question = questions[index];

    if (!question) {
        return;
    }

    const details =
        document.getElementById(
            "skillDetails-" + index
        );

    if (!details) {
        return;
    }

    question.dataset.status = "waiting";

    question.style.borderColor = "#2563eb";

    details.style.display = "block";

    const textarea =
        document.getElementById(
            "skillDescription-" + index
        );

    if (textarea) {

        setTimeout(function () {
            textarea.focus();
        }, 100);

    }

    checkVerificationComplete();
}


// ============================================================
// REMOVE SKILL QUESTION
// USER DOES NOT HAVE THE SKILL
// ============================================================

function removeSkillQuestion(index) {

    const questions =
        document.querySelectorAll(".skill-question");

    const question = questions[index];

    if (!question) {
        return;
    }

    question.dataset.status = "no";

    question.style.borderColor = "#94a3b8";

    const details =
        document.getElementById(
            "skillDetails-" + index
        );

    if (details) {
        details.style.display = "none";
    }

    const buttons =
        question.querySelectorAll(
            ".skill-answer-buttons button"
        );

    buttons.forEach(function (button) {

        button.disabled = true;
        button.style.opacity = "0.6";

    });

    let message =
        question.querySelector(
            ".skill-answer-status"
        );

    if (!message) {

        message =
            document.createElement("p");

        message.className =
            "skill-answer-status";

        question.appendChild(message);
    }

    message.textContent =
        "✓ Marked as not currently having this skill.";

    message.style.color = "#64748b";

    checkVerificationComplete();
}


// ============================================================
// SAVE VERIFIED SKILL
// ============================================================

function saveSkill(index, skill) {

    const description =
        document.getElementById(
            "skillDescription-" + index
        );

    if (!description) {
        return;
    }

    const text =
        description.value.trim();

    if (!text) {

        alert(
            "Please describe where you used this skill before saving it."
        );

        description.focus();

        return;
    }

    const questions =
        document.querySelectorAll(".skill-question");

    const question = questions[index];

    if (!question) {
        return;
    }

    const alreadySaved =
        verifiedSkills.some(function (item) {

            return item.index === index;

        });

    if (alreadySaved) {
        return;
    }

    verifiedSkills.push({

        index: index,
        skill: skill,
        description: text

    });

    question.dataset.status = "yes-saved";

    question.style.borderColor = "#22c55e";

    const buttons =
        question.querySelectorAll(
            ".skill-answer-buttons button"
        );

    buttons.forEach(function (button) {

        button.disabled = true;
        button.style.opacity = "0.6";

    });

    description.disabled = true;

    const saveButton =
        question.querySelector(
            ".save-skill-button"
        );

    if (saveButton) {

        saveButton.disabled = true;
        saveButton.textContent = "✓ Skill Saved";

    }

    let message =
        question.querySelector(
            ".skill-answer-status"
        );

    if (!message) {

        message =
            document.createElement("p");

        message.className =
            "skill-answer-status";

        question.appendChild(message);
    }

    message.textContent =
        "✓ Skill verified and saved.";

    message.style.color = "#16a34a";

    checkVerificationComplete();
}


// ============================================================
// CHECK WHETHER ALL SKILLS ARE ANSWERED
// ============================================================

function checkVerificationComplete() {

    const updateSection =
        document.getElementById(
            "updateResumeSection"
        );

    if (!updateSection) {
        return;
    }

    const questions =
        Array.from(
            document.querySelectorAll(
                ".skill-question"
            )
        );

    if (questions.length === 0) {

        updateSection.style.display = "block";

        return;
    }

    const allAnswered =
        questions.every(function (question) {

            return (
                question.dataset.status === "no" ||
                question.dataset.status === "yes-saved"
            );

        });

    if (allAnswered) {

        updateSection.style.display = "block";

    } else {

        updateSection.style.display = "none";

    }
}


// ============================================================
// CONTINUE TO RESUME EDITOR
// ============================================================

function continueToResumeEditor() {

    const questions =
        Array.from(
            document.querySelectorAll(
                ".skill-question"
            )
        );

    const allAnswered =
        questions.every(function (question) {

            return (
                question.dataset.status === "no" ||
                question.dataset.status === "yes-saved"
            );

        });

    if (!allAnswered) {

        alert(
            "Please answer every missing skill before continuing."
        );

        return;
    }

    localStorage.setItem(
        "verifiedSkills",
        JSON.stringify(verifiedSkills)
    );

    console.log(
        "Verified skills saved:",
        verifiedSkills
    );

    window.location.href = "build.html";
}


// ============================================================
// LOAD VERIFIED SKILLS INTO RESUME BUILDER
// ============================================================

function loadVerifiedSkillsIntoBuilder() {

    const stored =
        localStorage.getItem("verifiedSkills");

    if (!stored) {
        return;
    }

    try {

        const skills =
            JSON.parse(stored);

        if (
            !Array.isArray(skills) ||
            skills.length === 0
        ) {
            return;
        }

        const skillsInput =
            document.getElementById(
                "builderSkills"
            );

        if (!skillsInput) {
            return;
        }

        const verifiedSkillNames =
            skills
                .map(function (item) {
                    return item.skill;
                })
                .filter(function (skill) {
                    return skill && skill.trim();
                });

        if (verifiedSkillNames.length === 0) {
            return;
        }

        const existingSkills =
            skillsInput.value.trim();

        const combinedSkills = [];

        if (existingSkills) {
            combinedSkills.push(existingSkills);
        }

        combinedSkills.push(
            verifiedSkillNames.join(", ")
        );

        skillsInput.value =
            combinedSkills.join(", ");

        console.log(
            "Verified skills transferred to builder:",
            verifiedSkillNames
        );

    } catch (error) {

        console.error(
            "Unable to load verified skills:",
            error
        );

    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// ESCAPE STRING FOR INLINE JAVASCRIPT
// ============================================================

function escapeJavaScriptString(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, "\\n");

}


// ============================================================
// END OF SCRIPT
// ============================================================