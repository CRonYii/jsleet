import fs from 'fs-extra';
import { flow } from './flow';

export class LocalUtil {

    static languageExtensionMap = {
        "C++": ".cpp",
        "Java": ".java",
        "Python": ".py",
        "Python3": ".py",
        "MySQL": ".sql",
        "C": ".c",
        "C#": ".cs",
        "JavaScript": ".js",
        "Ruby": ".rb",
        "Bash": ".sh",
        "Swift": ".swift",
        "Go": ".go",
        "Scala": ".scala",
        "Kotlin": ".kt",
        "Rust": ".rs",
        "PHP": ".php",
    };

    static async createWorkspace(qData, lang) {
        const { questionId, titleSlug } = qData;
        const path = `./${questionId} - ${titleSlug} - ${lang}`;

        // falsy value means exception occured.
        const succceed = await LocalUtil.createFolder(path)
        if (!succceed) {
            return false;
        }

        const codeSnippet = qData.codeSnippets.find(v => v.lang == lang).code;

        return fs.writeFile(path + '/' + titleSlug + LocalUtil.languageExtensionMap[lang], codeSnippet, 'utf8')
            .then(() => true)
            .catch(e => flow.error(e));
    }

    static async createFolder(path) {
        return fs.pathExists(path)
            .then(exists => {
                if (!exists) {
                    return fs.mkdir(path)
                        .then(() => true)
                        .catch(e => flow.error(e));
                } else {
                    flow.error('A folder with the same name already existed.');
                    return false;
                }
            })
            .catch(e => flow.error(e));
    }
}

