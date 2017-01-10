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

Algotype.typesetStep = function(stepElement, state, isReturn) {
    var stepText = stepElement.innerHTML;
    var inTeX = false;
    var htmlText = "";
    var call = "";
    
    for (var i = 0; i < stepText.length; ++i) {
        var character = stepText[i];
        
        switch (character) {
            case '$':
                if (!inTeX) {
                    if (call) {
                        // Dump the current call.
                        htmlText += 
                            " <span " + 
                            "class='algotype-text algotype-algorithm-name'>" + 
                            call + 
                            "</span>";
                    
                        call = "";
                    }
                    
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
    }
    
    var returnHtml = "";
    
    if (isReturn === true) {
        returnHtml = "<span class='algotype-text algotype-keyword'>" +
                     "return</span> ";
    }
    
    htmlText = "<table class='algotype-code-row-table'>\n" + 
               "  <tbody class='algotype-code-row-tbody'>\n" +
               "    <tr class='algotype-algorithm-line'>\n" +
               "      <td class='algotype-algorithm-line-number'>" +
               state["lineNumber"] +
               "</td> " +
               "<td class='algorithm-line-number-space' width='" +
               (Algotype.INDENTATION_WIDTH * state["indentation"] +
                Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
               "px'></td>" +
               "<td>" + 
               (isReturn ? returnHtml : "") +
               htmlText +
               "</td>\n" +
               "    </tr>\n" +
               "  </tbody>\n" +
               "</table>\n";
       
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetReturn = function(returnElement, state) {
    return Algotype.typesetStep(returnElement, state, true);
};

Algotype.typesetBreak = function(breakElement, state) {
    var label = breakElement.innerHTML;
    
    var htmlText = 
            "<table class='algotype-code-row-table'>\n" +
            "  <tbody class='algotype-code-row-tbody'>\n" +
            "    <tr class='algotype-algorithm-line'>\n" +
            "      <td class='algotype-algorithm-line-number'>" +
            state["lineNumber"] + "</td>\n" +
            "      <td class='algorithm-line-number-space' width='" +
            (Algotype.INDENTATION_WIDTH * state["indentation"] +
             Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
            "px'></td>\n" +
            "      <td class='algotype-text algotype-keyword'>break " +
            (label ? "<span class='algotype-label'>" + label + "</span>" : "") +
            "</td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n";
    
    
    state["lineNumber"]++;
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
    
    var label = forEachElement.getAttribute("label");
    var htmlText = "";
    
    if (label) {
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += "<table class='algotype-code-row-table'>\n" +
                    "  <tbody class='algotype-code-row-tbody'\n" +
                    "    <tr class='algotype-algorithm-line'>\n" +
                    "      <td class='algotype-algorithm-line-number'></td>\n" +
                    "      <td class='algorithm-line-number-space' width='" + 
                    (Algotype.INDENTATION_WIDTH * state["indentation"] +
                     Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
                    "px'></td>\n" + 
                    "      <td class='algotype-label'>" + label + "</td>\n" +
                    "    </tr>\n" +
                    "  </tbody>\n" +
                    "</table>\n";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algorithm-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>for each " + 
                conditionTeX + 
                ":</td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = forEachElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
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
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
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
    document.registerElement("alg-for");
    document.registerElement("alg-for-downto");
    document.registerElement("alg-forever");
    document.registerElement("alg-if");
    document.registerElement("alg-elseif");
    document.registerElement("alg-else");
    document.registerElement("alg-step");
    document.registerElement("alg-return");
    document.registerElement("alg-break");
    document.registerElement("alg-continue");
    
    // Typeset all algorithms present in the DOM.
    var algorithmList = document.getElementsByTagName("alg-algorithm");
    
    for (var i = 0; i < algorithmList.length; ++i) {
        Algotype.typesetAlgorithm(algorithmList[i]);
    }
};

Algotype.dispatchTable = {};

Algotype.dispatchTable["alg-foreach"]    = Algotype.typesetForEach;
Algotype.dispatchTable["alg-for"]        = Algotype.typesetFor;
Algotype.dispatchTable["alg-for-downto"] = Algotype.typesetForDownto;
Algotype.dispatchTable["alg-forever"]    = Algotype.typesetForever;
Algotype.dispatchTable["alg-if"]         = Algotype.typesetIf;
Algotype.dispatchTable["alg-else-if"]    = Algotype.typesetElseIf;
Algotype.dispatchTable["alg-else"]       = Algotype.typesetElse;
Algotype.dispatchTable["alg-step"]       = Algotype.typesetStep;
Algotype.dispatchTable["alg-return"]     = Algotype.typesetReturn;
Algotype.dispatchTable["alg-break"]      = Algotype.typesetBreak;
Algotype.dispatchTable["alg-continue"]   = Algotype.typesetContinue;

var oldOnloadHandler = window.onload;

window.onload = function() {
    if (oldOnloadHandler) {
        oldOnloadHandler();
    }
    
    Algotype.setup();
};