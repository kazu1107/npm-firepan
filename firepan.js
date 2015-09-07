#!/usr/bin/env node

var sys         = require('sys');
var fs          = require('fs');
var path        = require('path');
var execSync    = require('child_process').execSync;

var request     = require('request');
var unzip       = require('unzip');
var scanf       = require('scanf');
var copyDir     = require('copy-dir');


fs.readlink(process.argv[1], function(err, linkString){
    console.assert(err==null, "error : Can not get script path.");
    if(err != null){ return; }

    var op = {};


    op.scriptDir   = path.dirname(linkString);
    op.currentDir  = fs.realpathSync('./');

    console.log("\nTo setup the HTML5Boilerplate project from now!\n");

    process.stdout.write("What's project name? : ");
    op.projectName = scanf('%s');

    process.stdout.write("\nWho is the author? : ");
    op.author = scanf('%s');


    /*
    console.log("\nUsing what language?");
    console.log("[ts] TypeScript");
    // console.log("[cf] CoffeeScript");
    console.log("[no] Unused.");
    do{
        var loop = true;
        process.stdout.write("language : ");
        var lang = scanf("%s");
        switch (lang) {
        case "ts":
            op.lang = "ts"; loop = false;
            break;
        // case "cf":
        //     op.lang = "cf"; loop = false;
        //     break;
        case "no":
            op.lang = ""; loop = false;
            break;
        }
    }while(loop);
    */

    console.log("\nDo you use any type?");
    console.log("[c] Clasic HTML5Boilerplate");
    console.log("[r] Responsive");
    console.log("[b] Bootstrap");
    console.log("[n] no HTML5Boilerplate");

    var command;
    do{
        process.stdout.write('type : ');
        command = scanf('%s');
        switch(command){
        case 'c':
            op.initializr = "http://www.initializr.com/builder?h5bp-content&modernizr&jquerymin&h5bp-analytics&h5bp-favicon&h5bp-scripts&h5bp-css&h5bp-csshelpers&h5bp-mediaqueryprint&h5bp-mediaqueries&simplehtmltag";
            firepan(op);
            return;
        case 'r':
            op.initializr = "http://www.initializr.com/builder?izr-responsive&jquerymin&h5bp-iecond&h5bp-analytics&h5bp-favicon&h5bp-appletouchicons&modernizrrespond&h5bp-css&h5bp-csshelpers&h5bp-mediaqueryprint&izr-emptyscript"
            firepan(op);
            return;
        case 'b':
            op.initializr = "http://www.initializr.com/builder?boot-hero&jquerymin&h5bp-iecond&h5bp-analytics&h5bp-favicon&h5bp-appletouchicons&modernizrrespond&izr-emptyscript&boot-css&boot-scripts"
            firepan(op);
            return;
        case 'n':
            op.initializr = "";
            firepan(op);
            return;
        }
    }while(true);
});


function firepan(op){
    op.templateDir = path.join( op.scriptDir, "template" );
    var projDir = path.join( op.currentDir,op.projectName);
    copyDir.sync(op.templateDir, projDir );

    process.chdir('./'+op.projectName );

    // keyword replace
    fileReplace(path.join(projDir, "package.json"), "\\$PROJECT_NAME"   , op.projectName );
    fileReplace(path.join(projDir, "package.json"), "\\$AUTHOR"         , op.author );
    fileReplace(path.join(projDir, "bower.json"), "\\$PROJECT_NAME"     , op.projectName );

    // download
    if(op.initializr != ""){
        var output = path.join( projDir, "__TEMP_ARCHIVE__.zip");
        request({url: op.initializr , encoding: null}, function(err, resp, body) {
            if(err) throw err;
            fs.writeFile(output, body, function(err) {
                console.log("\nsetup directory ...");

                fs.createReadStream(output)
                    .pipe(unzip.Extract({ path: projDir }))
                    .on('close', function(){
                        fs.rename( path.join(projDir, "initializr"), path.join(projDir, "dest"));
                        fs.unlink(output);

                        execSync("npm install --save-dev gulp gulp-typescript gulp-webpack gulp-ruby-sass ts-loader");

                        process.chdir( './src' );
                        execSync("tsd init");
                        execSync("tsd query jquery --save --resolve --action install");
                        process.chdir('..');
                    })
            });
        });
    }
}



function fileReplace(filePath, src, dest){
    var text = fs.readFileSync(filePath, 'utf-8');
    text = text.replace(RegExp(src, "g"), dest);
    fs.writeFileSync(filePath, text, {
        encoding : 'utf-8',
    });
}