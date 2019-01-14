import Axios from "axios";
import Table from 'cli-table';
import { flow } from "./flow";
import chalk from "chalk";

export const getProblemSet = async () => {
    const problemSet = await Axios.get("https://leetcode.com/api/problems/all/")
        .then((res) => {
            return res.data.stat_status_pairs;
        })
        .catch((e) => console.error('When fetching problem set from leetcode.' + e));

    return new LeetProblemSet(problemSet);
}

export const formatQuestions = (qs) => {
    const table = new Table({
        head: ['ID', 'Title', 'Difficulty', 'Acceptance (%)'],
        style: { head: ['cyan'] }
    });
    qs.forEach((q) => {
        table.push(formatQuestion(q));
    });
    return table.toString();
}

export const formatQuestion = (q) => {
    const diff = {
        1: 'easy', 2: 'medium', 3: 'hard'
    }[q.difficulty.level];
    return [q.stat.frontend_question_id, q.stat.question__title, diff, (q.stat.total_acs / q.stat.total_submitted * 100).toFixed(2) + '%'];
}

class LeetProblemSet {

    constructor(problemSet) {
        this.problemSet = problemSet;
        this.reset();
    }

    id(qid) {
        return this.problemSet.find((q) => q.stat.frontend_question_id == qid);
    }

    title(keyword) {
        if (!keyword)
            return this;
        if (/\d/.test(keyword)) {
            this.filteredSet = this.filteredSet.filter((q) => {
                return q.stat.frontend_question_id == keyword;
            });
        } else {
            this.filteredSet = this.filteredSet.filter((q) => {
                const t = q.stat.question__title;
                return t.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
            });
        }
        return this;
    }

    difficulty(diff) {
        if (!diff)
            return this;
        diff = {
            '1': 1,
            '2': 2,
            '3': 3,
            'easy': 1,
            'medium': 2,
            'hard': 3,
        }[diff];
        if (!diff) {
            flow.error('Invalid difficulty.');
            flow.exit();
        }
        this.filteredSet = this.filteredSet.filter((q) => {
            const level = q.difficulty.level;
            return level == diff;
        });
        return this;
    }

    onlyNew(bool) {
        if (bool == null)
            return this;
        this.filteredSet = this.filteredSet.filter((q) => {
            return bool === q.stat.is_new_question;
        });
        return this;
    }

    onlyFree(bool) {
        if (bool == null)
            return this;
        this.filteredSet = this.filteredSet.filter((q) => {
            return bool !== q.paid_only;
        });
        return this;
    }

    limit(num) {
        if (num == null)
            return this;
        if (/\D/.test(num)) {
            flow.error('Limit must be a number: ' + num);
            flow.exit();
        }
        this.filteredSet.splice(num);
        return this;
    }

    sort(method, order) {
        console.log(method);
        if (!method || method === 'id' || method === 'i') {
            this.filteredSet.sort((a, b) => {
                const v = a.stat.frontend_question_id - b.stat.frontend_question_id;
                return !order || order === 'a' || order === 'asc' ? v : -v;
            });
            return this;
        } else if (method === 'acceptance' || method === 'a') {
            this.filteredSet.sort((a, b) => {
                const v = (a.stat.total_acs / a.stat.total_submitted) - (b.stat.total_acs / b.stat.total_submitted);
                return !order || order === 'a' || order === 'asc' ? v : -v;
            });
        } else {
            flow.error('Unknowed sorting method: ' + method);
        }
        return this;
    }

    result() {
        return this.filteredSet;
    }

    reset() {
        this.filteredSet = this.problemSet;
    }

}