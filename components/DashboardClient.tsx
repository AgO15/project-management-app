"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Layout } from "lucide-react";
import Link from 'next/link';

interface DashboardHeaderProps {
    email: string;
    children: React.ReactNode; // For the CognitiveProjectDialog
}

export function DashboardHeader({ email, children }: DashboardHeaderProps) {
    const { t } = useLanguage();

    return (
        <header
            className="mx-4 mt-4 mb-6 p-4 rounded-2xl bg-[#E0E5EC]"
            style={{
                boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)'
            }}
        >
            <div className="container mx-auto px-2">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-[#444444]">{t('cognitiveManager')}</h1>
                            <p className="text-sm text-[#888888]">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <LanguageToggle />

                        {/* New Project Button */}
                        {children}

                        {/* Logout */}
                        <form action="/auth/logout" method="post">
                            <Button
                                variant="ghost"
                                size="sm"
                                type="submit"
                                className="rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3]"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Section title component with translation
export function DashboardSectionTitle() {
    const { t } = useLanguage();

    return (
        <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#444444]">{t('yourProjects')}</h2>
            <p className="text-sm text-[#888888]">{t('organizedByState')}</p>
        </div>
    );
}
