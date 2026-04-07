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
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

function AVL(am, w, h) {
    this.init(am, w, h);
    this.treeType = "AVL";
}

AVL.prototype = new Algorithm();
AVL.prototype.constructor = AVL;
AVL.superclass = Algorithm.prototype;

// 1. Injeta as FUNÇÕES (métodos) no protótipo para a árvore usar
Object.assign(AVL.prototype, TreeTraversals);
Object.assign(AVL.prototype, TreeSearch);
Object.assign(AVL.prototype, TreeVisuals);

// 2. Injeta as CONSTANTES estáticas direto na classe
Object.assign(AVL, TreeConstants);

// Various constants
AVL.HIGHLIGHT_LABEL_COLOR = VISUAL_CONFIG.drawingStyle.highlight;
AVL.HEIGHT_LABEL_COLOR = VISUAL_CONFIG.drawingStyle.foreground;

AVL.HSE_LABEL = 1;
AVL.HSD_LABEL = 2;
AVL.DIF_LABEL = 3;

AVL.prototype.init = function (am, w, h) {
    var sc = AVL.superclass;
    var fn = sc.init;
    this.first_print_pos_y = h - 2 * AVL.PRINT_VERTICAL_GAP;
    this.print_max = w - 10;

    fn.call(this, am, w, h);
    this.startingX = w / 2;
    this.addControls();
    this.nextIndex = 4;
    this.commands = [];
    this.cmd("CreateLabel", 0, "", 20, 10, 0);
    this.cmd("CreateLabel", 1, "", 32, 33, 0);
    this.cmd("CreateLabel", 2, "", 32, 56, 0);
    this.cmd("CreateLabel", 3, "", 32, 79, 0);
    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
    this.showFB = false;
    this.balanced = true;
    this.anima = true;
};

AVL.prototype.addControls = function () {
    this.setupBasicInputs();

    this.meuCheckbox = addCheckboxToAlgorithmBar("Mostrar fator de balanceamento");

    this.meuCheckbox.addEventListener("change", (event) => {
        this.showFB = event.target.checked;
        if (typeof gtag === "function") {
            gtag("event", "opcoes_arvore", {
                tipo_arvore: "AVL",
                acao: "fb",
                valor: this.showFB ? "mostrar" : "esconder",
            });
        }
        this.implementAction(this.traverse.bind(this), "");
    });
    addSpaceToAlgorithmBar(15);
    this.setupTraversalSelect();
};

AVL.prototype.fb = function (node) {
    var lefth = node.left ? node.left.height : 0;
    var righth = node.right ? node.right.height : 0;

    return righth - lefth;
};

AVL.prototype.traverse = function () {
    this.commands = [];

    this.traverseRec(this.treeRoot);
    return this.commands;
};

AVL.prototype.traverseRec = function (node) {
    if (node != null) {
        this.cmd("SetText", node.heightLabelID, this.showFB ? this.fb(node) : "");
        this.traverseRec(node.left);
        this.traverseRec(node.right);
    }
};

AVL.prototype.reset = function () {
    this.nextIndex = 10;
    this.treeRoot = null;
};

AVL.prototype.insertCallback = function (event) {
    var insertedValue = this.insertField.value;
    // Get text value
    insertedValue = this.normalizeNumber(insertedValue, 4);
    if (insertedValue != "") {
        // Rastreando o uso da remoção
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: "AVL",
                acao: "insercao",
                valor: insertedValue,
            });
        }
        // set text value
        this.insertField.value = "";
        this.implementAction(this.insertElement.bind(this), insertedValue);
    }
};

AVL.prototype.deleteCallback = function (event) {
    var deletedValue = this.deleteField.value;
    if (deletedValue != "") {
        deletedValue = this.normalizeNumber(deletedValue, 4);
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: "AVL",
                acao: "remocao",
                valor: deletedValue,
            });
        }
        this.deleteField.value = "";
        this.implementAction(this.deleteElement.bind(this), deletedValue);
    }
};

AVL.prototype.clearHLabels = function () {
    this.cmd("SetText", AVL.HSE_LABEL, "");
    this.cmd("SetText", AVL.HSD_LABEL, "");
    this.cmd("SetText", AVL.DIF_LABEL, "");
};

AVL.prototype.setHLabels = function (node) {
    var se = node.left ? node.left.height : 0;
    var sd = node.right ? node.right.height : 0;
    var dif = se - sd;
    if (dif < 0) dif *= -1;
    this.cmd("SetForegroundColor", AVL.DIF_LABEL, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("SetForegroundColor", AVL.HSE_LABEL, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("SetForegroundColor", AVL.HSD_LABEL, AVL.HEIGHT_LABEL_COLOR);

    this.cmd("SetText", AVL.HSE_LABEL, "Altura da subárvore esquerda: " + se);
    this.cmd("Step");
    this.cmd("SetText", AVL.HSD_LABEL, "Altura da subárvore direita: " + sd);
    this.cmd("Step");
    this.cmd("SetText", AVL.DIF_LABEL, "Diferença: " + dif);
    if (dif == 2) this.cmd("SetForegroundColor", AVL.DIF_LABEL, AVL.HIGHLIGHT_LABEL_COLOR);

    return dif;
};

AVL.prototype.insertElement = function (insertedValue) {
    this.commands = new Array();

    showValue = Utils.toShow(insertedValue);
    texto = "Inserindo elemento: " + showValue;
    this.cmd("SetText", 0, texto);
    this.cmd("Step");

    treeNodeID = this.nextIndex++;
    labelID = this.nextIndex++;
    this.cmd("CreateCircle", treeNodeID, showValue, 60, 110);
    this.cmd("CreateLabel", labelID, this.showFB ? "0" : "", 60 + AVL.LABEL_X_DELTA, 110 - AVL.LABEL_Y_DELTA);
    this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);

    this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
    this.cmd("SetHighlightColor", treeNodeID, VISUAL_CONFIG.drawingStyle.highlight);
    this.cmd("Step");

    this.highlightID = this.nextIndex++;

    if (this.treeRoot == null) {
        this.cmd("SetHighlight", treeNodeID, 1);
        texto += "\n\n   Árvore vazia!";
        this.cmd("SetText", 0, texto);

        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.startingX, AVL.STARTING_Y);
        this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, this.startingX, AVL.STARTING_Y);
        this.cmd("SetText", 0, texto);
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
        this.treeRoot = new AVLNode(insertedValue, treeNodeID, labelID, this.startingX, AVL.STARTING_Y);
        this.cmd("Move", treeNodeID, this.startingX, AVL.STARTING_Y);
        this.cmd("Move", labelID, this.startingX + AVL.LABEL_X_DELTA, AVL.STARTING_Y - AVL.LABEL_Y_DELTA);
        texto += "\n\n    ► Inserir como raiz da árvore.";
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        this.cmd("SetHighlight", treeNodeID, 0);
        // this.cmd("SetText", labelID, "0");
        this.treeRoot.height = 1;
    } else {
        var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 60, 110);
        insertElem.height = 1;
        this.anima = true;

        this.insert(insertElem, this.treeRoot);
    }

    this.cmd("SetText", 0, " ");
    return this.commands;
};

