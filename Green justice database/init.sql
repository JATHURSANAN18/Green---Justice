-- Green Justice Database Initialization Script
-- Ultra-safe version for maximum compatibility

-- Reset database
DROP DATABASE IF EXISTS green_justice;
CREATE DATABASE green_justice;
USE green_justice;

-- 1. Locations Table
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    district VARCHAR(100),
    landmark VARCHAR(255)
) ENGINE=InnoDB;

-- 2. Authorities Table
CREATE TABLE authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 3. Complaints Table
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_type ENUM('Waste Disposal', 'Air Pollution', 'Water Pollution', 'Deforestation', 'Noise Pollution') NOT NULL,
    description TEXT,
    media_url VARCHAR(255),
    location_id INT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Not Viewed', 'In Progress', 'Resolved') DEFAULT 'Not Viewed',
    assigned_authority_id INT,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_authority_id) REFERENCES authorities(authority_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Evidence Table
CREATE TABLE evidence (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    file_type VARCHAR(50),
    file_url VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Reminders Table
CREATE TABLE reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    authority_id INT NOT NULL,
    sent_status BOOLEAN DEFAULT FALSE,
    trigger_date DATE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (authority_id) REFERENCES authorities(authority_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Sample Data
INSERT INTO authorities (username, email, password, region) VALUES ('officer_smith', 'smith@greenjustice.gov', 'hashed_pass_123', 'North District');
INSERT INTO authorities (username, email, password, region) VALUES ('officer_jane', 'jane@greenjustice.gov', 'hashed_pass_456', 'South District');

INSERT INTO locations (latitude, longitude, district, landmark) VALUES (6.9271, 79.8612, 'Colombo 01', 'Old Parliament');
INSERT INTO locations (latitude, longitude, district, landmark) VALUES (7.2906, 80.6337, 'Kandy Central', 'Lake View');

INSERT INTO complaints (violation_type, description, location_id, assigned_authority_id) VALUES ('Waste Disposal', 'Illegal dumping of plastic waste near the river bank.', 1, 1);

INSERT INTO evidence (complaint_id, file_type, file_url) VALUES (1, 'image/jpeg', 'evidence/waste_123.jpg');

INSERT INTO reminders (complaint_id, authority_id, trigger_date) VALUES (1, 1, '2026-03-27');
