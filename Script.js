const API_URL = "http://127.0.0.1:8000";


// ================= MESSAGE =================

function showMessage(message) {
    const box = document.getElementById("messageBox");

    if (box) {
        box.innerText = message;
        box.style.display = "block";

        setTimeout(() => {
            box.style.display = "none";
        }, 3000);
    }

    console.log(message);
}


// ================= NAVIGATION =================

function showSection(section) {

    const element = document.getElementById(section);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ================= ADD STUDENT =================

async function addStudent() {

    const name = document.getElementById("name").value.trim();
    const course = document.getElementById("course").value.trim();
    const marks = document.getElementById("marks").value;

    if (!name || !course || marks === "") {
        showMessage("Please fill all fields");
        return;
    }

    if (Number(marks) < 0 || Number(marks) > 100) {
        showMessage("Marks must be between 0 and 100");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/students`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                course: course,
                marks: Number(marks)
            })

        });

        const data = await response.json();

        console.log("ADD RESPONSE:", data);

        if (!response.ok) {

            showMessage(
                data.detail
                    ? JSON.stringify(data.detail)
                    : data.error || "Student creation failed"
            );

            return;
        }

        showMessage(data.message || "Student added successfully");

        document.getElementById("name").value = "";
        document.getElementById("course").value = "";
        document.getElementById("marks").value = "";

        getStudents();

    } catch (error) {

        console.error("ADD ERROR:", error);

        showMessage("FastAPI connection failed");
    }
}



// ================= GET STUDENTS =================

async function getStudents() {

    const list = document.getElementById("studentList");

    try {

        const response = await fetch(`${API_URL}/students`);

        console.log("GET STATUS:", response.status);

        const data = await response.json();

        console.log("GET DATA:", data);

        if (!response.ok) {

            throw new Error(
                data.error || "Failed to get students"
            );
        }

        list.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {

            list.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No students available
                    </td>
                </tr>
            `;

            return;
        }


        data.forEach(student => {

            const marks = Number(student.marks);

            const status = marks >= 40 ? "Pass" : "Fail";

            const statusClass =
                marks >= 40 ? "pass" : "fail";


            list.innerHTML += `
                <tr>

                    <td>${student.id}</td>

                    <td>${student.name}</td>

                    <td>${student.course}</td>

                    <td>${student.marks}</td>

                    <td>
                        <span class="status ${statusClass}">
                            ${status}
                        </span>
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error("GET ERROR:", error);

        list.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Unable to load students
                </td>
            </tr>
        `;

        showMessage("FastAPI connection failed");
    }
}



// ================= UPDATE STUDENT =================

async function updateStudent() {

    const id =
        document.getElementById("updateId").value;

    const name =
        document.getElementById("updateName").value.trim();

    const course =
        document.getElementById("updateCourse").value.trim();

    const marks =
        document.getElementById("updateMarks").value;


    if (!id || !name || !course || marks === "") {

        showMessage("Please fill all fields");

        return;
    }


    if (Number(marks) < 0 || Number(marks) > 100) {

        showMessage("Marks must be between 0 and 100");

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

                    marks: Number(marks)

                })

            }
        );


        const data = await response.json();

        console.log("UPDATE RESPONSE:", data);


        if (!response.ok) {

            showMessage(
                data.detail
                    ? JSON.stringify(data.detail)
                    : data.error || "Student update failed"
            );

            return;
        }


        showMessage(
            data.message || "Student updated successfully"
        );


        document.getElementById("updateId").value = "";

        document.getElementById("updateName").value = "";

        document.getElementById("updateCourse").value = "";

        document.getElementById("updateMarks").value = "";


        getStudents();


    } catch (error) {

        console.error("UPDATE ERROR:", error);

        showMessage("FastAPI connection failed");

    }
}



// ================= DELETE STUDENT =================

async function deleteStudent() {

    const id =
        document.getElementById("deleteId").value;


    if (!id) {

        showMessage("Please enter Student ID");

        return;
    }


    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );


    if (!confirmDelete) {

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/students/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();

        console.log("DELETE RESPONSE:", data);


        if (!response.ok) {

            showMessage(
                data.detail
                    ? JSON.stringify(data.detail)
                    : data.error || "Student deletion failed"
            );

            return;
        }


        showMessage(
            data.message || "Student deleted successfully"
        );


        document.getElementById("deleteId").value = "";


        getStudents();


    } catch (error) {

        console.error("DELETE ERROR:", error);

        showMessage("FastAPI connection failed");

    }
}



// ================= PAGE LOAD =================

window.addEventListener("load", () => {

    getStudents();

});