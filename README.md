# crashplan-switcher
Easily switches between remote CrashPlan instances (via SSH) or local from Windows

Paths are all hard coded, so it only works on Windows 64, with CrashPlan installed for all users.

#Set up
* Copy your `.ui_info` file to `.ui_info.local`. (*On `\ProgramData\CrashPlan`*)
  * `.ui_info` will get overwritten on every CPSwitcher launch
* You need to have your private/public SSH keys set up on `*PROFILE*\\.ssh\id_rsa`
* You need to have those keys listed on the `authorized_keys` file on each remote machine
* **ssh** terminal command must exist (tried briefly to create tunnels with a few libraries to no avail, so...)

#How to use
###For Local Admin
```cpswitcher local```
###For Remote Admin
```cpswitcher SERVER USERNAME```

It will copy `.ui_info` via SSH and overwrite the local `.ui_info`, create a ssh tunnel, and launch the admin interface.

#To do
* Make it less hard coded
* Use a library to create the SSH tunnel, so I don't have to invoke the **ssh** process
* Make it work on other platforms?
