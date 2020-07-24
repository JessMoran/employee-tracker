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
      "View departments",
      "Add department",
      "Update department",
      "Remove department",
      "View employees",
      "Add employee",
      "Update employee's manager",
      "Remove employee",
      "View roles",
      "Add role",
      "Remove role",
      "Quit"
    ]
  }).then(function (answer) {
    switch (answer.opts[0]) {
      case "View departments":
        viewTable("departments");
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

      case "View employees":
        viewTable("employees");
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

      case "View roles":
        viewTable("roles");
        break;

      case "Add role":
        addNewRole("roles")
        break;

      case "Remove role":
        removeRole("roles");
        break;

      case "Quit":
        connection.end();
        break;
    }
  });
}

function viewTable(table) {
  connection.query("SELECT DISTINCT * FROM ??", [table], function (err, res) {
    if (err) throw err;
    console.table(res);
    connection.end();
  });
}

function addNewDepartment(table) {
  return inquirer.prompt([
    {
      type: "input",
      message: "Type the new department",
      name: "name"
    }
  ]).then(function (answer) {
    insertNewEl(table, answer);
  })
}

function addNewRole(table) {
  return inquirer.prompt([
    {
      type: "input",
      message: "Type the new role",
      name: "title"
    },
    {
      type: "input",
      message: "Type the salary",
      name: "salary"
    }
  ]).then(function (answer) {
    connection.query("SELECT DISTINCT id,name FROM departments", function (err, res) {
      return inquirer.prompt([
        {
          type: "checkbox",
          message: "Type the salary",
          name: "department",
          choices: res.map(department => department.name)
        }
      ]).then(function (answer2) {
        res.forEach(department => {
          if (department.name === answer2.department[0]) {
            answer['department_id'] = department.id;
          }
        })
        insertNewEl(table, answer);
      })
    })
  })
}

function addNewEmployee(table) {
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
    connection.query("SELECT DISTINCT roles.id, roles.title FROM roles", function (err, res) {
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
            answer['role_id'] = role.id;
          }
        })
        connection.query("SELECT DISTINCT employee2.id,employee2.first_name FROM employees as employee1 JOIN employees as employee2 on employee1.manager_id = employee2.id", function (err, res) {
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
                answer['manager_id'] = employee.id;
              }
            })
            insertNewEl(table, answer);
          })
        })
      })
    })
  })
}

function insertNewEl(table, answers) {
  connection.query("INSERT INTO ?? SET ?", [table, answers], function (err) {
    if (err) throw err;
    connection.end();
  });
}

function removeEmployee(table) {
  connection.query("SELECT DISTINCT ?? FROM ?? ", [["id", "first_name"], table], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which employee do you want to delete?",
        name: "first_name",
        choices: res.map(element => element.first_name),
      },
    ]).then(function (answer) {
      let employeeId;
      res.filter(employee => {
        if (employee.first_name === answer.first_name[0]) {
          employeeId = {'id': employee.id}
          removeEl(table, employeeId);
          console.log("Removed");
        }
      })
    })
  })
}

function removeRole(table) {
  connection.query("SELECT DISTINCT id,title FROM ?? ", [table], function (err, res) {
    let id;
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which role do you want to delete?",
        name: "title",
        choices: res.map(role => role.title),
      },
    ]).then(function (answer) {
      res.filter(role => {
        if (role.title === answer.title[0]) {
          id = {'id': role.id}
          console.log("Removed");
        }
      })
      removeEl(table, id);
    })
  })
}

function removeDepartment(table) {
  connection.query("SELECT DISTINCT id,name FROM ?? ", [table], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which department do you want to delete?",
        name: "name",
        choices: res.map(element => element.name),
      },
    ]).then(function (answer) {
      let id = {}
      res.filter(department => {
        if (department.name === answer.name[0]) {
          id = {id: department.id}
        }
      })
      removeEl(table, id);
    })
  })
}

function removeEl(table, id) {
  connection.query("DELETE FROM ?? WHERE ?", [table, id], function (err) {
    if (err) throw err;
    connection.end();
  })
}

function updateDepartment(table) {
  connection.query("SELECT DISTINCT id,name FROM ?? ", [table], function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "What department would you like to update?",
        name: "name",
        choices: res.map(element => element.name),
      },
    ]).then(function (answer) {
      let id;
      res.filter(department => {
        if (department.name === answer.name[0]) {
          id = {'id':department.id}
        }
      })
      return inquirer.prompt([
        {
          type: "input",
          message: "Type the new department",
          name: "name",
        },
      ]).then(function (answer2) {
        updateEl(table,answer2,id)
      })
    })
  })
}

function updateEmployee(table) {
  let managerId;
  let employeeId;
  connection.query("SELECT DISTINCT id,first_name, manager_id FROM employees", function (err, res) {
    return inquirer.prompt([
      {
        type: "checkbox",
        message: "Which employee's manager do you want to update?",
        name: "first_name",
        choices: res.map(element => element.first_name),
      },
    ]).then(function (answer) {
      res.map(employee => {
        if (employee.first_name === answer.first_name[0]) {
          managerId = {'manager_id': employee.manager_id}
          employeeId = {'id': employee.id}
        }
      })
      connection.query("SELECT DISTINCT employee2.id,employee2.first_name FROM employees as employee1 JOIN employees as employee2 on employee1.manager_id = employee2.id", function (err, res) {
        let newManagerId;
        return inquirer.prompt([
          {
            type: "checkbox",
            message: "Which employee's manager do you want to update?",
            name: "manager",
            choices: res.map(element => element.first_name),
          },
        ]).then(function (answer) {
          res.forEach(manager => {
            if (manager.first_name === answer.manager[0]) {
              newManagerId = {'manager_id': manager.id}
            }
          })
          updateEl(table, newManagerId, employeeId);
        })
      })
    })
  })
}

function updateEl(table, answer2, answer1) {
  connection.query("UPDATE ?? SET ? WHERE ?", [table, answer2, answer1], function (err) {
    if (err) throw err;
    connection.end();
  })
}
