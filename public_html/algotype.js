var Algotype = {};

// The string beginning the comments of the algorithm declaration.
Algotype.ALGORITHM_HEADER_COMMENT_TAG = "#";

// The string beginning the step comments. 
Algotype.ALGORITHM_STEP_COMMENT_TAG = "##";

// The width of code line numbers. This default works well. If you, however, 
// need to typeset an algorithm with at least 100 rows (in which case the space
// is tight) just increase this constant.
Algotype.LINE_NUMBER_WIDTH = 25;

// The indentation in pixels.
Algotype.INDENTATION_WIDTH = 25;

// Number of pixels between the line number span and the pseudocode span.
Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE = 8;

// The URL from which to download the MathJax math typesetting facilities.
Algotype.MATHJAX_SCRIPT_URL = 
    "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_CHTML";
    
// Configuration for MathJax. This provides in the pseudocode macros for such
// keywords as 'and', 'or', 'not', and others, with the font that matches the 
// actual keywords, such as 'for each', 'repeat ... until', etc.
Algotype.MATHJAX_CONFIG =
        'MathJax.Hub.Config({' + 
        "tex2jax: {inlineMath: [['$','$']]}," +
        'TeX: {' + 
            'Macros: {' +
                'And:     "\\\\mathbf{and}",'    +
                'Or:      "\\\\mathbf{or}",'     +
                'Not:     "\\\\mathbf{not}",'    +
                'Is:      "\\\\mathbf{is}",'     +
                'In:      "\\\\mathbf{in}",'     +
                'Mapped:  "\\\\mathbf{mapped}"'  +
            '}' +
        '}' +
    '});';
    
Algotype.MATHJAX_CONFIG_MIME_TYPE = "text/x-mathjax-config";

Algotype.UNNAMED_ALGORITHM = "UnnamedAlgorithm";
    
Algotype.loadMathJax = function() {
    // Load the MathJax.
    var importedScript = document.createElement("script");
    importedScript.async = "true";
    importedScript.src = Algotype.MATHJAX_SCRIPT_URL;
    document.head.appendChild(importedScript);
    
    // Make MathJax process the configuration.
    var mathJaxSettingsScript = document.createElement("script");
    mathJaxSettingsScript.type = Algotype.MATHJAX_CONFIG_MIME_TYPE;
    mathJaxSettingsScript.innerHTML = Algotype.MATHJAX_CONFIG;
    document.head.appendChild(mathJaxSettingsScript);
};

Algotype.getAlgorithmHeaderComment = function (algorithmElement) {
    var algorithmHeaderComment = 
            algorithmElement.getAttribute("comment");
    
    if (!algorithmHeaderComment) {
        return "";
    }
    
    return " " +
            Algotype.ALGORITHM_HEADER_COMMENT_TAG + 
            " " + algorithmHeaderComment;
};

Algotype.getAlgorithmParameterList = function(algorithmElement) {
    var algorithmParameterList = 
            algorithmElement.getAttribute("parameters") || "";
    
    algorithmParameterList = algorithmParameterList.trim();
    
    if (!algorithmParameterList) {
        return "$()$";
    }
    
    // Remove the beginning parenthesis, if present.
    if (algorithmParameterList[0] === "(") {
        algorithmParameterList = 
                algorithmParameterList.substring(1, 
                                                 algorithmParameterList.length);
    }
    
    // Remove the ending parenthesis, if present.
    if (algorithmParameterList[algorithmParameterList - 1] === ")") {
        algorithmParameterList.substring(0, algorithmParameterList.length - 1);
    }
    
    // Remove possible leading and trailing space within the parentheses.
    algorithmParameterList = algorithmParameterList.trim();
    
    // Split the string into parameter tokens.
    var algorithmParameters = algorithmParameterList.split(/\s*,\s*|\s+/);
    
    // Construct the TeX for the algorithm parameter list.
    var tex = "$(";
    var separator = "";
    
    for (var i = 0; i < algorithmParameters.length; ++i) {
        tex += separator;
        tex += algorithmParameters[i];
        separator = ", ";
    }
    
    return tex + ")$";
};

