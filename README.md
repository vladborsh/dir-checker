# Cli tool for boring tasks

Use it when you need polling changes in one directory and move changed (or added) files to another

Example: dirch -p polling_directory_name -c destination_directory_name

``` bash
# Install
npm intall
npm link

# Usage
dirch -p /Users/myuser/Documents/projects/rep -c /Users/myuser/Documents/projects/gitrep

# Help
dirch --help
```
**Don't forget terminate running (polling) process when you change the git branch in the destination directory**