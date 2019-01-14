#!/usr/bin/env node
import program from 'commander';
import { formatQuestion, formatQuestions, getProblemSet } from './datautil';

program
    .version('0.1.0', '-v, --version');

program
    .command('init <id>')
    .description('Initialize a leetcode problem with the given question id.')
    .action(async (id) => {
        const problemSet = await getProblemSet();
        const problem = problemSet.id(id);
        console.log(formatQuestion(problem));
    })

program
    .command('search [title]')
    .description('Search Leetcode Problem with given constraints.')
    .option('-l, --limit <limit>', 'The number of result to show per search.')
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
        const problemSet = await getProblemSet();
        const result = problemSet
            .title(title)
            .difficulty(options.diff)
            .onlyNew(options.new)
            .onlyFree(options.free)
            .limit(options.limit || 20)
            .sort(options.sort, options.order)
            .result();

        console.log(formatQuestions(result));
    })

program.parse(process.argv);