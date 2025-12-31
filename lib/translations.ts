// Language translations dictionary
export const translations = {
    es: {
        // Dashboard
        cognitiveManager: "Cognitive Manager",
        newProject: "Nuevo Proyecto",
        yourProjects: "Tus Proyectos",
        organizedByState: "Organizados por estado de ciclo de vida cognitivo",

        // Capacity Banner
        cognitiveCapacity: "Capacidad Cognitiva",
        mentalLoadManagement: "Gestión de carga mental activa",
        introduction: "Introducción",
        growth: "Crecimiento",
        stabilization: "Estabilización",
        pause: "Pausa",
        capacityExceeded: "Capacidad excedida. Mueve proyectos a Estabilización o Pausa para reducir la carga cognitiva.",

        // Project List
        activeFocus: "Enfoque Activo",
        projectsInIntroGrowth: "Proyectos en Introducción y Crecimiento",
        capacityAvailable: "Capacidad disponible. ¿Qué idea representa tu siguiente paso?",
        habitsAndSystems: "Hábitos y sistemas establecidos",
        noStabilizedHabits: "No tienes hábitos estabilizados aún.",
        inPause: "En Pausa",
        temporarilyInactive: "Proyectos temporalmente inactivos",
        noPausedProjects: "No tienes proyectos en pausa.",
        openProject: "Abrir Proyecto",
        noProjectsYet: "No hay proyectos aún",
        createFirstProject: "Crea tu primer proyecto para comenzar a gestionar tu carga cognitiva.",

        // Common
        cancel: "Cancelar",
        save: "Guardar",
        delete: "Eliminar",
        edit: "Editar",
        create: "Crear",
        close: "Cerrar",

        // Time Report
        timeReport: "Reporte de Tiempo",
        timeByTask: "Tiempo por Tarea:",
        noTimeEntries: "No hay registros de tiempo en este período.",
        totalTime: "Total",
        selectDateRange: "Seleccionar rango",
        last7Days: "Últimos 7 días",
        last30Days: "Últimos 30 días",
        thisWeek: "Esta semana",
        thisMonth: "Este mes",
        customRange: "Rango personalizado",

        // Tasks
        tasks: "Tareas",
        newTask: "Nueva Tarea",
        editTask: "Editar Tarea",
        dueDate: "Fecha límite",
        priority: "Urgencia",
        low: "Baja",
        medium: "Media",
        high: "Alta",

        // Notes
        notes: "Notas",
        addNote: "Añadir Nota",

        // Language
        language: "Idioma",
        spanish: "Español",
        english: "English",
    },

    en: {
        // Dashboard
        cognitiveManager: "Cognitive Manager",
        newProject: "New Project",
        yourProjects: "Your Projects",
        organizedByState: "Organized by cognitive lifecycle state",

        // Capacity Banner
        cognitiveCapacity: "Cognitive Capacity",
        mentalLoadManagement: "Active mental load management",
        introduction: "Introduction",
        growth: "Growth",
        stabilization: "Stabilization",
        pause: "Pause",
        capacityExceeded: "Capacity exceeded. Move projects to Stabilization or Pause to reduce cognitive load.",

        // Project List
        activeFocus: "Active Focus",
        projectsInIntroGrowth: "Projects in Introduction and Growth",
        capacityAvailable: "Capacity available. What idea represents your next step?",
        habitsAndSystems: "Established habits and systems",
        noStabilizedHabits: "You don't have stabilized habits yet.",
        inPause: "Paused",
        temporarilyInactive: "Temporarily inactive projects",
        noPausedProjects: "You don't have paused projects.",
        openProject: "Open Project",
        noProjectsYet: "No projects yet",
        createFirstProject: "Create your first project to start managing your cognitive load.",

        // Common
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        close: "Close",

        // Time Report
        timeReport: "Time Report",
        timeByTask: "Time by Task:",
        noTimeEntries: "No time entries in this period.",
        totalTime: "Total",
        selectDateRange: "Select range",
        last7Days: "Last 7 days",
        last30Days: "Last 30 days",
        thisWeek: "This week",
        thisMonth: "This month",
        customRange: "Custom range",

        // Tasks
        tasks: "Tasks",
        newTask: "New Task",
        editTask: "Edit Task",
        dueDate: "Due Date",
        priority: "Priority",
        low: "Low",
        medium: "Medium",
        high: "High",

        // Notes
        notes: "Notes",
        addNote: "Add Note",

        // Language
        language: "Language",
        spanish: "Español",
        english: "English",
    }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.es;

