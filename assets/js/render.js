document.addEventListener("DOMContentLoaded", () => {

  window.Utils = {
    toShow(str) {
        str = str.trim();

        // Verifica se é número inteiro ou real (positivo ou negativo)
        if (/^-?\d+(\.\d+)?$/.test(str)) {

            // Se for número, converte e volta para string
            return String(Number(str));
        }

        // Se não for número, retorna original
        return str;
    }
  };


  /* HEAD */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "application/javascript";
        script.src = src;
        script.async = false; // importante
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    }

    async function loadEverything(structure) {

        const base = "../../assets/js/AnimationLibrary/";

        const libs = [
            "CustomEvents.js",
            "UndoFunctions.js",
            "AnimatedObject.js",
            "AnimatedLabel.js",
            "AnimatedCircle.js",
            "AnimatedRectangle.js",
            "AnimatedLinkedList.js",
            "HighlightCircle.js",
            "Line.js",
            "ObjectManager.js",
            "AnimationMain.js",
        ];

        for (const file of libs) {
            await loadScript(base + file);
        }


        await loadScript("../../assets/js/AlgorithmLibrary/Algorithm.js");
        if (structure == "OpenHash.js" || structure == "ClosedHash.js")
            await loadScript("../../assets/js/AlgorithmLibrary/Hash.js");
            
        await loadScript("../../assets/js/AlgorithmLibrary/" + structure);


        }

    function getProjectRoot() {
        const path = window.location.pathname;
        const index = path.indexOf("/visualization/");
        return path.substring(0, index + "/visualization/".length);
    }


  /* TOPBAR */
  const topbar = document.getElementById("ufmsTopBar");
  if (topbar) {
    const currentPage = window.location.pathname.split("/").pop();
    console.log(currentPage);
    let foundItem = null;
    let foundGroup = null;

    PAGES_CONFIG.sections[0].groups.forEach(group => {
        group.items.forEach(item => {
            if (item.link.includes(currentPage)) {
                foundItem = item;
                foundGroup = group;
                showGroup = group.showGroupName;
            }
        });
    });

    const content = document.createElement("div");
    content.className = "topbar-content";
    if (foundItem)
    {
        if(showGroup)
        {
            content.innerHTML = `
                <h1 class="algo-title">${foundItem.fullname}</h1>
                <div class="breadcrumb">
                <a href="../../index.html">Início</a>
                <span>›</span>
                <span>${foundGroup.name}</span>
                <span>›</span>
                <span class="current">${foundItem.shortname}</span></div>
            `;
        }
        else
        {
            content.innerHTML = `
                <h1 class="algo-title">${foundItem.fullname}</h1>
                <div class="breadcrumb">
                <a href="../../index.html">Início</a>
                <span>›</span>
                <span class="current">${foundItem.shortname}</span></div>
            `;
        }

        loadEverything(currentPage.replace(".html", ".js"));

    }
    else
    {
        const title = topbar.dataset.title || "Plataforma de Visualização Interativa";
        const section = topbar.dataset.section || "";

        if (section) {
                const root = getProjectRoot();

                content.innerHTML = `
                    <h1 class="algo-title">${title}</h1>
                    <div class="breadcrumb">
                    <a href="${root}index.html">Início</a>
                    <span>›</span>
                    <span class="current">${section}</span></div>
                `
        }
        else
        {
                content.innerHTML = `
                    <h1 class="algo-title">${title}</h1>
                    <div class="breadcrumb">
                    <span class="current">Início</span></div>
                `;
        }
    }

     topbar.appendChild(content);
  }

//   Projeto Original (Galles)
// Adaptação (Lucet)


  
  /* FOOTER */
  const foot = document.getElementById("mainFooter");
  const corp = document.createElement("span");
  corp.innerHTML = `
        Copyright © 2011 
        <a href="http://www.cs.usfca.edu/galles" target="_blank">David Galles</a>.
        © 2015 
        <a href="https://people.ok.ubc.ca/ylucet/" target="_blank">Yves Lucet</a>.
        Licensed under the FreeBSD License.
        
        Modifications © 2026 Ronaldo Fiorilo.
    `;
    foot.appendChild(corp);
    


  /* SIDEBAR E CARDS */

  const sidebar = document.getElementById("sidebarContainer");
  const cards = document.getElementById("cardsContainer");

  PAGES_CONFIG.sections.forEach(section => { /* Seção Algoritmos */

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "nav-section";

    const title = document.createElement("span");
    title.className = "nav-title";
    title.textContent = section.title;
    sectionDiv.appendChild(title);

    const ul = document.createElement("ul");

    // TODOS
    if (section.title === "Algoritmos")
    {
        const liItem = document.createElement("li");
        const link = document.createElement("a");
        link.className = "overview-link"
        const root = getProjectRoot();
        link.href = root + "index.html";
        link.textContent = "Todos os Algoritmos";
        liItem.appendChild(link);
        ul.appendChild(liItem);
    }         

    section.groups.forEach(group => { /* Grupo */

        /* cria os cards */
        if (cards && section.title === "Algoritmos")
        {
            group.items.forEach(item => { /* Cada estrutura */
                    const card = document.createElement("a");
                    card.className = "algorithm-card";
                    card.href = item.link;

                    card.innerHTML = `
                        <div class="card-badges">
                            ${item.categories.map(cat => {
                                const category = CATEGORIES_CONFIG.categories[cat];
                                return `<span class="badge ${cat}">${category.label}</span>`;
                            }).join("")}
                        </div>

                        <h3 class="card-title">
                            ${item.fullname}
                        </h3>

                        ${item.description ? `
                            <p class="card-description">
                                ${item.description}
                            </p>
                        ` : ""}
                    `;

                    cards.appendChild(card);
            });
        }


        /* sidebar */
        if (group.showGroupName)
        {
            const liGroup = document.createElement("li");
            liGroup.className = "nav-group";
            const button = document.createElement("button");
            button.className = "nav-group-toggle";
            button.textContent = group.name;

            liGroup.appendChild(button);
            const subUl = document.createElement("ul");
            subUl.className = "nav-submenu";

            group.items.forEach(item => { /* Cada estrutura */
                // Sidebar link
                const liItem = document.createElement("li");
                const link = document.createElement("a");
                // link.href = item.link;
                const root = getProjectRoot();
                link.href = root + item.link;

                link.textContent = item.shortname;
                liItem.appendChild(link);
                subUl.appendChild(liItem);
            });
            liGroup.appendChild(subUl);
            ul.appendChild(liGroup);
      
            
        }
        else
        {
            group.items.forEach(item => { /* Cada estrutura */
                // Sidebar link
                const liItem = document.createElement("li");
                const link = document.createElement("a");
                // link.href = item.link;
                const root = getProjectRoot();
                link.href = root + item.link;
                if (item.name) link.textContent = item.name;
                else link.textContent = item.shortname;
                liItem.appendChild(link);

                ul.appendChild(liItem);
            });
        }       
        
    });

    sectionDiv.appendChild(ul);
    sidebar.appendChild(sectionDiv);
  });

  const creditos = document.createElement("div")
    creditos.className = "sidebar-credits"
    creditos.innerHTML = `
            <a href="https://www.cs.usfca.edu/~galles/visualization/Algorithms.html" target="_blank" rel="noopener noreferrer">Projeto Original (Galles)</a>
            <a href="https://cmps-people.ok.ubc.ca/ylucet/DS/Algorithms.html" target="_blank" rel="noopener noreferrer">Adaptação (Lucet)</a>
    `;
    sidebar.appendChild(creditos)

});




/*listener do sidebar */
document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("nav-group-toggle")) return;

    const clickedGroup = e.target.parentElement;

    // Fecha todos os outros grupos
    document.querySelectorAll(".nav-group").forEach(group => {
        if (group !== clickedGroup) {
            group.classList.remove("open");
        }
    });

    // Alterna apenas o clicado
    clickedGroup.classList.toggle("open");
});



