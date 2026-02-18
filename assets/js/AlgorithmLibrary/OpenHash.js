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



function OpenHash(am, w, h)
{
	this.init(am, w, h);

}



var POINTER_ARRAY_ELEM_WIDTH = 65;
var POINTER_ARRAY_ELEM_HEIGHT = 40;

function inicioVetor(ts)
{
	const tela = document.getElementById("canvas");

	if (tela)
	{
		const totalWidth = ts * POINTER_ARRAY_ELEM_WIDTH;
		POINTER_ARRAY_ELEM_START_X = (tela.width - totalWidth) / 2;
	}
	else
		var POINTER_ARRAY_ELEM_START_X = 50;

	return POINTER_ARRAY_ELEM_START_X;
}


var LINKED_ITEM_HEIGHT = 40;
var LINKED_ITEM_WIDTH = 55;

var LINKED_ITEM_Y_DELTA = 65;
var LINKED_ITEM_POINTER_PERCENT = 0.25;



var INDEX_COLOR = VISUAL_CONFIG.drawingStyle.index;



OpenHash.prototype = new Hash();
OpenHash.prototype.constructor = OpenHash;
OpenHash.superclass = Hash.prototype;


OpenHash.prototype.init = function(am, w, h)
{
	var sc = OpenHash.superclass;
	var fn = sc.init;
	fn.call(this,am, w, h);
	this.nextIndex = 0;
	this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH - parseInt(VISUAL_CONFIG.textStyle.font.match(/\d+/)[0]);
	this.setup(13);
	this.animman = am;
}

OpenHash.prototype.addControls = function()
{
	OpenHash.superclass.addControls.call(this);

	// Add new controls

}

OpenHash.prototype.insertElement_ok = function(elem)
{
	this.commands = new Array();
	// var index = this.doHash(elem);
	var index = elem % this.table_size;

	var texto = "Inserindo elemento: " + String(elem);
	this.cmd("SetText", this.ExplainLabel, texto);	



	
	var node  = new LinkedListNode(elem,this.nextIndex++, 100, 75);
	this.cmd("CreateLinkedList", node.graphicID, elem, LINKED_ITEM_WIDTH, LINKED_ITEM_HEIGHT, 100, 75);
	if (this.hashTableValues[index] != null && this.hashTableValues[index] != undefined)
	{
		this.cmd("connect", node.graphicID, this.hashTableValues[index].graphicID);
		this.cmd("disconnect", this.hashTableVisual[index], this.hashTableValues[index].graphicID);				
	}
	else
	{
		this.cmd("SetNull", node.graphicID, 1);
		this.cmd("SetNull", this.hashTableVisual[index], 0);
	}
	this.cmd("connect", this.hashTableVisual[index], node.graphicID);
	node.next = this.hashTableValues[index];
	this.hashTableValues[index] = node;
	
	this.repositionList(index);
	
	// this.cmd("SetText", this.ExplainLabel, "");
	this.cmd("SetText", this.ExplainLabel, "Inserindo elemento: " + String(elem) + "  Inserido!");

	
	return this.commands;
	
}



