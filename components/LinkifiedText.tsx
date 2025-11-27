"use client";

interface LinkifiedTextProps {
    text: string;
    className?: string;
}

export function LinkifiedText({ text, className = "" }: LinkifiedTextProps) {
    // URL regex pattern that matches http, https, and www URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

    const linkifyText = (content: string) => {
        const parts = content.split(urlRegex);

        return parts.map((part, index) => {
            if (!part) return null;

            // Check if this part is a URL
            if (part.match(urlRegex)) {
                // Add https:// to www. URLs
                const href = part.startsWith('www.') ? `https://${part}` : part;

                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                    >
                        {part}
                    </a>
                );
            }

            return <span key={index}>{part}</span>;
        });
    };

    return (
        <span className={className}>
            {linkifyText(text)}
        </span>
    );
}
