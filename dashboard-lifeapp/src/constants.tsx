import { Icon } from '@iconify/react';
import { 
  IconHome, 
  IconBackpack, 
  IconSchool, 
  IconBallpenFilled, 
  IconBooks, 
  IconFolder,
  IconSettings,
  IconCalculator
} from '@tabler/icons-react';

import { SideNavItem } from '@/types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <IconHome width="20" height="20" />,
  },
  {
    title: 'Students',
    path: '/students',
    icon: <IconBackpack width="20" height="20" />,
    submenu: true,
    subMenuItems: [
      { title: 'Dashboard', path: '/students/dashboard' },
      { title: 'Mission', path: '/students/mission' },
      { title: 'Coupons Redeemed', path: '/students/coupons_redeemed' }
    ]
  },
  {
    title: 'Teachers',
    path: '/teachers',
    icon: <IconSchool width="20" height="20" />,
    submenu: true,
    subMenuItems: [
      { title: 'Dashboard', path: '/teachers/dashboard' },
      // { title: 'Competencies', path: '/teachers/competencies' },
      // { title: 'Concept Cartoon Header', path: '/teachers/concept-cartoon-header' },
      // { title: 'Concept Cartoons', path: '/teachers/concept-cartoons' },
      // { title: 'Assessment', path: '/teachers/assessment' },
      // { title: 'Work Sheets', path: '/teachers/worksheets' },
      // { title: 'Lesson Plan Language', path: '/teachers/lesson-plan-language' },
      // { title: 'Lesson Plans', path: '/teachers/lesson-plans' }
    ]
  },
  {
    title: 'Mentors',
    path: '/mentors',
    icon: <IconBallpenFilled width="20" height="20" />,
    submenu: true,
    subMenuItems: [
      { title: 'Dashboard', path: '/mentors/dashboard' },
      { title: 'Sessions', path: '/mentors/sessions' }
    ]
  },
  {
    title: 'Schools',
    path: '/schools',
    icon: <IconBooks width="20" height="20" />,
    submenu: true,
    subMenuItems: [
      { title: 'Dashboard', path: '/schools/dashboard' },
      { title: 'School Data', path: '/schools/school-data' }
    ]
  },
  {
    title: 'Resources',
    path: '#',
    icon: <IconFolder width="20" height="20" />,
    submenu: true,
    subMenuItems: [
      { title: 'Student/Related', path: '#' },
      { title: 'Teacher', path: '#', 
        submenu: true,
        subMenuItems: [
          { title: 'Competencies', path: '/teachers/competencies' },
          { title: 'Concept Cartoon Header', path: '/teachers/concept-cartoon-header' },
          { title: 'Concept Cartoons', path: '/teachers/concept-cartoons' },
          { title: 'Assessment', path: '/teachers/assessment' },
          { title: 'Work Sheets', path: '/teachers/worksheets' },
          { title: 'Lesson Plan Language', path: '/teachers/lesson-plan-language' },
          { title: 'Lesson Plans', path: '/teachers/lesson-plans' }
        ]
      },
    ],
  },
  {
    title: 'Settings',
    path: '#',
    icon: <IconSettings width='20' height='20' />
  },
  {
    title: 'Campaigns',
    path: "#",
    icon: <IconCalculator width="20" height="20" />
  }
];