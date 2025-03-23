//---------------------------------------------------------------
// Constants and Variables
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
let currentStep = 1;
let previousSemestersData = [];
let performanceChart = null;

//---------------------------------------------------------------
// Helper Functions
//---------------------------------------------------------------
function updateProgressBar(step) {
    // Reset all steps
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active', 'completed');
    });
    
    // Mark current step as active and previous steps as completed
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.querySelector(`.step[data-step="${i}"]`);
        if (i < step) {
            stepEl.classList.add('completed');
        } else if (i === step) {
            stepEl.classList.add('active');
        }
    }
}

function showSection(stepNumber) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show the current section
    let sectionId;
    switch(stepNumber) {
        case 1:
            sectionId = 'semester-form';
            break;
        case 2:
            sectionId = 'previous-spi-form';
            break;
        case 3:
            sectionId = 'current-semester-form';
            break;
        case 4:
            sectionId = 'results-section';
            break;
    }
    
    document.getElementById(sectionId).classList.add('active-section');
    currentStep = stepNumber;
    updateProgressBar(currentStep);
    
    // Scroll to top of the section
    window.scrollTo({
        top: document.querySelector('.container').offsetTop - 100,
        behavior: 'smooth'
    });
}

function goBack(fromStep) {
    showSection(fromStep - 1);
}

function startOver() {
    // Reset all data
    totalSemesters = 0;
    previousSemestersData = [];
    document.getElementById('numSemesters').value = '';
    document.getElementById('previous-semesters-container').innerHTML = '';
    document.getElementById('subjects-container').innerHTML = '';
    document.getElementById('calculate-btn').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
    
    showSection(1);
}

function printResults() {
    window.print();
}

//---------------------------------------------------------------
// Main Functions
//---------------------------------------------------------------
function generateSemesterFields() {
    totalSemesters = parseInt(document.getElementById('numSemesters').value);
    if (totalSemesters < 1 || totalSemesters > 12) {
        showNotification('Please enter a valid number of semesters (1-12)', 'error');
        return;
    }

    const container = document.getElementById('previous-semesters-container');
    container.innerHTML = '';

    if (totalSemesters === 1) {
        // If there's only one semester, skip to the current semester section
        previousSemestersData = [];
        showSection(3);
        return;
    }

    // Create fields for previous semesters
    for (let i = 0; i < totalSemesters - 1; i++) {
        const semesterDiv = document.createElement('div');
        semesterDiv.className = 'semester-card';
        
        const html = `
            <h3><span class="semester-number">Semester ${i + 1}</span></h3>
            <div class="form-group">
                <label for="spi${i}">SPI:</label>
                <input type="number" id="spi${i}" step="0.01" min="0" max="10" placeholder="Enter SPI (0-10)" required>
            </div>
            
            <div class="form-group">
                <label for="semesterCredits${i}">Total Credits:</label>
                <input type="number" id="semesterCredits${i}" step="0.5" min="0" max="50" placeholder="Enter total credits" required>
            </div>
        `;
        
        semesterDiv.innerHTML = html;
        container.appendChild(semesterDiv);
    }

    showSection(2);
}

function proceedToCurrentSemester() {
    // Validate and store previous semesters' data
    previousSemestersData = [];
    let isValid = true;

    for (let i = 0; i < totalSemesters - 1; i++) {
        const spi = parseFloat(document.getElementById(`spi${i}`).value);
        const credits = parseFloat(document.getElementById(`semesterCredits${i}`).value);
        
        if (isNaN(spi) || spi < 0 || spi > 10) {
            showNotification(`Please enter valid SPI (0-10) for Semester ${i + 1}`, 'error');
            isValid = false;
            break;
        }
        
        if (isNaN(credits) || credits <= 0 || credits > 50) {
            showNotification(`Please enter valid credits (0.5-50) for Semester ${i + 1}`, 'error');
            isValid = false;
            break;
        }
        
        previousSemestersData.push({ spi, credits });
    }

    if (isValid) {
        showSection(3);
    }
}

