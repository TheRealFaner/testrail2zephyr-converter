
function createCsvData(jsonString) {
    var json = JSON.parse(jsonString);
    const csvHeader = '"Title","Type","Priority","Precondition","Steps (Expected Result)","Steps (Step)"\n';
    const csvRowTemplate = '"%title%","%type%","%priority%","%preconds%","%expected%","%content%"\n';
    var csv = csvHeader;

    json.suite.folder=json.suite.name;
    json.suite.sections.section = putDataArrayIfDataNotArray(json.suite.sections.section);
    json.suite.sections.section = recursiveSectionsToSingleArray(json.suite.sections.section, json.suite.folder);
    json.suite.sections.section.forEach(section => {
        if (section.cases) {
            section.cases.case = putDataArrayIfDataNotArray(section.cases.case);
        }
        else {
            section.cases = {};
            section.cases.case = [{
                "title": section.name.replaceAll("\"", "\\\""), 
                "type": "Other",
                "priority": "Medium"
                //"preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            }];
            section.cases.case[0].custom = {
                "preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            };
        }
        section.cases.case.forEach(c => {
            var isFirstRowOfCase = true;
            c.folder = section.folder;
            
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
                } else {
                    c.custom.steps_separated.step.push({
                        "title": c.title.replaceAll("\"", "\\\""), 
                        "type": c.type,
                        "priority": c.priority,
                        "preconds": c.custom.preconds ? c.custom.preconds.replaceAll("\"", "\\\"") : ( 
                                section.description ? section.description.replaceAll("\"", "\\\"") : ""),
                        "expected": "", 
                        "content": ""
                    });
                }
            };

            c.custom.steps_separated.step.forEach(step => {
                if (isFirstRowOfCase) {
                    csv += replaceTemplate(csvRowTemplate, {
                        "title": c.title.replaceAll("\"", "\\\""), 
                        "type": c.type,
                        "priority": c.priority,
                        "preconds": c.custom.preconds ? c.custom.preconds.replaceAll("\"", "\\\"") : ( 
                            section.description ? section.description.replaceAll("\"", "\\\"") : ""),
                        "expected": step.expected ? step.expected.replaceAll("\n", "\\n").replaceAll("\"", "\\\"") : "", 
                        "content": step.content ? step.content.replaceAll("\"", "\\\"") : ""
                    });
                    isFirstRowOfCase = false;
                }
                else {
                    csv += replaceTemplate(csvRowTemplate, {
                        "expected": step.expected ? step.expected.replaceAll("\n", "\\n").replaceAll("\"", "\\\"") : "", 
                        "content": step.content ? step.content.replaceAll("\"", "\\\"") : ""
                    });
                }
            });
        });
    });
    return csv;
}


