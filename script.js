// Configuração do Supabase
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";


let supabaseClient = null;
let selectedProject = null;

// Inicializar Supabase
function initSupabase() {
  if (typeof window.supabase === "undefined") {
    console.error("Supabase não foi carregado");
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Botão Admin
const adminButton = document.querySelector(".admin-button");
if (adminButton) {
  adminButton.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

// Menu mobile
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Fechar menu ao clicar em um link
  const navLinks = mainNav.querySelectorAll("a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Efeito de digitação do código
const typingCode = document.getElementById("typingCode");

if (typingCode) {
  const codeText = `const anne = {
  nome: "Anne Vitória",
  idade: 16,
  cidade: "Carlos Chagas - MG",
  estudando: "Tecnologia da Informação",
  interesse: "Programação e Desenvolvimento Web",
  objetivo: "Construir meu futuro"
};

console.log("Bem-vindo! 🚀");`;

  let characterIndex = 0;

  function typeCode() {
    if (characterIndex < codeText.length) {
      typingCode.textContent += codeText.charAt(characterIndex);
      characterIndex += 1;
      setTimeout(typeCode, 25);
    }
  }

  typeCode();
}

// Observar elementos para animação de revelação
function observeRevealElements() {
  const elements = document.querySelectorAll(".reveal-section, .reveal-item");

  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observerInstance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  elements.forEach((element) => observer.observe(element));
}

// Carregar projetos do Supabase
async function loadProjects() {
  const projectsGrid = document.getElementById("projectsGrid");

  if (!projectsGrid) {
    return;
  }

  if (
    SUPABASE_URL.includes("COLE_AQUI") ||
    SUPABASE_ANON_KEY.includes("COLE_AQUI")
  ) {
    projectsGrid.innerHTML = `
      <p class="projects-message">
        ⚙️ Configure as informações do Supabase no arquivo script.js
      </p>
    `;
    return;
  }

  if (typeof window.supabase === "undefined") {
    projectsGrid.innerHTML = `
      <p class="projects-message">
        Erro ao carregar o Supabase.
      </p>
    `;
    return;
  }

  initSupabase();

  const { data: projects, error } = await supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    projectsGrid.innerHTML = `
      <p class="projects-message">
        Não foi possível carregar os projetos no momento.
      </p>
    `;
    console.error("Erro ao carregar projetos:", error);
    return;
  }

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <p class="projects-message">
        Ainda não existem projetos cadastrados.
      </p>
    `;
    return;
  }

  projectsGrid.innerHTML = projects
    .map((project) => {
      const imageMarkup = project.image_url
        ? `<img src="${project.image_url}" alt="Imagem do projeto ${project.title}" />`
        : `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;

      return `
        <article class="project-card reveal-item" onclick="openProjectModal(${project.id}, '${project.title.replace(/'/g, "\\'")}', '${project.category}', '${project.description.replace(/'/g, "\\'")}', '${project.image_url || ''}', '${project.project_url}')">
          <div class="project-thumb">
            ${imageMarkup}
          </div>

          <div class="project-content">
            <span class="project-tag">${project.category}</span>
            <h3>${project.title}</h3>
            <p>${project.description.substring(0, 80)}...</p>
            <button type="button" class="btn btn-primary btn-small">
              <i class="fas fa-mouse"></i> Ver detalhes
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  observeRevealElements();
}

// Modal de Projeto
const projectModal = document.getElementById("projectModal");
const closeProjectModal = document.getElementById("closeProjectModal");

if (closeProjectModal) {
  closeProjectModal.addEventListener("click", () => {
    projectModal.classList.remove("open");
    selectedProject = null;
  });
}

if (projectModal) {
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) {
      projectModal.classList.remove("open");
      selectedProject = null;
    }
  });
}

function openProjectModal(id, title, category, description, imageUrl, projectUrl) {
  selectedProject = { id, title, category, description, imageUrl, projectUrl };

  document.getElementById("projectModalTitle").textContent = title;
  document.getElementById("projectModalTag").textContent = category;
  document.getElementById("projectModalDescription").textContent = description;
  document.getElementById("projectModalLink").href = projectUrl;

  if (imageUrl) {
    document.getElementById("projectModalImage").src = imageUrl;
  } else {
    document.getElementById("projectModalImage").innerHTML = '<div class="project-placeholder"><i class="fas fa-code"></i></div>';
  }

  projectModal.classList.add("open");
}

// Usar como referência
const useAsReferenceBtn = document.getElementById("useAsReferenceBtn");
if (useAsReferenceBtn) {
  useAsReferenceBtn.addEventListener("click", () => {
    if (selectedProject) {
      // Salvar no localStorage
      localStorage.setItem("referenceProject", JSON.stringify(selectedProject));

      // Redirecionar para contato
      window.location.href = "contact.html#reference";

      // Fechar modal
      projectModal.classList.remove("open");
    }
  });
}

// Carregar referência na página de contato
function loadReferenceProject() {
  const referenceBox = document.getElementById("projectReferenceBox");
  const referenceContent = document.getElementById("referenceContent");
  const clearReferenceBtn = document.getElementById("clearReferenceBtn");

  if (!referenceBox) return;

  const savedProject = localStorage.getItem("referenceProject");

  if (savedProject) {
    const project = JSON.parse(savedProject);

    referenceContent.innerHTML = `
      <strong>${project.title}</strong><br/>
      <small>${project.projectUrl}</small>
    `;

    referenceBox.style.display = "flex";

    // Adicionar ao formulário
    const messageField = document.getElementById("message");
    if (messageField && !messageField.value.includes(project.title)) {
      messageField.value += `\n\n[Site de Referência: ${project.title} - ${project.projectUrl}]`;
    }
  }

  if (clearReferenceBtn) {
    clearReferenceBtn.addEventListener("click", () => {
      localStorage.removeItem("referenceProject");
      referenceBox.style.display = "none";
      const messageField = document.getElementById("message");
      if (messageField) {
        messageField.value = messageField.value.split("\n\n[Site de Referência:")[0];
      }
    });
  }
}

// Validação do formulário de contato
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const subject = document.getElementById("subject");
    const message = document.getElementById("message");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const subjectError = document.getElementById("subjectError");
    const messageError = document.getElementById("messageError");

    let isValid = true;

    const clearError = (field, errorElement) => {
      if (field) {
        field.setAttribute("aria-invalid", "false");
      }
      if (errorElement) {
        errorElement.textContent = "";
      }
    };

    const setError = (field, errorElement, errorMessage) => {
      isValid = false;

      if (field) {
        field.setAttribute("aria-invalid", "true");
      }

      if (errorElement) {
        errorElement.textContent = errorMessage;
      }
    };

    clearError(name, nameError);
    clearError(email, emailError);
    clearError(subject, subjectError);
    clearError(message, messageError);

    if (!name.value.trim()) {
      setError(name, nameError, "Por favor, informe seu nome.");
    }

    if (!email.value.trim()) {
      setError(email, emailError, "Por favor, informe seu e-mail.");
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setError(email, emailError, "Digite um e-mail válido.");
      }
    }

    if (!subject.value.trim()) {
      setError(subject, subjectError, "Por favor, informe o assunto.");
    }

    if (!message.value.trim()) {
      setError(message, messageError, "Escreva sua mensagem.");
    } else if (message.value.trim().length < 10) {
      setError(message, messageError, "A mensagem deve ter pelo menos 10 caracteres.");
    }

    if (isValid) {
      alert("✅ Mensagem enviada com sucesso! Em breve entrarei em contato.");
      contactForm.reset();
      localStorage.removeItem("referenceProject");
      const referenceBox = document.getElementById("projectReferenceBox");
      if (referenceBox) {
        referenceBox.style.display = "none";
      }
    }
  });
}

// Inicializar na carga da página
document.addEventListener("DOMContentLoaded", () => {
  observeRevealElements();

  if (document.getElementById("projectsGrid")) {
    loadProjects();
  }

  loadReferenceProject();
});