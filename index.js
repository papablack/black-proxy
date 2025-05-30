const { rwsPath } = require('@rws-framework/console');
const rwsTsc = require('@rws-framework/tsc');
const path = require('path');

const isCliCall = require.main === module;

const transpileRun = async (fileNameWithExt) => {    
    
    await rwsTsc.transpile({
        runspaceDir: __dirname, 
        outFileName: `${fileNameWithExt}.js`,
        entries: {
            main: `./src/${fileNameWithExt}.ts`
        },
        isDev: true
    });
}

if(isCliCall){
    const args = process.argv.slice(2);

    if(!args.length){
        throw new Error('Pass script name to run.');
    }

    (async () => {
        await transpileRun(args[0]);
    })();
}

module.exports = { run: transpileRun }
