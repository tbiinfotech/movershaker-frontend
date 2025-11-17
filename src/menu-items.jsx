const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/dashboard'
        }
      ]
    },
    {
      id: 'student-management',
      title: 'Student Management',
      type: 'group',
      icon: 'icon-users',
      children: [
        // {
        //   id: 'student-enrollment',
        //   title: 'Student Enrollment',
        //   type: 'item',
        //   icon: 'feather icon-user-plus',
        //   url: '/students/enrollment'
        // },
        // {
        //   id: 'student-groups',
        //   title: 'Student Groups',
        //   type: 'item',
        //   icon: 'feather icon-users',
        //   url: '/students/groups'
        // },
        {
          id: 'student-details',
          title: 'Student Details',
          type: 'item',
          icon: 'feather icon-user',
          url: '/students/details'
        },
        {
          id: 'attendance',
          title: 'Attendance',
          type: 'item',
          icon: 'feather icon-check-circle',
          url: '/students/attendance'
        },
        {
          id: 'create-friday-practice',
          title: 'Create Friday Practice',
          type: 'item',
          icon: 'feather icon-check-circle',
          url: '/students/create-friday-practice'
        }
      ]
    },
    {
      id: 'program-management',
      title: 'Program Management',
      type: 'group',
      icon: 'icon-program',
      children: [
        // {
        //   id: 'create-program',
        //   title: 'Create Program',
        //   type: 'item',
        //   icon: 'feather icon-plus-circle',
        //   url: '/programs/create'
        // },
        // {
        //   id: 'program-schedules',
        //   title: 'Program Schedules',
        //   type: 'item',
        //   icon: 'feather icon-calendar',
        //   url: '/programs/schedules'
        // },
        {
          id: 'program-details',
          title: 'Program Details',
          type: 'item',
          icon: 'feather icon-info',
          url: '/programs/details'
        }
      ]
    },
    {
      id: 'announcements',
      title: 'Announcements',
      type: 'group',
      icon: 'icon-announcement',
      children: [
        {
          id: 'create-announcement',
          title: 'Create Announcement',
          type: 'item',
          icon: 'feather icon-bell',
          url: '/announcements/create'
        },
        {
          id: 'view-announcements',
          title: 'View Announcements',
          type: 'item',
          icon: 'feather icon-eye',
          url: '/announcements/view'
        }
      ]
    },
    {
      id: 'chat-management',
      title: 'Chat Management',
      type: 'group',
      icon: 'icon-chat',
      children: [
        // {
        //   id: 'chat-groups',
        //   title: 'Chat Groups',
        //   type: 'item',
        //   icon: 'feather icon-message-circle',
        //   url: '/chat/groups'
        // },
        {
          id: 'chat',
          title: 'Chat',
          type: 'item',
          icon: 'feather icon-message-square',
          url: '/chat/individual'
        }
      ]
    },
    {
      id: 'media-library',
      title: 'Media Library',
      type: 'group',
      icon: 'icon-media',
      children: [
        {
          id: 'master-list',
          title: 'Master List',
          type: 'item',
          icon: 'feather icon-folder',
          url: '/media/master-list'
        },
        {
          id: 'upload-video',
          title: 'Upload Video',
          type: 'item',
          icon: 'feather icon-upload',
          url: '/media/upload'
        }
      ]
    },
    // {
    //   id: 'support',
    //   title: 'Support',
    //   type: 'group',
    //   icon: 'icon-support',
    //   children: [
    //     {
    //       id: 'support-chat',
    //       title: 'Support Chat',
    //       type: 'item',
    //       icon: 'feather icon-headphones',
    //       url: '/support/chat'
    //     },
    //     {
    //       id: 'bug-reports',
    //       title: 'Bug Reports',
    //       type: 'item',
    //       icon: 'feather icon-alert-circle',
    //       url: '/support/bug-reports'
    //     }
    //   ]
    // },
    // {
    //   id: 'static-content',
    //   title: 'Static Content',
    //   type: 'group',
    //   icon: 'icon-content',
    //   children: [
    //     {
    //       id: 'manage-static-content',
    //       title: 'Manage Static Content',
    //       type: 'item',
    //       icon: 'feather icon-file-text',
    //       url: '/static-content/manage'
    //     },
    //     {
    //       id: 'manage-links',
    //       title: 'Manage Links',
    //       type: 'item',
    //       icon: 'feather icon-link',
    //       url: '/static-content/links'
    //     }
    //   ]
    // }

    /** Refrence Routes */
    // {
    //   id: 'ui-element',
    //   title: 'UI ELEMENT',
    //   type: 'group',
    //   icon: 'icon-ui',
    //   children: [
    //     {
    //       id: 'component',
    //       title: 'Component',
    //       type: 'collapse',
    //       icon: 'feather icon-box',
    //       children: [
    //         {
    //           id: 'button',
    //           title: 'Button',
    //           type: 'item',
    //           url: '/basic/button'
    //         },
    //         {
    //           id: 'badges',
    //           title: 'Badges',
    //           type: 'item',
    //           url: '/basic/badges'
    //         },
    //         {
    //           id: 'breadcrumb',
    //           title: 'Breadcrumb & Pagination',
    //           type: 'item',
    //           url: '/basic/breadcrumb-paging'
    //         },
    //         {
    //           id: 'collapse',
    //           title: 'Collapse',
    //           type: 'item',
    //           url: '/basic/collapse'
    //         },
    //         {
    //           id: 'tabs-pills',
    //           title: 'Tabs & Pills',
    //           type: 'item',
    //           url: '/basic/tabs-pills'
    //         },
    //         {
    //           id: 'typography',
    //           title: 'Typography',
    //           type: 'item',
    //           url: '/basic/typography'
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   id: 'ui-forms',
    //   title: 'FORMS & TABLES',
    //   type: 'group',
    //   icon: 'icon-group',
    //   children: [
    //     {
    //       id: 'forms',
    //       title: 'Form Elements',
    //       type: 'item',
    //       icon: 'feather icon-file-text',
    //       url: '/forms/form-basic'
    //     },
    //     {
    //       id: 'table',
    //       title: 'Table',
    //       type: 'item',
    //       icon: 'feather icon-server',
    //       url: '/tables/bootstrap'
    //     }
    //   ]
    // },
    // {
    //   id: 'chart-maps',
    //   title: 'Chart & Maps',
    //   type: 'group',
    //   icon: 'icon-charts',
    //   children: [
    //     {
    //       id: 'charts',
    //       title: 'Charts',
    //       type: 'item',
    //       icon: 'feather icon-pie-chart',
    //       url: '/charts/nvd3'
    //     },
    //     {
    //       id: 'maps',
    //       title: 'Maps',
    //       type: 'item',
    //       icon: 'feather icon-map',
    //       url: '/maps/google-map'
    //     }
    //   ]
    // },
    // {
    //   id: 'pages',
    //   title: 'Pages',
    //   type: 'group',
    //   icon: 'icon-pages',
    //   children: [
    //     {
    //       id: 'auth',
    //       title: 'Authentication',
    //       type: 'collapse',
    //       icon: 'feather icon-lock',
    //       badge: {
    //         title: 'New',
    //         type: 'label-danger'
    //       },
    //       children: [
    //         {
    //           id: 'signup-1',
    //           title: 'Sign up',
    //           type: 'item',
    //           url: '/auth/signup-1',
    //           target: true,
    //           breadcrumbs: false
    //         },
    //         {
    //           id: 'signin-1',
    //           title: 'Sign in',
    //           type: 'item',
    //           url: '/auth/signin-1',
    //           target: true,
    //           breadcrumbs: false
    //         }
    //       ]
    //     },
    //     {
    //       id: 'sample-page',
    //       title: 'Sample Page',
    //       type: 'item',
    //       url: '/sample-page',
    //       classes: 'nav-item',
    //       icon: 'feather icon-sidebar'
    //     },
    //     {
    //       id: 'documentation',
    //       title: 'Documentation',
    //       type: 'item',
    //       icon: 'feather icon-book',
    //       classes: 'nav-item',
    //       url: 'https://codedthemes.gitbook.io/datta/',
    //       target: true,
    //       external: true
    //     },
    //     {
    //       id: 'menu-level',
    //       title: 'Menu Levels',
    //       type: 'collapse',
    //       icon: 'feather icon-menu',
    //       children: [
    //         {
    //           id: 'menu-level-1.1',
    //           title: 'Menu Level 1.1',
    //           type: 'item',
    //           url: '#!'
    //         },
    //         {
    //           id: 'menu-level-1.2',
    //           title: 'Menu Level 2.2',
    //           type: 'collapse',
    //           children: [
    //             {
    //               id: 'menu-level-2.1',
    //               title: 'Menu Level 2.1',
    //               type: 'item',
    //               url: '#'
    //             },
    //             {
    //               id: 'menu-level-2.2',
    //               title: 'Menu Level 2.2',
    //               type: 'collapse',
    //               children: [
    //                 {
    //                   id: 'menu-level-3.1',
    //                   title: 'Menu Level 3.1',
    //                   type: 'item',
    //                   url: '#'
    //                 },
    //                 {
    //                   id: 'menu-level-3.2',
    //                   title: 'Menu Level 3.2',
    //                   type: 'item',
    //                   url: '#'
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       id: 'disabled-menu',
    //       title: 'Disabled Menu',
    //       type: 'item',
    //       url: '#',
    //       classes: 'nav-item disabled',
    //       icon: 'feather icon-power'
    //     }
    //   ]
    // }
  ]
};

export default menuItems;