AVL.prototype.singleRotateRight = function (node) {
    var pivot = node.left; // O nó que vai subir (Verde)
    var orphan = pivot.right; // A subárvore que vai trocar de pai (Amarelo)

    // this.cmd("Step");
    this.cmd("SetText", AVL.HSE_LABEL, "► Raiz de transformação: " + Utils.toShow(node.data));

    this.cmd("Step");
    this.cmd("SetText", AVL.HSD_LABEL, "    ► Rotação Simples à Direita");
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("Step");

    if (node.parent != null) this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 1);
    this.cmd("SetEdgeHighlight", node.graphicID, pivot.graphicID, 1);
    if (orphan != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan.graphicID, 1);
    this.cmd("Step");

    if (node.parent != null) {
        this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 0);
        this.cmd("Disconnect", node.parent.graphicID, node.graphicID);
    }
    this.cmd("SetEdgeHighlight", node.graphicID, pivot.graphicID, 0);
    this.cmd("Disconnect", node.graphicID, pivot.graphicID);

    // Se existe um órfão, destaca ele e o desconecta
    if (orphan != null) {
        this.cmd("SetForegroundColor", orphan.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan.graphicID);
    }
    this.cmd("Step");

    // ==========================================
    // ==========================================
    pivot.parent = node.parent;
    if (node.parent == null) {
        this.treeRoot = pivot;
    } else {
        if (node.parent.left == node) {
            node.parent.left = pivot;
        } else {
            node.parent.right = pivot;
        }
    }

    // O nó original desce e adota o órfão à sua esquerda
    node.left = orphan;
    if (orphan != null) {
        orphan.parent = node;
    }

    // O pivô adota o nó original à sua direita
    pivot.right = node;
    node.parent = pivot;

    // ==========================================
    // CONEXAO E RESIZE DA ÁRVORE
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    if (orphan != null) {
        this.cmd("Connect", node.graphicID, orphan.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.resetHeight(node);
    this.resetHeight(pivot);
    this.resizeTree();

    // ==========================================
    //  RESTAURA VISUAL
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Disconnect", pivot.parent.graphicID, pivot.graphicID);
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.LINK_COLOR);
    }
    this.cmd("Disconnect", pivot.graphicID, node.graphicID);
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.LINK_COLOR);
    if (orphan != null) {
        this.cmd("Disconnect", node.graphicID, orphan.graphicID);
        this.cmd("Connect", node.graphicID, orphan.graphicID, TreeConstants.LINK_COLOR);
    }

    this.cmd("SetBackgroundColor", node.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", node.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetText", AVL.HSE_LABEL, "");
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.FOREGROUND_COLOR);
    if (orphan != null) {
        this.cmd("SetBackgroundColor", orphan.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan.graphicID, TreeConstants.FOREGROUND_COLOR);
    }
};

AVL.prototype.singleRotateLeft = function (node) {
    var pivot = node.right; // O nó que vai subir (Verde)
    var orphan = pivot.left; // A subárvore que vai trocar de pai (Amarelo)
    // this.cmd("Step");

    this.cmd("SetText", AVL.HSE_LABEL, "► Raiz de transformação: " + Utils.toShow(node.data));
    this.cmd("Step");

    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("SetText", AVL.HSD_LABEL, "    ► Rotação Simples à Esquerda");
    this.cmd("Step");

    if (node.parent != null) this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 1);
    this.cmd("SetEdgeHighlight", node.graphicID, pivot.graphicID, 1);
    if (orphan != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan.graphicID, 1);
    this.cmd("Step");

    if (node.parent != null) {
        this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 0);
        this.cmd("Disconnect", node.parent.graphicID, node.graphicID);
    }
    this.cmd("SetEdgeHighlight", node.graphicID, pivot.graphicID, 0);
    this.cmd("Disconnect", node.graphicID, pivot.graphicID);

    // Se existe um órfão, destaca ele e o desconecta
    if (orphan != null) {
        this.cmd("SetForegroundColor", orphan.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan.graphicID);
    }
    this.cmd("Step");

    // ==========================================
    // LÓGICA DA ROTAÇÃO
    // ==========================================
    pivot.parent = node.parent;
    if (node.parent == null) {
        this.treeRoot = pivot;
    } else {
        if (node.parent.left == node) {
            node.parent.left = pivot;
        } else {
            node.parent.right = pivot;
        }
    }

    // O nó original desce e adota o órfão à sua direita
    node.right = orphan;
    if (orphan != null) {
        orphan.parent = node;
    }

    // O pivô adota o nó original à sua esquerda
    pivot.left = node;
    node.parent = pivot;

    // ==========================================
    // CONEXAO E RESIZE DA ÁRVORE
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    if (orphan != null) {
        this.cmd("Connect", node.graphicID, orphan.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.resetHeight(node);
    this.resetHeight(pivot);
    this.resizeTree();

    // ==========================================
    // RESTAURA VISUAL
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Disconnect", pivot.parent.graphicID, pivot.graphicID);
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.LINK_COLOR);
    }
    this.cmd("Disconnect", pivot.graphicID, node.graphicID);
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.LINK_COLOR);
    if (orphan != null) {
        this.cmd("Disconnect", node.graphicID, orphan.graphicID);
        this.cmd("Connect", node.graphicID, orphan.graphicID, TreeConstants.LINK_COLOR);
    }

    this.cmd("SetBackgroundColor", node.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", node.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetText", AVL.HSE_LABEL, "");
    if (orphan != null) {
        this.cmd("SetBackgroundColor", orphan.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan.graphicID, TreeConstants.FOREGROUND_COLOR);
    }
};

AVL.prototype.getHeight = function (tree) {
    if (tree == null) {
        return 0;
    }
    return tree.height;
};

AVL.prototype.resetHeight = function (tree) {
    if (tree != null) {
        var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
        if (tree.height != newHeight) {
            tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
            //			this.cmd("SetText",tree.heightLabelID, newHeight);
        }
        this.cmd("SetText", tree.heightLabelID, this.showFB ? this.fb(tree) : "");
    }
};

