'use client'
import { useState, useEffect, useRef, useMemo, useCallback  } from 'react'
// import NumberFlow from '@number-flow/react'
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';

export default function StudentQuiz() {
    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />

            {/* Main Content */}
            <div className="page-wrapper" style={{ marginLeft: '250px' }}></div>
        </div>
    );
}