// French translations
const fr = {
  // Common
  common: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Creer',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    refresh: 'Actualiser',
    export: 'Exporter',
    import: 'Importer',
    settings: 'Parametres',
    logout: 'Deconnexion',
    profile: 'Profil',
    notifications: 'Notifications',
    noResults: 'Aucun resultat trouve',
    viewAll: 'Voir tout',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',
    favorites: 'Favoris',
    help: 'Aide & Support',
  },

  // Navigation
  nav: {
    home: 'Accueil',
    dashboard: 'Tableau de bord',
    kanban: 'Tableau',
    gantt: 'Chronologie',
    calendar: 'Calendrier',
    analytics: 'Analytiques',
    docs: 'Documents',
    goals: 'Objectifs',
    projects: 'Projets',
    tasks: 'Taches',
    team: 'Equipe',
    reports: 'Rapports',
    settings: 'Parametres',
  },

  // Command Bar
  commandBar: {
    placeholder: 'Rechercher ou taper une commande...',
  },

  // Dashboard
  dashboard: {
    welcome: 'Bienvenue, {{name}}',
    overview: 'Aperçu',
    myTasks: 'Mes tâches',
    teamActivity: 'Activité de l\'équipe',
    upcomingDeadlines: 'Échéances à venir',
    recentProjects: 'Projets récents',
    quickActions: 'Actions rapides',
    widgets: {
      tasksCompleted: 'Tâches terminées',
      tasksInProgress: 'En cours',
      tasksPending: 'En attente',
      projectProgress: 'Avancement du projet',
      teamVelocity: 'Vélocité de l\'équipe',
      burndownChart: 'Graphique d\'avancement',
    },
    stats: {
      totalTasks: 'Total des tâches',
      completedThisWeek: 'Terminées cette semaine',
      overdue: 'En retard',
      dueToday: 'Pour aujourd\'hui',
    },
  },

  // Kanban
  kanban: {
    title: 'Tableau Kanban',
    addColumn: 'Ajouter une colonne',
    addTask: 'Ajouter une tâche',
    columns: {
      todo: 'À faire',
      inProgress: 'En cours',
      review: 'En révision',
      done: 'Terminé',
    },
    taskDetails: 'Détails de la tâche',
    assignee: 'Assigné à',
    dueDate: 'Date d\'échéance',
    priority: 'Priorité',
    labels: 'Étiquettes',
    description: 'Description',
    comments: 'Commentaires',
    attachments: 'Pièces jointes',
    moveTask: 'Déplacer la tâche vers {{column}}',
    dragHint: 'Glissez pour réordonner ou déplacer vers une autre colonne',
  },

  // Gantt
  gantt: {
    title: 'Chronologie du projet',
    today: 'Aujourd\'hui',
    zoom: {
      day: 'Jour',
      week: 'Semaine',
      month: 'Mois',
      quarter: 'Trimestre',
    },
    dependencies: 'Dépendances',
    milestone: 'Jalon',
    progress: 'Progression',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    duration: 'Durée',
    scrollToToday: 'Aller à aujourd\'hui',
  },

  // Tasks
  tasks: {
    title: 'Tâches',
    newTask: 'Nouvelle tâche',
    editTask: 'Modifier la tâche',
    deleteTask: 'Supprimer la tâche',
    taskName: 'Nom de la tâche',
    status: {
      todo: 'À faire',
      inProgress: 'En cours',
      review: 'En révision',
      done: 'Terminé',
      blocked: 'Bloqué',
    },
    priority: {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente',
    },
    filters: {
      all: 'Toutes les tâches',
      myTasks: 'Mes tâches',
      unassigned: 'Non assignées',
      overdue: 'En retard',
    },
  },

  // Settings
  settings: {
    title: 'Paramètres',
    general: 'Général',
    appearance: 'Apparence',
    language: 'Langue',
    theme: 'Thème',
    themes: {
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
    },
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    account: 'Compte',
    integrations: 'Intégrations',
  },

  // Roles
  roles: {
    admin: 'Administrateur',
    teamLead: 'Chef d\'équipe',
    developer: 'Développeur',
    designer: 'Designer',
    coo: 'Directeur des opérations',
    projectManager: 'Chef de projet',
    viewer: 'Observateur',
  },

  // Time
  time: {
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    lastWeek: 'La semaine dernière',
    nextWeek: 'La semaine prochaine',
    thisMonth: 'Ce mois-ci',
    daysAgo: 'Il y a {{count}} jour',
    daysAgo_plural: 'Il y a {{count}} jours',
    hoursAgo: 'Il y a {{count}} heure',
    hoursAgo_plural: 'Il y a {{count}} heures',
    minutesAgo: 'Il y a {{count}} minute',
    minutesAgo_plural: 'Il y a {{count}} minutes',
  },

  // Accessibility
  a11y: {
    skipToMain: 'Aller au contenu principal',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    toggleSidebar: 'Basculer la barre latérale',
    expandSection: 'Développer la section',
    collapseSection: 'Réduire la section',
    dragHandle: 'Poignée de glissement, appuyez sur espace pour commencer',
    itemPosition: 'Élément {{current}} sur {{total}}',
  },

  // Placeholder pages
  placeholder: {
    calendarDesc: 'Planifiez et programmez vos tâches avec un calendrier interactif. Glissez-déposez des événements et synchronisez avec votre équipe.',
    analyticsDesc: 'Suivez les performances de l\'équipe et la progression des projets avec des tableaux de bord analytiques.',
    docsDesc: 'Créez, modifiez et collaborez sur des documents en temps réel. Gardez toute votre documentation projet au même endroit.',
    goalsDesc: 'Définissez des objectifs d\'équipe et personnels, suivez la progression et alignez votre travail.',
  },
};

export default fr;
