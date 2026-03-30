// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// Constants.

BST.LINK_COLOR = VISUAL_CONFIG.drawingStyle.link;
BST.HIGHLIGHT_CIRCLE_COLOR = VISUAL_CONFIG.drawingStyle.highlight;
BST.FOREGROUND_COLOR = VISUAL_CONFIG.drawingStyle.foreground;
BST.BACKGROUND_COLOR = VISUAL_CONFIG.drawingStyle.background;
BST.PRINT_COLOR = BST.FOREGROUND_COLOR;

// BST.LINK_COLOR = "#007700";
// BST.HIGHLIGHT_CIRCLE_COLOR = "#007700";
// BST.FOREGROUND_COLOR = "#007700";
// BST.BACKGROUND_COLOR = "#EEFFEE";
// BST.PRINT_COLOR = BST.FOREGROUND_COLOR;

BST.WIDTH_DELTA = 50;
BST.HEIGHT_DELTA = 50;
BST.STARTING_Y = 50;

BST.FIRST_PRINT_POS_X = 50;
BST.PRINT_VERTICAL_GAP = 20;
BST.PRINT_HORIZONTAL_GAP = 50;

BST.MAX_KEY_LENGTH = 4;

BST.PERCURSO = Object.freeze({
    NONE: "none",
    PREORDEM: "pre",
    EMORDEM: "ordem",
    POSORDEM: "pos",
    EMNIVEL: "nivel",
});

function BST(am, w, h) {
    this.init(am, w, h);
}

BST.prototype = new Algorithm();
BST.prototype.constructor = BST;
BST.superclass = Algorithm.prototype;

BST.prototype.init = function (am, w, h) {
    var sc = BST.superclass;
    this.startingX = w / 2;
    this.first_print_pos_y = h - 2 * BST.PRINT_VERTICAL_GAP;
    this.print_max = w - 30;

    var fn = sc.init;
    fn.call(this, am);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.cmd("CreateLabel", 0, "", 20, 10, 0);
    this.nextIndex = 1;
    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
    this.am = am;
};

BST.prototype.addControls = function () {
    this.insertField = addControlToAlgorithmBar("Text", "");
    this.insertField.size = BST.MAX_KEY_LENGTH;
    this.insertField.onkeydown = this.returnSubmit(
        this.insertField,
        this.insertCallback.bind(this),
        BST.MAX_KEY_LENGTH,
        true,
    );
    this.insertButton = addControlToAlgorithmBar("Button", "Inserir");
    this.insertButton.onclick = this.insertCallback.bind(this);
    addSpaceToAlgorithmBar(15);

    this.findField = addControlToAlgorithmBar("Text", "");
    this.findField.size = BST.MAX_KEY_LENGTH;
    this.findField.onkeydown = this.returnSubmit(
        this.findField,
        this.findCallback.bind(this),
        BST.MAX_KEY_LENGTH,
        true,
    );
    this.findButton = addControlToAlgorithmBar("Button", "Buscar");
    this.findButton.onclick = this.findCallback.bind(this);
    addSpaceToAlgorithmBar(15);

    this.deleteField = addControlToAlgorithmBar("Text", "");
    this.deleteField.size = BST.MAX_KEY_LENGTH;
    this.deleteField.onkeydown = this.returnSubmit(
        this.deleteField,
        this.deleteCallback.bind(this),
        BST.MAX_KEY_LENGTH,
        true,
    );
    this.deleteButton = addControlToAlgorithmBar("Button", "Remover");
    this.deleteButton.onclick = this.deleteCallback.bind(this);
    addSpaceToAlgorithmBar(55);

    // this.printButton = addControlToAlgorithmBar("Button", "Imprimir");
    // this.printButton.onclick = this.printCallback.bind(this);

    var options = [
        { value: BST.PERCURSO.NONE, text: "Percurso" },
        { value: BST.PERCURSO.PREORDEM, text: "Pré ordem" },
        { value: BST.PERCURSO.EMORDEM, text: "Em ordem" },
        { value: BST.PERCURSO.POSORDEM, text: "Pós ordem" },
    ];

    this.selectionBoxList = addCustomSelectionBoxToAlgorithmBar(options, "SelecaoPercurso2");

    this.selectionBoxList.addEventListener("change", (e) => {
        const escolha = e.detail.value;

        switch (escolha) {
            case BST.PERCURSO.EMORDEM:
                this.emOrdemCallback();
                break;
            case BST.PERCURSO.PREORDEM:
                this.preOrdemCallback();
                break;
            case BST.PERCURSO.POSORDEM:
                this.posOrdemCallback();
                break;
            case BST.PERCURSO.EMNIVEL:
                this.emNivelCallback();
                break;
            default:
                console.warn("Escolha desconhecida:", escolha);
        }
    });
};