OpenHash.prototype.insertElement = function(elem)
{
	this.commands = new Array();
	var index = elem % this.table_size;

	var texto = "Inserindo elemento: " + String(elem);
	this.cmd("SetText", this.ExplainLabel, texto);

	// this.cmd("Step");

	texto += "\n\n  " + elem + " % " + this.table_size + " = " + index;
	this.cmd("SetText", this.ExplainLabel, texto);

	var highlightID = this.nextIndex++;
	this.cmd("CreateHighlightCircle", highlightID, HIGHLIGHT_COLOR, HASH_LABEL_X + HASH_LABEL_DELTA_X, HASH_LABEL_Y);
	this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index] - 45);
	this.cmd("Step");
	

	/* cria no */
	this.cmd("Delete", highlightID);

	var node  = new LinkedListNode(elem, this.nextIndex++, 65, 85);
	this.cmd("CreateLinkedList", node.graphicID, elem, LINKED_ITEM_WIDTH, LINKED_ITEM_HEIGHT, 65, 85);
	this.cmd("SetNull", node.graphicID, 1); 
	node.next = null;

	var highlightID2 = this.nextIndex++;
	this.cmd("CreateHighlightCircle", highlightID2, HIGHLIGHT_COLOR, this.indexXPos[index], this.indexYPos[index] - 45);

	this.cmd("Step");
	this.cmd("Delete", highlightID2);
	this.nextIndex--;
	
	// this.cmd("Step");


	var compareIndex = this.nextIndex++;
	var found = false;

	if(this.hashTableValues[index] == null)
	{
		/* primeiro elemento */
		this.cmd("SetNull", this.hashTableVisual[index], 0);
		this.cmd("connect", this.hashTableVisual[index], node.graphicID);
		this.hashTableValues[index] = node;
		this.repositionList(index);
		this.cmd("SetText", this.ExplainLabel, "Inserindo elemento: " + elem + "  Inserido!");


	}
	else
	{
		this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 0);
		if (this.hashTableValues[index].data == elem)
		{
			this.cmd("SetText", this.ExplainLabel, "Inserindo elemento: " + elem + "  Elemento já existe!");
			this.cmd("Delete", node.graphicID);


			return this.commands;
		}

		var tmpPrev = this.hashTableValues[index];
		var tmp = this.hashTableValues[index].next;
		var found = false;
		while (tmp != null && !found)
		{
			this.cmd("SetHighlight", tmp.graphicID, 1);
			this.cmd("Step");
			this.cmd("SetHighlight", tmp.graphicID, 0);
			if (tmp.data == elem)
			{
				found = true;
				this.cmd("SetText", this.ExplainLabel, "Inserindo elemento: " + elem + "  Elemento já existe!");
				this.cmd("Delete", node.graphicID);
			}
			else
			{
				tmpPrev = tmp;
				tmp = tmp.next;
			}		
		}
		if (!found)
		{
			this.cmd("Connect", tmpPrev.graphicID, node.graphicID);
			tmpPrev.next = node;
			this.cmd("SetNull", tmpPrev.graphicID, 0);


			this.repositionList(index);
			this.cmd("SetText", this.ExplainLabel, "Inserindo elemento: " + elem + "  Inserido!");
		}
	}

	
	
	return this.commands;
	
}

OpenHash.prototype.repositionList = function(index)
{
	// var startX = POINTER_ARRAY_ELEM_START_X + index *POINTER_ARRAY_ELEM_WIDTH;
	var startX = inicioVetor(this.table_size) + index *POINTER_ARRAY_ELEM_WIDTH;
	var startY =  this.POINTER_ARRAY_ELEM_Y - LINKED_ITEM_Y_DELTA;
	var tmp = this.hashTableValues[index];
	while (tmp != null)
	{
		tmp.x = startX;
		tmp.y = startY;
		this.cmd("Move", tmp.graphicID, tmp.x, tmp.y);
		startY = startY - LINKED_ITEM_Y_DELTA;
		tmp = tmp.next;
	}
}