AVL.prototype.doubleRotateRight = function (node) {
    var child = node.left;
    var pivot = child.right;
    var orphan1 = pivot.left;
    var orphan2 = pivot.right;
    // this.cmd("Step");

    this.cmd("SetText", AVL.HSE_LABEL, "► Raiz de transformação: " + Utils.toShow(node.data));
    this.cmd("Step");

    // Destaca o pivô que vai assumir a raiz
    this.cmd("SetText", AVL.HSD_LABEL, "    ► Rotação Dupla à Direita");
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", child.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", child.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("Step");

    // Highlight das arestas envolvidas
    if (node.parent != null) this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 1);
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.cmd("SetEdgeHighlight", child.graphicID, pivot.graphicID, 1);
    if (orphan1 != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan1.graphicID, 1);
    if (orphan2 != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan2.graphicID, 1);
    this.cmd("Step");

    // Desconecta a estrutura velha
    if (node.parent != null) {
        this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 0);
        this.cmd("Disconnect", node.parent.graphicID, node.graphicID);
    }
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 0);
    this.cmd("Disconnect", node.graphicID, child.graphicID);

    this.cmd("SetEdgeHighlight", child.graphicID, pivot.graphicID, 0);
    this.cmd("Disconnect", child.graphicID, pivot.graphicID);

    if (orphan1 != null) {
        this.cmd("SetForegroundColor", orphan1.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan1.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan1.graphicID);
    }
    if (orphan2 != null) {
        this.cmd("SetForegroundColor", orphan2.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan2.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan2.graphicID);
    }
    this.cmd("Step");

    // ==========================================
    // LÓGICA DA ROTAÇÃO DUPLA
    // ==========================================

    // O pivô sobe até o nível do avô
    pivot.parent = node.parent;
    if (node.parent == null) {
        this.treeRoot = pivot;
    } else {
        if (node.parent.left == node) {
            node.parent.left = pivot;
        } else {
            node.parent.right = pivot;
        }
    }

    // O filho esquerdo adota o órfão 1
    child.right = orphan1;
    if (orphan1 != null) orphan1.parent = child;

    // O avô (nó original) desce e adota o órfão 2
    node.left = orphan2;
    if (orphan2 != null) orphan2.parent = node;

    // O pivô adota o filho esquerdo e o avô
    pivot.left = child;
    child.parent = pivot;

    pivot.right = node;
    node.parent = pivot;

    // ==========================================
    // CONEXÃO E RESIZE DA ÁRVORE
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.cmd("Connect", pivot.graphicID, child.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.HIGHLIGHT_COLOR);

    if (orphan1 != null) {
        this.cmd("Connect", child.graphicID, orphan1.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    if (orphan2 != null) {
        this.cmd("Connect", node.graphicID, orphan2.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }

    this.resetHeight(child);
    this.resetHeight(node);
    this.resetHeight(pivot);
    this.resizeTree();

    // ==========================================
    // RESTAURA VISUAL
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Disconnect", pivot.parent.graphicID, pivot.graphicID);
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.LINK_COLOR);
    }
    this.cmd("Disconnect", pivot.graphicID, child.graphicID);
    this.cmd("Connect", pivot.graphicID, child.graphicID, TreeConstants.LINK_COLOR);

    this.cmd("Disconnect", pivot.graphicID, node.graphicID);
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.LINK_COLOR);

    if (orphan1 != null) {
        this.cmd("Disconnect", child.graphicID, orphan1.graphicID);
        this.cmd("Connect", child.graphicID, orphan1.graphicID, TreeConstants.LINK_COLOR);
        this.cmd("SetBackgroundColor", orphan1.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan1.graphicID, TreeConstants.FOREGROUND_COLOR);
    }
    if (orphan2 != null) {
        this.cmd("Disconnect", node.graphicID, orphan2.graphicID);
        this.cmd("Connect", node.graphicID, orphan2.graphicID, TreeConstants.LINK_COLOR);
        this.cmd("SetBackgroundColor", orphan2.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan2.graphicID, TreeConstants.FOREGROUND_COLOR);
    }

    this.cmd("SetBackgroundColor", node.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", node.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", child.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", child.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetText", AVL.HSE_LABEL, "");
};

AVL.prototype.doubleRotateLeft = function (node) {
    var child = node.right;
    var pivot = child.left; // O nó que vai subir
    var orphan1 = pivot.left;
    var orphan2 = pivot.right;

    // this.cmd("Step");
    this.cmd("SetText", AVL.HSE_LABEL, "► Raiz de transformação: " + Utils.toShow(node.data));

    this.cmd("Step");

    this.cmd("SetText", AVL.HSD_LABEL, "    ► Rotação Dupla à Esquerda");

    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetBackgroundColor", child.graphicID, AVL.WARNING_BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", child.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.WARNING_FOREGROUND_COLOR);
    this.cmd("Step");

    if (node.parent != null) this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 1);
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.cmd("SetEdgeHighlight", child.graphicID, pivot.graphicID, 1);
    if (orphan1 != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan1.graphicID, 1);
    if (orphan2 != null) this.cmd("SetEdgeHighlight", pivot.graphicID, orphan2.graphicID, 1);
    this.cmd("Step");

    if (node.parent != null) {
        this.cmd("SetEdgeHighlight", node.parent.graphicID, node.graphicID, 0);
        this.cmd("Disconnect", node.parent.graphicID, node.graphicID);
    }
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 0);
    this.cmd("Disconnect", node.graphicID, child.graphicID);

    this.cmd("SetEdgeHighlight", child.graphicID, pivot.graphicID, 0);
    this.cmd("Disconnect", child.graphicID, pivot.graphicID);

    if (orphan1 != null) {
        this.cmd("SetForegroundColor", orphan1.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan1.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan1.graphicID);
    }
    if (orphan2 != null) {
        this.cmd("SetForegroundColor", orphan2.graphicID, AVL.WARNING_FOREGROUND_COLOR);
        this.cmd("SetEdgeHighlight", pivot.graphicID, orphan2.graphicID, 0);
        this.cmd("Disconnect", pivot.graphicID, orphan2.graphicID);
    }
    this.cmd("Step");

    // ==========================================
    // LÓGICA DA ROTAÇÃO DUPLA
    // ==========================================

    pivot.parent = node.parent;
    if (node.parent == null) {
        this.treeRoot = pivot;
    } else {
        if (node.parent.left == node) {
            node.parent.left = pivot;
        } else {
            node.parent.right = pivot;
        }
    }

    // O avô (nó original) desce e adota o órfão 1
    node.right = orphan1;
    if (orphan1 != null) orphan1.parent = node;

    // O filho direito adota o órfão 2
    child.left = orphan2;
    if (orphan2 != null) orphan2.parent = child;

    // O pivô adota o avô e o filho direito
    pivot.left = node;
    node.parent = pivot;

    pivot.right = child;
    child.parent = pivot;

    // ==========================================
    // CONEXÃO E RESIZE DA ÁRVORE
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    this.cmd("Connect", pivot.graphicID, child.graphicID, TreeConstants.HIGHLIGHT_COLOR);

    if (orphan1 != null) {
        this.cmd("Connect", node.graphicID, orphan1.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }
    if (orphan2 != null) {
        this.cmd("Connect", child.graphicID, orphan2.graphicID, TreeConstants.HIGHLIGHT_COLOR);
    }

    this.resetHeight(node);
    this.resetHeight(child);
    this.resetHeight(pivot);
    this.resizeTree();

    // ==========================================
    // RESTAURA VISUAL
    // ==========================================
    if (pivot.parent != null) {
        this.cmd("Disconnect", pivot.parent.graphicID, pivot.graphicID);
        this.cmd("Connect", pivot.parent.graphicID, pivot.graphicID, TreeConstants.LINK_COLOR);
    }
    this.cmd("Disconnect", pivot.graphicID, node.graphicID);
    this.cmd("Connect", pivot.graphicID, node.graphicID, TreeConstants.LINK_COLOR);

    this.cmd("Disconnect", pivot.graphicID, child.graphicID);
    this.cmd("Connect", pivot.graphicID, child.graphicID, TreeConstants.LINK_COLOR);

    if (orphan1 != null) {
        this.cmd("Disconnect", node.graphicID, orphan1.graphicID);
        this.cmd("Connect", node.graphicID, orphan1.graphicID, TreeConstants.LINK_COLOR);
        this.cmd("SetBackgroundColor", orphan1.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan1.graphicID, TreeConstants.FOREGROUND_COLOR);
    }
    if (orphan2 != null) {
        this.cmd("Disconnect", child.graphicID, orphan2.graphicID);
        this.cmd("Connect", child.graphicID, orphan2.graphicID, TreeConstants.LINK_COLOR);
        this.cmd("SetBackgroundColor", orphan2.graphicID, TreeConstants.BACKGROUND_COLOR);
        this.cmd("SetForegroundColor", orphan2.graphicID, TreeConstants.FOREGROUND_COLOR);
    }

    this.cmd("SetBackgroundColor", node.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", node.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", child.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", child.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", pivot.graphicID, AVL.BACKGROUND_COLOR);
    this.cmd("SetForegroundColor", pivot.graphicID, AVL.FOREGROUND_COLOR);
    this.cmd("SetText", AVL.HSE_LABEL, "");
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// MACRO 1: Anima o círculo voltando do filho para o pai após a recursão
AVL.prototype.animateRecursionReturn = function (parent, child) {
    if (this.anima) {
        this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, child.x, child.y);
        this.cmd("Move", this.highlightID, parent.x, parent.y);
        this.showFB
            ? this.cmd("SetText", 0, "Retorno da recursão.")
            : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
        this.cmd("SetHighlight", parent.graphicID, 1);
    }
};

