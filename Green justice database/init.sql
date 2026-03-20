-- Create Database
CREATE DATABASE IF NOT EXISTS green_justice;
USE green_justice;

-- Users Table (Citizens reporting violations)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  language ENUM('en', 'es', 'fr', 'de', 'pt') DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments/Council Table (CREATE BEFORE authorities and violation_types)
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  contact_person VARCHAR(100),
  violation_types VARCHAR(500),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authorities Table (Government officials)
CREATE TABLE IF NOT EXISTS authorities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  department_id INT,
  role ENUM('authority', 'admin') DEFAULT 'authority',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Violation Types Table
CREATE TABLE IF NOT EXISTS violation_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  violation_type_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('not_viewed', 'in_progress', 'resolved', 'fake_report') DEFAULT 'not_viewed',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  location_address VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  assigned_to INT,
  severity INT DEFAULT 5,
  proof_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (violation_type_id) REFERENCES violation_types(id),
  FOREIGN KEY (assigned_to) REFERENCES authorities(id)
);

-- Complaint Evidence (Photos/Videos)
CREATE TABLE IF NOT EXISTS complaint_evidence (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type ENUM('image', 'video') NOT NULL,
  mime_type VARCHAR(50),
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Complaint Updates/Comments
CREATE TABLE IF NOT EXISTS complaint_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  authority_id INT,
  status ENUM('not_viewed', 'in_progress', 'resolved', 'fake_report'),
  message TEXT,
  internal_notes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (authority_id) REFERENCES authorities(id)
);

-- Reminders for Unresolved Complaints
CREATE TABLE IF NOT EXISTS reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  authority_id INT,
  reminder_type ENUM('unresolved_week', 'priority_high', 'new_evidence') DEFAULT 'unresolved_week',
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (authority_id) REFERENCES authorities(id)
);

-- Suggested Authorities/Departments based on violation type
CREATE TABLE IF NOT EXISTS violation_department_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  violation_type_id INT NOT NULL,
  department_id INT NOT NULL,
  priority INT DEFAULT 1,
  FOREIGN KEY (violation_type_id) REFERENCES violation_types(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY unique_mapping (violation_type_id, department_id)
);

-- Indexes for performance
CREATE INDEX idx_complaint_status ON complaints(status);
CREATE INDEX idx_complaint_created ON complaints(created_at);
CREATE INDEX idx_complaint_user ON complaints(user_id);
CREATE INDEX idx_complaint_assigned ON complaints(assigned_to);
CREATE INDEX idx_complaint_location ON complaints(location_lat, location_lng);
CREATE INDEX idx_reminder_sent ON reminders(sent);
CREATE INDEX idx_update_complaint ON complaint_updates(complaint_id);
CREATE INDEX idx_evidence_complaint ON complaint_evidence(complaint_id);
