'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { SIDENAV_ITEMS } from '@/constants';
import { SideNavItem } from '@/types';

// MenuItem component for handling nested menu items
// const MenuItem = ({ item }: { item: SideNavItem }) => {
//     const pathname = usePathname();
//     const [subMenuOpen, setSubMenuOpen] = useState(false);
    
//     const toggleSubMenu = () => {
//       setSubMenuOpen(!subMenuOpen);
//     };
    
//     return (
//       <div className="w-full">
//         {item.submenu ? (
//           <>
//             <button
//               onClick={toggleSubMenu}
//               className={`flex flex-row items-center rounded-lg hover:bg-zinc-100 w-full pl-4 py-3 justify-between !pr-0 ${
//                 pathname.includes(item.path) ? 'bg-zinc-100' : ''
//               }`}
//             >
//               <div className="flex flex-row space-x-3 items-center text-base text-black">
//                 <span className="text-lg">{item.icon}</span>
//                 <span>{item.title}</span>
//               </div>
//               <Icon
//                 icon="lucide:chevron-down"
//                 width="16"
//                 height="16"
//                 className={`transition-transform duration-200 ${
//                   subMenuOpen ? 'rotate-180' : ''
//                 }`}
//               />
//             </button>
  
//             {subMenuOpen && (
//               <div className="ml-8 flex flex-col space-y-1">
//                 {item.subMenuItems?.map((subItem, idx) => (
//                   <Link
//                     key={idx}
//                     href={subItem.path}
//                     className={`!no-underline font-normal text-sm text-gray-700 py-2 pl-4 hover:text-blue-600 ${
//                       subItem.path === pathname ? 'font-semibold text-blue-600' : ''
//                     }`}
//                   >
//                     {subItem.title}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : (
//           <Link
//             href={item.path}
//             className={`flex flex-row !no-underline text-black items-center space-x-3 pl-4 py-3 rounded-lg hover:bg-zinc-100 ${
//               item.path === pathname ? 'bg-zinc-100' : ''
//             }`}
//           >
//             <span className="text-lg">{item.icon}</span>
//             <span>{item.title}</span>
//           </Link>
//         )}
//       </div>
//     );
// };

// const MenuItem = ({ item, level = 0 }: { item: SideNavItem; level?: number }) => {
//   const pathname = usePathname();
//   const [subMenuOpen, setSubMenuOpen] = useState(false);
  
//   const toggleSubMenu = () => {
//     setSubMenuOpen(!subMenuOpen);
//   };
  
//   return (
//     <div className={`w-full ${level > 0 ? 'ml-6' : ''}`}>
//       {item.submenu ? (
//         <>
//           <button
//             onClick={toggleSubMenu}
//             className={`flex flex-row items-center rounded-lg hover:bg-zinc-100 w-full pl-4 py-3 justify-between !pr-0 ${
//               pathname.includes(item.path) ? 'bg-zinc-100' : ''
//             }`}
//           >
//             <div className="flex flex-row space-x-3 items-center text-base text-black">
//               {item.icon && <span className="text-lg">{item.icon}</span>}
//               <span>{item.title}</span>
//             </div>
//             <Icon
//               icon="lucide:chevron-down"
//               width="16"
//               height="16"
//               className={`transition-transform duration-200 ${
//                 subMenuOpen ? 'rotate-180' : ''
//               }`}
//             />
//           </button>

//           {subMenuOpen && (
//             <div className="flex flex-col space-y-1">
//               {item.subMenuItems?.map((subItem, idx) => (
//                 <React.Fragment key={idx}>
//                   {subItem.submenu ? (
//                     <MenuItem item={subItem} level={level + 1} />
//                   ) : (
//                     <Link
//                       href={subItem.path}
//                       className={`!no-underline font-normal text-sm text-gray-700 py-2 pl-${level > 0 ? '8' : '4'} hover:text-blue-600 ${
//                         subItem.path === pathname ? 'font-semibold text-blue-600' : ''
//                       }`}
//                     >
//                       {subItem.title}
//                     </Link>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           )}
//         </>
//       ) : (
//         <Link
//           href={item.path}
//           className={`flex flex-row !no-underline text-black items-center space-x-3 pl-4 py-3 rounded-lg hover:bg-zinc-100 ${
//             item.path === pathname ? 'bg-zinc-100' : ''
//           }`}
//         >
//           {item.icon && <span className="text-lg">{item.icon}</span>}
//           <span>{item.title}</span>
//         </Link>
//       )}
//     </div>
//   );
// }; 

