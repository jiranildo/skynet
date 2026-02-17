import { useState, useEffect } from 'react';

interface UserAvatarProps {
    src?: string;
    name?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ src, name, className = '', size = 'md' }: UserAvatarProps) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);
    const [error, setError] = useState(false);

    // Update internal state if src prop changes
    useEffect(() => {
        setImgSrc(src);
        setError(false);
    }, [src]);

    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff`;

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const finalSrc = error || !imgSrc ? fallbackUrl : imgSrc;

    return (
        <img
            src={finalSrc}
            alt={name}
            className={`${sizeClasses[size]} rounded-full object-cover shadow-sm ${className}`}
            onError={() => {
                if (!error) {
                    setError(true);
                }
            }}
        />
    );
}

export default UserAvatar;
