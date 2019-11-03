const Logger = require('embark-logger');
const uuid = require('uuid');
const fs = require('fs-extra');

var DB = {
}

function addRecord(data) {
  DB[data.id] = data
  console.dir("---> added")
  console.dir(DB[data.id])
}

function findRecord(id) {
  return DB[id];
}

function updateRecord(id, data) {
  DB[id] = {...DB[id], ...data}
  console.dir("---> updated")
  console.dir(DB[id])
}

setTimeout(() => {
  console.dir(DB);
  fs.writeJSONSync("./log.json", DB);
  process.exit(0);
}, 60*1000);

class SuperLog extends Logger {

  startSession() {
    this.session = uuid.v4();

    addRecord({
      session: this.session,
      id: this.session,
      timestamp: Date.now(),
      value: "new_session",
      type: "new_session",
      name: "new_session"
    })
  }

  moduleInit(name) {
    let id = uuid.v4();

    addRecord({
      session: this.session,
      id: id,
      timestamp: Date.now(),
      parent_id: this.session,
      type: 'module_init',
      value: name,
      name: name
    })

    return id;
  }

  log(values) {
    // console.log("=> logging")
    // console.log(values.id)

    if (values.id) {
      // console.log("=> has an id")
      let existingLog = findRecord(values.id);
      // console.log("=> record found")
      if (existingLog) {
        updateRecord(values.id, values)
        return values.id;
      }
    }

    let id = uuid.v4();

    addRecord({
      session: this.session,
      timestamp: Date.now(),
      id: id,
      ...values
    })

    return id;
  }

  info() {
    let id = uuid.v4();
    this.log({
      session: this.session,
      timestamp: Date.now(),
      parent_id: this.session,
      id: id,
      type: "log_info",
      name: "info: " + arguments[0]
    })
    super.info(...arguments);
  }

}

module.exports = SuperLog;

// session
// branch
// branch

// cmd_controller
// * startSession()

// * module
// * log
// * branch off

// API:
// logger.startSession() - to start tracking logs
// let id = logger.tag({whatever-you-want}) - appends {whatever-you-want} to  a mongo db, associated to the current session id
// let sub_id = logger.tag({parent_id: id, ...whatever-you-want}) - appends {whatever-you-want} to  a mongo db, associated to the current session id and parent_id id

// - name (e.g module name, method name)
// - type (e.g module init, function call, event)
// - inputs
// - outputs
// - timestamp
// - file/origin (can kinda be done automatically almost)
// for inputs and outputs
// let sub_id = logger.tag({parent_id: id, ...whatever-you-want})
// logger.tag({id: sub_id, inputs: xyz})
// .... code
// // gonna return
// logger.tag({id: sub_id, outputs: [1,2,3]})
// return [1,2,3]
