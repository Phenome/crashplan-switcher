#!/usr/bin/env node
(function() {
  var CP_EXECUTABLE, SSH_KEY, SSH_KEY_PATH, UI_INFO_PATH, _, exec, fs, path, ref, scp2, server, spawn, tmp, tmpFile, user;

  fs = require('fs');

  path = require('path');

  spawn = require('child_process').spawn;

  exec = require('child_process').exec;

  tmp = require('tmp');

  scp2 = require('scp2');

  UI_INFO_PATH = "C:\\ProgramData\\CrashPlan";

  CP_EXECUTABLE = "C:\\Program Files\\CrashPlan\\CrashPlanDesktop.exe";

  ref = process.argv, _ = ref[0], _ = ref[1], server = ref[2], user = ref[3];

  if (!server || server === "local") {
    console.log('Trying to connect to local');
    fs.createReadStream(path.join(UI_INFO_PATH, '.ui_info.local')).pipe(fs.createWriteStream(path.join(UI_INFO_PATH, '.ui_info')));
    spawn(CP_EXECUTABLE);
    return;
  }

  SSH_KEY_PATH = path.join(process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'], '.ssh', 'id_rsa');

  SSH_KEY = fs.readFileSync(SSH_KEY_PATH);

  tmpFile = tmp.fileSync().name;

  console.log('Copying .ui_info from remote');

  scp2.scp({
    host: server,
    username: user,
    privateKey: SSH_KEY,
    path: '/var/lib/crashplan/.ui_info'
  }, tmpFile, function(err) {
    var child_cp, child_ssh, id, ip, port, ref1, str;
    if (err) {
      return console.log('err', err);
    }
    str = fs.readFileSync(tmpFile).toString();
    ref1 = str.split(','), port = ref1[0], id = ref1[1], ip = ref1[2];
    fs.writeFileSync(path.join(UI_INFO_PATH, '.ui_info'), [4200, id, ip].join(','));
    console.log('File copied');
    console.log("Connecting to " + server + " with user " + user);
    child_ssh = exec("ssh -L 4200:localhost:4243 " + user + "@" + server);
    child_cp = spawn(CP_EXECUTABLE);
    return child_cp.on('close', function() {
      console.log('CrashPlan closed. Killing SSH tunnel.');
      return child_ssh.kill();
    });
  });

}).call(this);
