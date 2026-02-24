import { useCallback, useRef, useState } from 'react';

interface Options {
    onLongPress?: (e: any) => void;
    onClick?: (e: any) => void;
    delay?: number;
    shouldPreventDefault?: boolean;
}

export const useLongPress = ({
    onLongPress,
    onClick,
    delay = 500,
    shouldPreventDefault = true
}: Options) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const target = useRef<any>(null);

    const start = useCallback(
        (event: any) => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener('touchend', preventDefault, {
                    passive: false
                });
                target.current = event.target;
            }
            timeout.current = setTimeout(() => {
                onLongPress?.(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event: any, shouldTriggerClick = true) => {
            if (timeout.current) {
                clearTimeout(timeout.current);
                timeout.current = null;
            }

            if (shouldTriggerClick && !longPressTriggered) {
                onClick?.(event);
            }

            if (longPressTriggered) {
                event.preventDefault();
                event.stopPropagation();
            }

            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener('touchend', preventDefault);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: any) => start(e),
        onTouchStart: (e: any) => start(e),
        onMouseUp: (e: any) => clear(e),
        onMouseLeave: (e: any) => clear(e, false),
        onTouchEnd: (e: any) => clear(e)
    };
};

const preventDefault = (event: any) => {
    if (!('touches' in event)) return;
    if (event.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};
