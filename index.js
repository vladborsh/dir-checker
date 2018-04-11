#!/usr/bin/env node

const program    = require('commander');
const chokidar   = require('chokidar');
const gitignore  = require('parse-gitignore');
const mkdirp     = require('mkdirp');
const fs         = require('fs');
const getDirName = require('path').dirname;
const log        = console.log.bind(console);

const changesMap = {};
const type2printFucmap = {
  'added'  : (path) => { log( `\x1b[92m${path}\x1b[0m` ) },
  'changed': (path) => { log( `\x1b[93m${path}\x1b[0m` ) },
  'removed': (path) => { log( `\x1b[91m${path}\x1b[0m` ) }
}

initProgramm(program);

const patterns = gitignore( program.poll + '/.gitignore' ).concat( gitignore( program.copy + '/.gitignore' ) );

log( 'Ignored patterns: ', patterns.map( p => `${program.poll}/${p}` ) );

const watcher = chokidar.watch(program.poll, {
  ignored: patterns.map( p => `${program.poll}/${p}` ), 
  ignoreInitial : true,
  persistent: true
});


watcher
  .on('add', (path) => { 
    addInChanges( changesMap, path, 'added' );
    printChanges( changesMap )
  })
  .on('addDir', (path) => {
    log('Directory', path, 'has been added'); 
    addInChanges( changesMap, path, 'added' );
  })
  .on('change', (path) => { 
    addInChanges( changesMap, path, 'changed' );
    printChanges( changesMap );
  })
  .on('unlink', (path) => { 
    addInChanges( changesMap, path, 'removed' );
    printChanges( changesMap )
  })
  .on('unlinkDir', (path) => { 
    log('Directory', path, 'has been removed'); 
  })
  .on('error', (error) => { 
    log('Error happened', error); 
  })
  .on('ready', () => { 
    log('Initial scan complete. Ready for changes.'); 
  })


function initProgramm(program) {
  program
    .version('0.1.0')
    .option('-p, --poll [value]', 'Polling directory')
    .option('-c, --copy [value]', 'Copy to directory')
    .parse(process.argv);
  log('Polling directory: ', program.poll);
  log('Copy to directory: ', program.copy);
}


function addInChanges( changesMap, path, type ) {
  changesMap[path] = type;
  if ( type === 'remove' )
    remove( path );
  else 
    copy( path )
}


function printChanges(changesMap) {
  log('\n');
  for (var prop in changesMap) {
    type2printFucmap[changesMap[prop]](prop);
  };
}


function copy( oldPath ) {
  if ( !!program.copy ) {
    let newPath = oldPath.replace(program.poll, program.copy);
    mkdirp(getDirName(newPath), function (err) {
      if (err) return log(err);
      fs.createReadStream( oldPath ).pipe(fs.createWriteStream( newPath ));
    })
  }
}


function remove( oldPath ) {
  if ( !!program.copy ) {
    let newPath = oldPath.replace(program.poll, program.copy);
    fs.unlink( newPath );
  }
}
