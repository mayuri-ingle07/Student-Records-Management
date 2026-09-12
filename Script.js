const API_URL = "http://127.0.0.1:8000";

let students = [];


/* ================= LOAD STUDENTS ================= */

async function loadStudents() {

    try {

        const response = await fetch(`${API_URL}/students`);

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        students = await response.json();

        displayStudents(students);
        updateDashboard();

    } catch (error) {

        console.error(error);

        document.getElementById("studentTable").innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Unable to connect to backend
                </td>
            </tr>
        `;

        showMessage("Backend connection failed", "error");
    }
}


/* ================= DISPLAY STUDENTS ================= */

function displayStudents(data) {

    const table = document.getElementById("studentTable");

    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No students found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = "";

    data.forEach(student => {

        const passed = Number(student.marks) >= 40;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>#${student.id}</strong></td>

            <td>
                <strong>${escapeHTML(student.name)}</strong>
            </td>

            <td>
                ${escapeHTML(student.course)}
            </td>

            <td>
                <strong>${student.marks}</strong>/100
            </td>

            <td>
                <span class="status-badge ${passed ? "passed" : "failed"}">
                    ${passed ? "Passed" : "Failed"}
                </span>
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button
                    class="small-delete"
                    onclick="deleteStudentById(${student.id})">
                    Delete
                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const total = students.length;

    const passed = students.filter(
        student => Number(student.marks) >= 40
    ).length;

    const totalMarks = students.reduce(
        (sum, student) => sum + Number(student.marks || 0),
        0
    );

    const average = total > 0
        ? totalMarks / total
        : 0;

    const courses = new Set(
        students.map(student => student.course)
    );

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("passedStudents").textContent = passed;

    document.getElementById("averageMarks").textContent =
        average.toFixed(1);

    document.getElementById("totalCourses").textContent =
        courses.size;
}


/* ================= ADD STUDENT ================= */

document.getElementById("addForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("addName").value.trim();

        const course =
            document.getElementById("addCourse").value.trim();

        const marks =
            Number(document.getElementById("addMarks").value);


        if (!name || !course) {

            showMessage(
                "Please fill all fields",
                "error"
            );

            return;
        }


        if (isNaN(marks) || marks < 0 || marks > 100) {

            showMessage(
                "Marks must be between 0 and 100",
                "error"
            );

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/students`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        course: course,
                        marks: marks
                    })
                }
            );


            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail || "Failed to add student"
                );
            }


            showMessage(
                "Student added successfully",
                "success"
            );


            document.getElementById("addForm").reset();

            await loadStudents();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message,
                "error"
            );
        }
    }
);


/* ================= UPDATE STUDENT ================= */

document.getElementById("updateForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            document.getElementById("updateId").value.trim();

        const name =
            document.getElementById("updateName").value.trim();

        const course =
            document.getElementById("updateCourse").value.trim();

        const marks =
            Number(document.getElementById("updateMarks").value);


        if (!id || !name || !course) {

            showMessage(
                "Please fill all fields",
                "error"
            );

            return;
        }


        if (isNaN(marks) || marks < 0 || marks > 100) {

            showMessage(
                "Marks must be between 0 and 100",
                "error"
            );

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/students/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        course: course,
                        marks: marks
                    })
                }
            );


            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail || "Update failed"
                );
            }


            showMessage(
                "Student updated successfully",
                "success"
            );


            document.getElementById("updateForm").reset();

            await loadStudents();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message,
                "error"
            );
        }
    }
);


/* ================= EDIT BUTTON ================= */

function editStudent(id) {

    const student = students.find(
        student => Number(student.id) === Number(id)
    );


    if (!student) {

        showMessage(
            "Student not found",
            "error"
        );

        return;
    }


    document.getElementById("updateId").value =
        student.id;

    document.getElementById("updateName").value =
        student.name;

    document.getElementById("updateCourse").value =
        student.course;

    document.getElementById("updateMarks").value =
        student.marks;


    document.getElementById("updateStudent")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* ================= DELETE FROM TABLE ================= */

async function deleteStudentById(id) {

    const confirmDelete = confirm(
        `Are you sure you want to delete student ID ${id}?`
    );


    if (!confirmDelete) {
        return;
    }


    await performDelete(id);
}


/* ================= DELETE FORM ================= */

async function deleteStudent() {

    const id =
        document.getElementById("deleteId").value.trim();


    if (!id) {

        showMessage(
            "Please enter Student ID",
            "error"
        );

        return;
    }


    const confirmDelete = confirm(
        `Are you sure you want to delete student ID ${id}?`
    );


    if (!confirmDelete) {
        return;
    }


    await performDelete(id);
}


/* ================= DELETE API ================= */

async function performDelete(id) {

    try {

        const response = await fetch(
            `${API_URL}/students/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail || "Delete failed"
            );
        }


        showMessage(
            "Student deleted successfully",
            "success"
        );


        document.getElementById("deleteId").value = "";

        await loadStudents();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );
    }
}


/* ================= SEARCH ================= */

function searchStudents() {

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const filtered = students.filter(student =>

        String(student.id)
            .toLowerCase()
            .includes(search)

        ||

        student.name
            .toLowerCase()
            .includes(search)

        ||

        student.course
            .toLowerCase()
            .includes(search)

    );


    displayStudents(filtered);
}


/* ================= MESSAGE ================= */

function showMessage(text, type) {

    const message =
        document.getElementById("message");


    message.textContent = text;

    message.className =
        `message ${type}`;


    setTimeout(() => {

        message.className = "message";

    }, 3000);
}


/* ================= SECURITY ================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    loadStudents
);
