const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
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
      "Update employee's manager",
      "Remove employee",
      "View all roles",
      "Add role",
      "Update role",
      "Remove role",
      "Quit"
    ]
  }).then(function (answer) {
    switch (answer.opts[0]) {
      case "View departments":
        viewCol("departments");
        break;

      case "Add department":
        addNewDepartment("departments");
        break;

      case "Update department":
        updateDepartment("departments");
        break;

      case "Remove department":
        removeDepartment("departments");
        break;

      case "View all employees":
        viewCol("employees");
        break;

      case "Add employee":
        addNewEmployee("employees");
        break;

      case "Remove employee":
        removeEmployee("employees");
        break;

      case "Update employee's manager":
        updateEmployee("employees");
        break;

      case "View all roles":
        viewCol("roles");
        break;

      case "Add role":
        addNewRole("roles")
        break;

      case "Update role":
        updateRole("roles");
        break;

      case "Remove role":
        removeRole(["id", "first_name"], "roles");
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

function addNewRole(col) {
  return inquirer.prompt([
    {
      type: "input",
      message: "Type the new role",
      name: "title"
    }
  ]).then(function (answer) {
    insertNewEl(col, answer);
  })
}

function addNewEmployee(col) {
  let answers = [];
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
    answers.push(answer)
    connection.query("SELECT roles.id, roles.title FROM roles", function (err, res) {
      return inquirer.prompt([
        {
          type: "checkbox",
          message: "What is the employee's role?",
          name: "role",
          choices: res.map(role => role.title),
        },
      ]).then(function (answer2) {
        res.forEach(role => {
          if (role.title === answer2.role[0]) {
            answers.push(role.id);
          }
        })
        connection.query("SELECT employee2.id,employee2.first_name FROM employees as employee1 JOIN employees as employee2 on employee1.manager_id = employee2.id", function (err, res) {
          return inquirer.prompt([
            {
              type: "checkbox",
              message: "Who is the employee's manager?",
              name: "manager",
              choices: res.map(employee => employee.first_name),
            },
          ]).then(function (answer3) {
            res.forEach(employee => {
              if (employee.first_name === answer3.manager[0]) {
                answers.push(employee.id);
              }
            })
            console.log(col, answers)
            insertNewEl(col, answers);
          })
        })
      })
    })
  })
}

function insertNewEl(col, answers) {
  connection.query("INSERT INTO ?? SET ?", [col, answers], function (err) {
    if (err) throw err;
    connection.end();
  });
}

function removeEmployee(col) {
  connection.query("SELECT ?? FROM ?? ", [["id", "first_name"], col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which employee do you want to delete?",
        name: "name",
        choices: res.map(element => element.first_name),
      },
    ]).then(function (answer) {
      res.filter(employee => {
        if (employee.first_name === answer.name[0]) {
          console.log(employee.id);
        }
      })
      removeEl(col, id)
    })
  })
}

function removeRole(col) {
  connection.query("SELECT ?? FROM ?? ", [["id", "title"], col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which role do you want to delete?",
        name: "role",
        choices: res.map(element => element.title),
      },
    ]).then(function (answer) {
      res.filter(role => {
        if (role.title === answer.role[0]) {
          console.log(role.id);
        }
      })
      removeEl(col, id);
    })
  })
}

function removeDepartment(col) {
  connection.query("SELECT ?? FROM ?? ", [["id", "name"], col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which department do you want to delete?",
        name: "department",
        choices: res.map(element => element.name),
      },
    ]).then(function (answer) {
      res.filter(department => {
        if (department.name === answer.department[0]) {
          console.log(department.id);
        }
      })
      removeEl(col, id);
    })
  })
}

function removeEl(col, id) {
  connection.query("DELETE FROM ?? WHERE ?", [col, id], function (err) {
    if (err) throw err;
    connection.end();
  })
}

function updateRole(col) {
  connection.query("SELECT ?? FROM ?? ", [["id", "title"], col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "What role would you like to update?",
        name: "role",
        choices: res.map(element => element.title),
      },
    ]).then(function (answer) {
      res.filter(role => {
        if (role.title === answer.role[0]) {
          console.log(role.id);
        }
      })
      return inquirer.prompt([
        {
          type: "input",
          message: "Type the new role",
          name: "title",
        },
      ]).then(function (answer) {
        updateEl(col, answer, id);
      })
    })
  })
}

function updateDepartment(col) {
  connection.query("SELECT ?? FROM ?? ", [["id", "name"], col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "What department would you like to update?",
        name: "department",
        choices: res.map(element => element.name),
      },
    ]).then(function (answer) {
      let answer3 = [];
      res.filter(department => {
        if (department.title === answer.department[0]) {
          answer3.push(department.id);
        }
      })
      answer3.push(answers);
      return inquirer.prompt([
        {
          type: "input",
          message: "Type the new department",
          name: "title",
        },
      ]).then(function (answer) {
        updateEl(col, answer, id);
      })
    })
  })
}

function updateEmployee(col) {
  connection.query("SELECT ?? FROM ?? ", ["first_name", col], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which employee's manager do you want to update?",
        name: "manager",
        choices: res.map(element => element.first_name),
      },
    ]).then(function (answer) {
      let answer3 = [];
      res.filter(department => {
        if (department.title === answer.manager[0]) {
          answer3.push(department.id);
        }
      })
      answer3.push(answers);
      return inquirer.prompt([
        {
          type: "input",
          message: "Type the new manager",
          name: "manager_id",
        },
      ]).then(function (answer) {
        updateEl(col, answer, id);
      })
    })
  })
}

function updateEl(col, id) {
  connection.query("UPDATE ?? SET ? WHERE ?", [col, answer, id], function (err) {
    if (err) throw err;
    connection.end();
  })
}