Algotype.typesetStep = function(stepElement, state) {
    var stepText = stepElement.innerHTML;
    var inTeX = false;
    var inCall = false;
    var htmlText = "";
    var call = "";
    var previousCharacter = "";
    
    for (var i = 0; i < stepText.length; ++i) {
        var character = stepText[i];
        
        switch (character) {
            case '$':
                if (!inTeX) {
                    htmlText += "<b>" + call + "</b>";
                    inTeX = true;
                } else {
                    inTeX = false;
                }
                
                htmlText += "$";
                break;
               
            default:
                
                if (inTeX) {
                    htmlText += character;
                } else {
                    call += character;
                }
        }
        
        previousCharacter = character;
    }
    
    alert("step: " + htmlText);
    
    htmlText = "<table class='algotype-code-row-table'>\n" + 
               "<tbody class='algotype-code-row-tbody'>\n" +
               "<tr class='algotype-algorithm-line'>\n" +
               "<td class='algotype-algorithm-line-number'>" +
               state["lineNumber"] +
               "</td> " +
               "<td class='algorithm-line-number-space' width='" +
               (Algotype.INDENTATION_WIDTH * state["indentation"] +
                Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
               "px'>" +
               "</td> " +
               "<td>" + 
               htmlText +
               "</td> " +
               "</tr>\n" +
               "</tbody>\n" +
               "</table>\n";
       
    return htmlText;
};

Algotype.typesetForEach = function(forEachElement, state) {
    var conditionTeX = forEachElement.getAttribute("condition") || "";
    conditionTeX = conditionTeX.trim();
    
    if (conditionTeX[0] !== "$") {
        conditionTeX = "$\\;" + conditionTeX;
    }
    
    if (conditionTeX[conditionTeX.length - 1] !== "$") {
        conditionTeX += "$";
    }
    
    var htmlText = "<table class='algotype-code-row-table'>\n" +
                   "<tbody class='algotype-code-row-tbody'>\n" +
                   "<tr class='algotype-algorithm-line'>\n" +
                   "<td class='algotype-algorithm-line-number'>" +
                   state["lineNumber"] +
                   "</td> " +
                   "<td class='algorithm-line-number-space' width='" + 
                   (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                    Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                   "px'>" +
                   "</td> " +
                   "<td class='algotype-text algotype-keyword'>for each " + 
                   conditionTeX + 
                   ":</td> " +
                   "</tr>\n" +
                   "</tbody>\n" +
                   "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = forEachElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        
        switch (elementName) {
            case "alg-foreach":
                htmlText += Algotype.typesetForEach(childElements[i], state);
                break;
                
            case "alg-step":
                htmlText += Algotype.typesetStep(childElements[i], state);
                break;
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetAlgorithm = function(algorithmElement) {
    var algorithmName =
            algorithmElement.getAttribute("name") || Algotype.UNNAMED_ALGORITHM;
    
    var algorithmParameterList = 
            Algotype.getAlgorithmParameterList(algorithmElement);
    
    var commentText = Algotype.getAlgorithmHeaderComment(algorithmElement);
    
    var parentNode = algorithmElement.parentNode;

    var htmlText = 
            "<span class='algotype-text algotype-algorithm-name'>" +
            algorithmName +
            "</span>" + algorithmParameterList + 
            commentText +
            "<br/>";
    
    var childElements = algorithmElement.children;
    
    var state = {
        lineNumber: 8,
        indentation: 0
    };
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        
        switch (elementName) {
            case "alg-foreach":
                htmlText += Algotype.typesetForEach(childElements[i], state);
                break;
                
            case "alg-return":
                break;
               
        }
    }
    
    var paragraphElement = document.createElement("p");
    paragraphElement.style.textAlign = "left";
    paragraphElement.innerHTML = htmlText;
    parentNode.appendChild(paragraphElement);
};

Algotype.setup = function() {
    // Load MathJax.
    Algotype.loadMathJax();
    
    // Create the Algotype.js specific tags.
    document.registerElement("alg-algorithm");
    document.registerElement("alg-foreach");
    document.registerElement("alg-return");
    document.registerElement("alg-step");
    document.registerElement("alg-call");
    
    // Typeset all algorithms present in the DOM.
    var algorithmList = document.getElementsByTagName("alg-algorithm");
    
    for (var i = 0; i < algorithmList.length; ++i) {
        Algotype.typesetAlgorithm(algorithmList[i]);
    }
};

var oldOnloadHandler = window.onload;

window.onload = function() {
    if (oldOnloadHandler) {
        oldOnloadHandler();
    }
    
    Algotype.setup();
};