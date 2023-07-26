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
  