fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn
exec = require('child_process').exec
tmp = require 'tmp'
scp2 = require 'scp2'
UI_INFO_PATH = "C:\\ProgramData\\CrashPlan"
CP_EXECUTABLE = "C:\\Program Files\\CrashPlan\\CrashPlanDesktop.exe"

[_, _, server, user] = process.argv

if not server or server is "local"
  console.log 'Trying to connect to local'
  fs.createReadStream path.join UI_INFO_PATH, '.ui_info.local'
  .pipe fs.createWriteStream path.join UI_INFO_PATH, '.ui_info'
  spawn CP_EXECUTABLE
  return

SSH_KEY_PATH = path.join(
  process.env[if process.platform is 'win32' then 'USERPROFILE' else 'HOME'],
  '.ssh',
  'id_rsa'
  )
SSH_KEY = fs.readFileSync SSH_KEY_PATH

tmpFile = tmp.fileSync().name
console.log 'Copying .ui_info from remote'
scp2.scp
  host: server,
  username: user,
  privateKey: SSH_KEY,
  path: '/var/lib/crashplan/.ui_info',
  tmpFile,
  (err) ->
    return console.log 'err', err if err
    str = fs.readFileSync(tmpFile).toString()
    [port,id,ip] = str.split ','
    fs.writeFileSync path.join(UI_INFO_PATH, '.ui_info'),
      [4200,id,ip].join(',')
    console.log 'File copied'
    console.log "Connecting to #{server} with user #{user}"
    child_ssh = exec "ssh -L 4200:localhost:4243 #{user}@#{server}"
    child_cp = spawn CP_EXECUTABLE

    child_cp.on 'close', ->
      console.log 'CrashPlan closed. Killing SSH tunnel.'
      child_ssh.kill()