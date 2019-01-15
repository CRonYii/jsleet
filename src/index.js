#!/usr/bin/env node
import program from 'commander';
import prompts from 'prompts';
import { LeetProblemSet } from './LeetProblemSet';
import { ApiUtil } from './ApiUtil';
import { LocalUtil } from './LocalUtil';
import { flow } from './flow';
import chalk from 'chalk';

program
    .version('0.1.0', '-v, --version');

program
    .command('init [id]')
    .description('Initialize a leetcode problem with the given question id, or a random problem if no id is given.')
    .action(async (id) => {
        const problemSet = await ApiUtil.getProblemSet();

        let problem;
        if (id) {
            problem = problemSet.id(id);
        } else {
            problem = problemSet
                .onlyFree(true)
                .random(1).result()[0];
        }

        console.log(LeetProblemSet.formatQuestions([problem]));
        const { confirm } = await prompts({
            type: 'text',
            name: 'confirm',
            message: 'Create workspace for this leetcode problem? (y/n)',
            validate: confirm => ['y', 'yes', 'n', 'no'].indexOf(confirm) > -1 ? true : 'Invalid Answer'
        });
        if (['y', 'yes'].indexOf(confirm) > -1) {
            const title = problem.stat.question__title_slug;
            const qData = await ApiUtil.getQuestion(title);

            const { lang } = await prompts([{
                type: 'select',
                name: 'lang',
                message: 'What Language would you like to use?',
                choices: [{ title: chalk.red('Cancel'), value: 'Cancelled' }]
                    .concat(qData.codeSnippets ?
                        qData.codeSnippets.map(v => ({
                            title: chalk.cyan(v.lang),
                            value: v.lang
                        }))
                        : []
                    )
            }]);

            console.log(lang);

            if (lang === 'Cancelled') {
                return
            }

            const succceed = await LocalUtil.createWorkspace(qData, lang);
            if (succceed) {
                flow.info(`Succesfully created ${lang} workspace for "${qData.title}"`);
            }
        }
    })

program
    .command('search [title]')
    .description('Search Leetcode Problem with given constraints.')
    .option('-l, --limit <limit>', 'The number of result to show per search.')
    .option('-r, --random [number]', 'Randomly select a question.', parseInt)
    .option('-d, --diff <diff>', 'Question difficulty (easy|medium|hard)/(1|2|3).')
    .option('-s, --sort <sort>', 'Sort the problems by given method. [id/acceptance](you may only input the initial)')
    .option('-o, --order <order>', 'The order that the problem display. [asc/desc](you may only input the initial)')
    .option('-n, --new [isNew]', 'Search only the new/old Leetcode questions. [yes/no] value)', (val) => {
        return val === 'no' ? false : true;
    })
    .option('-f, --free [isFree]', 'Search only the free/paid Leetcode questions. [yes/no] value)', (val) => {
        return val === 'no' ? false : true;
    })
    .action(async (title, options) => {
        const problemSet = await ApiUtil.getProblemSet();
        let result;

        result = problemSet
            .title(title)
            .difficulty(options.diff)
            .onlyNew(options.new)
            .onlyFree(options.free)
            .random(options.random)
            .sort(options.sort, options.order)
            .limit(options.limit || 10)
            .result();

        console.log(LeetProblemSet.formatQuestions(result));
    })

program.parse(process.argv);