// const MenuItem = ({ item, level = 0 }: { item: SideNavItem; level?: number }) => {
//   const pathname = usePathname();
//   const [subMenuOpen, setSubMenuOpen] = useState(false);
  
//   const toggleSubMenu = () => {
//     setSubMenuOpen(!subMenuOpen);
//   };
  
//   return (
//     <div className={`w-full ${level > 0 ? 'ml-6' : ''}`}>
//       {item.submenu ? (
//         <>
//           <button
//             onClick={toggleSubMenu}
//             className={`flex flex-row items-center rounded-lg hover:bg-zinc-100 w-full pl-4 py-3 justify-between !pr-0 ${
//               pathname.includes(item.path) ? 'bg-zinc-100' : ''
//             }`}
//           >
//             <div className="flex flex-row space-x-3 items-center text-base text-black">
//               {item.icon && <span className="text-lg">{item.icon}</span>}
//               <span className={`${level > 0 ? 'text-xs' : ''}`}>{item.title}</span>
//             </div>
//             <Icon
//               icon="lucide:chevron-down"
//               width="16"
//               height="16"
//               className={`transition-transform duration-200 ${
//                 subMenuOpen ? 'rotate-180' : ''
//               }`}
//             />
//           </button>

//           {subMenuOpen && (
//             <div className="ml-8 flex flex-col space-y-1">
//               {item.subMenuItems?.map((subItem, idx) => (
//                 <React.Fragment key={idx}>
//                   {subItem.submenu ? (
//                     <MenuItem item={subItem} level={level + 1} />
//                   ) : (
//                     <Link
//                       href={subItem.path}
//                       className={`flex items-center justify-between !no-underline font-normal text-${level > 0 ? 'sm' : 'sm'} text-gray-700 py-2 pl-${level > 0 ? '8' : '4'} hover:text-blue-600 ${
//                         subItem.path === pathname ? 'font-semibold text-blue-600' : ''
//                       }`}
//                     >
//                       <span className='text-sm'>{subItem.title}</span>
//                       {subItem.submenu && (
//                         <Icon
//                           icon="lucide:chevron-down"
//                           width="14"
//                           height="14"
//                           className="mr-2"
//                         />
//                       )}
//                     </Link>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           )}
//         </>
//       ) : (
//         <Link
//           href={item.path}
//           className={`flex flex-row !no-underline text-black items-center space-x-3 pl-4 py-3 rounded-lg hover:bg-zinc-100 ${
//             item.path === pathname ? 'bg-zinc-100' : ''
//           }`}
//         >
//           {item.icon && <span className="text-lg">{item.icon}</span>}
//           <span className={`${level > 0 ? 'text-lg' : ''}`}>{item.title}</span>
//         </Link>
//       )}
//     </div>
//   );
// };

