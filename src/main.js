var file;

function handleFileSelect(event) {
  file = event.target.files[0];
}

function convert(mode) {
  const reader = new FileReader();

  reader.onload = function(e) {
      const xmlString = e.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const jsonString = xml2json(xmlDoc,'');
      //console.log(jsonString);
      var data = "";
      if (mode == 'csv') {
        data = createCsvData(jsonString[1]);
        downloadFile(data,"converted_test_suite",mode);
      }
      else if (mode == 'xml') {
        data = createXmlData(jsonString[1]);
        downloadFile(data,"converted_test_suite",mode);
      }
      const textareaElement = document.getElementById('textArea');
      textareaElement.value = data;

      const textareaJsonElement = document.getElementById('textAreaJson');
      textareaJsonElement.value = jsonString[1];

      
  }
  
  reader.readAsText(file);
}
