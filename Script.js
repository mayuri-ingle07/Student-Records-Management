// =====================================================
// EDUMANAGE - STUDENT MANAGEMENT SYSTEM
// =====================================================

const API_URL = "http://127.0.0.1:8000";

let students = [];
let studentToDelete = null;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Frontend loaded");

    // Load students from backend
    getStudents();

    // Add Student Form
    const addForm = document.getElementById("addStudentForm");

    if (addForm) {
        addForm.addEventListener("submit", addStudent);
    }

    // Update Student Form
    const updateForm = document.getElementById("updateStudentForm");

    if (updateForm) {
        updateForm.addEventListener("submit", updateStudent);
    }

    // Delete Student Form
    const deleteForm = document.getElementById("deleteStudentForm");

    if (deleteForm) {
        deleteForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const id = document.getElementById("deleteId").value;

            if (!id) {
                showToast(
                    "Missing ID",
                    "Please enter Student ID.",
                    "error"
                );
                return;
            }

            openDeleteModal(Number(id));
        });
    }

});


// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId, clickedButton = null) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.remove("active");
    });

    if (clickedButton) {
        clickedButton.classList.add("active");
    }

    const titles = {
        home: "Dashboard",
        students: "Student Records",
        add: "Add Student",
        update: "Update Student",
        delete: "Delete Student"
    };

    const title = titles[sectionId] || "Dashboard";

    const pageTitle = document.getElementById("pageTitle");
    const breadcrumb = document.getElementById("breadcrumbText");

    if (pageTitle) {
        pageTitle.textContent = title;
    }

    if (breadcrumb) {
        breadcrumb.textContent = title;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// GET STUDENTS
// =====================================================

async function getStudents() {

    console.log("Getting students from:", `${API_URL}/students`);

    try {

        const response = await fetch(`${API_URL}/students`);

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Backend data:", data);

        if (!Array.isArray(data)) {
            throw new Error("Backend did not return student array");
        }

        students = data;

        // Sort latest ID first
        students.sort((a, b) => Number(b.id) - Number(a.id));

        displayStudents(students);
        displayRecentStudents();
        updateStatistics();

        console.log("Students loaded successfully:", students.length);

    } catch (error) {

        console.error("GET STUDENTS ERROR:", error);

        students = [];

        displayStudents([]);
        displayRecentStudents();
        updateStatistics();

        showToast(
            "Connection Error",
            "Unable to connect to FastAPI backend.",
            "error"
        );
    }
}


// =====================================================
// DISPLAY ALL STUDENTS
// =====================================================

function displayStudents(data) {

    const table = document.getElementById("studentList");

    const recordCount = document.getElementById("recordCount");

    if (!table) {
        console.error("studentList not found in HTML");
        return;
    }

    if (recordCount) {
        recordCount.textContent = data.length;
    }

    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No student records found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = "";

    data.forEach(student => {

        const id = student.id;

        const name = student.name || "Unknown";

        const course = student.course || "-";

        const marks = Number(student.marks) || 0;

        const passed = marks >= 40;

        const firstLetter =
            name.charAt(0).toUpperCase();

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>#${id}</strong>
            </td>

            <td>
                <div class="student-cell">

                    <div class="student-avatar">
                        ${escapeHTML(firstLetter)}
                    </div>

                    <div>
                        <div class="student-name">
                            ${escapeHTML(name)}
                        </div>

                        <div class="student-id">
                            Student ID: ${id}
                        </div>
                    </div>

                </div>
            </td>

            <td>
                ${escapeHTML(course)}
            </td>

            <td>
                <strong>${marks}</strong> / 100
            </td>

            <td>
                <span class="status ${passed ? "pass" : "fail"}">
                    ${passed ? "Passed" : "Failed"}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        class="action-btn edit-action"
                        title="Update"
                        onclick="prepareUpdate(${id})"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="action-btn delete-action"
                        title="Delete"
                        onclick="openDeleteModal(${id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


// =====================================================
// RECENT STUDENTS
// =====================================================

function displayRecentStudents() {

    const table =
        document.getElementById("recentStudentList");

    if (!table) {
        console.error("recentStudentList not found in HTML");
        return;
    }

    if (!students || students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No student records available.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = "";

    // Latest 5 students
    const recentStudents = students.slice(0, 5);

    recentStudents.forEach(student => {

        const id = student.id;

        const name = student.name || "Unknown";

        const course = student.course || "-";

        const marks = Number(student.marks) || 0;

        const passed = marks >= 40;

        const firstLetter =
            name.charAt(0).toUpperCase();

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                #${id}
            </td>

            <td>
                <div class="student-cell">

                    <div class="student-avatar">
                        ${escapeHTML(firstLetter)}
                    </div>

                    <div>
                        <div class="student-name">
                            ${escapeHTML(name)}
                        </div>
                    </div>

                </div>
            </td>

            <td>
                ${escapeHTML(course)}
            </td>

            <td>
                <strong>${marks}</strong> / 100
            </td>

            <td>
                <span class="status ${passed ? "pass" : "fail"}">
                    ${passed ? "Passed" : "Failed"}
                </span>
            </td>
        `;

        table.appendChild(row);
    });
}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    const total = students.length;

    const passed = students.filter(student => {
        return Number(student.marks) >= 40;
    }).length;

    let totalMarks = 0;

    students.forEach(student => {
        totalMarks += Number(student.marks) || 0;
    });

    const average =
        total > 0
            ? totalMarks / total
            : 0;

    const courses = new Set(
        students.map(student => student.course)
    );

    const totalStudents =
        document.getElementById("totalStudents");

    const passedStudents =
        document.getElementById("passedStudents");

    const averageMarks =
        document.getElementById("averageMarks");

    const totalCourses =
        document.getElementById("totalCourses");

    const heroTotal =
        document.getElementById("heroTotal");

    const heroAverage =
        document.getElementById("heroAverage");

    if (totalStudents)
        totalStudents.textContent = total;

    if (passedStudents)
        passedStudents.textContent = passed;

    if (averageMarks)
        averageMarks.textContent = average.toFixed(1);

    if (totalCourses)
        totalCourses.textContent = courses.size;

    if (heroTotal)
        heroTotal.textContent = total;

    if (heroAverage)
        heroAverage.textContent = average.toFixed(1);
}


// =====================================================
// ADD STUDENT
// =====================================================

async function addStudent(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const course =
        document.getElementById("course").value.trim();

    const marks =
        Number(document.getElementById("marks").value);

    if (!name || !course) {

        showToast(
            "Invalid Input",
            "Please fill all required fields.",
            "error"
        );

        return;
    }

    if (marks < 0 || marks > 100 || isNaN(marks)) {

        showToast(
            "Invalid Marks",
            "Marks must be between 0 and 100.",
            "error"
        );

        return;
    }

    const studentData = {
        name: name,
        course: course,
        marks: marks
    };

    console.log("Adding student:", studentData);

    try {

        const response =
            await fetch(`${API_URL}/students`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(studentData)
            });

        const result = await response.json();

        console.log("ADD response:", result);

        if (!response.ok) {
            throw new Error(
                result.detail ||
                result.error ||
                "Add student failed"
            );
        }

        document
            .getElementById("addStudentForm")
            .reset();

        showToast(
            "Student Added",
            "Student record created successfully.",
            "success"
        );

        await getStudents();

        setTimeout(() => {
            showSection("students");
        }, 500);

    } catch (error) {

        console.error("ADD ERROR:", error);

        showToast(
            "Add Failed",
            error.message,
            "error"
        );
    }
}


// =====================================================
// CLEAR ADD FORM
// =====================================================

function clearAddForm() {

    const form =
        document.getElementById("addStudentForm");

    if (form) {
        form.reset();
    }
}


// =====================================================
// PREPARE UPDATE
// =====================================================

function prepareUpdate(id) {

    const student =
        students.find(
            s => Number(s.id) === Number(id)
        );

    if (!student) {

        showToast(
            "Student Not Found",
            "The selected student does not exist.",
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

    showSection("update");
}


// =====================================================
// UPDATE STUDENT
// =====================================================

async function updateStudent(event) {

    event.preventDefault();

    const id =
        document.getElementById("updateId").value;

    const name =
        document.getElementById("updateName").value.trim();

    const course =
        document.getElementById("updateCourse").value.trim();

    const marks =
        Number(document.getElementById("updateMarks").value);

    if (!id) {

        showToast(
            "Missing ID",
            "Student ID is required.",
            "error"
        );

        return;
    }

    if (!name || !course) {

        showToast(
            "Invalid Input",
            "Please fill all fields.",
            "error"
        );

        return;
    }

    if (marks < 0 || marks > 100 || isNaN(marks)) {

        showToast(
            "Invalid Marks",
            "Marks must be between 0 and 100.",
            "error"
        );

        return;
    }

    const studentData = {
        name: name,
        course: course,
        marks: marks
    };

    console.log("Updating:", id, studentData);

    try {

        const response =
            await fetch(
                `${API_URL}/students/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(studentData)
                }
            );

        const result = await response.json();

        console.log("UPDATE response:", result);

        if (!response.ok) {

            throw new Error(
                result.detail ||
                result.error ||
                "Update failed"
            );
        }

        document
            .getElementById("updateStudentForm")
            .reset();

        showToast(
            "Student Updated",
            "Student record updated successfully.",
            "success"
        );

        await getStudents();

        setTimeout(() => {
            showSection("students");
        }, 500);

    } catch (error) {

        console.error("UPDATE ERROR:", error);

        showToast(
            "Update Failed",
            error.message,
            "error"
        );
    }
}


// =====================================================
// OPEN DELETE MODAL
// =====================================================

function openDeleteModal(id) {

    studentToDelete = Number(id);

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.add("show");
    }
}


// =====================================================
// CLOSE DELETE MODAL
// =====================================================

function closeDeleteModal() {

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.remove("show");
    }

    studentToDelete = null;
}


// =====================================================
// CONFIRM DELETE
// =====================================================

async function confirmDelete() {

    if (!studentToDelete) {
        return;
    }

    console.log(
        "Deleting student:",
        studentToDelete
    );

    try {

        const response =
            await fetch(
                `${API_URL}/students/${studentToDelete}`,
                {
                    method: "DELETE"
                }
            );

        const result = await response.json();

        console.log("DELETE response:", result);

        if (!response.ok) {

            throw new Error(
                result.detail ||
                result.error ||
                "Delete failed"
            );
        }

        closeDeleteModal();

        showToast(
            "Student Deleted",
            "Student record removed successfully.",
            "success"
        );

        await getStudents();

    } catch (error) {

        console.error("DELETE ERROR:", error);

        closeDeleteModal();

        showToast(
            "Delete Failed",
            error.message,
            "error"
        );
    }
}


// =====================================================
// SEARCH STUDENTS
// =====================================================

function searchStudents() {

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }

    const search =
        input.value.toLowerCase().trim();

    const filtered =
        students.filter(student => {

            const id =
                String(student.id || "")
                    .toLowerCase();

            const name =
                String(student.name || "")
                    .toLowerCase();

            const course =
                String(student.course || "")
                    .toLowerCase();

            return (
                id.includes(search) ||
                name.includes(search) ||
                course.includes(search)
            );
        });

    displayStudents(filtered);
}


// =====================================================
// TOAST
// =====================================================

function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        document.getElementById("messageBox");

    if (!toast) {
        alert(`${title}: ${message}`);
        return;
    }

    const icon =
        toast.querySelector(".toast-icon i");

    const toastTitle =
        document.getElementById("toastTitle");

    const toastMessage =
        document.getElementById("toastMessage");

    if (toastTitle) {
        toastTitle.textContent = title;
    }

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    if (icon) {

        if (type === "error") {

            icon.className =
                "fa-solid fa-circle-exclamation";

        } else {

            icon.className =
                "fa-solid fa-check";
        }
    }

    toast.classList.add("show");

    setTimeout(() => {
        hideToast();
    }, 3500);
}


// =====================================================
// HIDE TOAST
// =====================================================

function hideToast() {

    const toast =
        document.getElementById("messageBox");

    if (toast) {
        toast.classList.remove("show");
    }
}


// =====================================================
// HTML SAFETY
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
