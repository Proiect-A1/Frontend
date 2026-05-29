import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

const docs = [
    {
        title: "Prezentare",
        content: `# Test Generation Scripts\n\nEach Fiicoder problem has a test generation script.\n\nThis script offers a concise way to specify the following information about the problem:\n\n* Model solution name\n* Test generation parameters (generator name + arguments)\n* Test validation parameters (validator name + arguments)\n* Output checker parameters (checker name + arguments)\n* The amount of points for each subtask\n* Subtask dependencies\n\n## Syntax\n\nEach line of the test generation script is a separate command.\nEach command can specify some metadata about the problem, test generation info, or both.\n\n**Examples:**\n\n\`\`\`\n// single line comment\n\`\`\`\n\n\`\`\`\n#VAL val 1000 2000 // do not use file extensions here\n// sets the current validator as "val"\n// with two arguments: "1000" and "2000"\n\`\`\`\n\n\`\`\`\n= example0.in // copies the file example0.in into a new test\n\`\`\`\n\n\`\`\`\n< gen 200 star // generates a new test\n// uses generator "gen" with two arguments: "200" and "star"\n\`\`\``
    },
    {
        title: "#MAIN",
        content: `# #MAIN\n\n**#MAIN** is used to specify the executable name of the model solution.\n\nThe model solution will be used to generate the correct output for all tests defined after this line.\n\n**Examples:**\n\n\`\`\`\n#MAIN main // "main" will be used to generate the correct outputs\n< gen 100\n< gen 200\n#MAIN other_solution // overrides the previous #MAIN\n< gen 400\n< gen 500\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Fatal Error|Main executable '<name>' cannot be run | The executable cannot be run. This is usually due to a server error.\n|Error|Main executable name must not contain spaces; command line arguments are not allowed for main sources| The command does not have exactly two tokens (e.g. \`#MAIN main 200\`, \`#MAIN\`)|\n|Error|Main executable name must not contain a dot ('.'); do not use file extensions in the executable name|The executable name contains a dot (e.g. \`#MAIN main.cpp\`). |\n|Error|Main executable '<name>' does not exist| No compilable solutions with that name exist.|\n|Error|No main source specified for this test|No model solution has been specified for a particular test. As such, the model output cannot be generated.|`
    },
    {
        title: "#VAL",
        content: `# #VAL / #VALIDATOR\n\n**#VAL** (or **#VALIDATOR**) is used to specify the executable name and command line arguments of the input validator.\n\nThe role of a validator is to determine whether the input data of a particular test is valid, according to the problem restrictions.\n\nIf no validator is specified for a particular test, then it is always considered valid.\n\n**Examples:**\n\n\`\`\`\n#VAL val 1000 1000 \n// "val" will be used as a validator for all tests below\n// val will receive "1000" and "1000" as command line arguments\n\n< gen 100 100\n< gen 1000 1000\n\n#VAL 100000 100000 // overrides the previous #VAL\n< gen 20000 20000\n< gen 100000 100000\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Fatal Error|Validator executable '<name>' cannot be run | The executable cannot be run. This is usually due to a server error.\n|Error|Validator name unspecified|The command has less than two tokens (e.g. \`#VAL\`)|\n|Error|Validator executable name must not contain a dot ('.'); do not use file extensions in the executable name|The executable name contains a dot (e.g. \`#VAL val.cpp\`). |\n|Error|Validator executable '<name>' does not exist| No compilable validators with that name exist.|\n|Warning|No validator specified for this test|No validator has been specified for a particular test. All tests without a validator are considered valid.|`
    },
    {
        title: "#CHECK",
        content: `# #CHECK / #CHECKER\n\n**#CHECK** (or **#CHECKER**) is used to specify the executable name and command line arguments of the checker.\n\nThe role of a checker is to determine whether the output of a submission for a particular test is correct, according to the problem restrictions.\n\nIn the absence of a checker, the outputs are compared using whitespace diff (\`diff -wbB\`).\n\n**Examples:**\n\n\`\`\`\n#CHECK check 10000 \n// "check" will be used as a checker for all tests below\n// check will receive "10000" as a command line argument\n\n< gen 50\n< gen 100\n\n#CHECK checker2 1000000 1000000 // overrides the previous #CHECK\n< gen 400\n< gen 1000\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Fatal Error|Checker executable '<name>' cannot be run | The executable cannot be run. This is usually due to a server error.\n|Error|Checker name unspecified|The command has less than two tokens (e.g. \`#CHECK\`)|\n|Error|Checker executable name must not contain a dot ('.'); do not use file extensions in the executable name|The executable name contains a dot (e.g. \`#CHECK checker.cpp\`). |\n|Error|Checker executable '<name>' does not exist| No compilable checkers with that name exist.|\n|Warning|No checker specified for this test|No checker has been specified for a particular test. All tests without a checker will use whitespace diff (\`diff -wbB\`) as a checker.|`
    },
    {
        title: "#GEN",
        content: `# #GEN / #GENERATOR\n\n**#GEN** (or **#GENERATOR**) is used to specify the executable name and command line arguments of the generator.\n\nThe role of a generator is to print the input data for a particular test.\n\n**Note:** Generators **must** be deterministic.\n\n**Examples:**\n\n\`\`\`\n#GEN gen \n// "gen" will be used as a generator for all tests below\n\n1000 1 // test will be generated by "gen 1000 1"\n1000 2 // test will be generated by "gen 1000 1"\n// blank lines are still ignored\n// they will not produce a test (in this case, "gen 1000") \n\n#GEN gen 100000 // overrides the previous #GEN \n1 // test will be generated by "gen 100000 1"\n2 // test will be generated by "gen 100000 2"\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Fatal Error|Generator executable '<name>' cannot be run | The executable cannot be run. This is usually due to a server error.\n|Error|Generator name unspecified|The command has less than two tokens (e.g. \`#GEN\`)|\n|Error|Generator executable name must not contain a dot ('.'); do not use file extensions in the executable name|The executable name contains a dot (e.g. \`#GEN gen.cpp\`). |\n|Error|Generator executable '<name>' does not exist| No compilable generators with that name exist.|`
    },
    {
        title: "Teste",
        content: `# Tests\n\nIt is possible to generate tests in three ways:\n\n1. Using a generator from a previous **#GEN** command:\n\`\`\`\n#GEN gen 1000\n1 // "gen 1000 1"\n2 // "gen 1000 2"\n3 // "gen 1000 3"\n\`\`\`\n2. Copying a raw test file using the \`=\` symbol:\n\`\`\`\n= example0.in\n\`\`\`\n3. Overriding (covering) a generator from a previous **#GEN** command using the \`<\` symbol:\n\`\`\`\n#GEN gen 1000\n1 // "gen 1000 1"\n< gen2 star 10000 // "gen2 star 5000"\n< gen 5000 // "gen 5000"\n\`\`\`\n\nTests are automatically assigned ids based on the order that they appear in the script. The first test has an id of $0$, the second test has an id of $1$ and so on.\n\n**Examples:**\n\n\`\`\`\n= example0.in\n= example1\n#GEN gen 1000\n< gen_all_small // "gen_all_small"\n1 // "gen 1000 1"\n2 // "gen 1000 2"\n3 // "gen 1000 3"\n#GEN gen2 100000\n< gen 100000 // "gen 100000"\n1 // "gen2 100000 1"\n2 // "gen2 100000 2"\n3 // "gen2 100000 3"\n= bigtest.txt\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Fatal Error|Generator executable '<name>' cannot be run | The executable cannot be run. This is usually due to a server error.\n|Error|Generator name unspecified|The command has less than two tokens (e.g. \`#GEN\`).|\n|Error|Generator executable name must not contain a dot ('.'); do not use file extensions in the executable name|The executable name contains a dot (e.g. \`#GEN gen.cpp\`). |\n|Error|Generator executable '<name>' does not exist| No compilable generators with that name exist.|\n|Error|Empty generator script|No test generation script provided, usually from \`#TEST <points>\`.|\n|Error|Invalid copy syntax|The number of tokens is not equal to $2$ (e.g. \`=\`, \`= file1 file2\`).|\n|Error|Filename must not contain \`/\` or \`\\\`|Filename must not contain \`/\` or \`\\\` (e.g. \`raw_tests/file.txt\`).|\n|Error|File \`<name>\` not found|No such file exists.|\n|Error|Invalid generator cover syntax|There are less than $2$ tokens (e.g. \`<\`).|\n|Error|No generator specified for this test|No generator specified for this test, either from a cover (\`<\`), or from a previous \`#GEN\`.\n|Error|Test does not belong to any subtasks|No subtasks specified for this test from a previous \`#IN\`, \`#ADDIN\` or \`#TEST\`.|\n|Error|No main source specified for this test|No model solution specified from a previous \`#MAIN\`.|\n|Error|No generator arguments specified for this test|No generator arguments specified, usually from \`#TEST <points>\`.|\n|Warning|No validator specified for this test|No validators specified from a previous \`#VAL\`.|\n|Warning|No checker specified for this test|No checkers specified from a previous \`#CHECK\`.|`
    },
    {
        title: "Subtask-uri",
        content: `# Subtasks\n\nEach test can belong to multiple subtasks/groups, however each test must belong to at least one subtask.\n\nFor IOI Style problems, points are assigned to subtasks, rather than tests.\n\nSubtasks are automatically assigned ids based on the order that they are defined in the script. The first subtask has an id of $0$, the second test has an id of $1$ and so on.\n\nEach subtask also has a name, which can either be set manually, or generated automatically by the system. In the second case (which occurs for \`#TEST\` and \`#GROUP\`), the name of the group will be \`__<id>\` (e.g. \`__0\`, \`__1\`, ... )\n\nThere are several commands that can be used to define what subtasks contain each test:\n\n## #TEST\n\n\`#TEST\` is used to create a new subtask which contains only one test.\n**Examples:**\n\`\`\`\n\n#TEST 10 = example0.in \n// creates a new subtask "__0" worth 10 points\n// that subtask will contain one test, example0.in\n\n#TEST 20.5 < gen2\n// creates a new subtask "__1" worth 20.5 points\n// generated by "gen2"\n\n#GEN gen\n#TEST 21.5 1000 \n// creates a new subtask "__2" worth 21.5 points\n// generated by "gen 1000"\n\`\`\`\n\n## #GRP / #GROUP\n\n**#GRP** and its alias **#GROUP** are used to define a "single use" subtask. These commands are mainly useful if each test belongs to exactly one subtask.\n\nAll tests below **#GRP / #GROUP** and above the next subtask command (**#TEST, #IN, #ADDIN, #NOTIN, #GROUP**) will belong to this new group.\n\n**Examples:**\n\`\`\`\n#GRP 30.0 // creates a new subtask "__0" worth 30 points\n= example.in // belongs to "__0"\n< gen_small 10 path // belongs to "__0"\n\n#GRP 70.0 // creates a new subtask "__1" worth 70 points\n#GEN gen 100000\n1 // belongs to "__1"\n2 // belongs to "__1" \n3 // belongs to "__1"\n\`\`\`\n## #DEFGRP / #DEFGROUP\n\n**#DEFGRP** and its alias **#DEFGROUP** are used to define a new subtask based on its value and name.\n\n**Note:** the tests below will **not** belong to the newly defined subtask.\n\n **Examples:**\n \`\`\`\n #DEFGRP 20.0 examples\n #DEFGRP 73.2 smalln\n #DEFGRP 6.8 bign\n= test.in // does not belong to any subtasks\n \`\`\`\n\n## #IN/#SETIN, #ADDIN, #NOTIN\n\n**#IN** and its alias **#SETIN** are used to specify that all tests below belong to a particular set of subtasks.\n\n**#ADDIN** is used to specify that all tests below **also** belong to a particular set of subtasks.\n\n**#NOTIN** is used to specify that all tests below **no longer** belong to a particular set of subtasks.\n\n **Examples:**\n\`\`\`\n// subtask with id "0" and name "backtracking"\n#DEFGRP 20 backtracking \n\n// subtask with id "1" and name "star"\n#DEFGRP 10 star\n\n// subtask with id "2" and name "quadratic"\n#DEFGRP 40 quadratic\n\n// subtask with id "3" and name "full"\n#DEFGRP 40 full\n\n#IN backtracking quadratic full\n#GEN gen 10\n= test.in\n< gensmall 10\n1\n2\n\n#SETIN // tests below no longer belong to any subtasks\n#ADDIN star // tests below belong to "star"\n< stargen 100000\n\n\n#ADDIN quadratic full\n#NOTIN star // tests below belong to "quadratic" and "full"\n#GEN gen 1000\n1\n2\n\n#NOTIN quadratic // tests below belong to "full"\n#GEN gen 100000\n1\n2\n\`\`\`\n\n**Compiler Messages:**\n| Error Level | Error Message | Reason |\n|-|-|-|\n|Error|Test does not belong to any subtasks|A test does not belong to any subtasks (e.g. \`#IN\` + \`= example.txt\`).|\n|Error|Unknown subtask name \`'<subtask_name>'\` | This error occurs when a subtask name used by **#IN**, **#ADDIN** or **#NOTIN** has not been previously defined (e.g. by a **#DEFGRP** command).|\n|Error|Incorrect number of tokens|This error occurs when a **#GROUP** command does not have exactly $2$ tokens. |\n|Error|Incorrect number of tokens|This error occurs when a **#DEFGRP** command does not have exactly $3$ tokens. |\n|Error|Cannot convert \`'<points>'\` to float | The amount of points specified in a **#GROUP** or **#DEFGRP** command cannot be parsed as a float (e.g. \`#GROUP 2,3\`, \`#DEFGRP not_a_float subtask_name\`).|\n|Error|Point totals for subtasks must be non-negative|The amount of points specified in a **#GROUP** or **#DEFGRP** command are strictly less than $0$ (e.g. \`#GROUP -1\`, \`#DEFGRP -3.5 subtask_name\`).|\n|Error|Group with name \`'<subtask_name>'\` has been defined previously|A previously defined subtask with the same name exists (e.g. \`#DEFGRP 20.0 subtask\` + \`#DEFGRP 50.0 subtask\`).|\n|Error|No generator arguments specified for this test|Occurs for \`#TEST\` if no generator arguments are specified (e.g. \`#TEST 30.0\`, \`#TEST 30.0 <\`). However, if a generator has been specified with \`#GEN\`, \`#TEST 30.0\` would be correct. In this case, a new test will be generated using the specified generator without any additional arguments.\n|Warning|Tests below already belong to subtask \`'<subtask_name>'\`|This warning occurs when trying to include a test into the same subtask twice (e.g. \`#IN subtask subtask\` or \`#IN subtask\` + \`#ADDIN subtask\`). |\n|Warning|Tests below already do not belong to subtask \`'<subtask_name>'\`  | This warning occurs when trying to exclude a test from a subtask that it doesn't belong to (e.g. \`#NOTIN subtask\` + \`#NOTIN subtask\`). |\n|Warning|Redundant command, no group names specified.| This warning occurs when \`#NOTIN\` and \`#ADDIN\` do not specify any subtask names.|`
    }
];

