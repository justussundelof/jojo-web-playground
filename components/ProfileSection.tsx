"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ProfileSectionProps {
    title: string;
    description: string;
    count?: number;
    countLabel?: string;
    buttonText: string;
    onButtonClick: () => void;
    disabled?: boolean;
    children?: ReactNode;
}

export default function ProfileSection({
    title,
    description,
    count,
    countLabel,
    buttonText,
    onButtonClick,
    disabled = false,
    children,
}: ProfileSectionProps) {
    return (
        <div className="border-2 border-primary p-6 flex flex-col space-y-4 h-full">
            <h2 className="font-mono text-sm uppercase tracking-wide">{title}</h2>
            <div className="flex-1">
                {children}
                {!children && count !== undefined && countLabel && (
                    <p className="font-serif-book text-sm mb-2">
                        You have {count} {countLabel}.
                    </p>
                )}
                <p className="font-serif-book text-sm text-accent-foreground/70">
                    {description}
                </p>
            </div>
            <Button
                variant="link"
                size="sm"
                onClick={onButtonClick}
                disabled={disabled}
                className="self-start uppercase"
            >
                [{buttonText}]
            </Button>
        </div>
    );
}