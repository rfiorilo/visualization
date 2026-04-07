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

function BST(am, w, h) {
    this.init(am, w, h);
    this.treeType = "BST";
}

BST.prototype = new Algorithm();
BST.prototype.constructor = BST;
BST.superclass = Algorithm.prototype;

// 1. Injeta as FUNÇÕES (métodos) no protótipo para a árvore usar
Object.assign(BST.prototype, TreeTraversals);
Object.assign(BST.prototype, TreeSearch);
Object.assign(BST.prototype, TreeVisuals);

// 2. Injeta as CONSTANTES estáticas direto na classe
Object.assign(BST, TreeConstants);

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
    // Monta a UI reaproveitando os blocos
    this.setupBasicInputs();
    this.setupTraversalSelect();
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
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: "BST",
                acao: "insercao",
                valor: insertedValue,
            });
        }
        // set text value
        this.insertField.value = "";
        this.implementAction(this.insertElement.bind(this), insertedValue);
    }
};

BST.prototype.deleteCallback = function (event) {
    var deletedValue = this.deleteField.value;
    if (deletedValue != "") {
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: "BST",
                acao: "remocao",
                valor: deletedValue,
            });
        }
        deletedValue = this.normalizeNumber(deletedValue, 4);
        this.deleteField.value = "";
        this.implementAction(this.deleteElement.bind(this), deletedValue);
    }
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
        texto += "\n\n   Árvore vazia!";
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

    this.highlightID = this.nextIndex++;
    var msg = "Removendo elemento: " + Utils.toShow(deletedValue);
    this.cmd("SetText", 0, msg);
    this.cmd("Step");

    if (this.treeRoot == null) {
        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.startingX, BST.STARTING_Y);
        this.cmd("SetForegroundColor", nullID, BST.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, this.startingX, BST.STARTING_Y);
        this.cmd("SetText", 0, msg + "\n\n   ► Árvore Vazia!");
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
    } else {
        this.treeDelete(this.treeRoot, deletedValue);
        this.resizeTree();
    }

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
                texto += "\n\n    ► É uma folha.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                texto += "\n\n     ► Remover diretamente.";
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
                var compl = "";

                texto += "\n\n     ► Não possui filho esquerdo.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                // texto += "\n\n     ► Conectar o pai diretamente ao filho da direita.";
                // this.cmd("SetText", 0, texto);
                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, BST.LINK_COLOR);
                    compl = "\n\n        ► Conectar o pai diretamente ao filho da direita.";
                } else {
                    compl = "\n\n        ► É raiz! A raiz da subárvore direita é a nova raiz da árvore.";
                }
                this.cmd("SetText", 0, texto + compl);

                this.cmd("Step");
                this.cmd("Delete", tree.graphicID);
                if (tree.parent != null) {
                    if (leftchild) {
                        tree.parent.left = tree.right;
                    } else {
                        tree.parent.right = tree.right;
                    }
                    tree.right.parent = tree.parent;
                } else {
                    this.treeRoot = tree.right;
                    this.treeRoot.parent = null;
                }
                this.cmd("SetText", 0, textobase + " Removido!");
            } else if (tree.right == null) {
                var compl = "";
                texto += "\n\n     ► Não possui filho direito.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                // texto += "\n\n     ► Filho esquerdo ocupa sua posição.";
                // this.cmd("SetText", 0, texto);
                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, BST.LINK_COLOR);
                    compl = "\n\n        ► Conectar o pai diretamente ao filho da esquerda.";
                } else {
                    compl = "\n\n        ► É raiz! A raiz da subárvore esquerda é a nova raiz da árvore.";
                }
                this.cmd("SetText", 0, texto + compl);

                this.cmd("Step");
                this.cmd("Delete", tree.graphicID);
                if (tree.parent != null) {
                    if (leftchild) {
                        tree.parent.left = tree.left;
                    } else {
                        tree.parent.right = tree.left;
                    }
                    tree.left.parent = tree.parent;
                } else {
                    this.treeRoot = tree.left;
                    this.treeRoot.parent = null;
                }
                this.cmd("SetText", 0, textobase + " Removido!");
            } else // tree.left != null && tree.right != null
            {
                this.cmd("SetFocusBackgroundColor", tree.graphicID, "#F0C065");
                this.cmd("SetFocusForegroundColor", tree.graphicID, "#BA643C");
                texto += "\n\n    ► Possui dois filhos.";
                texto += "\n\n     ► Buscar o maior valor da subárvore esquerda.";
                this.cmd("SetText", 0, texto);

                this.highlightID = this.nextIndex;
                this.nextIndex += 1;
                this.cmd("CreateHighlightCircle", this.highlightID, BST.GOOD_FOREGROUND_COLOR, tree.x, tree.y);
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
                this.cmd("SetForegroundColor", labelID, BST.GOOD_FOREGROUND_COLOR);
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