BST.prototype.reset = function () {
    this.nextIndex = 1;
    this.treeRoot = null;
};

BST.prototype.insertCallback = function (event) {
    // console.log("ojif");
    var insertedValue = this.insertField.value;
    // Get text value
    insertedValue = this.normalizeNumber(insertedValue, 4);
    if (insertedValue != "") {
        // set text value
        this.insertField.value = "";
        this.implementAction(this.insertElement.bind(this), insertedValue);
    }
};

BST.prototype.deleteCallback = function (event) {
    var deletedValue = this.deleteField.value;
    if (deletedValue != "") {
        deletedValue = this.normalizeNumber(deletedValue, 4);
        this.deleteField.value = "";
        this.implementAction(this.deleteElement.bind(this), deletedValue);
    }
};

// BST.prototype.printCallback = function(event)
// {
// 	this.implementAction(this.printTree.bind(this),"");
// }

BST.prototype.emOrdemCallback = function (event) {
    this.implementAction(this.printTree.bind(this), BST.PERCURSO.EMORDEM);
};

BST.prototype.preOrdemCallback = function (event) {
    this.implementAction(this.printTree.bind(this), BST.PERCURSO.PREORDEM);
};

BST.prototype.posOrdemCallback = function (event) {
    this.implementAction(this.printTree.bind(this), BST.PERCURSO.POSORDEM);
};

BST.prototype.emNivelCallback = function (event) {
    this.implementAction(this.printTree.bind(this), BST.PERCURSO.EMNIVEL);
};

BST.prototype.printTree = function (percurso) {
    this.commands = [];

    if (this.treeRoot != null) {
        this.highlightID = this.nextIndex++;
        this.firstLabel = this.nextIndex;
        this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            BST.HIGHLIGHT_CIRCLE_COLOR,
            this.treeRoot.x,
            this.treeRoot.y,
        );
        this.yPosOfNextLabel = this.first_print_pos_y + 10;

        var labelPerc = this.nextIndex++;
        this.linhas = 1;
        this.recuos = [];
        switch (percurso) {
            case BST.PERCURSO.EMORDEM:
                this.cmd("CreateLabel", labelPerc, "Percurso em ordem simétrica: ", 133, this.yPosOfNextLabel);
                this.labelPosition = 133;
                this.xPosOfNextLabel = this.initialXPosition = 235;
                this.printTreeRec(this.treeRoot);
                break;
            case BST.PERCURSO.PREORDEM:
                this.cmd("CreateLabel", labelPerc, "Percurso em pré ordem: ", 115, this.yPosOfNextLabel);
                this.labelPosition = 115;
                this.xPosOfNextLabel = this.initialXPosition = 198;
                // this.preOrdemRec(this.treeRoot);
                this.preOrdemRec(this.treeRoot);

                break;
            case BST.PERCURSO.POSORDEM:
                this.cmd("CreateLabel", labelPerc, "Percurso em pós ordem: ", 115, this.yPosOfNextLabel);
                this.labelPosition = 115;
                this.xPosOfNextLabel = this.initialXPosition = 198;
                // this.posOrdemRec(this.treeRoot);
                this.posOrdemRec(this.treeRoot);

                break;
        }
        this.cmd("Delete", this.highlightID);
        this.cmd("Step");

        for (var i = this.firstLabel; i < this.nextIndex; i++) {
            this.cmd("Delete", i);
        }
        this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
        this.cmd("SetText", 0, "");
    }

    return this.commands;
};