OpenHash.prototype.deleteElement = function(elem)
{
	this.commands = new Array();
	var texto = "Removendo elemento: " + String(elem);
	this.cmd("SetText", this.ExplainLabel, texto);

	// this.cmd("Step");

	// var index = this.doHash(elem);
	var index = elem % this.table_size;

	texto += "\n\n  " + elem + " % " + this.table_size + " = " + index;
	this.cmd("SetText", this.ExplainLabel, texto);


	var highlightID = this.nextIndex++;
	this.cmd("CreateHighlightCircle", highlightID, HIGHLIGHT_COLOR, HASH_LABEL_X + HASH_LABEL_DELTA_X, HASH_LABEL_Y);
	this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index] - 45);
	this.cmd("Step");
	this.cmd("Delete", highlightID);
	this.nextIndex -= 1;
	

	if (this.hashTableValues[index] == null)
	{
		this.cmd("SetText", this.ExplainLabel, "Removendo elemento: " + elem + "  Não encontrado!");
		return this.commands;
	}
	this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 1);
	this.cmd("Step");
	this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 0);
	if (this.hashTableValues[index].data == elem)
	{
		this.cmd("SetText", this.ExplainLabel, "Removendo elemento: " + elem + "  Removido!");

		if (this.hashTableValues[index].next != null)
		{
			this.cmd("Connect", this.hashTableVisual[index], this.hashTableValues[index].next.graphicID);
		}
		else
		{
			this.cmd("SetNull", this.hashTableVisual[index], 1);
		}
		this.cmd("Delete", this.hashTableValues[index].graphicID);
		this.hashTableValues[index] = this.hashTableValues[index].next;
		this.repositionList(index);
		return this.commands;
	}
	var tmpPrev = this.hashTableValues[index];
	var tmp = this.hashTableValues[index].next;
	var found = false;
	while (tmp != null && !found)
	{
		this.cmd("SetHighlight", tmp.graphicID, 1);
		this.cmd("Step");
		this.cmd("SetHighlight", tmp.graphicID, 0);
		if (tmp.data == elem)
		{
			found = true;
			this.cmd("SetText", this.ExplainLabel, "Removendo elemento: " + elem + "  Removido!");
			if (tmp.next != null)
			{
				this.cmd("Connect", tmpPrev.graphicID, tmp.next.graphicID);
			}
			else
			{
				this.cmd("SetNull", tmpPrev.graphicID, 1);
			}
			tmpPrev.next = tmpPrev.next.next;
			this.cmd("Delete", tmp.graphicID);
			this.repositionList(index);
		}
		else
		{
			tmpPrev = tmp;
			tmp = tmp.next;
		}		
	}
	if (!found)
	{
		this.cmd("SetText", this.ExplainLabel, "Removendo elemento: " + elem + "  Não encontrado!");
	}
	
	return this.commands;
	
}
OpenHash.prototype.findElement = function(elem)
{
	this.commands = new Array();
	var texto = "Buscando elemento: " + String(elem);
	this.cmd("SetText", this.ExplainLabel, texto);

	// this.cmd("Step");

	// var index = this.doHash(elem);
	var index = elem % this.table_size;

	texto += "\n\n  " + elem + " % " + this.table_size + " = " + index;
	this.cmd("SetText", this.ExplainLabel, texto);

	var highlightID = this.nextIndex++;
	this.cmd("CreateHighlightCircle", highlightID, HIGHLIGHT_COLOR, HASH_LABEL_X + HASH_LABEL_DELTA_X, HASH_LABEL_Y);
	this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index] - 45);
	this.cmd("Step");
	this.cmd("Delete", highlightID);
	this.nextIndex -= 1;


	// var compareIndex = this.nextIndex++;
	var found = false;
	var tmp = this.hashTableValues[index];
	// this.cmd("CreateLabel", compareIndex, "", 10, 40, 0);
	var msg = ""
	while (tmp != null && !found)
	{
		this.cmd("SetHighlight", tmp.graphicID, 1);
		if (tmp.data == elem)
		{
			// this.cmd("SetText", compareIndex,  tmp.data  + "==" + elem)
			msg =  "\n\n    " + tmp.data  + " == " + elem;
			found = true;
		}
		else
		{
			// this.cmd("SetText", compareIndex,  tmp.data  + "!=" + elem)
			msg =  "\n\n    " + tmp.data  + " != " + elem;

		}
		this.cmd("SetText", this.ExplainLabel, texto + msg);

		this.cmd("Step");
		this.cmd("SetHighlight", tmp.graphicID, 0);
		tmp = tmp.next;
	}
	if (found)
	{
		this.cmd("SetText", this.ExplainLabel, "Buscando elemento: " + elem+ "  Encontrado!")				
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Buscando elemento: " + elem + "  Não encontrado!")
		
	}
	// this.cmd("Delete", compareIndex);
	// this.nextIndex--;
	return this.commands;
}


OpenHash.prototype.tableSize = function(newSize)
{
    newSize = parseInt(newSize);

    this.animman.resetAll();
	this.setup(newSize);

};




