'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconDownload, IconX, IconTrash, IconEdit, IconPlus, IconFilterOff } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function SettingsActivityType() {
    const activityTypes = [
        { id: 1, name: "Mission" },
        { id: 2, name: "Jigyasa" },
        { id: 3, name: "Pragya" },
        { id: 4, name: "Quiz" },
        { id: 5, name: "Riddle" },
        { id: 6, name: "Puzzle" }
    ];

    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className='container-xl pt-0 pb-4'>
                        <div className="card">
                            <div className="card-header">
                                <div className="flex justify-between items-center">
                                    <h3 className="card-title">Activity Types</h3>
                                    {/* <div className="mx-2 flex gap-2">
                                        <button className="btn btn-primary">
                                            <IconPlus size={16} className="mr-1" />
                                            Add Activity Type
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                            <div className="card-body">
                                <ul className="list-group">
                                    {activityTypes.map(activity => (
                                        <li key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{activity.name}</span>
                                            {/* <div>
                                                <button className="btn btn-icon">
                                                    <IconEdit size={16} />
                                                </button>
                                                <button className="btn btn-icon text-danger">
                                                    <IconTrash size={16} />
                                                </button>
                                            </div> */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}