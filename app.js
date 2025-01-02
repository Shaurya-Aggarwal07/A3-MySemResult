//---------------------------------------------------------------

const gradePoints = {
    'AA': 10,
    'AB': 9,
    'BB': 8,
    'BC': 7,
    'CC': 6,
    'CD': 5,
    'DD': 4,
    'FF': 0
};

let totalSemesters = 0;
let previousSemestersData = [];

function generateSemesterFields() {
    totalSemesters = parseInt(document.getElementById('numSemesters').value);
    if (totalSemesters < 1) {
        alert('Please enter a valid number of semesters');
        return;
    }

    document.getElementById('semester-form').style.display = 'none';
    document.getElementById('previous-spi-form').style.display = 'block';

    const container = document.getElementById('previous-semesters-container');
    container.innerHTML = '';

    for (let i = 0; i < totalSemesters - 1; i++) {
        const semesterDiv = document.createElement('div');
        semesterDiv.className = 'semester-card';
        
        const html = `
            <h3>Semester ${i + 1}</h3>
            <label for="spi${i}">SPI:</label>
            <input type="number" id="spi${i}" step="0.01" min="0" max="10" required>
            
            <label for="semesterCredits${i}">Total Credits:</label>
            <input type="number" id="semesterCredits${i}" step="0.5" min="0" required>
        `;
        
        semesterDiv.innerHTML = html;
        container.appendChild(semesterDiv);
    }
}

function proceedToCurrentSemester() {
    // Validate and store previous semesters' data
    previousSemestersData = [];
    for (let i = 0; i < totalSemesters - 1; i++) {
        const spi = parseFloat(document.getElementById(`spi${i}`).value);
        const credits = parseFloat(document.getElementById(`semesterCredits${i}`).value);
        
        if (isNaN(spi) || spi < 0 || spi > 10) {
            alert(`Please enter valid SPI (0-10) for Semester ${i + 1}`);
            return;
        }
        
        if (isNaN(credits) || credits <= 0) {
            alert(`Please enter valid credits (greater than 0) for Semester ${i + 1}`);
            return;
        }
        
        previousSemestersData.push({ spi, credits });
    }

    document.getElementById('previous-spi-form').style.display = 'none';
    document.getElementById('current-semester-form').style.display = 'block';
}

function generateSubjectFields() {
    const numSubjects = parseInt(document.getElementById('numSubjects').value);
    if (numSubjects < 1) {
        alert('Please enter a valid number of subjects');
        return;
    }

    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    for (let i = 0; i < numSubjects; i++) {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-card';
        
        const html = `
            <h3>Subject ${i + 1}</h3>
            <label for="subjectName${i}">Subject Name:</label>
            <input type="text" id="subjectName${i}" required>
            
            <label for="grade${i}">Grade:</label>
            <select id="grade${i}">
                ${Object.keys(gradePoints).map(grade => 
                    `<option value="${grade}">${grade}</option>`
                ).join('')}
            </select>
            
            <label for="subjectCredits${i}">Credits:</label>
            <input type="number" id="subjectCredits${i}" step="0.5" min="0.5" max="5" value="1" required>
        `;
        
        subjectDiv.innerHTML = html;
        container.appendChild(subjectDiv);
    }

    document.getElementById('calculate-btn').style.display = 'block';
}

function calculateResults() {
    const numSubjects = parseInt(document.getElementById('numSubjects').value);
    let currentSemTotalPoints = 0;
    let currentSemTotalCredits = 0;

    for (let i = 0; i < numSubjects; i++) {
        const subject = document.getElementById(`subjectName${i}`).value.trim();
        const grade = document.getElementById(`grade${i}`).value;
        const credits = parseFloat(document.getElementById(`subjectCredits${i}`).value);

        if (isNaN(credits) || credits < 0.5 || credits > 5) {
            alert(`Please enter valid credits (0.5-5) for ${subject || `Subject ${i + 1}`}`);
            return;
        }

        currentSemTotalPoints += gradePoints[grade] * credits;
        currentSemTotalCredits += credits;
    }

    const currentSPI = currentSemTotalPoints / currentSemTotalCredits;

    let totalWeightedSPI = currentSPI * currentSemTotalCredits;
    let totalCredits = currentSemTotalCredits;

    previousSemestersData.forEach(sem => {
        totalWeightedSPI += sem.spi * sem.credits;
        totalCredits += sem.credits;
    });

    const cpi = totalWeightedSPI / totalCredits;

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p>Current Semester (${totalSemesters}) SPI: ${currentSPI.toFixed(2)}</p>
        <p>Cumulative Performance Index (CPI): ${cpi.toFixed(2)}</p>
    `;
}
