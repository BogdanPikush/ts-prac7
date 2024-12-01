// Enum для статусу студента
enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled"
}

// Enum для типу курсу
enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special"
}

// Enum для семестру
enum Semester {
    First = "First",
    Second = "Second"
}

// Enum для оцінок
enum GradeEnum {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

// Enum для факультетів університету
enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering"
}

// Інтерфейс для опису студента
interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

// Інтерфейс для опису курсу
interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

// Інтерфейс для опису оцінки студента
interface Grade {
    studentId: number;
    courseId: number;
    grade: GradeEnum | null;
    date: Date;
    semester: Semester;
}

// Клас системи управління університетом
class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: Grade[] = [];
    private nextStudentId = 1;
    private nextCourseId = 1;

    // Додавання нового студента
    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent = { ...student, id: this.nextStudentId++ };
        this.students.push(newStudent);
        return newStudent;
    }

    // Реєстрація студента на курс
    registerForCourse(studentId: number, courseId: number): void {
        const course = this.courses.find(c => c.id === courseId);
        const student = this.students.find(s => s.id === studentId);

        if (!course || !student) throw new Error("Invalid student or course ID.");
        if (course.faculty !== student.faculty) throw new Error("Faculty mismatch.");
        if (this.grades.filter(g => g.courseId === courseId).length >= course.maxStudents) {
            throw new Error("Course is full.");
        }

        this.grades.push({ studentId, courseId, grade: null, date: new Date(), semester: course.semester });
    }

    // Виставлення оцінки студенту за курс
    setGrade(studentId: number, courseId: number, grade: GradeEnum): void {
        const registration = this.grades.find(g => g.studentId === studentId && g.courseId === courseId);
        if (!registration) {
            throw new Error("Student is not registered for this course.");
        }

        registration.grade = grade;
        registration.date = new Date();
    }

    // Оновлення статусу студента
    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);
        if (!student) throw new Error("Invalid student ID.");

        // Валідація для зміни статусу
        if (student.status === StudentStatus.Expelled && newStatus !== StudentStatus.Academic_Leave) {
            throw new Error("Cannot change status of an expelled student.");
        }
        student.status = newStatus;
    }

    // Отримання списку студентів факультету
    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    // Отримання оцінок студента
    getStudentGrades(studentId: number): Grade[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    // Отримання доступних курсів факультету для семестру
    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }

    // Обчислення середньої оцінки студента
    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.grades.filter(g => g.studentId === studentId && g.grade !== null);
        const total = studentGrades.reduce((acc, g) => acc + (g.grade || 0), 0);
        return studentGrades.length ? total / studentGrades.length : 0;
    }

    // Отримання списку відмінників факультету
    getTopStudentsByFaculty(faculty: Faculty): Student[] {
        const studentsByFaculty = this.getStudentsByFaculty(faculty);

        return studentsByFaculty.filter(student => {
            const average = this.calculateAverageGrade(student.id);
            return average >= GradeEnum.Excellent - 1; // Відмінники (>= 4.5)
        });
    }
}


// Test

// Ініціалізація системи управління університетом
const ums = new UniversityManagementSystem();

// Додавання студентів
const student1 = ums.enrollStudent({
    fullName: "Ivan Ivanov",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date("2023-09-01"),
    groupNumber: "CS-101"
});
const student2 = ums.enrollStudent({
    fullName: "Maria Petrenko",
    faculty: Faculty.Economics,
    year: 2,
    status: StudentStatus.Active,
    enrollmentDate: new Date("2022-09-01"),
    groupNumber: "ECO-201"
});

console.log("Students enrolled:", ums.getStudentsByFaculty(Faculty.Computer_Science));

// Додавання курсів
const course1 = {
    id: 1,
    name: "Data Structures",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 2
};
const course2 = {
    id: 2,
    name: "Microeconomics",
    type: CourseType.Optional,
    credits: 3,
    semester: Semester.Second,
    faculty: Faculty.Economics,
    maxStudents: 1
};

// Додавання курсів
ums['courses'].push(course1, course2);

console.log("Available courses for CS faculty:", ums.getAvailableCourses(Faculty.Computer_Science, Semester.First));

// Реєстрація студентів на курси
try {
    ums.registerForCourse(student1.id, course1.id);
    ums.registerForCourse(student2.id, course2.id);
    console.log("Registration successful!");
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error("An unknown error occurred:", error);
    }
}


// Виставлення оцінок
try {
    ums.setGrade(student1.id, course1.id, GradeEnum.Excellent);
    ums.setGrade(student2.id, course2.id, GradeEnum.Good);
    console.log("Grades set successfully!");
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error("An unknown error occurred:", error);
    }
}

console.log("Student 1 grades:", ums.getStudentGrades(student1.id));
console.log("Student 2 grades:", ums.getStudentGrades(student2.id));

// Оновлення статусу студента
try {
    ums.updateStudentStatus(student1.id, StudentStatus.Graduated);
    console.log(`Student ${student1.fullName} status updated to Graduated.`);
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error("An unknown error occurred:", error);
    }
}

// Розрахунок середньої оцінки студента
console.log("Student 1 average grade:", ums.calculateAverageGrade(student1.id));
console.log("Student 2 average grade:", ums.calculateAverageGrade(student2.id));

// Отримання списку відмінників по факультету
console.log("Top students in Computer Science:", ums.getTopStudentsByFaculty(Faculty.Computer_Science));
console.log("Top students in Economics:", ums.getTopStudentsByFaculty(Faculty.Economics));