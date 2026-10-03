// ==========================================
// RESUME BUILDER WIZARD
// ==========================================

let currentStep = 1;


// ==========================================
// GO TO NEXT STEP
// ==========================================

function nextStep(step) {

    if (step === 1) {

        const name =
            document.getElementById("builderName").value.trim();

        const email =
            document.getElementById("builderEmail").value.trim();

        if (!name || !email) {

            alert("Please enter your name and email.");

            return;

        }

    }


    showStep(step + 1);

}


// ==========================================
// GO TO PREVIOUS STEP
// ==========================================

function previousStep(step) {

    showStep(step - 1);

}


// ==========================================
// SHOW STEP
// ==========================================

function showStep(step) {

    document
        .querySelectorAll(".builder-step")
        .forEach(function(section) {

            section.classList.remove("active-step");

        });


    const selectedStep =
        document.getElementById("step" + step);


    if (selectedStep) {

        selectedStep.classList.add("active-step");

    }


    currentStep = step;


    updateProgress(step);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (step === 6) {

        generateFinalResume();

    }

}


// ==========================================
// UPDATE PROGRESS
// ==========================================

function updateProgress(step) {

    for (let i = 1; i <= 6; i++) {

        const progress =
            document.getElementById("progress" + i);


        if (!progress) continue;


        progress.classList.remove("active");


        if (i <= step) {

            progress.classList.add("active");

        }

    }

}


// ==========================================
// SKIP STEP
// ==========================================

function skipStep(step) {

    showStep(step + 1);

}


// ==========================================
// SKIP EDUCATION
// ==========================================

function skipEducation(type) {

    const section =
        document.getElementById(
            type + "Section"
        );


    if (section) {

        section.classList.add(
            "education-skipped"
        );

    }

}


// ==========================================
// ADD PROJECT
// ==========================================

function addBuilderProject() {

    const container =
        document.getElementById(
            "projectBuilderContainer"
        );


    const project =
        document.createElement("div");


    project.className =
        "project-builder-item";


    project.innerHTML = `

        <div class="form-group">

            <label>
                Project Name
            </label>

            <input
                type="text"
                class="builder-project-name"
                placeholder="Project Name"
            >

        </div>


        <div class="form-group">

            <label>
                Technologies Used
            </label>

            <input
                type="text"
                class="builder-project-tech"
                placeholder="Python, JavaScript, SQL"
            >

        </div>


        <div class="form-group">

            <label>
                Project Link
            </label>

            <input
                type="text"
                class="builder-project-link"
                placeholder="GitHub / Live project URL"
            >

        </div>


        <div class="form-group">

            <label>
                Description
            </label>

            <textarea
                class="builder-project-description"
                rows="4"
                placeholder="Describe your project."
            ></textarea>

        </div>

    `;


    container.appendChild(project);

}


// ==========================================
// ADD EXPERIENCE
// ==========================================

function addBuilderExperience() {

    const container =
        document.getElementById(
            "experienceBuilderContainer"
        );


    const experience =
        document.createElement("div");


    experience.className =
        "experience-builder-item";


    experience.innerHTML = `

        <div class="form-grid">

            <div class="form-group">

                <label>
                    Job Title
                </label>

                <input
                    type="text"
                    class="builder-job-title"
                    placeholder="Job Title"
                >

            </div>


            <div class="form-group">

                <label>
                    Company
                </label>

                <input
                    type="text"
                    class="builder-company"
                    placeholder="Company Name"
                >

            </div>


            <div class="form-group">

                <label>
                    Start Date
                </label>

                <input
                    type="text"
                    class="builder-experience-start"
                    placeholder="June 2026"
                >

            </div>


            <div class="form-group">

                <label>
                    End Date
                </label>

                <input
                    type="text"
                    class="builder-experience-end"
                    placeholder="August 2026"
                >

            </div>

        </div>


        <div class="form-group">

            <label>
                Responsibilities / Achievements
            </label>

            <textarea
                class="builder-experience-description"
                rows="5"
                placeholder="Describe your responsibilities."
            ></textarea>

        </div>

    `;


    container.appendChild(experience);

}


// ==========================================
// GENERATE FINAL RESUME
// ==========================================