const weights = {
    1: 0.7,
    0: 0.9,
    2: 0.8,
    3: 0.8,
    4: 0.8,
    5: 0.8,
    6: 0.8,
    7: 0.8,
    8: 0.9,
    9: 0.8,
    " ": 0.3,
};

BST.prototype.printTreeRec = function (tree) {
    this.cmd("Step");
    var esq = this.projecaoFilhoEsquerdo(tree);
    var dir = this.projecaoFilhoDireito(tree);

    /* vista esquerda */
    if (tree.left != null) {
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.printTreeRec(tree.left);
    } else {
        this.cmd("Move", this.highlightID, esq[0], esq[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    /* visita o no */

    let total = 0;
    if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
    for (let char of Utils.toShow(tree.data)) {
        total += weights[char] || 0.8;
    }
    var delta = total * 10;
    this.xPosOfNextLabel += delta;

    if (this.xPosOfNextLabel >= this.print_max) {
        var linhas = this.linhas;
        this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
        var x_pos = this.recuos[0];
        var des = 1;
        for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
            this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
            if (this.recuos[des] < this.recuos[des - 1]) {
                linhas--;
            }
            x_pos = this.recuos[des++];
        }

        this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
        this.linhas++;
    }
    this.cmd("SetFocus", tree.graphicID, 1);
    this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
    this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
    var nextLabelID = this.nextIndex++;
    this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
    this.cmd("SetForegroundColor", nextLabelID, BST.PRINT_COLOR);
    this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
    this.cmd("Step");
    this.cmd("SetFocus", tree.graphicID, 0);
    this.recuos.push(this.xPosOfNextLabel);

    // this.xPosOfNextLabel +=  BST.PRINT_HORIZONTAL_GAP;

    /* visita direita */
    if (tree.right != null) {
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.printTreeRec(tree.right);
    } else {
        this.cmd("Move", this.highlightID, dir[0], dir[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    return;
};

BST.prototype.preOrdemRec = function (tree) {
    this.cmd("Step");
    var esq = this.projecaoFilhoEsquerdo(tree);
    var dir = this.projecaoFilhoDireito(tree);

    /* visita o no */
    let total = 0;
    if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
    for (let char of Utils.toShow(tree.data)) {
        total += weights[char] || 0.8;
    }
    var delta = total * 10;
    this.xPosOfNextLabel += delta;

    if (this.xPosOfNextLabel >= this.print_max) {
        var linhas = this.linhas;
        this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
        var x_pos = this.recuos[0];
        var des = 1;
        for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
            this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
            if (this.recuos[des] < this.recuos[des - 1]) {
                linhas--;
            }
            x_pos = this.recuos[des++];
        }

        this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
        this.linhas++;
    }
    this.cmd("SetFocus", tree.graphicID, 1);
    this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
    this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
    var nextLabelID = this.nextIndex++;
    this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
    this.cmd("SetForegroundColor", nextLabelID, BST.PRINT_COLOR);
    this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
    this.cmd("Step");
    this.cmd("SetFocus", tree.graphicID, 0);
    this.recuos.push(this.xPosOfNextLabel);

    /* vista esquerda */
    if (tree.left != null) {
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.preOrdemRec(tree.left);
    } else {
        this.cmd("Move", this.highlightID, esq[0], esq[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    /* visita direita */
    if (tree.right != null) {
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.preOrdemRec(tree.right);
    } else {
        this.cmd("Move", this.highlightID, dir[0], dir[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    return;
};

BST.prototype.posOrdemRec = function (tree) {
    this.cmd("Step");
    var esq = this.projecaoFilhoEsquerdo(tree);
    var dir = this.projecaoFilhoDireito(tree);

    /* vista esquerda */
    if (tree.left != null) {
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.posOrdemRec(tree.left);
    } else {
        this.cmd("Move", this.highlightID, esq[0], esq[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    /* visita direita */
    if (tree.right != null) {
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.posOrdemRec(tree.right);
    } else {
        this.cmd("Move", this.highlightID, dir[0], dir[1]);
        this.cmd("Step");

        var nullID = this.nextIndex++;
        this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");
        this.cmd("Delete", nullID);
        this.nextIndex--;
    }
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");

    /* visita o no */
    let total = 0;
    if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
    for (let char of Utils.toShow(tree.data)) {
        total += weights[char] || 0.8;
    }
    var delta = total * 10;
    this.xPosOfNextLabel += delta;

    if (this.xPosOfNextLabel >= this.print_max) {
        var linhas = this.linhas;
        this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
        var x_pos = this.recuos[0];
        var des = 1;
        for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
            this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
            if (this.recuos[des] < this.recuos[des - 1]) {
                linhas--;
            }
            x_pos = this.recuos[des++];
        }

        this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
        this.linhas++;
    }
    this.cmd("SetFocus", tree.graphicID, 1);
    this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
    this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
    var nextLabelID = this.nextIndex++;
    this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
    this.cmd("SetForegroundColor", nextLabelID, BST.PRINT_COLOR);
    this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
    this.cmd("Step");
    this.cmd("SetFocus", tree.graphicID, 0);
    this.recuos.push(this.xPosOfNextLabel);

    return;
};

BST.prototype.findCallback = function (event) {
    if (this.findField.value != "") {
        var findValue;
        findValue = this.normalizeNumber(this.findField.value, 4);
        this.findField.value = "";
        this.implementAction(this.findElement.bind(this), findValue);
    }
};

BST.prototype.findElement = function (findValue) {
    this.commands = [];

    this.highlightID = this.nextIndex++;
    this.cmd("SetText", 0, "Buscando elemento: " + Utils.toShow(findValue));
    this.cmd("Step");

    this.doFind(this.treeRoot, findValue);

    this.cmd("Step");
    this.cmd("SetText", 0, "");

    return this.commands;
};

BST.prototype.doFind = function (tree, value) {
    showValue = Utils.toShow(value);
    var texto = "Buscando elemento: " + showValue;

    if (tree != null) {
        showTreeValue = Utils.toShow(tree.data);

        this.cmd("SetHighlight", tree.graphicID, 1);
        if (tree.data == value) {
            texto += "\n\n   " + showValue + " = " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetFocus", tree.graphicID, 1);
            this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodBackground);
            this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodForeground);
            this.cmd("SetHighlightColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodForeground);
            this.cmd("Step");

            this.cmd("SetText", 0, "Buscando elemento: " + showValue + " Encontrado!");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID, 0);
            this.cmd("SetFocus", tree.graphicID, 0);
            this.cmd("SetHighlightColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.highlight);
        } else {
            if (tree.data > value) {
                texto += "\n\n   " + showValue + " < " + showTreeValue;
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                this.cmd("SetHighlight", tree.graphicID, 0);
                texto += "\n\n   ► Descer para a subárvore esquerda";
                this.cmd("SetText", 0, texto);
                this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

                if (tree.left != null) {
                    this.nextPos = [tree.left.x, tree.left.y];
                } else {
                    this.nextPos = this.projecaoFilhoEsquerdo(tree);
                }
                this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
                this.cmd("Step");

                this.cmd("Delete", this.highlightID);
                this.doFind(tree.left, value);
            } else {
                texto += "\n\n   " + showValue + " > " + showTreeValue;
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                this.cmd("SetHighlight", tree.graphicID, 0);
                texto += "\n\n   ► Descer para a subárvore direita";
                this.cmd("SetText", 0, texto);
                this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

                if (tree.right != null) {
                    this.nextPos = [tree.right.x, tree.right.y];
                } else {
                    this.nextPos = this.projecaoFilhoDireito(tree);
                }
                this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
                this.cmd("Step");

                this.cmd("Delete", this.highlightID);
                this.doFind(tree.right, value);
            }
        }
    } else {
        texto += "\n\n   Subárvore vazia!";
        this.cmd("SetText", 0, texto);
        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.nextPos[0], this.nextPos[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            BST.HIGHLIGHT_CIRCLE_COLOR,
            this.nextPos[0],
            this.nextPos[1],
        );
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetText", 0, "Buscando elemento: " + showValue + " Não encontrado!");
    }
};

BST.prototype.projecaoFilhoEsquerdo = function (node) {
    const offset = node.rightWidth ?? BST.WIDTH_DELTA / 2;
    return [node.x - offset, node.y + BST.HEIGHT_DELTA - 1];
};

BST.prototype.projecaoFilhoDireito = function (node) {
    const offset = node.lefttWidth ?? BST.WIDTH_DELTA / 2;

    return [node.x + offset, node.y + BST.HEIGHT_DELTA + 1];
};

BST.prototype.insertElement = function (insertedValue) {
    this.commands = new Array();

    showValue = Utils.toShow(insertedValue);
    texto = "Inserindo elemento: " + showValue;
    this.cmd("SetText", 0, texto);
    this.cmd("Step");

    this.highlightID = this.nextIndex++;
    this.cmd("CreateCircle", this.nextIndex, showValue, 60, 110);
    this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
    this.cmd("SetHighlightColor", this.nextIndex, VISUAL_CONFIG.drawingStyle.highlight);
    this.cmd("Step");

    if (this.treeRoot == null) {
        this.cmd("SetHighlight", this.nextIndex, 1);
        texto += "\n\n   Subárvore vazia!";
        this.cmd("SetText", 0, texto);

        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.startingX, BST.STARTING_Y);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, this.startingX, BST.STARTING_Y);
        this.cmd("SetText", 0, texto);
        // this.cmd("Step");
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
        this.treeRoot = new BSTNode(insertedValue, this.nextIndex, this.startingX, BST.STARTING_Y);
        this.cmd("Move", this.nextIndex, this.startingX, BST.STARTING_Y);
        texto += "\n\n   ► Inserir como raiz da árvore.";
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        this.cmd("SetHighlight", this.nextIndex, 0);

        this.nextIndex++;
    } else {
        var insertElem = new BSTNode(insertedValue, this.nextIndex, 60, 110);
        this.nextIndex++;
        // this.cmd("SetHighlight", insertElem.graphicID, 1);
        this.insert(insertElem, this.treeRoot);
        this.resizeTree();
        this.cmd("SetHighlight", this.nextIndex - 1, 0);
    }

    // this.cmd("Step");
    this.cmd("SetText", 0, "");
    return this.commands;
};

BST.prototype.insert = function (elem, tree) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("SetHighlight", elem.graphicID, 1);

    showElemValue = Utils.toShow(elem.data);
    showTreeValue = Utils.toShow(tree.data);

    var texto = "Inserindo elemento: " + showValue;
    if (elem.data < tree.data) {
        texto += "\n\n   " + showElemValue + " < " + showTreeValue;
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        texto += "\n\n   ► Descer para a subárvore esquerda";
    } else {
        if (elem.data > tree.data) {
            texto += "\n\n    " + showElemValue + " > " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Descer para a subárvore direita";
        } else {
            texto += "\n\n    " + showElemValue + " = " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            this.cmd("SetFocus", elem.graphicID, 1);
            // this.cmd("SetFocusBackgroundColor", elem.graphicID, VISUAL_CONFIG.drawingStyle.focusBadBackground);
            // this.cmd("SetFocusForegroundColor", elem.graphicID, VISUAL_CONFIG.drawingStyle.focusBadForeground);
            this.cmd("SetFocusBackgroundColor", elem.graphicID, "#F0C065");
            this.cmd("SetFocusForegroundColor", elem.graphicID, "#BA643C");
            this.cmd("SetFocus", tree.graphicID, 1);
            // this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusBadBackground);
            // this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusBadForeground);
            this.cmd("SetFocusBackgroundColor", tree.graphicID, "#F0C065");
            this.cmd("SetFocusForegroundColor", tree.graphicID, "#BA643C");
            texto += "\n\n   ► Já está na árvore.";
            this.cmd("SetText", 0, texto);

            this.cmd("Step");
        }
    }

    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlight", elem.graphicID, 0);
    this.cmd("SetText", 0, texto);
    texto = "Inserindo elemento: " + showValue;
    if (elem.data < tree.data) {
        this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

        if (tree.left == null) {
            var filho = this.projecaoFilhoEsquerdo(tree);
            this.cmd("Move", this.highlightID, filho[0], filho[1]);
            this.cmd("Step");

            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
            this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
            texto += "\n\n   Subárvore vazia!";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            tree.left = elem;
            elem.parent = tree;
            this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
            texto += "\n\n   ► Inserir nessa posição.";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetHighlight", elem.graphicID, 1);
            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");
        } else {
            this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
            this.cmd("Step");
            this.cmd("Delete", this.highlightID);
            this.insert(elem, tree.left);
        }
    } else {
        if (elem.data > tree.data) {
            this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

            if (tree.right == null) {
                var filho = this.projecaoFilhoDireito(tree);
                this.cmd("Move", this.highlightID, filho[0], filho[1]);
                this.cmd("Step");

                var nullID = this.nextIndex + 1;
                this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
                this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
                texto += "\n\n   Subárvore vazia!";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                tree.right = elem;
                elem.parent = tree;
                this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
                texto += "\n\n   ► Inserir nessa posição.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                this.cmd("SetHighlight", elem.graphicID, 1);
                this.cmd("Delete", nullID);
                this.cmd("Delete", this.highlightID);
                this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");
            } else {
                this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
                this.insert(elem, tree.right);
            }
        } else {
            /* é igual -- aborta */
            this.cmd("SetFocus", tree.graphicID, 0);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Elemento já existe!");
            this.cmd("Delete", elem.graphicID);
        }
    }
};

BST.prototype.deleteElement = function (deletedValue) {
    this.commands = [];
    this.cmd("SetText", 0, "Removendo elemento: " + Utils.toShow(deletedValue));
    this.cmd("Step");

    this.highlightID = this.nextIndex++;
    this.treeDelete(this.treeRoot, deletedValue);
    this.resizeTree();
    // this.cmd("Step");
    this.cmd("SetText", 0, "");

    return this.commands;
};

BST.prototype.treeDelete = function (tree, valueToDelete) {
    var leftchild = false;
    showValue = Utils.toShow(valueToDelete);
    var textobase = "Removendo elemento: " + showValue;
    var texto = textobase;

    if (tree != null) {
        showTreeValue = Utils.toShow(tree.data);
        if (tree.parent != null) {
            leftchild = tree.parent.left == tree;
        }
        this.cmd("SetHighlight", tree.graphicID, 1);
        if (valueToDelete < tree.data) {
            texto += "\n\n   " + showValue + " < " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Descer para a subárvore esquerda";
        } else if (valueToDelete > tree.data) {
            texto += "\n\n    " + showValue + " > " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Descer para a subárvore direita";
        } else {
            texto += "\n\n    " + showValue + " = " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Elemento encontrado.";
            this.cmd("SetHighlight", tree.graphicID, 0);

            this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusBadBackground);
            this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusBadForeground);
            this.cmd("SetFocus", tree.graphicID, 1);

            this.cmd("SetText", 0, texto);
            this.cmd("Step");
        }

        this.cmd("SetText", 0, texto);
        this.cmd("SetHighlight", tree.graphicID, 0);

        if (valueToDelete == tree.data) {
            if (tree.left == null && tree.right == null) {
                texto += "\n\n    ► Nó é uma folha.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                texto += "\n\n     ► Remover nó.";
                this.cmd("SetText", 0, texto);
                this.cmd("Delete", tree.graphicID);
                if (leftchild && tree.parent != null) {
                    tree.parent.left = null;
                } else if (tree.parent != null) {
                    tree.parent.right = null;
                } else {
                    this.treeRoot = null;
                }
                this.cmd("Step");
                this.cmd("SetText", 0, textobase + " Removido!");
            } else if (tree.left == null) {
                texto += "\n\n    ► Não possui filho esquerdo.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                texto += "\n\n     ► Filho direito ocupa sua posição.";
                this.cmd("SetText", 0, texto);
                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, BST.LINK_COLOR);
                    this.cmd("Step");
                    this.cmd("Delete", tree.graphicID);
                    if (leftchild) {
                        tree.parent.left = tree.right;
                    } else {
                        tree.parent.right = tree.right;
                    }
                    tree.right.parent = tree.parent;
                } else {
                    this.cmd("Delete", tree.graphicID);
                    this.treeRoot = tree.right;
                    this.treeRoot.parent = null;
                }
                this.cmd("SetText", 0, textobase + " Removido!");
            } else if (tree.right == null) {
                texto += "\n\n    ► Não possui filho direito.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                texto += "\n\n     ► Filho esquerdo ocupa sua posição.";
                this.cmd("SetText", 0, texto);
                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, BST.LINK_COLOR);
                    this.cmd("Step");
                    this.cmd("Delete", tree.graphicID);
                    if (leftchild) {
                        tree.parent.left = tree.left;
                    } else {
                        tree.parent.right = tree.left;
                    }
                    tree.left.parent = tree.parent;
                } else {
                    this.cmd("Delete", tree.graphicID);
                    this.treeRoot = tree.left;
                    this.treeRoot.parent = null;
                }
                this.cmd("SetText", 0, textobase + " Removido!");
            } else // tree.left != null && tree.right != null
            {
                this.cmd("SetFocusBackgroundColor", tree.graphicID, "#F0C065");
                this.cmd("SetFocusForegroundColor", tree.graphicID, "#BA643C");
                texto += "\n\n    ► Possui dois filhos.";
                texto += "\n\n     ► Buscar maior elemento da subárvore esquerda.";
                this.cmd("SetText", 0, texto);

                this.highlightID = this.nextIndex;
                this.nextIndex += 1;
                this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
                var tmp = tree;
                tmp = tree.left;
                this.cmd("Move", this.highlightID, tmp.x, tmp.y);
                this.cmd("Step");
                while (tmp.right != null) {
                    tmp = tmp.right;
                    this.cmd("Move", this.highlightID, tmp.x, tmp.y);
                    this.cmd("Step");
                }
                this.cmd("SetText", tree.graphicID, " ");
                var labelID = this.nextIndex;
                this.nextIndex += 1;
                this.cmd("CreateLabel", labelID, Utils.toShow(tmp.data), tmp.x, tmp.y);
                tree.data = tmp.data;
                this.cmd("Move", labelID, tree.x, tree.y);
                texto += "\n\n      ► Copiar valor encontrado.";
                this.cmd("SetFocus", tmp.graphicID, 1);
                this.cmd("SetFocusForegroundColor", tree.graphicID, BST.FOREGROUND_COLOR);

                this.cmd("SetFocusBackgroundColor", tmp.graphicID, VISUAL_CONFIG.drawingStyle.focusBadBackground);
                this.cmd("SetFocusForegroundColor", tmp.graphicID, VISUAL_CONFIG.drawingStyle.focusBadForeground);
                this.cmd("Delete", this.highlightID);

                this.cmd("SetText", 0, texto);

                this.cmd("Step");
                this.cmd("SetFocus", tree.graphicID, 0);

                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("Delete", labelID);
                this.cmd("SetText", tree.graphicID, Utils.toShow(tree.data));
                texto += "\n\n       ► Remover nó substituto.";
                this.cmd("SetText", 0, texto);

                if (tmp.left == null) {
                    if (tmp.parent != tree) {
                        tmp.parent.right = null;
                    } else {
                        tree.left = null;
                    }
                    this.cmd("Delete", tmp.graphicID);
                    // this.resizeTree();
                } else {
                    this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
                    this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, BST.LINK_COLOR);
                    this.cmd("Step");
                    this.cmd("Delete", tmp.graphicID);
                    if (tmp.parent != tree) {
                        tmp.parent.right = tmp.left;
                        tmp.left.parent = tmp.parent;
                    } else {
                        tree.left = tmp.left;
                        tmp.left.parent = tree;
                    }
                    // this.resizeTree();
                }

                this.cmd("SetText", 0, textobase + " Removido!");
            }
        } else if (valueToDelete < tree.data) {
            this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

            if (tree.left != null) {
                this.nextPos = [tree.left.x, tree.left.y];
            } else {
                this.nextPos = this.projecaoFilhoEsquerdo(tree);
            }
            this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
            this.cmd("Step");

            this.cmd("Delete", this.highlightID);
            this.treeDelete(tree.left, valueToDelete);
        } else {
            this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);

            if (tree.right != null) {
                this.nextPos = [tree.right.x, tree.right.y];
            } else {
                this.nextPos = this.projecaoFilhoDireito(tree);
            }
            this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
            this.cmd("Step");

            this.cmd("Delete", this.highlightID);

            this.treeDelete(tree.right, valueToDelete);
        }
    } else {
        texto += "\n\n   Subárvore vazia!";
        this.cmd("SetText", 0, texto);
        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.nextPos[0], this.nextPos[1]);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            BST.HIGHLIGHT_CIRCLE_COLOR,
            this.nextPos[0],
            this.nextPos[1],
        );
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetText", 0, "Removendo elemento: " + showValue + " Não encontrado!");
    }
};