// MACRO 2: Anima a verificação e atualização visual do Fator de Balanceamento / Altura
AVL.prototype.animateBalanceUpdate = function (tree, sideText) {
    if (this.anima) {
        var desb = this.fb(tree);

        if (this.showFB) {
            this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
            this.cmd("Step");

            this.cmd("SetText", AVL.HSE_LABEL, sideText); // "Voltou da esquerda..." ou "Voltou da direita..."
            this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
            this.cmd("SetText", tree.heightLabelID, desb);
            if (desb == -2) desb = 2; // Mantendo sua lógica original de módulo visual
        } else {
            this.cmd("SetText", 0, "Verificação de balanceamento.");
            this.cmd("SetText", tree.heightLabelID, "");
            this.cmd("Step");
            desb = this.setHLabels(tree);
        }

        if (desb == 2) {
            this.cmd("SetBackgroundColor", tree.graphicID, AVL.BAD_BACKGROUND_COLOR);
            this.cmd("SetForegroundColor", tree.graphicID, AVL.BAD_FOREGROUND_COLOR);
        }

        this.cmd("Step");
        this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.clearHLabels();
    }
};

// MACRO 3: Trata o momento em que o FB zera (Árvore balanceada e propagação interrompida)
AVL.prototype.checkAndAnimateBalancedState = function (tree) {
    if (this.fb(tree) == 0) {
        this.balanced = true;
        if (this.anima && this.showFB) {
            this.cmd("SetText", 0, "Árvore Balanceada.");
            this.cmd("SetHighlight", tree.graphicID, 1);
            this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);
            this.cmd("Step");
            this.cmd("SetText", AVL.HSE_LABEL, "FB = 0, altura da subárvore não aumentou.");
            this.cmd("Step");
            this.cmd("SetText", AVL.HSE_LABEL, "");
            this.cmd("SetHighlight", tree.graphicID, 0);
            this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
        }
        this.anima = false;
    }
};

