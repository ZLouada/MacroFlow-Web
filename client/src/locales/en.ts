// English translations
const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    settings: 'Settings',
    logout: 'Log out',
    profile: 'Profile',
    notifications: 'Notifications',
    noResults: 'No results found',
    viewAll: 'View all',
    showMore: 'Show more',
    showLess: 'Show less',
    favorites: 'Favorites',
    help: 'Help & Support',
  },

  // Navigation
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    kanban: 'Board',
    gantt: 'Timeline',
    calendar: 'Calendar',
    analytics: 'Analytics',
    docs: 'Documents',
    goals: 'Goals',
    projects: 'Projects',
    tasks: 'Tasks',
    team: 'Team',
    reports: 'Reports',
    settings: 'Settings',
  },

  // Command Bar
  commandBar: {
    placeholder: 'Search or type a command...',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome back, {{name}}',
    overview: 'Overview',
    myTasks: 'My Tasks',
    teamActivity: 'Team Activity',
    upcomingDeadlines: 'Upcoming Deadlines',
    recentProjects: 'Recent Projects',
    quickActions: 'Quick Actions',
    widgets: {
      tasksCompleted: 'Tasks Completed',
      tasksInProgress: 'In Progress',
      tasksPending: 'Pending',
      projectProgress: 'Project Progress',
      teamVelocity: 'Team Velocity',
      burndownChart: 'Burndown Chart',
    },
    stats: {
      totalTasks: 'Total Tasks',
      completedThisWeek: 'Completed This Week',
      overdue: 'Overdue',
      dueToday: 'Due Today',
    },
  },

  // Kanban
  kanban: {
    title: 'Kanban Board',
    addColumn: 'Add Column',
    addTask: 'Add Task',
    columns: {
      todo: 'To Do',
      inProgress: 'In Progress',
      review: 'Review',
      done: 'Done',
    },
    taskDetails: 'Task Details',
    assignee: 'Assignee',
    dueDate: 'Due Date',
    priority: 'Priority',
    labels: 'Labels',
    description: 'Description',
    comments: 'Comments',
    attachments: 'Attachments',
    moveTask: 'Move task to {{column}}',
    dragHint: 'Drag to reorder or move to another column',
  },

  // Gantt
  gantt: {
    title: 'Project Timeline',
    today: 'Today',
    zoom: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
    },
    dependencies: 'Dependencies',
    milestone: 'Milestone',
    progress: 'Progress',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    scrollToToday: 'Scroll to today',
  },

  // Tasks
  tasks: {
    title: 'Tasks',
    newTask: 'New Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    taskName: 'Task Name',
    status: {
      todo: 'To Do',
      inProgress: 'In Progress',
      review: 'In Review',
      done: 'Done',
      blocked: 'Blocked',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    },
    filters: {
      all: 'All Tasks',
      myTasks: 'My Tasks',
      unassigned: 'Unassigned',
      overdue: 'Overdue',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    language: 'Language',
    theme: 'Theme',
    themes: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    notifications: 'Notifications',
    privacy: 'Privacy',
    account: 'Account',
    integrations: 'Integrations',
  },

  // Roles
  roles: {
    admin: 'Administrator',
    teamLead: 'Team Lead',
    developer: 'Developer',
    designer: 'Designer',
    coo: 'Chief Operating Officer',
    projectManager: 'Project Manager',
    viewer: 'Viewer',
  },

  // Time
  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    daysAgo: '{{count}} day ago',
    daysAgo_plural: '{{count}} days ago',
    hoursAgo: '{{count}} hour ago',
    hoursAgo_plural: '{{count}} hours ago',
    minutesAgo: '{{count}} minute ago',
    minutesAgo_plural: '{{count}} minutes ago',
  },

  // Accessibility
  a11y: {
    skipToMain: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    toggleSidebar: 'Toggle sidebar',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    dragHandle: 'Drag handle, press space to start dragging',
    itemPosition: 'Item {{current}} of {{total}}',
  },

  // Economic Simulation
  economics: {
    title: 'Economic Simulation',
    mundellFleming: 'Mundell-Fleming Model',
    
    // Curves
    curves: {
      is: 'IS Curve',
      lm: 'LM Curve',
      bop: 'BOP Curve',
      isDescription: 'Goods market equilibrium',
      lmDescription: 'Money market equilibrium',
      bopDescription: 'Balance of payments equilibrium',
    },
    
    // Fiscal Policy
    fiscalPolicy: {
      title: 'Fiscal Policy',
      taxRate: 'Tax Rate',
      governmentSpending: 'Government Spending',
      transferPayments: 'Transfer Payments',
      budgetDeficit: 'Budget Deficit',
      budgetSurplus: 'Budget Surplus',
    },
    
    // Monetary Policy
    monetaryPolicy: {
      title: 'Monetary Policy',
      moneySupply: 'Money Supply',
      interestRate: 'Interest Rate',
      reserveRequirement: 'Reserve Requirement',
      discountRate: 'Discount Rate',
    },
    
    // External Sector
    externalSector: {
      title: 'External Sector',
      exchangeRate: 'Exchange Rate',
      exchangeRateRegime: 'Exchange Rate Regime',
      fixed: 'Fixed',
      floating: 'Floating',
      capitalMobility: 'Capital Mobility',
      perfect: 'Perfect',
      imperfect: 'Imperfect',
      none: 'None',
      worldInterestRate: 'World Interest Rate',
      exports: 'Exports',
      imports: 'Imports',
      tradeBalance: 'Trade Balance',
      capitalFlow: 'Capital Flow',
      balanceOfPayments: 'Balance of Payments',
    },
    
    // Indicators
    indicators: {
      title: 'Economic Indicators',
      gdp: 'GDP',
      inflation: 'Inflation',
      unemployment: 'Unemployment',
      priceLevel: 'Price Level',
      potentialOutput: 'Potential Output',
      outputGap: 'Output Gap',
    },
    
    // Simulation
    simulation: {
      title: 'Simulation',
      start: 'Start Simulation',
      stop: 'Stop Simulation',
      step: 'Step Forward',
      reset: 'Reset',
      speed: 'Speed',
      period: 'Period',
      history: 'History',
    },
    
    // Analysis
    analysis: {
      title: 'Policy Analysis',
      fiscalMultiplier: 'Fiscal Multiplier',
      monetaryMultiplier: 'Monetary Multiplier',
      equilibrium: 'Equilibrium',
      policyImpact: 'Policy Impact',
    },
    
    // Units
    units: {
      billions: 'Billions',
      percent: '%',
      percentage: 'Percentage',
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome to MacroFlow',
      description: 'Let us show you around the key features of the economic simulation platform.',
    },
    simulation: {
      title: 'Economic Simulation',
      description: 'Adjust fiscal and monetary policies to see how they affect the economy in real-time.',
    },
    charts: {
      title: 'IS-LM-BOP Curves',
      description: 'Visualize the Mundell-Fleming model with interactive charts showing equilibrium points.',
    },
    export: {
      title: 'Export Reports',
      description: 'Generate PDF reports of your simulation results to share with others.',
    },
    finish: 'Got it!',
    next: 'Next',
    back: 'Back',
    skip: 'Skip Tour',
  },

  // Reports
  reports: {
    title: 'Simulation Report',
    generatedOn: 'Generated on {{date}}',
    summary: 'Summary',
    parameters: 'Parameters',
    results: 'Results',
    exportPdf: 'Export PDF',
    exportCsv: 'Export CSV',
    downloading: 'Downloading...',
  },

  // Placeholder pages
  placeholder: {
    calendarDesc: 'Plan and schedule your tasks with an interactive calendar view. Drag & drop events, set reminders, and sync with your team.',
    analyticsDesc: 'Track team performance, project progress, and productivity metrics with powerful analytics dashboards.',
    docsDesc: 'Create, edit, and collaborate on documents in real-time. Keep all your project documentation in one place.',
    goalsDesc: 'Set team and personal goals, track progress, and align your work with organizational objectives.',
  },
};

export default en;