export default function ScriptDocumentation() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex flex-col h-full bg-(--surface-card) border border-(--accent)/25 rounded-2xl overflow-hidden mb-4">
            {/* Tabs Header */}
            <div className="flex overflow-x-auto border-b border-(--accent)/20 bg-(--surface-muted) custom-scrollbar">
                {docs.map((doc, idx) => (
                    <button
                        type="button"
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                            activeTab === idx
                                ? 'text-(--accent) border-b-2 border-(--accent) bg-(--accent)/5'
                                : 'text-(--text-muted) hover:text-(--text) hover:bg-(--accent)/5'
                        }`}
                    >
                        {doc.title}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar bg-(--surface-card) text-(--text) text-sm leading-relaxed">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ ...props }) => <h1 className="text-xl font-bold text-(--text-h) mb-3" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-lg font-bold text-(--text-h) mt-4 mb-2" {...props} />,
                                p: ({ ...props }) => <p className="mb-3" {...props} />,
                                pre: ({ ...props }) => (
                                    <pre className="p-3 bg-black/30 rounded-xl text-(--text-muted) whitespace-pre-wrap font-mono text-[12px] my-3 border border-(--accent)/10" {...props} />
                                ),
                                code: ({ className, children, ...props }: any) => (
                                    <code className={`text-(--accent) font-mono ${className || ''}`} {...props}>
                                        {children}
                                    </code>
                                ),
                                table: ({ ...props }) => (
                                    <div className="overflow-x-auto my-3">
                                        <table className="w-full text-xs border-collapse border border-(--accent)/20 rounded-xl overflow-hidden" {...props} />
                                    </div>
                                ),
                                thead: ({ ...props }) => <thead className="bg-(--accent)/10" {...props} />,
                                tr: ({ ...props }) => <tr className="border-b border-(--accent)/10" {...props} />,
                                th: ({ ...props }) => <th className="px-3 py-2 text-left font-bold text-(--text-h) border-r last:border-r-0 border-(--accent)/15" {...props} />,
                                td: ({ ...props }) => <td className="px-3 py-2 text-(--text) border-r last:border-r-0 border-(--accent)/10" {...props} />,
                            }}
                        >
                            {docs[activeTab].content}
                        </ReactMarkdown>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