AVL.prototype.insert = function (elem, tree) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("SetHighlight", elem.graphicID, 1);

    var showElemValue = Utils.toShow(elem.data);
    var showTreeValue = Utils.toShow(tree.data);

    var texto = "Inserindo elemento: " + showValue;

    if (elem.data < tree.data) {
        texto += "\n\n   " + showElemValue + " < " + showTreeValue;
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        texto += "\n\n    ► Descer para a subárvore esquerda";
    } else if (elem.data > tree.data) {
        texto += "\n\n    " + showElemValue + " > " + showTreeValue;
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        texto += "\n\n    ► Descer para a subárvore direita";
    } else {
        texto += "\n\n    " + showElemValue + " = " + showTreeValue;
        this.cmd("SetText", 0, texto);
        this.cmd("Step");

        this.cmd("SetFocus", elem.graphicID, 1);
        this.cmd("SetFocusBackgroundColor", elem.graphicID, "#F0C065");
        this.cmd("SetFocusForegroundColor", elem.graphicID, "#BA643C");

        this.cmd("SetFocus", tree.graphicID, 1);
        this.cmd("SetFocusBackgroundColor", tree.graphicID, "#F0C065");
        this.cmd("SetFocusForegroundColor", tree.graphicID, "#BA643C");

        texto += "\n\n    ► Já está na árvore.";
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        this.anima = false;
    }

    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlight", elem.graphicID, 0);
    this.cmd("SetText", 0, texto);
    texto = "Inserindo elemento: " + showValue;

    // =========================================================
    // RAMO ESQUERDO
    // =========================================================
    if (elem.data < tree.data) {
        if (tree.left == null) {
            // Inserção na folha esquerda
            this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
            var filho = this.projecaoFilhoEsquerdo(tree);
            this.cmd("Move", this.highlightID, filho[0], filho[1]);
            this.cmd("Step");

            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
            this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
            texto += "\n\n   Subárvore vazia!";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            tree.left = elem;
            elem.parent = tree;
            this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
            texto += "\n\n    ► Inserir nessa posição.";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetHighlight", elem.graphicID, 1);
            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");

            this.resizeTree();
            this.cmd("SetHighlight", elem.graphicID, 0);

            // Animação de subida (usando a macro)
            this.animateRecursionReturn(tree, elem);

            // Atualização matemática e visual
            if (tree.height < tree.left.height + 1) {
                tree.height = tree.left.height + 1;
            }
            this.animateBalanceUpdate(tree, "Voltou da esquerda, subtrai 1");
            this.checkAndAnimateBalancedState(tree);
        } else {
            // Descida recursiva à esquerda
            if (this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            this.insert(elem, tree.left);

            // Retorno da recursão
            this.animateRecursionReturn(tree, tree.left);

            // Atualização matemática e visual
            if (tree.height < tree.left.height + 1) {
                tree.height = tree.left.height + 1;
            }
            this.animateBalanceUpdate(tree, "Voltou da esquerda, subtrai 1");
            this.checkAndAnimateBalancedState(tree);

            // Checagem de Rotação
            if (
                (tree.right != null && tree.left.height > tree.right.height + 1) ||
                (tree.right == null && tree.left.height > 1)
            ) {
                this.cmd("SetText", 0, "► Desbalanceamento à esquerda detectado!");
                this.cmd("Step");
                if (elem.data < tree.left.data) {
                    this.singleRotateRight(tree);
                } else {
                    this.doubleRotateRight(tree);
                }
                this.anima = false;
                this.balanced = true;
                this.cmd("SetText", 0, "Árvore Balanceada.");
                this.clearHLabels();
                this.cmd("Step");
            }
        }
    }
    // =========================================================
    // RAMO DIREITO
    // =========================================================
    else if (elem.data > tree.data) {
        if (tree.right == null) {
            // Inserção na folha direita
            this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
            var filho = this.projecaoFilhoDireito(tree);
            this.cmd("Move", this.highlightID, filho[0], filho[1]);
            this.cmd("Step");

            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
            this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
            texto += "\n\n   Subárvore vazia!";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            tree.right = elem;
            elem.parent = tree;
            this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
            texto += "\n\n    ► Inserir nessa posição.";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetHighlight", elem.graphicID, 1);
            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");

            this.resizeTree();
            this.cmd("SetHighlight", elem.graphicID, 0);
            this.cmd("Step");

            // Animação de subida
            this.animateRecursionReturn(tree, tree.right);

            // Atualização matemática e visual
            if (tree.height < tree.right.height + 1) {
                tree.height = tree.right.height + 1;
            }
            // Na primeira inserção de folha o texto original não passava a string,
            // mas o comportamento visual é o mesmo.
            this.animateBalanceUpdate(tree, "Voltou da direita, soma 1");
            this.checkAndAnimateBalancedState(tree);
        } else {
            // Descida recursiva à direita
            if (this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            this.insert(elem, tree.right);

            // Retorno da recursão
            this.animateRecursionReturn(tree, tree.right);

            // Atualização matemática e visual
            if (tree.height < tree.right.height + 1) {
                tree.height = tree.right.height + 1;
            }
            this.animateBalanceUpdate(tree, "Voltou da direita, soma 1");
            this.checkAndAnimateBalancedState(tree);

            // Checagem de Rotação
            if (
                (tree.left != null && tree.right.height > tree.left.height + 1) ||
                (tree.left == null && tree.right.height > 1)
            ) {
                this.cmd("SetText", 0, "► Desbalanceamento à direita detectado!");
                this.cmd("Step");
                if (elem.data >= tree.right.data) {
                    this.singleRotateLeft(tree);
                } else {
                    this.doubleRotateLeft(tree);
                }
                this.balanced = true;
                this.anima = false;
                this.clearHLabels();
                this.cmd("SetText", 0, "Árvore Balanceada.");
                this.cmd("Step");
            }
        }
    }
    // ELEMENTO JÁ EXISTE
    else {
        this.cmd("SetFocus", tree.graphicID, 0);
        this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Elemento já existe!");
        this.cmd("Delete", elem.graphicID);

        // Verifica se o heightLabelID existe antes de deletar, pois na BST base pode não existir
        if (elem.heightLabelID !== undefined) {
            this.cmd("Delete", elem.heightLabelID);
        }
    }
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

AVL.prototype.insert_ok = function (elem, tree) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("SetHighlight", elem.graphicID, 1);

    showElemValue = Utils.toShow(elem.data);
    showTreeValue = Utils.toShow(tree.data);

    var texto = "Inserindo elemento: " + showValue;

    if (elem.data < tree.data) {
        texto += "\n\n   " + showElemValue + " < " + showTreeValue;
        this.cmd("SetText", 0, texto);
        this.cmd("Step");
        texto += "\n\n    ► Descer para a subárvore esquerda";
    } else {
        if (elem.data > tree.data) {
            texto += "\n\n    " + showElemValue + " > " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n    ► Descer para a subárvore direita";
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
            texto += "\n\n    ► Já está na árvore.";
            this.cmd("SetText", 0, texto);

            this.cmd("Step");
            this.anima = false;
        }
    }
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlight", elem.graphicID, 0);
    this.cmd("SetText", 0, texto);
    texto = "Inserindo elemento: " + showValue;

    if (elem.data < tree.data) {
        if (tree.left == null) {
            this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
            var filho = this.projecaoFilhoEsquerdo(tree);
            this.cmd("Move", this.highlightID, filho[0], filho[1]);
            this.cmd("Step");

            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
            this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
            texto += "\n\n   Subárvore vazia!";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            tree.left = elem;
            elem.parent = tree;
            this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
            texto += "\n\n    ► Inserir nessa posição.";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetHighlight", elem.graphicID, 1);
            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");

            this.resizeTree();

            this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, elem.x, elem.y);
            this.cmd("Move", this.highlightID, tree.x, tree.y);
            this.cmd("SetHighlight", elem.graphicID, 0);

            this.showFB
                ? this.cmd("SetText", 0, "Retorno da recursão.")
                : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
            this.cmd("Step");
            this.cmd("Delete", this.highlightID);
            this.cmd("SetHighlight", tree.graphicID, 1);

            if (tree.height < tree.left.height + 1) {
                tree.height = tree.left.height + 1;
            }
            if (this.anima) {
                this.cmd("SetText", tree.heightLabelID, this.showFB ? this.fb(tree) : "");
                if (this.showFB) {
                    this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
                    this.cmd("SetText", AVL.HSE_LABEL, "Voltou da esquerda, subtrai 1");
                    this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
                } else {
                    this.cmd("SetText", 0, "Verificação de balanceamento.");
                    this.cmd("Step");
                    this.setHLabels(tree);
                }

                this.cmd("Step");
                this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.clearHLabels();
            }
            if (this.fb(tree) == 0) {
                this.balanced = true;
                if (this.anima && this.showFB) {
                    this.cmd("SetText", 0, "Árvore Balanceada.");
                    this.cmd("SetHighlight", tree.graphicID, 1);
                    this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);

                    this.cmd("Step");

                    this.cmd("SetText", AVL.HSE_LABEL, "FB = 0. A altura total desta subárvore não aumentou.");
                    this.cmd("Step");
                    this.cmd("SetText", AVL.HSE_LABEL, "");

                    this.cmd("SetHighlight", tree.graphicID, 0);
                    this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
                }
                this.anima = false;
            }
        } else {
            if (this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            this.insert(elem, tree.left);

            if (this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
                this.cmd("Move", this.highlightID, tree.x, tree.y);
                this.showFB
                    ? this.cmd("SetText", 0, "Retorno da recursão.")
                    : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
                this.cmd("SetHighlight", tree.graphicID, 1);
            }

            if (tree.height < tree.left.height + 1) {
                tree.height = tree.left.height + 1;
            }
            if (this.anima) {
                // coloquei esse if pra fora do if de cima
                var desb = this.fb(tree);

                if (this.showFB) {
                    this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
                    this.cmd("Step");
                    this.cmd("SetText", AVL.HSE_LABEL, "Voltou da esquerda, subtrai 1");
                    this.cmd("SetText", tree.heightLabelID, desb);
                    this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
                    if (desb == -2) desb = 2;
                } else {
                    this.cmd("SetText", 0, "Verificação de balanceamento.");
                    this.cmd("SetText", tree.heightLabelID, "");
                    this.cmd("Step");
                    desb = this.setHLabels(tree);
                }
                if (desb == 2) {
                    this.cmd("SetBackgroundColor", tree.graphicID, AVL.BAD_BACKGROUND_COLOR);
                    this.cmd("SetForegroundColor", tree.graphicID, AVL.BAD_FOREGROUND_COLOR);
                }
                this.cmd("Step");
                this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.clearHLabels();
            }
            if (this.fb(tree) == 0) {
                this.balanced = true;
                if (this.anima && this.showFB) {
                    this.cmd("SetText", 0, "Árvore Balanceada.");
                    this.cmd("SetHighlight", tree.graphicID, 1);
                    this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);
                    this.cmd("Step");
                    this.cmd("SetText", AVL.HSE_LABEL, "FB = 0, altura da subárvore não aumentou.");
                    this.cmd("Step");
                    this.cmd("SetText", AVL.HSE_LABEL, "");
                    this.cmd("SetHighlight", tree.graphicID, 0);
                    this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
                }
                this.anima = false;
            }
            if (
                (tree.right != null && tree.left.height > tree.right.height + 1) ||
                (tree.right == null && tree.left.height > 1)
            ) {
                if (elem.data < tree.left.data) {
                    this.singleRotateRight(tree);
                } else {
                    this.doubleRotateRight(tree);
                }
                this.anima = false;
                this.balanced = true;
                this.cmd("SetText", 0, "Árvore Balanceada.");
                this.cmd("Step");
            }
        }
    } else {
        if (elem.data > tree.data) {
            if (tree.right == null) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
                var filho = this.projecaoFilhoDireito(tree);
                this.cmd("Move", this.highlightID, filho[0], filho[1]);
                this.cmd("Step");

                var nullID = this.nextIndex + 1;
                this.cmd("CreateLabel", nullID, "null", filho[0], filho[1]);
                this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
                texto += "\n\n   Subárvore vazia!";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                tree.right = elem;
                elem.parent = tree;
                this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
                texto += "\n\n    ► Inserir nessa posição.";
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                this.cmd("SetHighlight", elem.graphicID, 1);
                this.cmd("Delete", nullID);
                this.cmd("Delete", this.highlightID);
                this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Inserido!");

                this.resizeTree();
                this.cmd("SetHighlight", elem.graphicID, 0);
                this.cmd("Step");

                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
                this.cmd("Move", this.highlightID, tree.x, tree.y);
                this.showFB
                    ? this.cmd("SetText", 0, "Retorno da recursão.")
                    : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
                this.cmd("SetHighlight", tree.graphicID, 1);

                if (tree.height < tree.right.height + 1) {
                    tree.height = tree.right.height + 1;
                }
                if (this.anima) {
                    this.cmd("SetText", tree.heightLabelID, this.showFB ? this.fb(tree) : "");
                    if (this.showFB) {
                        this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
                    } else {
                        this.cmd("SetText", 0, "Verificação de balanceamento.");
                        this.cmd("Step");
                        this.setHLabels(tree);
                    }
                    this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
                    this.cmd("Step");
                    this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
                    this.cmd("SetHighlight", tree.graphicID, 0);
                    this.clearHLabels();
                }
                if (this.fb(tree) == 0) {
                    this.balanced = true;
                    if (this.anima && this.showFB) {
                        this.cmd("SetText", 0, "Árvore Balanceada.");
                        this.cmd("SetHighlight", tree.graphicID, 1);
                        this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);

                        this.cmd("Step");

                        this.cmd("SetText", AVL.HSE_LABEL, "FB = 0, altura da subárvore não aumentou.");
                        this.cmd("Step");
                        this.cmd("SetText", AVL.HSE_LABEL, "");

                        this.cmd("SetHighlight", tree.graphicID, 0);
                        this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
                    }
                    this.anima = false;
                }
            } else {
                if (this.anima) {
                    this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                    this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
                    this.cmd("Step");
                    this.cmd("Delete", this.highlightID);
                }

                this.insert(elem, tree.right);

                if (this.anima) {
                    this.cmd(
                        "CreateHighlightCircle",
                        this.highlightID,
                        AVL.HIGHLIGHT_COLOR,
                        tree.right.x,
                        tree.right.y,
                    );
                    this.cmd("Move", this.highlightID, tree.x, tree.y);
                    this.showFB
                        ? this.cmd("SetText", 0, "Retorno da recursão.")
                        : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                    this.cmd("Step");
                    this.cmd("Delete", this.highlightID);
                    this.cmd("SetHighlight", tree.graphicID, 1);
                }

                if (tree.height < tree.right.height + 1) {
                    tree.height = tree.right.height + 1;
                }

                if (this.anima) {
                    var desb = this.fb(tree);
                    if (this.showFB) {
                        this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
                        this.cmd("Step");
                        this.cmd("SetText", AVL.HSE_LABEL, "Voltou da direita, soma 1");
                        this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
                        this.cmd("SetText", tree.heightLabelID, desb);
                    } else {
                        this.cmd("SetText", 0, "Verificação de balanceamento.");
                        this.cmd("SetText", tree.heightLabelID, "");
                        this.cmd("Step");
                        desb = this.setHLabels(tree);
                    }
                    if (desb == 2) {
                        this.cmd("SetBackgroundColor", tree.graphicID, AVL.BAD_BACKGROUND_COLOR);
                        this.cmd("SetForegroundColor", tree.graphicID, AVL.BAD_FOREGROUND_COLOR);
                    }
                    this.cmd("Step");
                    this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
                    this.cmd("SetHighlight", tree.graphicID, 0);
                    this.clearHLabels();
                }

                if (this.fb(tree) == 0) {
                    this.balanced = true;
                    if (this.anima && this.showFB) {
                        this.cmd("SetText", 0, "Árvore Balanceada.");
                        this.cmd("SetHighlight", tree.graphicID, 1);
                        this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);
                        this.cmd("Step");
                        this.cmd("SetText", AVL.HSE_LABEL, "FB = 0, altura da subárvore não aumentou.");
                        this.cmd("Step");
                        this.cmd("SetText", AVL.HSE_LABEL, "");
                        this.cmd("SetHighlight", tree.graphicID, 0);
                        this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
                    }
                    this.anima = false;
                }
                if (
                    (tree.left != null && tree.right.height > tree.left.height + 1) ||
                    (tree.left == null && tree.right.height > 1)
                ) {
                    if (elem.data >= tree.right.data) {
                        this.singleRotateLeft(tree);
                    } else {
                        this.doubleRotateLeft(tree);
                    }
                    this.balanced = true;
                    this.anima = false;
                    this.cmd("SetText", 0, "Árvore Balanceada.");
                    this.cmd("Step");
                }
            }
        } else {
            this.cmd("SetFocus", tree.graphicID, 0);
            this.cmd("SetText", 0, "Inserindo elemento: " + showValue + " Elemento já existe!");
            this.cmd("Delete", elem.graphicID);
            this.cmd("Delete", elem.heightLabelID);
        }
    }
};

