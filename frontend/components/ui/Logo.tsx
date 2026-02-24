import React from 'react';
import Image from 'next/image';

export function MomcarLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/Logo.svg"
                alt="Momcar Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
