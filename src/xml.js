
function createXmlData(jsonString) {

    var json = JSON.parse(jsonString);
    console.log(json);
    const projectTemplate = `{
        "folders": [],
        "testCases": []
    }`;

    const testCaseTemplate = `{
        "folder": "",
        "issues": [],
        "labels": [],
        "name": "",
        "objective": "",
        "precondition": "",
        "priority": "",
        "type": "steps",
        "testScript": { "steps": [] }
    }`;

    const stepTemplate = `{
        "index": 0,
        "description": "",
        "expectedResult": "",
        "testData": ""
    }`;

    var project = JSON.parse(projectTemplate);

    json.suite.folder=json.suite.name;
    json.suite.sections.section = putDataArrayIfDataNotArray(json.suite.sections.section);
    json.suite.sections.section = recursiveSectionsToSingleArray(json.suite.sections.section, json.suite.folder);
    project.folders.push(json.suite.folder);
    json.suite.sections.section.forEach(section => {
        project.folders.push(section.folder);
        if (section.cases) {
            section.cases.case = putDataArrayIfDataNotArray(section.cases.case);
        }
        else {
            section.cases = {};
            section.cases.case = [{
                "title": section.name.replaceAll("\"", "\\\""), 
                "type": "Other",
                "priority": "Medium",
                "folder": section.folder
                //"preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            }];
            section.cases.case[0].custom = {
                "preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            };
        }
        section.cases.case.forEach(c => {
            c.folder = section.folder;

            var caseObj = JSON.parse(testCaseTemplate);
                caseObj.folder = c.folder;
                caseObj.labels.push(c.type);
                caseObj.name = c.title;
                caseObj.priority = c.priority;
                caseObj.precondition = c.custom.preconds ? c.custom.preconds : ( 
                    section.description ? section.description : "");
                if (c.references) {
                    caseObj.issues = c.references.replaceAll(" ","").split(',');
                }
            
            if (c.custom.steps_separated) {
                c.custom.steps_separated.step = putDataArrayIfDataNotArray(c.custom.steps_separated.step);
            } else {
                c.custom.steps_separated = { "step": [] };
                if (c.custom.steps) {
                    c.custom.steps_separated.step.push({
                        "index": 1,
                        "content": c.custom.steps,
                        "expected": c.custom.expected
                    });
                }   
            };
            
            c.custom.steps_separated.step.forEach((step, index) => {
                var stepObj = JSON.parse(stepTemplate);
                stepObj.index = index;
                stepObj.description = step.content;
                stepObj.expectedResult = step.expected;
                caseObj.testScript.steps.push(stepObj);
            });
            project.testCases.push(caseObj);
        });
    });

    // Создаем корневой элемент
    var xmlDocument = document.implementation.createDocument(null, 'project', null);

    // Создаем базовые папки
    var foldersElement = xmlDocument.createElement('folders');
    project.folders.forEach(folder => {
        var folderElement = xmlDocument.createElement('folder');
        folderElement.setAttribute('fullPath', folder);
        foldersElement.appendChild(folderElement);
    });
    xmlDocument.documentElement.appendChild(foldersElement);

    var testCasesElement = xmlDocument.createElement('testCases');
    project.testCases.forEach(testCase => {
        var testCaseElement = xmlDocument.createElement('testCase');
            var testCaseFolderElement = createElementWithData(xmlDocument, 'folder', testCase.folder); 
        testCaseElement.appendChild(testCaseFolderElement);

        var testCaseIssues = xmlDocument.createElement('issues');
        testCase.issues.forEach(issue => {
            var testCaseIssuesIssue = xmlDocument.createElement('issue');
                var testCaseIssuesIssueKey = createElementWithData(xmlDocument, 'key', issue); 
            testCaseIssuesIssue.appendChild(testCaseIssuesIssueKey);
            testCaseIssues.appendChild(testCaseIssuesIssue);
        });
        testCaseElement.appendChild(testCaseIssues);

        var testCaseLabelsElement = xmlDocument.createElement('labels');
        testCase.labels.forEach(label => {
            var testCaseLabelElement = createElementWithData(xmlDocument,'label', label)
            testCaseLabelsElement.appendChild(testCaseLabelElement);
        });
        testCaseElement.appendChild(testCaseLabelsElement);

        var testCaseNameElement = createElementWithData(xmlDocument, 'name', testCase.name);
        var testCaseObjectiveElement = createElementWithData(xmlDocument, 'objective' , testCase.objective);
        var testCasePrecondElement = createElementWithData(xmlDocument, 'precondition' , testCase.precondition);
        var testCasePriorityElement = createElementWithData(xmlDocument, 'priority' , testCase.priority);
   
        testCaseElement.appendChild(testCaseNameElement);
        testCaseElement.appendChild(testCaseObjectiveElement);
        testCaseElement.appendChild(testCasePrecondElement);
        testCaseElement.appendChild(testCasePriorityElement);

        var testCaseTestScriptElement = xmlDocument.createElement('testScript');
            testCaseTestScriptElement.setAttribute("type",testCase.type);
        var testCaseTestScriptStepsElement = xmlDocument.createElement('steps');

        testCase.testScript.steps.forEach(step => {
            var testCaseTestScriptStepElement = xmlDocument.createElement('step');
                testCaseTestScriptStepElement.setAttribute('index', step.index);
            var stepDescrElement = createElementWithData(xmlDocument, 'description' , step.description);
            var stepExpectElement = createElementWithData(xmlDocument, 'expectedResult' , step.expectedResult);
            var stepTestDataElement = createElementWithData(xmlDocument, 'testData' , step.testData);
            
            testCaseTestScriptStepElement.appendChild(stepDescrElement);
            testCaseTestScriptStepElement.appendChild(stepExpectElement);
            testCaseTestScriptStepElement.appendChild(stepTestDataElement);
            testCaseTestScriptStepsElement.appendChild(testCaseTestScriptStepElement);
        });
        testCaseTestScriptElement.appendChild(testCaseTestScriptStepsElement);
        testCaseElement.appendChild(testCaseTestScriptElement);
        testCasesElement.appendChild(testCaseElement);
    });
    xmlDocument.documentElement.appendChild(testCasesElement);

    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + prettifyXml(xmlDocument);
    return xml;
}
