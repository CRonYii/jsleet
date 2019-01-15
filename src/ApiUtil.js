import { LeetProblemSet } from "./LeetProblemSet";
import Axios from "axios";
import { Spinner } from 'cli-spinner';
import chalk from "chalk";

export class ApiUtil {

    static getProblemSet = async () => {
        const spinner = new Spinner(chalk.green('%s Searching Leetcode problems... '));
        spinner.start();
        const problemSet = await Axios.get('https://leetcode.com/api/problems/all/')
            .then((res) => {
                return res.data.stat_status_pairs;
            })
            .catch((e) => console.error('When fetching problem set from leetcode.\n' + e))
            .finally(() => {
                spinner.stop(true);
            });

        return new LeetProblemSet(problemSet);
    }

    static getQuestion = async (title) => {
        const spinner = new Spinner(chalk.green('%s Getting Leetcode problem details... '));
        spinner.start();
        return await Axios.post('https://leetcode.com/graphql', { "operationName": "questionData", "variables": { "titleSlug": title}, "query": "query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    envInfo\n    __typename\n  }\n}\n" }, {
            headers: {
                'referer': `https://leetcode.com/problems/${title}/`,
                'Content-Type': 'application/json',
                'x-csrftoken': await ApiUtil.getCSRFToken()
            }
        })
            .then((res) => {
                const d = res.data.data.question;
                return {
                    questionId: d.questionFrontendId,
                    title: d.title,
                    titleSlug: d.titleSlug,
                    content: d.content,
                    similarQuestions: JSON.parse(d.similarQuestions),
                    difficulty: d.difficulty,
                    isPaidOnly: d.isPaidOnly,
                    topicTags: d.topicTags,
                    codeSnippets: d.codeSnippets
                };
            })
            .catch((e) => console.error('When getting problem details from leetcode.\n' + e))
            .finally(() => {
                spinner.stop(true);
            });

    }

    static async getCSRFToken() {
        return Axios.get('https://leetcode.com/problems/two-sum/')
            .then(res => {
                return res.headers['set-cookie'].map(c => {
                    const i = c.indexOf('=');
                    return {
                        name: c.substring(0, i),
                        value: c.substring(i + 1)
                    }
                })
                .find(v => v.name === 'csrftoken')
                .value;
            })
            .catch(e => flow.error(e));
    }

}