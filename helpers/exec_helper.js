var spawn = require('child_process').spawn,
    //pty = require('pty.js'),
    path = require('path'),
    ipython, spawn_list = [];

/*exports.spawn_ipython = function() {
  ipython = pty.spawn('sudo', ['ipython']);
};*/

exports.execute_program = function(file, is_job) {
  
  console.log(file);
  if (file.extension === 'py') {
    execute_program(file, "python", is_job);
  } else if (file.extension === 'rb') {
    execute_program(file, "ruby", is_job);
  } else if (file.extension === 'js') {
    execute_program(file, "node", is_job);
  }
};

exports.stop_program = function(file, is_job) {
  var key = get_key(file);
  for (var i=0; i< spawn_list.length; i++) {
    if (spawn_list[i].key === key) {
      spawn_list.prog.kill();
      spawn_list.splice(i, 1);
    }
  }
};

/*function execute_ipython(file, is_job) {
  var file_path = path.resolve(__dirname + "/../" + file.path.replace('\/filesystem\/', '\/repositories\/'));
  ipython.removeAllListeners('data');
  require('../server').get_socket(file.username, function(socket) {
    if (is_job) {
      socket.emit('scheduler-start', {file: file});
    }
    ipython.on('data', function(data) {
      console.log(data);
      //data = data.replace(/\[0;.*?In\s\[.*?\[0m/, '~-prompt-~');
      //data = data.replace(/In\s\[.*?\]:/, '~-prompt-~');
      if (is_job) {
        socket.emit('scheduler-executing', {file: file});
      } else {
        socket.emit('program-stdout', {output: data});
      }
    });
  });
  ipython.write('run ');
  ipython.write(file_path);
  ipython.write('\r\n');

}*/

function get_key(file) {
  var key = "prog:" + file.path.replace(/\W/g, '');
  return key;
}

function get_cwd(file_path) {
  var split = file_path.split('/');
  split.splice(split.length-1, 1);
  return split.join('/');
}

function execute_program(file, type, is_job) {
  var file_path = path.resolve(__dirname + "/../" + file.path.replace('\/filesystem\/', '\/repositories\/'));

  console.log('execute_program');
  console.log(file_path);

  require('../server').get_socket(file.username, function(socket) {
    console.log(file);
    var cwd = get_cwd(file_path);
    var prog = spawn("sudo", [type, file_path], {cwd: cwd});
    var key = get_key(file);
    spawn_list.push({key: key, prog: prog});
    if (socket) {
      console.log('found socket, executing');
      handle_output(prog, file, is_job, socket);
    }
  });
}

function handle_output(prog, file, is_job, socket) {
  if (is_job) {
    socket.emit('scheduler-start', {file: file});
  }

  prog.stdout.on('data', function(data) {
    if (is_job) {
      console.log(data.toString());
      socket.emit('scheduler-executing', {file: file});
    } else {
      console.log(data.toString());
      socket.emit('program-stdout', {output: data.toString()});
    }
  });

  prog.stderr.on('data', function(data) {
    if (is_job) {
      console.log(data.toString());
      socket.emit('scheduler-error', {file: file, error: data});
    } else {
      console.log(data.toString());
      socket.emit('program-stderr', {output: data.toString()});
    }
  });

  prog.on('exit', function(code) {
    var key = get_key(file);
    for (var i=0; i< spawn_list.length; i++) {
      if (spawn_list[i].key === key) {
        spawn_list.splice(i, 1);
      }
    }

    if (is_job) {
      socket.emit('scheduler-exit', {code: code, file: file});
    } else {
      socket.emit('program-exit', {code: code});
    }

  });
}