BST.prototype.resizeTree = function () {
    var startingPoint = this.startingX;
    this.resizeWidths(this.treeRoot);
    if (this.treeRoot != null) {
        if (this.treeRoot.leftWidth > startingPoint) {
            startingPoint = this.treeRoot.leftWidth;
        } else if (this.treeRoot.rightWidth > startingPoint) {
            startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
        }
        this.setNewPositions(this.treeRoot, startingPoint, BST.STARTING_Y, 0);
        this.animateNewPositions(this.treeRoot);
    }
    this.cmd("Step");
};

BST.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
    if (tree != null) {
        tree.y = yPosition;
        if (side == -1) {
            xPosition = xPosition - tree.rightWidth;
        } else if (side == 1) {
            xPosition = xPosition + tree.leftWidth;
        }
        tree.x = xPosition;
        this.setNewPositions(tree.left, xPosition, yPosition + BST.HEIGHT_DELTA, -1);
        this.setNewPositions(tree.right, xPosition, yPosition + BST.HEIGHT_DELTA, 1);
    }
};
BST.prototype.animateNewPositions = function (tree) {
    if (tree != null) {
        this.cmd("Move", tree.graphicID, tree.x, tree.y);
        this.animateNewPositions(tree.left);
        this.animateNewPositions(tree.right);
    }
};