function generateSubjectFields() {
    const numSubjects = parseInt(document.getElementById('numSubjects').value);
    if (numSubjects < 1 || numSubjects > 15) {
        showNotification('Please enter a valid number of subjects (1-15)', 'error');
        return;
    }

    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    for (let i = 0; i < numSubjects; i++) {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-card';
        
        const html = `
            <h3>Subject ${i + 1}</h3>
            <div class="form-group">
                <label for="subjectName${i}">Subject Name:</label>
                <input type="text" id="subjectName${i}" placeholder="e.g. Data Structures" required>
            </div>
            
            <div class="form-group">
                <label for="grade${i}">Grade:</label>
                <select id="grade${i}">
                    ${Object.keys(gradePoints).map(grade => 
                        `<option value="${grade}">${grade} (${gradePoints[grade]} points)</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="subjectCredits${i}">Credits:</label>
                <input type="number" id="subjectCredits${i}" step="0.5" min="0.5" max="10" value="3" required>
            </div>
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
    let subjectsData = [];
    let isValid = true;

    // Validate and collect subject data
    for (let i = 0; i < numSubjects; i++) {
        const subjectName = document.getElementById(`subjectName${i}`).value.trim();
        const grade = document.getElementById(`grade${i}`).value;
        const credits = parseFloat(document.getElementById(`subjectCredits${i}`).value);

        if (subjectName === '') {
            showNotification(`Please enter a name for Subject ${i + 1}`, 'error');
            isValid = false;
            break;
        }

        if (isNaN(credits) || credits < 0.5 || credits > 10) {
            showNotification(`Please enter valid credits (0.5-10) for ${subjectName}`, 'error');
            isValid = false;
            break;
        }

        const points = gradePoints[grade] * credits;
        currentSemTotalPoints += points;
        currentSemTotalCredits += credits;
        
        subjectsData.push({
            name: subjectName,
            grade,
            credits,
            points
        });
    }

    if (!isValid) return;

    const currentSPI = currentSemTotalPoints / currentSemTotalCredits;

    let totalWeightedSPI = currentSPI * currentSemTotalCredits;
    let totalCredits = currentSemTotalCredits;

    previousSemestersData.forEach(sem => {
        totalWeightedSPI += sem.spi * sem.credits;
        totalCredits += sem.credits;
    });

    const cpi = totalWeightedSPI / totalCredits;

    // Display results
    const resultDiv = document.getElementById('result');
    
    let resultHTML = `
        <div class="result-summary">
            <h3>Current Semester (${totalSemesters}) Summary</h3>
            <p>Total Credits: <span class="result-number">${currentSemTotalCredits.toFixed(1)}</span></p>
            <p>Semester Performance Index (SPI): <span class="result-number">${currentSPI.toFixed(2)}</span></p>
            <p>Cumulative Performance Index (CPI): <span class="result-number">${cpi.toFixed(2)}</span></p>
        </div>
    `;

    // Add detailed subject breakdown
    resultHTML += `
        <div class="subject-breakdown">
            <h3>Subject Breakdown</h3>
            <table>
                <tr>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Points</th>
                </tr>
    `;

    subjectsData.forEach(subject => {
        resultHTML += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.credits}</td>
                <td>${subject.grade}</td>
                <td>${subject.points.toFixed(1)}</td>
            </tr>
        `;
    });

    resultHTML += `
            </table>
        </div>
    `;

    resultDiv.innerHTML = resultHTML;

    // Create or update chart
    createPerformanceChart(cpi, currentSPI, previousSemestersData);

    // Show results section
    showSection(4);
}

function createPerformanceChart(cpi, currentSPI, previousSemesters) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Prepare data for chart
    const labels = [];
    const spiData = [];
    
    // Add previous semester data
    previousSemesters.forEach((semester, index) => {
        labels.push(`Semester ${index + 1}`);
        spiData.push(semester.spi);
    });
    
    // Add current semester
    labels.push(`Semester ${totalSemesters}`);
    spiData.push(currentSPI);
    
    // Calculate running CPI for each semester
    const cpiData = [];
    let runningTotalCredits = 0;
    let runningTotalPoints = 0;
    
    previousSemesters.forEach((semester, index) => {
        runningTotalPoints += semester.spi * semester.credits;
        runningTotalCredits += semester.credits;
        cpiData.push(runningTotalPoints / runningTotalCredits);
    });
    
    // Add current semester CPI
    cpiData.push(cpi);
    
    // Destroy previous chart if exists
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    // Create new chart
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'SPI',
                    data: spiData,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 3,
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                    pointRadius: 6
                },
                {
                    label: 'CPI',
                    data: cpiData,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 3,
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...spiData, ...cpiData) - 1),
                    max: Math.min(10, Math.max(...spiData, ...cpiData) + 1),
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f3f4f6'
                    }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 16,
                    displayColors: true,
                    borderColor: '#4b5563',
                    borderWidth: 1
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f3f4f6',
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<p>${message}</p>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

//---------------------------------------------------------------
// Event Listeners
//---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Initialize accordion functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            accordionItem.classList.toggle('active');
        });
    });

    // Initialize the progress bar
    updateProgressBar(1);
});