const MenuItem = ({ item, level = 0 }: { item: SideNavItem; level?: number }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };
  
  return (
    <div className="w-full">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center rounded-lg hover:bg-zinc-100 w-full pl-4 py-3 justify-between !pr-0 ${
              pathname.includes(item.path) ? 'bg-zinc-100' : ''
            }`}
          >
            <div className="flex flex-row space-x-3 items-center text-base text-black">
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span>{item.title}</span>
            </div>
            <Icon
              icon="lucide:chevron-down"
              width="16"
              height="16"
              className={`transition-transform duration-200 ${
                subMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {subMenuOpen && (
            <div className="flex flex-col space-y-1">
              {item.subMenuItems?.map((subItem, idx) => (
                <React.Fragment key={idx}>
                  {subItem.submenu ? (
                    <div className="w-full">
                      <button
                        onClick={() => {
                          // Find the state for this specific submenu and toggle it
                          const currentSubMenu = document.getElementById(`submenu-${subItem.title.replace(/\s+/g, '-').toLowerCase()}`);
                          if (currentSubMenu) {
                            currentSubMenu.classList.toggle('hidden');
                          }
                          // Toggle the chevron icon
                          const chevron = document.getElementById(`chevron-${subItem.title.replace(/\s+/g, '-').toLowerCase()}`);
                          if (chevron) {
                            chevron.classList.toggle('rotate-180');
                          }
                        }}
                        className="flex items-center justify-between w-full ml-8 py-2 text-sm font-normal text-gray-700 hover:text-blue-600"
                      >
                        <span>{subItem.title}</span>
                        <Icon
                          id={`chevron-${subItem.title.replace(/\s+/g, '-').toLowerCase()}`}
                          icon="lucide:chevron-down"
                          width="16"
                          height="16"
                          className="mr-4 transition-transform duration-200"
                        />
                      </button>
                      <div id={`submenu-${subItem.title.replace(/\s+/g, '-').toLowerCase()}`} className="hidden ml-8 pl-4 flex flex-col space-y-1">
                        {subItem.subMenuItems?.map((nestedItem, nestedIdx) => (
                          <Link
                            key={nestedIdx}
                            href={nestedItem.path}
                            className={`!no-underline font-normal text-sm text-gray-700 py-2 hover:text-blue-600 ${
                              nestedItem.path === pathname ? 'font-semibold text-blue-600' : ''
                            }`}
                          >
                            {nestedItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={subItem.path}
                      className={`!no-underline font-normal text-sm text-gray-700 py-2 ml-8 hover:text-blue-600 ${
                        subItem.path === pathname ? 'font-semibold text-blue-600' : ''
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row !no-underline text-black items-center space-x-3 pl-4 py-3 rounded-lg hover:bg-zinc-100 ${
            item.path === pathname ? 'bg-zinc-100' : ''
          }`}
        >
          {item.icon && <span className="text-lg">{item.icon}</span>}
          <span>{item.title}</span>
        </Link>
      )}
    </div>
  );
};

// const MenuItem = ({ item, level = 0 }: { item: SideNavItem; level?: number }) => {
//   const pathname = usePathname();
//   const [subMenuOpen, setSubMenuOpen] = useState(false);
  
//   const toggleSubMenu = () => {
//     setSubMenuOpen(!subMenuOpen);
//   };
  
//   // Calculate padding and spacing based on nesting level
//   const paddingLeft = level > 0 ? `ml-${level * 4}` : '';
//   const fontSize = level > 0 ? 'text-sm' : 'text-base';
  
//   return (
//     <div className="w-full">
//       {item.submenu ? (
//         <>
//           <button
//             onClick={toggleSubMenu}
//             className={`flex flex-row items-center rounded-lg hover:bg-zinc-100 w-full pl-4 py-3 justify-between !pr-4 ${
//               pathname.includes(item.path) ? 'bg-zinc-100' : ''
//             } ${level > 0 ? 'ml-8' : ''}`}
//           >
//             <div className={`flex flex-row space-x-3 items-center ${fontSize} text-black`}>
//               {item.icon && <span className="text-lg">{item.icon}</span>}
//               <span>{item.title}</span>
//             </div>
//             <Icon
//               icon="lucide:chevron-down"
//               width="16"
//               height="16"
//               className={`transition-transform duration-200 ${
//                 subMenuOpen ? 'rotate-180' : ''
//               }`}
//             />
//           </button>

//           {subMenuOpen && (
//             <div className={`flex flex-col space-y-1 ${level > 0 ? 'ml-8' : ''}`}>
//               {item.subMenuItems?.map((subItem, idx) => (
//                 <React.Fragment key={idx}>
//                   {subItem.submenu ? (
//                     <MenuItem item={subItem} level={level + 1} />
//                   ) : (
//                     <Link
//                       href={subItem.path}
//                       className={`!no-underline font-normal text-sm text-gray-700 py-2 ${level === 0 ? 'ml-8' : 'ml-4'} hover:text-blue-600 ${
//                         subItem.path === pathname ? 'font-semibold text-blue-600' : ''
//                       }`}
//                     >
//                       {subItem.title}
//                     </Link>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           )}
//         </>
//       ) : (
//         <Link
//           href={item.path}
//           className={`flex flex-row !no-underline text-black items-center space-x-3 pl-4 py-3 rounded-lg hover:bg-zinc-100 ${
//             item.path === pathname ? 'bg-zinc-100' : ''
//           } ${level > 0 ? 'ml-8' : ''}`}
//         >
//           {item.icon && <span className="text-lg">{item.icon}</span>}
//           <span className={fontSize}>{item.title}</span>
//         </Link>
//       )}
//     </div>
//   );
// };
// Main Sidebar Component
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="navbar navbar-vertical navbar-expand-lg navbar-light bg-white custom-sidebar fixed-left"
      style={{ width: '250px', zIndex: 1000 }}
    >
      <div className="container-fluid">
        <div className="navbar-nav pt-lg-3 d-flex flex-column g-3 overflow-x-hidden">
          {SIDENAV_ITEMS.map((item, idx) => (
            <MenuItem key={idx} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}