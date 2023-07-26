
function createCsvData(jsonString) {
    var json = JSON.parse(jsonString);
    const csvHeader = '"Title","Type","Priority","Precondition","Steps (Expected Result)","Steps (Step)"\n';
    const csvRowTemplate = '"%title%","%type%","%priority%","%preconds%","%expected%","%content%"\n';
    var csv = csvHeader;

    json.suite.sections.section = putDataArrayIfDataNotArray(json.suite.sections.section);
    json.suite.sections.section = recursiveSectionsToSingleArray(json.suite.sections.section);
    json.suite.sections.section.forEach(section => {
        if (section.cases) {
            section.cases.case = putDataArrayIfDataNotArray(section.cases.case);
        }
        else {
            section.cases = {};
            section.cases.case = [{
                "title": section.name.replaceAll("\"", "\\\""), 
                "type": "Other",
                "priority": "Medium",
                //"preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            }];
            section.cases.case[0].custom = {
                "preconds": section.description ? section.description.replaceAll("\"", "\\\"") : "",
            };
        }
        section.cases.case.forEach(c => {
            var isFirstRowOfCase = true;
            
            if (c.custom.steps_separated) {
                c.custom.steps_separated.step = putDataArrayIfDataNotArray(c.custom.steps_separated.step);
            } else {c.custom.steps_separated = { "step": [{
                "title": c.title.replaceAll("\"", "\\\""), 
                "type": c.type,
                "priority": c.priority,
                "preconds": c.custom.preconds ? c.custom.preconds.replaceAll("\"", "\\\"") : ( 
                        section.description ? section.description.replaceAll("\"", "\\\"") : ""),
                "expected": "", 
                "content": ""
            }] } }

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

function downloadCSV(data, filename) {
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
    const link = document.createElement('a');
    link.setAttribute('href', csvData);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