function generateFinalResume() {

    const preview =
        document.getElementById(
            "finalResumePreview"
        );


    if (!preview) return;


    const name =
        getBuilderValue("builderName");


    const email =
        getBuilderValue("builderEmail");


    const phone =
        getBuilderValue("builderPhone");


    const location =
        getBuilderValue("builderLocation");


    const linkedin =
        getBuilderValue("builderLinkedin");


    const github =
        getBuilderValue("builderGithub");


    const portfolio =
        getBuilderValue("builderPortfolio");


    const skills =
        getBuilderValue("builderSkills");


    const achievements =
        getBuilderValue("builderAchievements");


    const certifications =
        getBuilderValue("builderCertifications");


    let html = `

        <div class="final-resume">

            <div class="final-resume-header">

                <h1>
                    ${escapeBuilderHTML(
                        name || "Your Name"
                    )}
                </h1>

                <p>

                    ${escapeBuilderHTML(email)}

                    ${email && phone ? " | " : ""}

                    ${escapeBuilderHTML(phone)}

                    ${
                        (email || phone) &&
                        location
                        ? " | "
                        : ""
                    }

                    ${escapeBuilderHTML(location)}

                </p>


                <p>

                    ${escapeBuilderHTML(linkedin)}

                    ${
                        linkedin && github
                        ? " | "
                        : ""
                    }

                    ${escapeBuilderHTML(github)}

                    ${
                        (linkedin || github) &&
                        portfolio
                        ? " | "
                        : ""
                    }

                    ${escapeBuilderHTML(portfolio)}

                </p>

            </div>

    `;


    // EDUCATION

    html += generateEducationHTML();


    // SKILLS

    if (skills) {

        html += `

            <div class="final-resume-section">

                <h2>
                    Skills
                </h2>

                <p>
                    ${escapeBuilderHTML(skills)}
                </p>

            </div>

        `;

    }


    // PROJECTS

    html += generateProjectsHTML();


    // EXPERIENCE

    html += generateExperienceHTML();


    // ACHIEVEMENTS

    if (achievements) {

        html += `

            <div class="final-resume-section">

                <h2>
                    Achievements
                </h2>

                <p>
                    ${escapeBuilderHTML(
                        achievements
                    )}
                </p>

            </div>

        `;

    }


    // CERTIFICATIONS

    if (certifications) {

        html += `

            <div class="final-resume-section">

                <h2>
                    Certifications
                </h2>

                <p>
                    ${escapeBuilderHTML(
                        certifications
                    )}
                </p>

            </div>

        `;

    }


    html += `
        </div>
    `;


    preview.innerHTML = html;

}


// ==========================================
// EDUCATION HTML
// ==========================================

function generateEducationHTML() {

    let html = "";


    const class10School =
        getBuilderValue("class10School");

    const class10Board =
        getBuilderValue("class10Board");

    const class10Year =
        getBuilderValue("class10Year");

    const class10Score =
        getBuilderValue("class10Score");


    const class12School =
        getBuilderValue("class12School");

    const class12Board =
        getBuilderValue("class12Board");

    const class12Year =
        getBuilderValue("class12Year");

    const class12Score =
        getBuilderValue("class12Score");


    const bachelorDegree =
        getBuilderValue("bachelorDegree");

    const bachelorCollege =
        getBuilderValue("bachelorCollege");

    const bachelorStart =
        getBuilderValue("bachelorStart");

    const bachelorEnd =
        getBuilderValue("bachelorEnd");

    const bachelorScore =
        getBuilderValue("bachelorScore");


    const masterDegree =
        getBuilderValue("masterDegree");

    const masterCollege =
        getBuilderValue("masterCollege");

    const masterStart =
        getBuilderValue("masterStart");

    const masterEnd =
        getBuilderValue("masterEnd");

    const masterScore =
        getBuilderValue("masterScore");


    const phdField =
        getBuilderValue("phdField");

    const phdCollege =
        getBuilderValue("phdCollege");

    const phdStart =
        getBuilderValue("phdStart");

    const phdEnd =
        getBuilderValue("phdEnd");


    if (
        class10School ||
        class12School ||
        bachelorDegree ||
        masterDegree ||
        phdField
    ) {

        html += `

            <div class="final-resume-section">

                <h2>
                    Education
                </h2>

        `;


        if (bachelorDegree || bachelorCollege) {

            html += `

                <div class="final-education-item">

                    <strong>
                        ${escapeBuilderHTML(
                            bachelorDegree
                        )}
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            bachelorCollege
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            bachelorStart
                        )}

                        ${
                            bachelorStart &&
                            bachelorEnd
                            ? " - "
                            : ""
                        }

                        ${escapeBuilderHTML(
                            bachelorEnd
                        )}

                        ${
                            bachelorScore
                            ? " | " +
                              escapeBuilderHTML(
                                  bachelorScore
                              )
                            : ""
                        }

                    </small>

                </div>

            `;

        }


        if (masterDegree || masterCollege) {

            html += `

                <div class="final-education-item">

                    <strong>
                        ${escapeBuilderHTML(
                            masterDegree
                        )}
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            masterCollege
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            masterStart
                        )}

                        ${
                            masterStart &&
                            masterEnd
                            ? " - "
                            : ""
                        }

                        ${escapeBuilderHTML(
                            masterEnd
                        )}

                        ${
                            masterScore
                            ? " | " +
                              escapeBuilderHTML(
                                  masterScore
                              )
                            : ""
                        }

                    </small>

                </div>

            `;

        }


        if (phdField || phdCollege) {

            html += `

                <div class="final-education-item">

                    <strong>
                        PhD - ${escapeBuilderHTML(
                            phdField
                        )}
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            phdCollege
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            phdStart
                        )}

                        ${
                            phdStart &&
                            phdEnd
                            ? " - "
                            : ""
                        }

                        ${escapeBuilderHTML(
                            phdEnd
                        )}

                    </small>

                </div>

            `;

        }


        if (class12School) {

            html += `

                <div class="final-education-item">

                    <strong>
                        Class 12th
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            class12School
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            class12Board
                        )}

                        ${
                            class12Year
                            ? " | " +
                              escapeBuilderHTML(
                                  class12Year
                              )
                            : ""
                        }

                        ${
                            class12Score
                            ? " | " +
                              escapeBuilderHTML(
                                  class12Score
                              )
                            : ""
                        }

                    </small>

                </div>

            `;

        }


        if (class10School) {

            html += `

                <div class="final-education-item">

                    <strong>
                        Class 10th
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            class10School
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            class10Board
                        )}

                        ${
                            class10Year
                            ? " | " +
                              escapeBuilderHTML(
                                  class10Year
                              )
                            : ""
                        }

                        ${
                            class10Score
                            ? " | " +
                              escapeBuilderHTML(
                                  class10Score
                              )
                            : ""
                        }

                    </small>

                </div>

            `;

        }


        html += `</div>`;

    }


    return html;

}


