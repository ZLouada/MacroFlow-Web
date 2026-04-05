// Arabic translations - RTL language
const ar = {
  // Common
  common: {
    loading: '\u{062C}\u{0627}\u{0631}\u{064A} \u{0627}\u{0644}\u{062A}\u{062D}\u{0645}\u{064A}\u{0644}...',
    error: '\u{062D}\u{062F}\u{062B} \u{062E}\u{0637}\u{0623}',
    save: '\u{062D}\u{0641}\u{0638}',
    cancel: '\u{0625}\u{0644}\u{063A}\u{0627}\u{0621}',
    delete: '\u{062D}\u{0630}\u{0641}',
    edit: '\u{062A}\u{0639}\u{062F}\u{064A}\u{0644}',
    create: '\u{0625}\u{0646}\u{0634}\u{0627}\u{0621}',
    search: '\u{0628}\u{062D}\u{062B}',
    filter: '\u{062A}\u{0635}\u{0641}\u{064A}\u{0629}',
    sort: '\u{062A}\u{0631}\u{062A}\u{064A}\u{0628}',
    refresh: '\u{062A}\u{062D}\u{062F}\u{064A}\u{062B}',
    export: '\u{062A}\u{0635}\u{062F}\u{064A}\u{0631}',
    import: '\u{0627}\u{0633}\u{062A}\u{064A}\u{0631}\u{0627}\u{062F}',
    settings: '\u{0627}\u{0644}\u{0625}\u{0639}\u{062F}\u{0627}\u{062F}\u{0627}\u{062A}',
    logout: '\u{062A}\u{0633}\u{062C}\u{064A}\u{0644} \u{0627}\u{0644}\u{062E}\u{0631}\u{0648}\u{062C}',
    profile: '\u{0627}\u{0644}\u{0645}\u{0644}\u{0641} \u{0627}\u{0644}\u{0634}\u{062E}\u{0635}\u{064A}',
    notifications: '\u{0627}\u{0644}\u{0625}\u{0634}\u{0639}\u{0627}\u{0631}\u{0627}\u{062A}',
    noResults: '\u{0644}\u{0645} \u{064A}\u{062A}\u{0645} \u{0627}\u{0644}\u{0639}\u{062B}\u{0648}\u{0631} \u{0639}\u{0644}\u{0649} \u{0646}\u{062A}\u{0627}\u{0626}\u{062C}',
    viewAll: '\u{0639}\u{0631}\u{0636} \u{0627}\u{0644}\u{0643}\u{0644}',
    showMore: '\u{0639}\u{0631}\u{0636} \u{0627}\u{0644}\u{0645}\u{0632}\u{064A}\u{062F}',
    showLess: '\u{0639}\u{0631}\u{0636} \u{0623}\u{0642}\u{0644}',
    favorites: '\u{0627}\u{0644}\u{0645}\u{0641}\u{0636}\u{0644}\u{0629}',
    help: '\u{0627}\u{0644}\u{0645}\u{0633}\u{0627}\u{0639}\u{062F}\u{0629} \u{0648}\u{0627}\u{0644}\u{062F}\u{0639}\u{0645}',
  },

  // Navigation
  nav: {
    home: '\u{0627}\u{0644}\u{0631}\u{0626}\u{064A}\u{0633}\u{064A}\u{0629}',
    dashboard: '\u{0644}\u{0648}\u{062D}\u{0629} \u{0627}\u{0644}\u{062A}\u{062D}\u{0643}\u{0645}',
    kanban: '\u{0627}\u{0644}\u{0644}\u{0648}\u{062D}\u{0629}',
    gantt: '\u{0627}\u{0644}\u{062C}\u{062F}\u{0648}\u{0644} \u{0627}\u{0644}\u{0632}\u{0645}\u{0646}\u{064A}',
    calendar: '\u{0627}\u{0644}\u{062A}\u{0642}\u{0648}\u{064A}\u{0645}',
    analytics: '\u{0627}\u{0644}\u{062A}\u{062D}\u{0644}\u{064A}\u{0644}\u{0627}\u{062A}',
    docs: '\u{0627}\u{0644}\u{0645}\u{0633}\u{062A}\u{0646}\u{062F}\u{0627}\u{062A}',
    goals: '\u{0627}\u{0644}\u{0623}\u{0647}\u{062F}\u{0627}\u{0641}',
    projects: '\u{0627}\u{0644}\u{0645}\u{0634}\u{0627}\u{0631}\u{064A}\u{0639}',
    tasks: '\u{0627}\u{0644}\u{0645}\u{0647}\u{0627}\u{0645}',
    team: '\u{0627}\u{0644}\u{0641}\u{0631}\u{064A}\u{0642}',
    reports: '\u{0627}\u{0644}\u{062A}\u{0642}\u{0627}\u{0631}\u{064A}\u{0631}',
    settings: '\u{0627}\u{0644}\u{0625}\u{0639}\u{062F}\u{0627}\u{062F}\u{0627}\u{062A}',
  },

  // Command Bar
  commandBar: {
    placeholder: '\u{0628}\u{062D}\u{062B} \u{0623}\u{0648} \u{0627}\u{0643}\u{062A}\u{0628} \u{0623}\u{0645}\u{0631}...',
  },

  // Dashboard
  dashboard: {
    welcome: 'مرحباً بعودتك، {{name}}',
    overview: 'نظرة عامة',
    myTasks: 'مهامي',
    teamActivity: 'نشاط الفريق',
    upcomingDeadlines: 'المواعيد النهائية القادمة',
    recentProjects: 'المشاريع الأخيرة',
    quickActions: 'إجراءات سريعة',
    widgets: {
      tasksCompleted: 'المهام المكتملة',
      tasksInProgress: 'قيد التنفيذ',
      tasksPending: 'في الانتظار',
      projectProgress: 'تقدم المشروع',
      teamVelocity: 'سرعة الفريق',
      burndownChart: 'مخطط الإنجاز',
    },
    stats: {
      totalTasks: 'إجمالي المهام',
      completedThisWeek: 'المكتملة هذا الأسبوع',
      overdue: 'متأخرة',
      dueToday: 'تستحق اليوم',
    },
  },

  // Kanban
  kanban: {
    title: 'لوحة كانبان',
    addColumn: 'إضافة عمود',
    addTask: 'إضافة مهمة',
    columns: {
      todo: 'للتنفيذ',
      inProgress: 'قيد التنفيذ',
      review: 'قيد المراجعة',
      done: 'مكتمل',
    },
    taskDetails: 'تفاصيل المهمة',
    assignee: 'المسؤول',
    dueDate: 'تاريخ الاستحقاق',
    priority: 'الأولوية',
    labels: 'التصنيفات',
    description: 'الوصف',
    comments: 'التعليقات',
    attachments: 'المرفقات',
    moveTask: 'نقل المهمة إلى {{column}}',
    dragHint: 'اسحب لإعادة الترتيب أو النقل إلى عمود آخر',
  },

  // Gantt
  gantt: {
    title: 'الجدول الزمني للمشروع',
    today: 'اليوم',
    zoom: {
      day: 'يوم',
      week: 'أسبوع',
      month: 'شهر',
      quarter: 'ربع سنة',
    },
    dependencies: 'التبعيات',
    milestone: 'حدث رئيسي',
    progress: 'التقدم',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    duration: 'المدة',
    scrollToToday: 'الانتقال إلى اليوم',
  },

  // Tasks
  tasks: {
    title: 'المهام',
    newTask: 'مهمة جديدة',
    editTask: 'تعديل المهمة',
    deleteTask: 'حذف المهمة',
    taskName: 'اسم المهمة',
    status: {
      todo: 'للتنفيذ',
      inProgress: 'قيد التنفيذ',
      review: 'قيد المراجعة',
      done: 'مكتمل',
      blocked: 'محظور',
    },
    priority: {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة',
    },
    filters: {
      all: 'جميع المهام',
      myTasks: 'مهامي',
      unassigned: 'غير مسندة',
      overdue: 'متأخرة',
    },
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    general: 'عام',
    appearance: 'المظهر',
    language: 'اللغة',
    theme: 'السمة',
    themes: {
      light: 'فاتح',
      dark: 'داكن',
      system: 'النظام',
    },
    notifications: 'الإشعارات',
    privacy: 'الخصوصية',
    account: 'الحساب',
    integrations: 'التكاملات',
  },

  // Roles
  roles: {
    admin: 'مدير النظام',
    teamLead: 'قائد الفريق',
    developer: 'مطور',
    designer: 'مصمم',
    coo: 'مدير العمليات',
    projectManager: 'مدير المشروع',
    viewer: 'مشاهد',
  },

  // Time
  time: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    nextWeek: 'الأسبوع القادم',
    thisMonth: 'هذا الشهر',
    daysAgo: 'منذ يوم واحد',
    daysAgo_plural: 'منذ {{count}} أيام',
    hoursAgo: 'منذ ساعة واحدة',
    hoursAgo_plural: 'منذ {{count}} ساعات',
    minutesAgo: 'منذ دقيقة واحدة',
    minutesAgo_plural: 'منذ {{count}} دقائق',
  },

  // Accessibility
  a11y: {
    skipToMain: 'تخطي إلى المحتوى الرئيسي',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    toggleSidebar: 'تبديل الشريط الجانبي',
    expandSection: 'توسيع القسم',
    collapseSection: 'طي القسم',
    dragHandle: 'مقبض السحب، اضغط على المسافة للبدء بالسحب',
    itemPosition: 'العنصر {{current}} من {{total}}',
  },

  // Economic Simulation
  economics: {
    title: 'المحاكاة الاقتصادية',
    mundellFleming: 'نموذج موندل-فليمنج',
    
    // Curves
    curves: {
      is: 'منحنى IS',
      lm: 'منحنى LM',
      bop: 'منحنى ميزان المدفوعات',
      isDescription: 'توازن سوق السلع',
      lmDescription: 'توازن سوق النقود',
      bopDescription: 'توازن ميزان المدفوعات',
    },
    
    // Fiscal Policy
    fiscalPolicy: {
      title: 'السياسة المالية',
      taxRate: 'معدل الضريبة',
      governmentSpending: 'الإنفاق الحكومي',
      transferPayments: 'مدفوعات التحويل',
      budgetDeficit: 'عجز الميزانية',
      budgetSurplus: 'فائض الميزانية',
    },
    
    // Monetary Policy
    monetaryPolicy: {
      title: 'السياسة النقدية',
      moneySupply: 'عرض النقود',
      interestRate: 'سعر الفائدة',
      reserveRequirement: 'نسبة الاحتياطي',
      discountRate: 'سعر الخصم',
    },
    
    // External Sector
    externalSector: {
      title: 'القطاع الخارجي',
      exchangeRate: 'سعر الصرف',
      exchangeRateRegime: 'نظام سعر الصرف',
      fixed: 'ثابت',
      floating: 'عائم',
      capitalMobility: 'حركة رأس المال',
      perfect: 'كاملة',
      imperfect: 'غير كاملة',
      none: 'معدومة',
      worldInterestRate: 'سعر الفائدة العالمي',
      exports: 'الصادرات',
      imports: 'الواردات',
      tradeBalance: 'الميزان التجاري',
      capitalFlow: 'تدفق رأس المال',
      balanceOfPayments: 'ميزان المدفوعات',
    },
    
    // Indicators
    indicators: {
      title: 'المؤشرات الاقتصادية',
      gdp: 'الناتج المحلي الإجمالي',
      inflation: 'التضخم',
      unemployment: 'البطالة',
      priceLevel: 'مستوى الأسعار',
      potentialOutput: 'الناتج المحتمل',
      outputGap: 'فجوة الناتج',
    },
    
    // Simulation
    simulation: {
      title: 'المحاكاة',
      start: 'بدء المحاكاة',
      stop: 'إيقاف المحاكاة',
      step: 'خطوة للأمام',
      reset: 'إعادة تعيين',
      speed: 'السرعة',
      period: 'الفترة',
      history: 'السجل',
    },
    
    // Analysis
    analysis: {
      title: 'تحليل السياسات',
      fiscalMultiplier: 'المضاعف المالي',
      monetaryMultiplier: 'المضاعف النقدي',
      equilibrium: 'التوازن',
      policyImpact: 'تأثير السياسة',
    },
    
    // Units
    units: {
      billions: 'مليارات',
      percent: '٪',
      percentage: 'نسبة مئوية',
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'مرحباً بك في MacroFlow',
      description: 'دعنا نعرفك على الميزات الرئيسية لمنصة المحاكاة الاقتصادية.',
    },
    simulation: {
      title: 'المحاكاة الاقتصادية',
      description: 'عدّل السياسات المالية والنقدية لترى كيف تؤثر على الاقتصاد في الوقت الفعلي.',
    },
    charts: {
      title: 'منحنيات IS-LM-BOP',
      description: 'تصور نموذج موندل-فليمنج مع رسوم بيانية تفاعلية تظهر نقاط التوازن.',
    },
    export: {
      title: 'تصدير التقارير',
      description: 'أنشئ تقارير PDF لنتائج المحاكاة لمشاركتها مع الآخرين.',
    },
    finish: 'فهمت!',
    next: 'التالي',
    back: 'السابق',
    skip: 'تخطي الجولة',
  },

  // Reports
  reports: {
    title: 'تقرير المحاكاة',
    generatedOn: 'تم الإنشاء في {{date}}',
    summary: 'ملخص',
    parameters: 'المعاملات',
    results: 'النتائج',
    exportPdf: 'تصدير PDF',
    exportCsv: 'تصدير CSV',
    downloading: 'جاري التحميل...',
  },

  // Placeholder pages
  placeholder: {
    calendarDesc: 'خطط وجدول مهامك مع عرض تقويم تفاعلي. اسحب وأفلت الأحداث، واضبط التذكيرات، وتزامن مع فريقك.',
    analyticsDesc: 'تتبع أداء الفريق وتقدم المشروع ومقاييس الإنتاجية مع لوحات تحليلية قوية.',
    docsDesc: 'أنشئ وحرر وتعاون على المستندات في الوقت الفعلي. احتفظ بجميع وثائق مشروعك في مكان واحد.',
    goalsDesc: 'حدد أهداف الفريق والأهداف الشخصية، وتتبع التقدم، ووائم عملك مع الأهداف التنظيمية.',
  },
};

export default ar;