AVL.prototype.deleteElement = function (deletedValue) {
    this.commands = [];

    this.highlightID = this.nextIndex++;
    var msg = "Removendo elemento: " + Utils.toShow(deletedValue);
    this.cmd("SetText", 0, msg);
    this.cmd("Step");

    if (this.treeRoot == null) {
        var nullID = this.nextIndex + 1;
        this.cmd("CreateLabel", nullID, "null", this.startingX, AVL.STARTING_Y);
        this.cmd("SetForegroundColor", nullID, AVL.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_CIRCLE_COLOR, this.startingX, AVL.STARTING_Y);
        this.cmd("SetText", 0, msg + "\n\n    ► Árvore Vazia!");
        this.cmd("Step");

        this.cmd("Delete", nullID);
        this.cmd("Delete", this.highlightID);
    } else {
        this.anima = true;
        this.treeDelete(this.treeRoot, deletedValue);
        // this.resizeTree();
    }

    // this.cmd("Step");
    this.cmd("SetText", 0, "");

    return this.commands;
};

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// Macro para atualizar altura, exibir animações de FB e aplicar rotações
AVL.prototype._atualizaEBalanceia = function (node, sideText) {
    if (node == null) return;

    // 1. Atualiza a altura do nó
    var altEsq = this.getHeight(node.left);
    var altDir = this.getHeight(node.right);
    var novaAltura = Math.max(altEsq, altDir) + 1;
    var alturaMudou = this.getHeight(node) != novaAltura;

    node.height = novaAltura;

    // 2. Animações Didáticas de Atualização
    if (this.anima) {
        var desb = this.fb(node);
        this.cmd("SetHighlight", node.graphicID, 1);

        if (this.showFB) {
            this.cmd("SetText", 0, "Atualização do fator de balanceamento.");
            this.cmd("Step");

            if (sideText) this.cmd("SetText", AVL.HSE_LABEL, sideText);
            this.cmd("SetForegroundColor", node.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
            this.cmd("SetText", node.heightLabelID, desb);

            if (desb == -2) desb = 2; // Ajuste visual do seu framework
        } else {
            this.cmd("SetText", 0, "Verificação de balanceamento.");
            this.cmd("SetText", node.heightLabelID, "");

            this.cmd("Step");
            desb = this.setHLabels(node);
        }

        // Destaca se encontrou desbalanceamento crítico
        if (desb == 2) {
            this.cmd("SetBackgroundColor", node.graphicID, AVL.BAD_BACKGROUND_COLOR);
            this.cmd("SetForegroundColor", node.graphicID, AVL.BAD_FOREGROUND_COLOR);
        }

        this.cmd("Step");
        this.cmd("SetForegroundColor", node.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
        this.cmd("SetHighlight", node.graphicID, 0);
        this.clearHLabels();
    }

    // 3. Aplicação das Rotações (se FB > 1 ou FB < -1)
    var rot = 0;
    if (this.getHeight(node.left) - this.getHeight(node.right) > 1) {
        this.cmd("SetText", 0, "► Desbalanceamento à esquerda detectado!");
        this.cmd("Step");
        if (this.getHeight(node.left.right) > this.getHeight(node.left.left)) {
            this.doubleRotateRight(node);
        } else {
            this.singleRotateRight(node);
            rot = 1;
        }
        this.clearHLabels();
    } else if (this.getHeight(node.right) - this.getHeight(node.left) > 1) {
        this.cmd("SetText", 0, "► Desbalanceamento à direita detectado!");
        this.cmd("Step");
        if (this.getHeight(node.right.left) > this.getHeight(node.right.right)) {
            this.doubleRotateLeft(node);
        } else {
            this.singleRotateLeft(node);
            rot = 2;
        }
        this.clearHLabels();
    }

    // 4. Critério de Parada Didático (Otimização da Remoção)
    // Na remoção, se o nó assume FB = 1 ou -1, significa que a altura da subárvore
    // PERMANECEU a mesma. Logo, o resto da árvore acima dele não sentirá impacto.
    if (this.fb(node) == 1 || this.fb(node) == -1) {
        this.balanced = true; // Impede que o resto da recursão continue animando checagens inúteis
        if (this.anima && this.showFB) {
            var hnode = node;
            if (rot == 1 || rot == 2) {
                hnode = node.parent;
            }
            this.cmd("SetText", 0, "► Árvore Balanceada!");
            this.cmd("SetHighlight", hnode.graphicID, 1);
            this.cmd("SetHighlightColor", hnode.graphicID, AVL.GOOD_FOREGROUND_COLOR);
            this.cmd("Step");
            this.cmd(
                "SetText",
                AVL.HSE_LABEL,
                "FB = " + this.fb(hnode) + ". A altura total desta subárvore não diminuiu.",
            );
            this.cmd("Step");
            this.cmd("SetText", AVL.HSE_LABEL, "");
            this.cmd("SetHighlight", hnode.graphicID, 0);
            this.cmd("SetHighlightColor", hnode.graphicID, AVL.HIGHLIGHT_COLOR);
            this.anima = false; // Desliga a animação para as próximas subidas recursivas
        }
    }
};

var failRem = null;

AVL.prototype.treeDelete = function (tree, valueToDelete) {
    var leftchild = false;
    var showElemValue = Utils.toShow(valueToDelete);
    var texto = "Removendo elemento: " + showElemValue;

    if (tree != null) {
        var showTreeValue = Utils.toShow(tree.data);
        if (tree.parent != null) {
            leftchild = tree.parent.left == tree;
        }

        // --- ETAPA 1: BUSCA DO ELEMENTO ---
        this.cmd("SetHighlight", tree.graphicID, 1);
        if (valueToDelete < tree.data) {
            texto += "\n\n   " + showElemValue + " < " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Descer para a subárvore esquerda";

            if (!tree.left) {
                failRem = [tree, this.projecaoFilhoEsquerdo(tree)];
            }
        } else if (valueToDelete > tree.data) {
            texto += "\n\n    " + showElemValue + " > " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
            texto += "\n\n   ► Descer para a subárvore direita";
            if (!tree.right) {
                failRem = [tree, this.projecaoFilhoDireito(tree)];
            }
        } else {
            texto += "\n\n    " + showElemValue + " = " + showTreeValue;
            this.cmd("SetText", 0, texto);
            this.cmd("Step");

            this.cmd("SetFocus", tree.graphicID, 1);
            this.cmd("SetFocusBackgroundColor", tree.graphicID, AVL.BAD_BACKGROUND_COLOR);
            this.cmd("SetFocusForegroundColor", tree.graphicID, AVL.BAD_FOREGROUND_COLOR);

            texto += "\n\n    ► Elemento encontrado.";
            this.cmd("SetText", 0, texto);
            this.cmd("Step");
        }
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("SetText", 0, texto);
        texto = "Removendo elemento: " + showElemValue;

        // --- ETAPA 2: TRATAMENTO DA REMOÇÃO ---
        if (valueToDelete == tree.data) {
            // CASO 1: NÓ FOLHA
            if (tree.left == null && tree.right == null) {
                this.cmd("SetHighlight", tree.graphicID, 1);
                this.cmd("SetText", 0, texto + "\n\n    ► É uma folha.");
                this.cmd("Step");

                this.cmd("SetText", 0, texto + "\n\n    ► É uma folha.\n\n     ► Remover diretamente.");
                this.cmd("Step");

                this.cmd("Delete", tree.graphicID);
                this.cmd("Delete", tree.heightLabelID);

                if (leftchild && tree.parent != null) {
                    tree.parent.left = null;
                } else if (tree.parent != null) {
                    tree.parent.right = null;
                } else {
                    this.treeRoot = null;
                }
                this.cmd("SetText", 0, texto + " Removido!");

                this.resizeTree();
            }

            // CASO 2: APENAS FILHO À DIREITA
            else if (tree.left == null) {
                var compl = "";
                this.cmd("SetText", 0, texto + "\n\n    ► Não possui filho esquerdo.");
                this.cmd("Step");

                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, AVL.LINK_COLOR);
                    compl = "\n\n     ► Conectar o pai diretamente ao filho da direita.";
                } else {
                    compl = "\n\n     ► É raiz! A raiz da subárvore direita é a nova raiz da árvore.";
                }
                this.cmd("SetText", 0, texto + "\n\n    ► Não possui filho esquerdo." + compl);
                this.cmd("Step");

                this.cmd("Delete", tree.graphicID);
                this.cmd("Delete", tree.heightLabelID);
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
                this.cmd("SetText", 0, texto + " Removido!");

                this.resizeTree();
            }

            // CASO 3: APENAS FILHO À ESQUERDA
            else if (tree.right == null) {
                var compl = "";
                this.cmd("SetText", 0, texto + "\n\n    ► Não possui filho direito.");
                this.cmd("Step");

                if (tree.parent != null) {
                    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
                    this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, AVL.LINK_COLOR);
                    compl = "\n\n      ► Conectar o pai diretamente ao filho da esquerda.";
                } else {
                    compl = "\n\n      ► É raiz! A raiz da subárvore esquerda é a nova raiz da árvore.";
                }
                this.cmd("SetText", 0, texto + "\n\n    ► Não possui filho direito." + compl);
                this.cmd("Step");

                this.cmd("Delete", tree.graphicID);
                this.cmd("Delete", tree.heightLabelID);
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
                this.cmd("SetText", 0, texto + " Removido!");
                this.resizeTree();
            }

            // CASO 4: DOIS FILHOS (O MAIS COMPLEXO)
            else {
                this.cmd("SetFocusBackgroundColor", tree.graphicID, "#F0C065");
                this.cmd("SetFocusForegroundColor", tree.graphicID, "#BA643C");
                var duplotexto = texto + "\n\n    ► Possui dois filhos.";
                this.cmd("SetText", 0, duplotexto);
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("Step");

                duplotexto += "\n\n     ► Buscar o maior valor da subárvore esquerda.";
                this.cmd("SetText", 0, duplotexto);

                this.highlightID = this.nextIndex;
                this.nextIndex += 1;
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.GOOD_FOREGROUND_COLOR, tree.x, tree.y);

                var tmp = tree.left;
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
                this.cmd("SetForegroundColor", labelID, AVL.GOOD_FOREGROUND_COLOR);
                tree.data = tmp.data;
                this.cmd("Move", labelID, tree.x, tree.y);
                duplotexto += "\n\n      ► Copiar valor encontrado.";
                this.cmd("SetFocusForegroundColor", tree.graphicID, AVL.FOREGROUND_COLOR);
                this.cmd("SetText", 0, duplotexto);
                this.cmd("Step");

                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("Delete", labelID);
                this.cmd("SetText", tree.graphicID, Utils.toShow(tree.data));
                this.cmd("Delete", this.highlightID);
                this.cmd("SetFocusBackgroundColor", tmp.graphicID, VISUAL_CONFIG.drawingStyle.focusBadBackground);
                this.cmd("SetFocusForegroundColor", tmp.graphicID, VISUAL_CONFIG.drawingStyle.focusBadForeground);

                duplotexto += "\n\n       ► Remover nó substituto.";
                this.cmd("SetText", 0, duplotexto);
                this.cmd("SetFocus", tree.graphicID, 0);
                this.cmd("SetBackgroundColor", tmp.graphicID, AVL.BAD_BACKGROUND_COLOR);
                this.cmd("SetForegroundColor", tmp.graphicID, AVL.BAD_FOREGROUND_COLOR);
                this.cmd("Step");

                // Remoção física do antecessor
                var tmpParent = tmp.parent; // Guardamos o pai para iniciar a subida
                if (tmp.left == null) {
                    if (tmpParent != tree) tmpParent.right = null;
                    else tree.left = null;
                } else {
                    this.cmd("Disconnect", tmpParent.graphicID, tmp.graphicID);
                    this.cmd("Connect", tmpParent.graphicID, tmp.left.graphicID, AVL.LINK_COLOR);
                    this.cmd("Step");
                    if (tmpParent != tree) {
                        tmpParent.right = tmp.left;
                        tmp.left.parent = tmpParent;
                    } else {
                        tree.left = tmp.left;
                        tmp.left.parent = tree;
                    }
                }
                this.cmd("Delete", tmp.graphicID);
                this.cmd("Delete", tmp.heightLabelID);
                this.resizeTree();

                // LOOP DIDÁTICO: Subindo do pai do antecessor removido até o nó que assumiu o valor
                var atual = tmpParent;
                while (atual != tree) {
                    // 1. Usamos nossa nova macro para atualizar altura, exibir FB e rotacionar se precisar
                    this._atualizaEBalanceia(atual, "Voltou da direita, subtrai 1.");

                    // 2. Animação de subida para o próximo pai
                    var proximoPai = atual.parent;
                    if (this.anima && proximoPai != null) {
                        this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, atual.x, atual.y);
                        this.cmd("Move", this.highlightID, proximoPai.x, proximoPai.y);
                        this.showFB
                            ? this.cmd("SetText", 0, "Retorno da recursão.")
                            : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                        this.cmd("Step");
                        this.cmd("Delete", this.highlightID);
                    }
                    atual = proximoPai;
                }

                // Por fim, como substituímos a raiz desse passo, precisamos balancear ela também
                this._atualizaEBalanceia(tree, "Voltou da esquerda, soma 1.");
            }
        }

        // --- ETAPA 3: RECURSÃO E RETORNO (Quando não achou ainda) ---
        else if (valueToDelete < tree.data) {
            if (tree.left != null) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            this.treeDelete(tree.left, valueToDelete);

            if (tree.left != null && this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
                this.cmd("Move", this.highlightID, tree.x, tree.y);
                this.showFB
                    ? this.cmd("SetText", 0, "Retorno da recursão.")
                    : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            // O uso da macro deixa a chamada recursiva extremamente limpa!
            this._atualizaEBalanceia(tree, "Voltou da esquerda, soma 1.");
        } else {
            if (tree.right != null) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
                this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            this.treeDelete(tree.right, valueToDelete);

            if (tree.right != null && this.anima) {
                this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
                this.cmd("Move", this.highlightID, tree.x, tree.y);
                this.showFB
                    ? this.cmd("SetText", 0, "Retorno da recursão.")
                    : this.cmd("SetText", 0, "Voltando pelo mesmo caminho.");
                this.cmd("Step");
                this.cmd("Delete", this.highlightID);
            }

            // Novamente a macro resolvendo toda a lógica do retorno pela direita
            this._atualizaEBalanceia(tree, "Voltou da direita, subtrai 1.");
        }
    } else {
        this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, failRem[0].x, failRem[0].y);
        this.cmd("Move", this.highlightID, failRem[1][0], failRem[1][1]);
        this.cmd("Step");

        texto += "\n\n   Subárvore vazia!";
        this.cmd("SetText", 0, texto);
        this.cmd("CreateLabel", this.nextIndex + 1, "null", failRem[1][0], failRem[1][1]);
        this.cmd("SetForegroundColor", this.nextIndex + 1, AVL.HIGHLIGHT_CIRCLE_COLOR);
        this.cmd("Step");

        this.cmd("Delete", this.nextIndex + 1);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetText", 0, "Removendo elemento: " + showElemValue + " Não encontrado!");
        this.cmd("Step");

        this.anima = false;
    }
};
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

