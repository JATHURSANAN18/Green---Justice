-- Create User Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Violation Table
CREATE TABLE IF NOT EXISTS Violations (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_type VARCHAR(255) NOT NULL UNIQUE
);

INSERT IGNORE INTO Violations (violation_type) VALUES 
('Illegal waste disposal'),
('Air pollution'),
('Water pollution'),
('Deforestation'),
('Noise pollution');

-- Create Authority Table
CREATE TABLE IF NOT EXISTS Authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    last_active TIMESTAMP NULL
);

-- Create Complaint Table
CREATE TABLE IF NOT EXISTS Complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    violation_type VARCHAR(255) NOT NULL,
    status ENUM('Not Viewed', 'In Progress', 'Resolved') DEFAULT 'Not Viewed',
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_authority_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);

-- Create Evidence Table
CREATE TABLE IF NOT EXISTS Evidences (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE
);

-- Create Location Table
CREATE TABLE IF NOT EXISTS Locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT UNIQUE NOT NULL,
    longitude DECIMAL(11, 8),
    latitude DECIMAL(10, 8),
    landmark VARCHAR(255),
    district VARCHAR(100),
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE
);

-- Create StatusUpdate Table
CREATE TABLE IF NOT EXISTS StatusUpdates (
    status_update_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    updated_by_authority_id INT,
    status VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);

-- Create Reminder Table
CREATE TABLE IF NOT EXISTS Reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT UNIQUE NOT NULL,
    scheduled_date TIMESTAMP,
    sent_status BOOLEAN DEFAULT FALSE,
    recipient_authority_id INT,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);
