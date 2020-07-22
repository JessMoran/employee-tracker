--- Create DB and tables ---
DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL,
  department_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id)
);

------ Seeds ------
USE employee_tracker_db;

----- Departments -----
INSERT INTO departments (name)

VALUES ("Sales"), ("Engineering"), ("Legal"), ("Finance"), ("Design");

----- Roles -----

INSERT INTO roles (title, salary, department_id)

VALUES ("Sales lead", 10000, 4), ("Salesperson", 9000, 4), ("Lead Engineer", 15000, 2), ("Software Engineer", 12000, 2), ("UX/UI", 11000, 5);

------ Employees ------

INSERT INTO employees (first_name, last_name, role_id, manager_id)

VALUES ("Jess", "Moran", 3, null), ("Andrew", "Keddis", 1, null), ("Aaron", "Juarez", 4, 1), ("Mike", "Emmons", 2, 2);
