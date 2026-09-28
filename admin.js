// Configuração do Supabase
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";

let supabaseClient = null;
let currentUser = null;
let editingProjectId = null;

// Inicializar Supabase
function initSupabase() {
  if (typeof window.supabase === "undefined") {
    console.error("Supabase não foi carregado");
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Página de login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  initSupabase();

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const authMessage = document.getElementById("authMessage");

    emailError.textContent = "";
    passwordError.textContent = "";
    authMessage.textContent = "";
    authMessage.classList.remove("error", "success");

    if (!email) {
      emailError.textContent = "Por favor, informe seu e-mail.";
      return;
    }

    if (!password) {
      passwordError.textContent = "Por favor, informe sua senha.";
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authMessage.textContent = "❌ E-mail ou senha incorretos.";
        authMessage.classList.add("error");
        return;
      }

      if (data.user) {
        authMessage.textContent = "✅ Login realizado com sucesso!";
        authMessage.classList.add("success");
        setTimeout(() => {
          window.location.href = "admin-dashboard.html";
        }, 700);
      }
    } catch (err) {
      authMessage.textContent = "Erro ao fazer login. Tente novamente.";
      authMessage.classList.add("error");
      console.error(err);
    }
  });
}

// Dashboard do admin
const projectsList = document.getElementById("projectsList");

if (projectsList) {
  initSupabase();

  async function checkAuth() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
      window.location.href = "admin.html";
      return;
    }

    currentUser = data.session.user;
    const userEmail = document.getElementById("userEmail");
    if (userEmail) {
      userEmail.textContent = `👤 ${currentUser.email}`;
    }

    loadProjects();
  }

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
  });

  async function loadProjects() {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      projectsList.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">❌ Erro ao carregar projetos</td>
        </tr>
      `;
      return;
    }

    if (!data || data.length === 0) {
      projectsList.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">📭 Nenhum projeto cadastrado</td>
        </tr>
      `;
      return;
    }

    projectsList.innerHTML = data
      .map((project) => {
        return `
          <tr>
            <td><strong>${project.title}</strong></td>
            <td>${project.category}</td>
            <td>${project.description.substring(0, 60)}...</td>
            <td>
              <a href="${project.project_url}" target="_blank" rel="noopener noreferrer">
                🔗 Abrir
              </a>
            </td>
            <td class="table-actions">
              <button class="btn btn-edit btn-small" onclick="editProject(${project.id})">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn btn-danger btn-small" onclick="deleteProject(${project.id})">
                <i class="fas fa-trash"></i> Deletar
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  const projectModal = document.getElementById("projectModal");
  const addProjectBtn = document.getElementById("addProjectBtn");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const projectForm = document.getElementById("projectForm");

  if (addProjectBtn) {
    addProjectBtn.addEventListener("click", () => {
      editingProjectId = null;
      document.getElementById("modalTitle").textContent = "➕ Adicionar Projeto";
      projectForm.reset();
      projectModal.classList.add("open");
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      projectModal.classList.remove("open");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      projectModal.classList.remove("open");
    });
  }

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove("open");
      }
    });
  }

  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("projectTitle").value.trim();
    const category = document.getElementById("projectCategory").value.trim();
    const description = document.getElementById("projectDescription").value.trim();
    const project_url = document.getElementById("projectUrl").value.trim();
    const image_url = document.getElementById("projectImage").value.trim();

    if (!title || !category || !description || !project_url) {
      alert("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

    const projectData = {
      title,
      category,
      description,
      project_url,
      image_url: image_url || null,
    };

    try {
      if (editingProjectId) {
        const { error } = await supabaseClient
          .from("projects")
          .update(projectData)
          .eq("id", editingProjectId);

        if (error) {
          alert("❌ Erro ao atualizar projeto.");
          return;
        }

        alert("✅ Projeto atualizado com sucesso!");
      } else {
        const { error } = await supabaseClient
          .from("projects")
          .insert([projectData]);

        if (error) {
          alert("❌ Erro ao criar projeto.");
          return;
        }

        alert("✅ Projeto criado com sucesso!");
      }

      projectModal.classList.remove("open");
      projectForm.reset();
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao salvar projeto.");
    }
  });

  window.editProject = async (id) => {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("❌ Erro ao carregar projeto.");
      return;
    }

    editingProjectId = id;
    document.getElementById("modalTitle").textContent = "✏️ Editar Projeto";
    document.getElementById("projectTitle").value = data.title;
    document.getElementById("projectCategory").value = data.category;
    document.getElementById("projectDescription").value = data.description;
    document.getElementById("projectUrl").value = data.project_url;
    document.getElementById("projectImage").value = data.image_url || "";

    projectModal.classList.add("open");
  };

  window.deleteProject = async (id) => {
    if (!confirm("⚠️ Tem certeza que deseja deletar este projeto?")) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) {
        alert("❌ Erro ao deletar projeto.");
        return;
      }

      alert("✅ Projeto deletado com sucesso!");
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao deletar projeto.");
    }
  };

  checkAuth();
}