OpenHash.prototype.setup = function(ts)
{
	this.table_size = ts;

	this.HASH_FUNCTION = "h(x) = x % " + ts

	this.hashTableVisual = new Array(this.table_size);
	this.hashTableIndices = new Array(this.table_size);
	this.hashTableValues = new Array(this.table_size);
	
	this.indexXPos = new Array(this.table_size);
	this.indexYPos = new Array(this.table_size);
	
	this.ExplainLabel = this.nextIndex++;
	this.FunctionLabel = this.nextIndex++;
	

	this.commands = [];
	for (var i = 0; i < this.table_size; i++)
	{
		var nextID  = this.nextIndex++;
		
		// this.cmd("CreateRectangle", nextID, "", POINTER_ARRAY_ELEM_WIDTH, POINTER_ARRAY_ELEM_HEIGHT, POINTER_ARRAY_ELEM_START_X + i *POINTER_ARRAY_ELEM_WIDTH, this.POINTER_ARRAY_ELEM_Y)
		this.cmd("CreateRectangle", nextID, "", POINTER_ARRAY_ELEM_WIDTH, POINTER_ARRAY_ELEM_HEIGHT, inicioVetor(this.table_size) + i *POINTER_ARRAY_ELEM_WIDTH, this.POINTER_ARRAY_ELEM_Y)
		this.hashTableVisual[i] = nextID;
		this.cmd("SetNull", this.hashTableVisual[i], 1);
		
		nextID = this.nextIndex++;
		this.hashTableIndices[i] = nextID;
		// this.indexXPos[i] =  POINTER_ARRAY_ELEM_START_X + i *POINTER_ARRAY_ELEM_WIDTH;
		this.indexXPos[i] =  inicioVetor(this.table_size) + i *POINTER_ARRAY_ELEM_WIDTH;
		this.indexYPos[i] = this.POINTER_ARRAY_ELEM_Y + POINTER_ARRAY_ELEM_HEIGHT
		this.hashTableValues[i] = null;
		
		this.cmd("CreateLabel", nextID, i,this.indexXPos[i],this.indexYPos[i] );
		this.cmd("SetForegroundColor", nextID, INDEX_COLOR);
	}
	this.cmd("CreateLabel", this.ExplainLabel, "", 20, 10, 0);

	const tela = document.getElementById("canvas");
	const ctx = tela.getContext("2d");
	ctx.font = VISUAL_CONFIG.textStyle.font;
	const totalWidth = ctx.measureText(this.HASH_FUNCTION).width

	this.cmd("CreateLabel", this.FunctionLabel, this.HASH_FUNCTION,  (tela.width - totalWidth) / 2, 10, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.resetIndex  = this.nextIndex;
}





OpenHash.prototype.resetAll = function()
{
	var tmp;
	this.commands = OpenHash.superclass.resetAll.call(this);
	for (var i = 0; i < this.hashTableValues.length; i++)
	{
		tmp = this.hashTableValues[i];
		if (tmp != null)
		{
			while (tmp != null)
			{
				this.cmd("Delete", tmp.graphicID);
				tmp = tmp.next; 
			}
			this.hashTableValues[i] = null;
			this.cmd("SetNull",  this.hashTableVisual[i], 1);
		}
	}

	return this.commands;
}



// NEED TO OVERRIDE IN PARENT
OpenHash.prototype.reset = function()
{
	for (var i = 0; i < this.table_size; i++)
	{
		this.hashTableValues[i] = null;
	}
	this.nextIndex = this.resetIndex;
	OpenHash.superclass.reset.call(this);
}


OpenHash.prototype.resetCallback = function(event)
{
	
}



/*this.nextIndex = 0;
 this.commands = [];
 this.cmd("CreateLabel", 0, "", 20, 50, 0);
 this.animationManager.StartNewAnimation(this.commands);
 this.animationManager.skipForward();
 this.animationManager.clearHistory(); */
	




OpenHash.prototype.disableUI = function(event)
{
	var sc = OpenHash.superclass;
	var fn = sc.disableUI;
	fn.call(this);
}

OpenHash.prototype.enableUI = function(event)
{
	OpenHash.superclass.enableUI.call(this);
}




function LinkedListNode(val, id, initialX, initialY)
{
	this.data = val;
	this.graphicID = id;
	this.x = initialX;
	this.y = initialY;
	this.next = null;
	
}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new OpenHash(animManag, canvas.width, canvas.height);
}
