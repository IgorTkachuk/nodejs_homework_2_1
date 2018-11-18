const fs = require('fs');
const fx = require('mkdir-recursive');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const removeSrc = argv.d;
const showHelp = argv.h;

const displayHelp = () => {
    const strHelp = 
    'Usage: node sortFiles.js [options]\n\
        -h  Show this help only and terminate progrramm\n\
        -s  Source directory\n\
        -t  Target directory\n\
        -d  Remove source directory after sort complite';

    console.log(strHelp);
}

var rmdir = function(dir) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		
		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};

const sortFiles = (fsPath = __dirname,  targetDir = path.join(__dirname, 'sort') ) => {
    const files = fs.readdirSync(fsPath);
    
    files.forEach( file => {
        const fileType = fs.statSync(path.join(fsPath, file));
        let logString = '';

        if (fileType.isDirectory()){
            logString = `D\t${fsPath}\\${file}`;
            console.log(logString);
            sortFiles(path.join(fsPath, file), targetDir);
        } else {
            logString = `f\t${fsPath}\\${file}`;
            if (!fs.existsSync(path.join(targetDir, file.substr(0,1)))) {
                fx.mkdirSync(path.join(targetDir, file.substr(0,1)));
            }
            fs.copyFile(path.join(fsPath, file), path.join(targetDir, file.substr(0,1), file), err => {
                if (err) {
                    console.log(`Error copy file ${logString}`);
                }
                console.log(logString);
            });
        } 
    });
}

if (showHelp) {
    displayHelp();
    process.exit(0);
}

let srcDir = '';
if  ( !argv.s ) {
    console.log ('Error! Does not specify source direcory');
    displayHelp();
    process.exit(1);
} else {
    srcDir = argv.s;
    if (!fs.existsSync(srcDir)) {
        console.log('Error! Does not found source directory');
        displayHelp();
        process.exit(2);
    }
}

sortFiles(srcDir, argv.t);

if (removeSrc) {
    rmdir(srcDir);
}