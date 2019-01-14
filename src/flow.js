import chalk from "chalk";

export const flow = {
    error: (msg) => {
        msg.split('\n').forEach(s => {
            console.error(chalk.red(`[jsleet] ` + s));
        });
    },
    warn: (msg) => {
        msg.split('\n').forEach(s => {
            console.warn(chalk.yellow(`[jsleet] ` + s));
        });
    },
    info: (msg) => {
        msg.split('\n').forEach(s => {
            console.info(chalk.cyan(`[jsleet] ` + s));
        });
    },
    exit: () => {
        flow.error('Program exited on an error.');
        flow.info('See --help for a list of available options.');
        process.exit(1);
    }
};