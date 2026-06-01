import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import gsap from "gsap";
import { reducedMotion } from "~/lib/animations";

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) throw new Error("Accordion components must be used within an Accordion");
    return context;
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    defaultOpen,
    allowMultiple = false,
    className = "",
}) => {
    const [activeItems, setActiveItems] = useState<string[]>(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
            } else {
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
            <div className={`space-y-2 ${className}`}>{children}</div>
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
    id,
    children,
    className = "",
}) => {
    return (
        <div className={`overflow-hidden border-b border-[#dfdfdf] ${className}`}>
            {children}
        </div>
    );
};

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
    itemId,
    children,
    className = "",
    icon,
    iconPosition = "right",
}) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);
    const chevronRef = useRef<SVGSVGElement>(null);
    const chevronTweenRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        const el = chevronRef.current;
        if (!el) return;

        chevronTweenRef.current?.kill();

        if (reducedMotion()) {
            gsap.set(el, { rotation: isActive ? 180 : 0 });
            return;
        }

        chevronTweenRef.current = gsap.to(el, {
            rotation: isActive ? 180 : 0,
            duration: 0.25,
            ease: "power2.inOut",
        });

        return () => { chevronTweenRef.current?.kill(); };
    }, [isActive]);

    const defaultIcon = (
        <svg
            ref={chevronRef}
            className="w-5 h-5"
            fill="none"
            stroke="#707070"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    return (
        <button
            onClick={() => toggleItem(itemId)}
            className={`
                w-full px-4 py-3 text-left
                focus:outline-none
                transition-colors duration-200 flex items-center justify-between cursor-pointer
                ${className}
            `}
        >
            <div className="flex items-center space-x-3">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
    itemId,
    children,
    className = "",
}) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);
    const outerRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;

        tweenRef.current?.kill();

        if (reducedMotion()) {
            gsap.set(el, { height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 });
            return;
        }

        tweenRef.current = isActive
            ? gsap.to(el, { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" })
            : gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });

        return () => { tweenRef.current?.kill(); };
    }, [isActive]);

    return (
        <div
            ref={outerRef}
            className={`overflow-hidden ${className}`}
            style={{ height: 0, opacity: 0 }}
        >
            <div className="px-4 py-3">{children}</div>
        </div>
    );
};
