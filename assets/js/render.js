document.addEventListener("DOMContentLoaded", () => {


  /* TOPBAR */

  const topbar = document.getElementById("ufmsTopBar");
  if (topbar) {
    const currentPage = window.location.pathname.split("/").pop();
    
    let foundItem = null;
    let foundGroup = null;

    PAGES_CONFIG.sections[0].groups.forEach(group => {
        group.items.forEach(item => {
            if (item.link.includes(currentPage)) {
                foundItem = item;
                foundGroup = group;
            }
        });
    });

    const content = document.createElement("div");
    content.className = "topbar-content";
    if (foundItem)
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

        script = document.createElement("script")
        script.type = "application/javascript"
        script.src = "../../assets/js/AlgorithmLibrary/" + currentPage.replace(".html", ".js");
        document.head.appendChild(script);
    }
    else
    {
        content.innerHTML = `
            <h1 class="algo-title">Plataforma de Visualização Interativa</h1>
            <div class="breadcrumb">
            <span class="current">Início</span></div>
        `;
    }

     topbar.appendChild(content);
  }
/* <div class="breadcrumb">
				<a href="../../index.html">Início</a>
				<span>›</span>
				<span>Árvores</span>
				<span>›</span>
				<span class="current">ABB</span>
			</div> */
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

    section.groups.forEach(group => { /* Grupo */

        /* cria os cards */
        if (cards && section.title === "Algoritmos")
        {
            group.items.forEach(item => { /* Cada estrutura */
                    // Card
                    const card = document.createElement("article");
                    card.className = "algorithm-card";
                    card.innerHTML = `
                        ${item.categories.map(cat => {
                            const category = CATEGORIES_CONFIG.categories[cat];
                            return `<span class="badge ${cat}">${category.label}</span>`;
                        }).join("")}
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <a href="${item.link}" class="btn-primary">Abrir</a>
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
                link.href = item.link;
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
                link.href = item.link;
                link.textContent = item.name;
                liItem.appendChild(link);

                ul.appendChild(liItem);
            });
        }       
        
    });

    sectionDiv.appendChild(ul);
    sidebar.appendChild(sectionDiv);
  });

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