BST.prototype.resizeWidths = function (tree) {
    if (tree == null) {
        return 0;
    }
    tree.leftWidth = Math.max(this.resizeWidths(tree.left), BST.WIDTH_DELTA / 2);
    tree.rightWidth = Math.max(this.resizeWidths(tree.right), BST.WIDTH_DELTA / 2);
    return tree.leftWidth + tree.rightWidth;
};

function BSTNode(val, id, initialX, initialY) {
    this.data = val;
    this.x = initialX;
    this.y = initialY;
    this.graphicID = id;
    this.left = null;
    this.right = null;
    this.parent = null;
}

BST.prototype.disableUI = function (event) {
    this.insertField.disabled = true;
    this.insertButton.disabled = true;
    this.deleteField.disabled = true;
    this.deleteButton.disabled = true;
    this.findField.disabled = true;
    this.findButton.disabled = true;
    // this.printButton.disabled = true;
    this.selectionBoxList.disabled = true;
};

BST.prototype.enableUI = function (event) {
    this.insertField.disabled = false;
    this.insertButton.disabled = false;
    this.deleteField.disabled = false;
    this.deleteButton.disabled = false;
    this.findField.disabled = false;
    this.findButton.disabled = false;
    // this.printButton.disabled = false;
    this.selectionBoxList.disabled = false;
    // this.selectionBoxList.value = "none";
    this.selectionBoxList.setValue(BST.PERCURSO.NONE, false);
};

var currentAlg;

function init() {
    var animManag = initCanvas();
    currentAlg = new BST(animManag, canvas.width, canvas.height);
}
