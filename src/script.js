function replateTemplate( str, data ){
    var newStr = str;
    return newStr.replace(
        /%(\w*)%/g, 
        function( m, key ){
          return data.hasOwnProperty( key ) ? data[ key ] : "";
        }
      );
}

function putDataArrayIfDataNotArray(data) {
    if (!Array.isArray(data)) {
        return [data];
    }
    else {
        return data
    }
}

function recursiveSectionsToSingleArray(s) {
    s.forEach(sElem => {
        if (sElem.sections) {
            sElem.sections.section = putDataArrayIfDataNotArray(sElem.sections.section);
            
            s = s.concat(sElem.sections.section);
            recursiveSectionsToSingleArray(sElem.sections.section);
        }
    })
    return s;
}

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
                "title": section.name, 
                "type": "Other",
                "priority": "Medium",
                "preconds": section.description ?? "",
            }];
            section.cases.case[0].custom = {};
            section.cases.case[0].custom.steps_separated = {};
            section.cases.case[0].custom.steps_separated.step = [];
        }
        section.cases.case.forEach(c => {
            var isFirstRowOfCase = true;
            
            if (c.custom.steps_separated) {
                c.custom.steps_separated.step = putDataArrayIfDataNotArray(c.custom.steps_separated.step);
            } else {c.custom.steps_separated = { "step": [{
                "title": c.title, 
                "type": c.type,
                "priority": c.priority,
                "preconds": c.custom.preconds ?? "",
                "expected": "", 
                "content": ""
            }] } }

            c.custom.steps_separated.step.forEach(step => {
                if (isFirstRowOfCase) {
                    csv += replateTemplate(csvRowTemplate, {
                        "title": c.title, 
                        "type": c.type,
                        "priority": c.priority,
                        "preconds": c.custom.preconds ?? "",
                        "expected": step.expected ? step.expected.replace("\n", "\\n") : "", 
                        "content": step.content ?? ""
                    });
                    isFirstRowOfCase = false;
                }
                else {
                    csv += replateTemplate(csvRowTemplate, {
                        "expected": step.expected ? step.expected.replace("\n", "\\n") : "", 
                        "content": step.content ?? ""
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

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(e) {
        const xmlString = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const jsonString = xml2json(xmlDoc,'');
        //console.log(jsonString);
        const csvData = createCsvData(jsonString[1]);
        const textareaElement = document.getElementById('textArea');
        textareaElement.value = csvData;

        const textareaJsonElement = document.getElementById('textAreaJson');
        textareaJsonElement.value = jsonString[1];

        downloadCSV(csvData,"converted_test_suite")
    }
    
    reader.readAsText(file);
  }
  
  function handleButtonClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/xml';
  
    input.onchange = handleFileSelect;
  
    input.click();
  }
  