AVL.prototype.treeDelete_ANTES = function (tree, valueToDelete) {
    if (this.fb(tree) == 1 || this.fb(tree) == -1) {
        this.balanced = true;
        if (this.anima && this.showFB) {
            this.cmd("SetText", 0, "Árvore Balanceada.");
            this.cmd("SetHighlight", tree.graphicID, 1);
            this.cmd("SetHighlightColor", tree.graphicID, AVL.GOOD_FOREGROUND_COLOR);

            this.cmd("Step");

            this.cmd("SetText", AVL.HSE_LABEL, "FB = 1, altura da subárvore não aumentou.");
            this.cmd("Step");
            this.cmd("SetText", AVL.HSE_LABEL, "");

            this.cmd("SetHighlight", tree.graphicID, 0);
            this.cmd("SetHighlightColor", tree.graphicID, AVL.HIGHLIGHT_COLOR);
        }
        this.anima = false;
    }
};

AVL.prototype.disableUI = function (event) {
    this.insertField.disabled = true;
    this.insertButton.disabled = true;
    this.deleteField.disabled = true;
    this.deleteButton.disabled = true;
    this.findField.disabled = true;
    this.findButton.disabled = true;
    // this.printButton.disabled = true;
    this.selectionBoxList.disabled = true;
    this.meuCheckbox.disabled = true;
};

AVL.prototype.enableUI = function (event) {
    this.insertField.disabled = false;
    this.insertButton.disabled = false;
    this.deleteField.disabled = false;
    this.deleteButton.disabled = false;
    this.findField.disabled = false;
    this.findButton.disabled = false;
    // this.printButton.disabled = false;
    this.selectionBoxList.disabled = false;
    // this.selectionBoxList.value = "none";
    this.selectionBoxList.setValue(AVL.PERCURSO.NONE, false);
    this.meuCheckbox.disabled = false;
};

function AVLNode(val, id, hid, initialX, initialY) {
    this.data = val;
    this.x = initialX;
    this.y = initialY;
    this.heightLabelID = hid;
    this.height = 1;

    this.graphicID = id;
    this.left = null;
    this.right = null;
    this.parent = null;
}

AVLNode.prototype.isLeftChild = function () {
    if (this.parent == null) {
        return true;
    }
    return this.parent.left == this;
};

var currentAlg;

function init() {
    var animManag = initCanvas();
    currentAlg = new AVL(animManag, canvas.width, canvas.height);
}
