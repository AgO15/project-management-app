"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from "@/components/ui/button";
import { LogOut, Layout } from "lucide-react";

interface DashboardHeaderProps {
    email: string;
    children: React.ReactNode; // For the CognitiveProjectDialog
}

export function DashboardHeader({ email, children }: DashboardHeaderProps) {
    const { t } = useLanguage();

    return (
        <header
            className="mx-3 sm:mx-4 mt-3 sm:mt-4 mb-4 sm:mb-6 px-3 sm:px-4 py-2.5 sm:py-4 rounded-2xl bg-[#E0E5EC]"
            style={{
                boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.5)'
            }}
        >
            {/* Single row layout - all elements on same line */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Logo + Title (compact on mobile) */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                            boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm sm:text-lg font-semibold text-[#444444] truncate">
                            {t('cognitiveManager')}
                        </h1>
                        <p className="text-xs text-[#888888] truncate hidden sm:block">{email}</p>
                    </div>
                </div>

                {/* Right: Actions - compact row */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Language Toggle (smaller on mobile) */}
                    <LanguageToggle className="scale-90 sm:scale-100" />

                    {/* New Project Button */}
                    {children}

                    {/* Logout */}
                    <form action="/auth/logout" method="post">
                        <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3]"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    );
}

// Section title component with translation
export function DashboardSectionTitle() {
    const { t } = useLanguage();

    return (
        <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#444444]">{t('yourProjects')}</h2>
            <p className="text-xs sm:text-sm text-[#888888]">{t('organizedByState')}</p>
        </div>
    );
}
