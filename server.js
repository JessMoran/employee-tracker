var mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const util = require("util");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "JessMoran29",
  database: "employee_tracker_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  promptUserOpts();
});

function promptUserOpts() {
  inquirer.prompt({
    type: "checkbox",
    message: "What would you like to do?",
    name: "opts",
    choices: [
      "View all departments",
      "Add department",
      "Update department",
      "Remove department",
      "View all employees",
      "Add employee",
      "Update employee",
      "Remove employee",
      "View all roles",
      "Add role",
      "Update role",
      "Remove role",
      "Quit"
    ]
  })
    .then(function (answer) {
      switch (answer.opts[0]) {
        case "View all departments":
          viewCol("departments");
          break;

        case "Add department":
          addNewDepartment("departments");
          break;

        case "Update department":
          updateField();
          break;

        case "Remove department":
          removeField("departments");
          break;

        case "View all employees":
          viewCol("employees");
          break;

        case "Add employee":
          addNewEmployee("employees");
          break;

        case "Remove employee":
          removeField("employees");
          break;

        case "View all roles":
          viewCol("roles");
          break;

        case "Add role":
          addNewField()
          break;

        case "Update role":
          updateField();
          break;

        case "Remove role":
          removeField("roles");
          break;

        case "Quit":
          connection.end();
          break;
      }
    });
}

function viewCol(col) {
  connection.query("SELECT * FROM ??", [col], function (err, res) {
    if (err) throw err;
    console.table(res);
    connection.end();
  });
}

function addNewDepartment(col) {
  return inquirer.prompt([
    {
      type: "input",
      message: "Type the new department",
      name: "name"
    }
  ]).then(function (answer) {
    insertNewEl(col, answer);
  })
}

function addNewEmployee(col) {
  connection.query("SELECT title FROM roles", function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "What is the employee's role?",
        name: "roles",
        choices: res.map(role => role.title),
      },
    ]).then(function (answer) {
      insertNewEl(col, answer);
    })
  })
  connection.query("SELECT * FROM employees", function (err, res) {
    console.log(res);
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "What is the employee's role?",
        name: "roles",
        choices: res.map(role => role.title),
      },
    ]).then(function (answer) {
      insertNewEl(col, answer);
    })
  })

  return inquirer.prompt([
    {
      type: "input",
      message: "What is the employees's name",
      name: "first_name"
    },
    {
      type: "input",
      message: "What is the employees's last name",
      name: "last_name"
    },
  ]).then(function (answer) {
    insertNewEl(col, answer);
  })
}

function insertNewEl(col, answer) {
  connection.query("INSERT INTO ?? SET ?", [col, answer], function (err) {
    if (err) throw err;
    connection.end();
  });
}

function updateField(col) {
  connection.query("SELECT * FROM ??", [col], function (err, res) {
    if (err) throw err;

    inquirer.prompt({
      type: "checkbox",
      message: "What would you like to do?",
      name: "opts",
      choices: res.forEach(department => department.name)
    }).then(function (answer) {
      connection.query("UPDATE ?? SET ? WHERE ?", [table, field, col], function (err, res) {
        if (err) throw err;
        connection.end();
      });
    })
    connection.end();
  });
}

function removeField(col) {
  return inquirer.prompt([
    {
      type: "checkbox",
      message: "What role do ?",
      name: "roles",
      choices: (function () {
        connection.query("SELECT * FROM roles", function (err, res) {
          if (err) throw err;
          const result = res.filter(role => role.title);
          console.log(result);
          return result;
        })
      })
    },
    {
      type: "checkbox",
      message: "Who is the employee's manager?",
      name: "opts",
      choices: function () {
        connection.query("SELECT * FROM employees", function (err, res) {
          if (err) throw err;
          for (const employee in res) {
            console.log(`${employee}: ${res[employee.first_name]}`);
          }
        })
      }
    }
  ]).then(function (answer) {
    insertNewEl(col, answer);
  })
}