// ==========================================
// PROJECT HTML
// ==========================================

function generateProjectsHTML() {

    const projects =
        document.querySelectorAll(
            ".project-builder-item"
        );


    let html = "";


    let projectHTML = "";


    projects.forEach(function(project) {

        const name =
            project
            .querySelector(
                ".builder-project-name"
            )
            .value.trim();


        const tech =
            project
            .querySelector(
                ".builder-project-tech"
            )
            .value.trim();


        const link =
            project
            .querySelector(
                ".builder-project-link"
            )
            .value.trim();


        const description =
            project
            .querySelector(
                ".builder-project-description"
            )
            .value.trim();


        if (
            name ||
            tech ||
            description
        ) {

            projectHTML += `

                <div class="final-project-item">

                    <strong>
                        ${escapeBuilderHTML(
                            name
                        )}
                    </strong>

                    ${
                        tech
                        ? `
                            <small>
                                ${escapeBuilderHTML(
                                    tech
                                )}
                            </small>
                        `
                        : ""
                    }

                    ${
                        description
                        ? `
                            <p>
                                ${escapeBuilderHTML(
                                    description
                                )}
                            </p>
                        `
                        : ""
                    }

                    ${
                        link
                        ? `
                            <small>
                                ${escapeBuilderHTML(
                                    link
                                )}
                            </small>
                        `
                        : ""
                    }

                </div>

            `;

        }

    });


    if (projectHTML) {

        html = `

            <div class="final-resume-section">

                <h2>
                    Projects
                </h2>

                ${projectHTML}

            </div>

        `;

    }


    return html;

}


// ==========================================
// EXPERIENCE HTML
// ==========================================

function generateExperienceHTML() {

    const experiences =
        document.querySelectorAll(
            ".experience-builder-item"
        );


    let experienceHTML = "";


    experiences.forEach(function(experience) {

        const title =
            experience
            .querySelector(
                ".builder-job-title"
            )
            .value.trim();


        const company =
            experience
            .querySelector(
                ".builder-company"
            )
            .value.trim();


        const start =
            experience
            .querySelector(
                ".builder-experience-start"
            )
            .value.trim();


        const end =
            experience
            .querySelector(
                ".builder-experience-end"
            )
            .value.trim();


        const description =
            experience
            .querySelector(
                ".builder-experience-description"
            )
            .value.trim();


        if (
            title ||
            company ||
            description
        ) {

            experienceHTML += `

                <div class="final-experience-item">

                    <strong>
                        ${escapeBuilderHTML(
                            title
                        )}
                    </strong>

                    <span>
                        ${escapeBuilderHTML(
                            company
                        )}
                    </span>

                    <small>

                        ${escapeBuilderHTML(
                            start
                        )}

                        ${
                            start && end
                            ? " - "
                            : ""
                        }

                        ${escapeBuilderHTML(
                            end
                        )}

                    </small>

                    ${
                        description
                        ? `
                            <p>
                                ${escapeBuilderHTML(
                                    description
                                )}
                            </p>
                        `
                        : ""
                    }

                </div>

            `;

        }

    });


    if (!experienceHTML) {

        return "";

    }


    return `

        <div class="final-resume-section">

            <h2>
                Experience
            </h2>

            ${experienceHTML}

        </div>

    `;

}


// ==========================================
// GET VALUE
// ==========================================

function getBuilderValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return element.value.trim();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeBuilderHTML(value) {

    if (!value) {

        return "";

    }


    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// DOWNLOAD
// ==========================================

function downloadResume() {

    alert(
        "PDF download will be added in the next step."
    );

}